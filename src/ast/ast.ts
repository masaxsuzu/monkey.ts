import { Token } from "../token/token"

export interface Node {
    TokenLiteral(): string
    String(): string
}

export interface Statement {
    Node(): Node
    StatementNode()
}

export interface Expression {
    Node(): Node
    ExpressionNode()
}

export class Program {
    Statements: Statement[]

    public constructor() {
        this.Statements = [];
    }
    public TokenLiteral(): string {
        if (this.Statements.length > 0) {
            return this.Statements["0"].TokenLiteral();
        }
        return "";
    }

    public String(): string {
        let s = "";
        this.Statements.forEach(element => {
            s += (element.Node().String());
        });
        return s;
    }
}

export class LetStatement {
    Token: Token
    Name: Identifier
    Value: Expression

    public StatementNode() { }

    public Node(): Node {
        return this;
    }
    public TokenLiteral(): string { return this.Token.Literal; }

    public String(): string {
        return `${this.TokenLiteral()} ${this.Name.String()} = ${this.Value.Node().String()};`
    }
}

export class ReturnStatement {
    Token: Token
    ReturnValue: Expression

    public StatementNode() { }

    public Node(): Node {
        return this;
    }
    public TokenLiteral(): string { return this.Token.Literal; }

    public String(): string {
        return `${this.TokenLiteral()} ${this.ReturnValue.Node().String()};`
    }

}

export class ExpressionStatement {
    Token: Token;
    Expression: Expression;

    public StatementNode() { }
    public TokenLiteral() { return this.Token.Literal; }

    public Node(): Node {
        return this;
    }
    public String(): string {
        return this.Expression.Node().String();
    }
}

export class PrefixExpression {
    Token: Token
    Operator: string
    Right: Expression

    ExpressionNode() { }
    Node() :Node{
        return this;
    }
    TokenLiteral(): string { return this.Token.Literal; }
    String(): string {
        let out = "(";
        out += this.Operator;
        out += this.Right.Node().String();
        out += ")";
        return out;
    }
}

export class InfixExpression {
    Token: Token
    Left: Expression
    Operator: string
    Right: Expression

    ExpressionNode() { }
    Node() :Node{
        return this;
    }
    TokenLiteral(): string { return this.Token.Literal; }
    String(): string {
        let out = "(";
        out += this.Left.Node().String();
        out += " ";
        out += this.Operator;
        out += " ";
        out += this.Right.Node().String();
        out += ")";
        return out;
    }
}


export class Identifier {
    Token: Token
    Value: string

    public Node(): Node {
        return this;
    }
    public ExpressionNode() { }
    public TokenLiteral(): string { return this.Token.Literal; }
    public String(): string {
        return this.Value;
    }
}

export class IntegerLiteral {
    Token: Token
    Value: number

    ExpressionNode() { }

    Node(): Node {
        return this;
    }

    TokenLiteral(): string { return this.Token.Literal; }
    String(): string { return this.Token.Literal; }
}


