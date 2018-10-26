import * as token from "../token/token"
import * as lexer from "../lexer/lexer"
import * as ast from "../ast/ast"

export class Parser {
    private lex: lexer.Lexer;
    private currentToken: token.Token;
    private peekToken: token.Token;
    private erros: string[];

    public static New(l: lexer.Lexer): Parser {
        let p = new Parser(l);
        p.NextToken();
        p.NextToken();

        return p;
    }

    private constructor(l: lexer.Lexer) {
        this.lex = l;
        this.erros = [];
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
        return this.erros;
    }

    private ParseStatement(): ast.Statement {
        switch (this.currentToken.Type) {
            case token.TokenType.LET:
                return this.ParseLetStatement();
                break;
            case token.TokenType.RETURN:
                return this.ParseReturnStatement();
            default:
                return null;
                break;
        }
    }

    private ParseLetStatement(): ast.Statement {
        let ls: ast.LetStatement = new ast.LetStatement();
        ls.Token = this.currentToken;

        if (!this.expectPeek(token.TokenType.IDENT)) {
            return null;
        }

        ls.Name = new ast.Identifier(this.currentToken, this.currentToken.Literal);

        if (!this.expectPeek(token.TokenType.ASSIGN)) {
            return null;
        }

        while (!this.currentTokenIs(token.TokenType.SEMICOLON)) {
            this.NextToken();
        }
        return ls;
    }

    private ParseReturnStatement():ast.ReturnStatement{
        let s :ast.ReturnStatement = new ast.ReturnStatement();
        s.Token = this.currentToken;

        this.NextToken();

        // TODO as of now, skip if current token is not SEMICOLON.
        while(!this.currentTokenIs(token.TokenType.SEMICOLON)){
            this.NextToken();
        }

        return s;
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
    private peekError(t: token.TokenType) {
        let e = `expected next token to be ${t},got ${this.peekToken.Type} instead`;
        this.erros.push(e);
    }
}