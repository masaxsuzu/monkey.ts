import { Token } from "../token/token"

export interface Node {
    TokenLiteral(): string
}

export interface Statement {
    Node():Node
    StatementNode()
}

export interface Expression {
    Node():Node
    ExpressionNode()
}

export class Program {
    Statements: Statement[]

    public constructor(){
        this.Statements = [];
    }
    public TokenLiteral(): string {
        if (this.Statements.length > 0) {
            return this.Statements["0"].TokenLiteral();
        }
        return "";
    }
}

export class LetStatement {
    Token: Token
    Name: Identifier
    Value: Expression

    public StatementNode() { }

    public Node():Node{
        return this;
    }
    public TokenLiteral(): string { return this.Token.Literal; }
}

export class ReturnStatement {
    Token: Token
    ReturnValue: Expression

    public StatementNode() { }

    public Node():Node{
        return this;
    }
    public TokenLiteral(): string { return this.Token.Literal; }
}

export class Identifier {
    Token: Token
    Value: string

    public constructor(t :Token,v :string){
        this.Token = t;
        this.Value = v;
    }
    public ExpressionNode() { }
    public TokenLiteral(): string { return this.Token.Literal; }
}


