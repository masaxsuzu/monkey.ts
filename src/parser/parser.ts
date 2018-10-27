import * as token from "../token/token"
import * as lexer from "../lexer/lexer"
import * as ast from "../ast/ast"
import { addListener } from "cluster";
import { error } from "util";

type prefixParsingFunction = () => ast.Expression;
type infixParsingFunction = (ex: ast.Expression) => ast.Expression;

enum Priority {
    LOWEST = 0,
    EQUALS,
    LESSGREATER,
    SUM,
    PRODUCT,
    PREFIX,
    CALL,
}

var precedences = new Map<token.TokenType, Priority>([
    [token.TokenType.EQ, Priority.EQUALS],
    [token.TokenType.NOT_EQ, Priority.EQUALS],
    [token.TokenType.LT, Priority.LESSGREATER],
    [token.TokenType.GT, Priority.LESSGREATER],
    [token.TokenType.PlUS, Priority.SUM],
    [token.TokenType.MINUS, Priority.SUM],
    [token.TokenType.SLASH, Priority.PRODUCT],
    [token.TokenType.ASTERISK, Priority.PRODUCT],
]);

export class Parser {
    private lex: lexer.Lexer;
    private currentToken: token.Token;
    private peekToken: token.Token;
    private errors: string[];
    private prefixParsingFunctions: Map<token.TokenType, prefixParsingFunction>;
    private infixParsingFunctions: Map<token.TokenType, infixParsingFunction>;

    public static New(l: lexer.Lexer): Parser {
        let p = new Parser(l);
        p.NextToken();
        p.NextToken();

        return p;
    }

    private constructor(l: lexer.Lexer) {
        this.lex = l;
        this.errors = [];
        this.prefixParsingFunctions = new Map();
        this.infixParsingFunctions = new Map();
        this.currentToken = null;

        // "this" is lost if class method is directly used as callback.
        // https://kuroeveryday.blogspot.com/2015/04/this.html.

        this.registerPrefix(token.TokenType.IDENT, () => { return this.parseIdentifier() });
        this.registerPrefix(token.TokenType.INT, () => { return this.parseIntegerLiteral() });
        this.registerPrefix(token.TokenType.BANG, () => { return this.parsePrefixExpression() });
        this.registerPrefix(token.TokenType.MINUS, () => { return this.parsePrefixExpression() });
        this.registerPrefix(token.TokenType.TRUE, () => { return this.parseBoolean() });
        this.registerPrefix(token.TokenType.FALSE, () => { return this.parseBoolean() });
        this.registerPrefix(token.TokenType.LPAREN, () => { return this.parseGroupedExpression() });
        this.registerPrefix(token.TokenType.IF, () => { return this.parseIfExpression() });
        this.registerPrefix(token.TokenType.FUNCTION, () => { return this.parseFunctionLiteral() });

        this.registerInfix(token.TokenType.PlUS, (left: ast.Expression) => { return this.parseInfixExpression(left); });
        this.registerInfix(token.TokenType.MINUS, (left: ast.Expression) => { return this.parseInfixExpression(left); });
        this.registerInfix(token.TokenType.SLASH, (left: ast.Expression) => { return this.parseInfixExpression(left); });
        this.registerInfix(token.TokenType.ASTERISK, (left: ast.Expression) => { return this.parseInfixExpression(left); });
        this.registerInfix(token.TokenType.EQ, (left: ast.Expression) => { return this.parseInfixExpression(left); });
        this.registerInfix(token.TokenType.NOT_EQ, (left: ast.Expression) => { return this.parseInfixExpression(left); });
        this.registerInfix(token.TokenType.LT, (left: ast.Expression) => { return this.parseInfixExpression(left); });
        this.registerInfix(token.TokenType.GT, (left: ast.Expression) => { return this.parseInfixExpression(left); });

    }

    public ToProgram(): ast.Program {
        let program = new ast.Program();
        program.Statements = [];
        while (this.currentToken.Type != token.TokenType.EOF) {
            let statement: ast.Statement = this.ParseStatement();
            if (statement != null) {
                program.Statements.push(statement);
            }
            this.NextToken();
        }

        return program;
    }

    public Errors(): string[] {
        return this.errors;
    }

    private ParseStatement(): ast.Statement {
        switch (this.currentToken.Type) {
            case token.TokenType.LET:
                return this.ParseLetStatement();
                break;
            case token.TokenType.RETURN:
                return this.ParseReturnStatement();
            default:
                return this.ParseExpressionStatement();
                break;
        }
    }

    private ParseLetStatement(): ast.Statement {
        let ls: ast.LetStatement = new ast.LetStatement();
        ls.Token = this.currentToken;

        if (!this.expectPeek(token.TokenType.IDENT)) {
            return null;
        }

        let i = new ast.Identifier();
        i.Token = this.currentToken;
        i.Value = this.currentToken.Literal;
        ls.Name = i;

        if (!this.expectPeek(token.TokenType.ASSIGN)) {
            return null;
        }

        while (!this.currentTokenIs(token.TokenType.SEMICOLON)) {
            this.NextToken();
        }
        return ls;
    }

    private ParseReturnStatement(): ast.ReturnStatement {
        let s: ast.ReturnStatement = new ast.ReturnStatement();
        s.Token = this.currentToken;

        this.NextToken();

        // TODO as of now, skip if current token is not SEMICOLON.
        while (!this.currentTokenIs(token.TokenType.SEMICOLON)) {
            this.NextToken();
        }

        return s;
    }

    private ParseExpressionStatement(): ast.ExpressionStatement {
        let se = new ast.ExpressionStatement();
        se.Token = this.currentToken;
        se.Expression = this.ParseExpression(Priority.LOWEST);

        if (this.peekTokenIs(token.TokenType.SEMICOLON)) {
            this.NextToken();
        }

        return se;
    }

    private noPrefixParseError(t: token.TokenType) {
        let msg = `no prefix parse function for ${t} found`;
        this.errors.push(msg);
    }

    private ParseExpression(p: Priority): ast.Expression {

        let prefix = this.prefixParsingFunctions.get(this.currentToken.Type);
        if (prefix == null || prefix == undefined) {
            this.noPrefixParseError(this.currentToken.Type);
            return null;
        }
        let left = prefix();

        while (!this.peekTokenIs(token.TokenType.SEMICOLON) && p < this.peekPrecedence()) {
            let infix = this.infixParsingFunctions.get(this.peekToken.Type);
            if (infix == null || infix == undefined) {
                return left;
            }
            this.NextToken();

            left = infix(left);
        }
        return left;
    }

    private parseIdentifier(): ast.Identifier {
        let i = new ast.Identifier();
        i.Token = this.currentToken;
        i.Value = this.currentToken.Literal;
        return i;
    }

    private parseIntegerLiteral(): ast.IntegerLiteral {
        let l = new ast.IntegerLiteral();
        l.Value = parseInt(this.currentToken.Literal);
        l.Token = this.currentToken;
        return l;
    }

    private parseBoolean(): ast.Bool {
        let b = new ast.Bool();
        b.Value = this.currentTokenIs(token.TokenType.TRUE);
        b.Token = this.currentToken;
        return b;
    }

    private parsePrefixExpression(): ast.Expression {
        let ex = new ast.PrefixExpression();
        ex.Token = this.currentToken;
        ex.Operator = this.currentToken.Literal;

        this.NextToken();

        ex.Right = this.ParseExpression(Priority.PREFIX);

        return ex;
    }

    private parseInfixExpression(left: ast.Expression): ast.Expression {
        let ex = new ast.InfixExpression();
        ex.Token = this.currentToken;
        ex.Operator = this.currentToken.Literal;
        ex.Left = left;

        let precedence = this.currentPrecedence();
        this.NextToken();
        ex.Right = this.ParseExpression(precedence);

        return ex;
    }

    private parseGroupedExpression(): ast.Expression {
        this.NextToken();
        let exp = this.ParseExpression(Priority.LOWEST);
        if (!this.expectPeek(token.TokenType.RPAREN)) {
            return null;
        }
        return exp;
    }
    private parseIfExpression(): ast.Expression {
        let _if = new ast.IfExpression();
        _if.Token = this.currentToken;
        if (!this.expectPeek(token.TokenType.LPAREN)) {
            return null;
        }

        this.NextToken();

        _if.Condition = this.ParseExpression(Priority.LOWEST);

        if (!this.expectPeek(token.TokenType.RPAREN)) {
            return null;
        }

        if (!this.expectPeek(token.TokenType.LBRACE)) {
            return null;
        }

        _if.Consequence = this.parseBlockStatement();

        if (this.peekTokenIs(token.TokenType.ELSE)) {
            this.NextToken();
            if (!this.expectPeek(token.TokenType.LBRACE)) {
                return null;
            }

            _if.Alternative = this.parseBlockStatement();
        }

        return _if;
    }

    private parseBlockStatement(): ast.BlockStatement {
        let block = new ast.BlockStatement();
        block.Statements = [];

        this.NextToken();
        while (!this.currentTokenIs(token.TokenType.RBRACE) && !this.currentTokenIs(token.TokenType.EOF)) {
            let s = this.ParseStatement();

            if (s != null) {
                block.Statements.push(s);
            }
            this.NextToken();
        }
        return block;
    }
    private parseFunctionLiteral():ast.Expression{
        let fn = new ast.FunctionLiteral();
        if(!this.expectPeek(token.TokenType.LPAREN)){
            return null;
        }
        fn.Parameters = this.parseFunctionParameters();

        if (!this.expectPeek(token.TokenType.LBRACE)){
            return null;
        }

        fn.Body = this.parseBlockStatement();

        return fn;
    }

    private parseFunctionParameters():ast.Identifier[]{
        let identifiers = [];
        if(this.peekTokenIs(token.TokenType.RPAREN)){
            this.NextToken();
            return identifiers;
        }

        this.NextToken();

        let ident = new ast.Identifier();
        ident.Token = this.currentToken;
        ident.Value = this.currentToken.Literal;
        identifiers.push(ident);

        while(this.peekTokenIs(token.TokenType.COMMA)){
            this.NextToken();
            this.NextToken();

            let ident = new ast.Identifier();
            ident.Token = this.currentToken;
            ident.Value = this.currentToken.Literal;
            identifiers.push(ident);
    
        }

        if(!this.expectPeek(token.TokenType.RPAREN)){
            return null;
        }

        return identifiers;
    }

    private NextToken() {
        this.currentToken = this.peekToken;
        this.peekToken = this.lex.NextToken();
    }

    private expectPeek(t: token.TokenType): Boolean {
        if (this.peekTokenIs(t)) {
            this.NextToken()
            return true;
        }
        this.peekError(t);
        return false;
    }
    private peekTokenIs(t: token.TokenType): Boolean {
        return this.peekToken.Type == t;
    }
    private currentTokenIs(t: token.TokenType): Boolean {
        return this.currentToken.Type == t;
    }
    private currentPrecedence(): Priority {
        let p = precedences.get(this.currentToken.Type);
        return p == undefined ? Priority.LOWEST : p;
    }
    private peekPrecedence(): Priority {
        let p = precedences.get(this.peekToken.Type);
        return p == undefined ? Priority.LOWEST : p;
    }
    private peekError(t: token.TokenType) {
        let e = `expected next token to be ${t},got ${this.peekToken.Type} instead`;
        this.errors.push(e);
    }

    private registerPrefix(t: token.TokenType, f: prefixParsingFunction) {
        this.prefixParsingFunctions.set(t, f);
    }
    private registerInfix(t: token.TokenType, f: infixParsingFunction) {
        this.infixParsingFunctions.set(t, f);
    }

}