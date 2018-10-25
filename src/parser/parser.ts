import * as token from "../token/token"
import * as lexer from "../lexer/lexer"
import * as ast from "../ast/ast"

export class Parser {
    private lex: lexer.Lexer;
    private currentToken: token.Token;
    private peekToken: token.Token;

    public static New(l: lexer.Lexer): Parser {
        let p = new Parser(l);
        p.NextToken();
        p.NextToken();

        return p;
    }

    private constructor(l: lexer.Lexer) {
        this.lex = l;
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

    private ParseStatement(): ast.Statement {
        switch (this.currentToken.Type) {
            case token.TokenType.LET:
                return this.ParseLetStatement();
                break;

            default:
                return null;
                break;
        }
    }

    private ParseLetStatement(): ast.Statement{
        let ls : ast.LetStatement = new ast.LetStatement();
        ls.Token = this.currentToken;

        if (!this.ExpectPeek(token.TokenType.IDENT)){
            return null;
        }

        ls.Name = new ast.Identifier(this.currentToken,this.currentToken.Literal);

        if (!this.ExpectPeek(token.TokenType.ASSIGN)){
            return null;
        }

        while (!this.currentTokenIs(token.TokenType.SEMICOLON)){
            this.NextToken();
        }
        return ls;
    }

    private NextToken() {
        this.currentToken = this.peekToken;
        this.peekToken = this.lex.NextToken();
    }

    private ExpectPeek(t:token.TokenType) :Boolean{
        if (this.peekTokenIs(t)){
            this.NextToken()
                return true;
        }
            return false;
    }
    private peekTokenIs(t:token.TokenType):Boolean{
        return this.peekToken.Type == t;
    }
    private currentTokenIs(t:token.TokenType):Boolean{
        return this.currentToken.Type == t;
    }

}