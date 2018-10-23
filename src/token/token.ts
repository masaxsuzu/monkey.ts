export class Token{
    constructor(t :TokenType,l: string){
        this.Type = t;
        this.Literal = l;
    }
    Type: TokenType;
    Literal: string;
}

export enum TokenType{
    ILLEGAL = "ILLEGAL",
    EOF = "EOF",

    IDENT = "IDENT",
    INT = "INT",

    ASSIGN = "=",
    PlUS = "+",

    COMMA = ",",
    SEMICOLON = ";",

    LPAREN = "(",
    RPAREN = ")",
    LBRACE = "{",
    RBRACE = "}",

    FUNCTION = "FUNCTION",
    LET = "LET",
}
