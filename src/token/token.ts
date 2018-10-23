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

export class Token{
    constructor(t :TokenType,l: string){
        this.Type = t;
        this.Literal = l;
    }

    private static KeyWords = new Map<string,TokenType>([
        ["fn",TokenType.FUNCTION],
        ["let",TokenType.LET],
    ]);

    static LookupIdent(i:string) :TokenType{
        if (Token.KeyWords.has(i)){
            // don't use Token.KeyWords[i],  -> "undefined"
            // but use Token.KeyWords.get(i) -> value for i
            return Token.KeyWords.get(i)
        }
        return TokenType.IDENT
    }

    Type: TokenType;
    Literal: string;


}
