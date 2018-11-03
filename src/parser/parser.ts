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
    [token.TokenType.LPAREN, Priority.CALL],
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

        this.RegisterPrefix(token.TokenType.IDENT, () => { return this.ParseIdentifier() });
        this.RegisterPrefix(token.TokenType.INT, () => { return this.ParseIntegerLiteral() });
        this.RegisterPrefix(token.TokenType.STRING, () => { return this.ParseStringLiteral() });
        this.RegisterPrefix(token.TokenType.BANG, () => { return this.ParsePrefixExpression() });
        this.RegisterPrefix(token.TokenType.MINUS, () => { return this.ParsePrefixExpression() });
        this.RegisterPrefix(token.TokenType.TRUE, () => { return this.ParseBoolean() });
        this.RegisterPrefix(token.TokenType.FALSE, () => { return this.ParseBoolean() });
        this.RegisterPrefix(token.TokenType.LPAREN, () => { return this.ParseGroupedExpression() });
        this.RegisterPrefix(token.TokenType.IF, () => { return this.ParseIfExpression() });
        this.RegisterPrefix(token.TokenType.FUNCTION, () => { return this.ParseFunctionLiteral() });

        this.RegisterInfix(token.TokenType.PlUS, (left: ast.Expression) => { return this.ParseInfixExpression(left); });
        this.RegisterInfix(token.TokenType.MINUS, (left: ast.Expression) => { return this.ParseInfixExpression(left); });
        this.RegisterInfix(token.TokenType.SLASH, (left: ast.Expression) => { return this.ParseInfixExpression(left); });
        this.RegisterInfix(token.TokenType.ASTERISK, (left: ast.Expression) => { return this.ParseInfixExpression(left); });
        this.RegisterInfix(token.TokenType.EQ, (left: ast.Expression) => { return this.ParseInfixExpression(left); });
        this.RegisterInfix(token.TokenType.NOT_EQ, (left: ast.Expression) => { return this.ParseInfixExpression(left); });
        this.RegisterInfix(token.TokenType.LT, (left: ast.Expression) => { return this.ParseInfixExpression(left); });
        this.RegisterInfix(token.TokenType.GT, (left: ast.Expression) => { return this.ParseInfixExpression(left); });
        this.RegisterInfix(token.TokenType.LPAREN, (left: ast.Expression) => { return this.ParseCallExpression(left); });

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

        if (!this.ExpectPeek(token.TokenType.IDENT)) {
            return null;
        }

        let i = new ast.Identifier();
        i.Token = this.currentToken;
        i.Value = this.currentToken.Literal;
        ls.Name = i;

        if (!this.ExpectPeek(token.TokenType.ASSIGN)) {
            return null;
        }

        this.NextToken();
        ls.Value = this.ParseExpression(Priority.LOWEST);

        if(this.PeekTokenIs(token.TokenType.SEMICOLON)){
            this.NextToken();
        }
        return ls;
    }

    private ParseReturnStatement(): ast.ReturnStatement {
        let s: ast.ReturnStatement = new ast.ReturnStatement();
        s.Token = this.currentToken;

        this.NextToken();

        s.ReturnValue = this.ParseExpression(Priority.LOWEST);

        if(this.PeekTokenIs(token.TokenType.SEMICOLON)){
            this.NextToken();
        }

        return s;
    }

    private ParseExpressionStatement(): ast.ExpressionStatement {
        let se = new ast.ExpressionStatement();
        se.Token = this.currentToken;
        se.Expression = this.ParseExpression(Priority.LOWEST);

        if (this.PeekTokenIs(token.TokenType.SEMICOLON)) {
            this.NextToken();
        }

        return se;
    }

    private NoPrefixParseError(t: token.TokenType) {
        let msg = `no prefix parse function for ${t} found`;
        this.errors.push(msg);
    }

    private ParseExpression(p: Priority): ast.Expression {

        let prefix = this.prefixParsingFunctions.get(this.currentToken.Type);
        if (prefix == null || prefix == undefined) {
            this.NoPrefixParseError(this.currentToken.Type);
            return null;
        }
        let left = prefix();

        while (!this.PeekTokenIs(token.TokenType.SEMICOLON) && p < this.PeekPrecedence()) {
            let infix = this.infixParsingFunctions.get(this.peekToken.Type);
            if (infix == null || infix == undefined) {
                return left;
            }
            this.NextToken();

            left = infix(left);
        }
        return left;
    }

    private ParseIdentifier(): ast.Identifier {
        let i = new ast.Identifier();
        i.Token = this.currentToken;
        i.Value = this.currentToken.Literal;
        return i;
    }

    private ParseIntegerLiteral(): ast.IntegerLiteral {
        let l = new ast.IntegerLiteral();
        l.Value = parseInt(this.currentToken.Literal);
        l.Token = this.currentToken;
        return l;
    }

    private ParseStringLiteral(): ast.StringLiteral {
        let l = new ast.StringLiteral();
        l.Value = this.currentToken.Literal;
        l.Token = this.currentToken;
        return l;
    }

    private ParseBoolean(): ast.Bool {
        let b = new ast.Bool();
        b.Value = this.CurrentTokenIs(token.TokenType.TRUE);
        b.Token = this.currentToken;
        return b;
    }

    private ParsePrefixExpression(): ast.Expression {
        let ex = new ast.PrefixExpression();
        ex.Token = this.currentToken;
        ex.Operator = this.currentToken.Literal;

        this.NextToken();

        ex.Right = this.ParseExpression(Priority.PREFIX);

        return ex;
    }

    private ParseInfixExpression(left: ast.Expression): ast.Expression {
        let ex = new ast.InfixExpression();
        ex.Token = this.currentToken;
        ex.Operator = this.currentToken.Literal;
        ex.Left = left;

        let precedence = this.CurrentPrecedence();
        this.NextToken();
        ex.Right = this.ParseExpression(precedence);

        return ex;
    }

    private ParseGroupedExpression(): ast.Expression {
        this.NextToken();
        let exp = this.ParseExpression(Priority.LOWEST);
        if (!this.ExpectPeek(token.TokenType.RPAREN)) {
            return null;
        }
        return exp;
    }
    private ParseIfExpression(): ast.Expression {
        let _if = new ast.IfExpression();
        _if.Token = this.currentToken;
        if (!this.ExpectPeek(token.TokenType.LPAREN)) {
            return null;
        }

        this.NextToken();

        _if.Condition = this.ParseExpression(Priority.LOWEST);

        if (!this.ExpectPeek(token.TokenType.RPAREN)) {
            return null;
        }

        if (!this.ExpectPeek(token.TokenType.LBRACE)) {
            return null;
        }

        _if.Consequence = this.ParseBlockStatement();

        if (this.PeekTokenIs(token.TokenType.ELSE)) {
            this.NextToken();
            if (!this.ExpectPeek(token.TokenType.LBRACE)) {
                return null;
            }

            _if.Alternative = this.ParseBlockStatement();
        }

        return _if;
    }

    private ParseBlockStatement(): ast.BlockStatement {
        let block = new ast.BlockStatement();
        block.Statements = [];

        this.NextToken();
        while (!this.CurrentTokenIs(token.TokenType.RBRACE) && !this.CurrentTokenIs(token.TokenType.EOF)) {
            let s = this.ParseStatement();

            if (s != null) {
                block.Statements.push(s);
            }
            this.NextToken();
        }
        return block;
    }
    private ParseFunctionLiteral():ast.Expression{
        let fn = new ast.FunctionLiteral();
        fn.Token = this.currentToken;
        if(!this.ExpectPeek(token.TokenType.LPAREN)){
            return null;
        }
        fn.Parameters = this.ParseFunctionParameters();

        if (!this.ExpectPeek(token.TokenType.LBRACE)){
            return null;
        }

        fn.Body = this.ParseBlockStatement();

        return fn;
    }

    private ParseFunctionParameters():ast.Identifier[]{
        let identifiers = [];
        if(this.PeekTokenIs(token.TokenType.RPAREN)){
            this.NextToken();
            return identifiers;
        }

        this.NextToken();

        let ident = new ast.Identifier();
        ident.Token = this.currentToken;
        ident.Value = this.currentToken.Literal;
        identifiers.push(ident);

        while(this.PeekTokenIs(token.TokenType.COMMA)){
            this.NextToken();
            this.NextToken();

            let ident = new ast.Identifier();
            ident.Token = this.currentToken;
            ident.Value = this.currentToken.Literal;
            identifiers.push(ident);
    
        }

        if(!this.ExpectPeek(token.TokenType.RPAREN)){
            return null;
        }

        return identifiers;
    }

    private ParseCallExpression(f:ast.Expression):ast.Expression{
        let exp = new ast.CallExpression();
        exp.Token = this.currentToken;
        exp.Function = f;
        exp.Arguments = this.ParseCallArguments();
        return exp;
    }
    private ParseCallArguments():ast.Expression[]{
        let args :ast.Expression[] = [];

        if(this.PeekTokenIs(token.TokenType.RPAREN)){
            this.NextToken();
            return args
        }

        this.NextToken();
        args.push(this.ParseExpression(Priority.LOWEST));

        while(this.PeekTokenIs(token.TokenType.COMMA)){
            this.NextToken();
            this.NextToken();
            args.push(this.ParseExpression(Priority.LOWEST));
        }

        if (!this.ExpectPeek(token.TokenType.RPAREN)){
            return null;
        }

        return args;
    }

    private NextToken() {
        this.currentToken = this.peekToken;
        this.peekToken = this.lex.NextToken();
    }

    private ExpectPeek(t: token.TokenType): Boolean {
        if (this.PeekTokenIs(t)) {
            this.NextToken()
            return true;
        }
        this.PeekError(t);
        return false;
    }
    private PeekTokenIs(t: token.TokenType): Boolean {
        return this.peekToken.Type == t;
    }
    private CurrentTokenIs(t: token.TokenType): Boolean {
        return this.currentToken.Type == t;
    }
    private CurrentPrecedence(): Priority {
        let p = precedences.get(this.currentToken.Type);
        return p == undefined ? Priority.LOWEST : p;
    }
    private PeekPrecedence(): Priority {
        let p = precedences.get(this.peekToken.Type);
        return p == undefined ? Priority.LOWEST : p;
    }
    private PeekError(t: token.TokenType) {
        let e = `expected next token to be ${t},got ${this.peekToken.Type} instead`;
        this.errors.push(e);
    }

    private RegisterPrefix(t: token.TokenType, f: prefixParsingFunction) {
        this.prefixParsingFunctions.set(t, f);
    }
    private RegisterInfix(t: token.TokenType, f: infixParsingFunction) {
        this.infixParsingFunctions.set(t, f);
    }

}