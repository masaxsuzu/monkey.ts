export enum TokenType {
    ILLEGAL = "ILLEGAL",
    EOF = "EOF",

    IDENT = "IDENT",
    INT = "INT",
    STRING = "STRING",

    ASSIGN = "=",
    PlUS = "+",
    MINUS = "-",
    BANG = "!",
    ASTERISK = "*",
    SLASH = "/",

    EQ = "==",
    NOT_EQ = "!=",

    LT = "<",
    GT = ">",

    COMMA = ",",
    SEMICOLON = ";",

    LPAREN = "(",
    RPAREN = ")",
    LBRACE = "{",
    RBRACE = "}",

    TRUE = "TRUE",
    FALSE = "FALSE",

    FUNCTION = "FUNCTION",
    LET = "LET",
    IF = "IF",
    ELSE = "ELSE",
    RETURN = "RETURN",
}

export class Token {
    Type: TokenType;
    Literal: string;

    constructor(t: TokenType, l: string) {
        this.Type = t;
        this.Literal = l;
    }

    private static KeyWords = new Map<string, TokenType>([
        ["fn", TokenType.FUNCTION],
        ["let", TokenType.LET],
        ["true",TokenType.TRUE],
        ["false",TokenType.FALSE],
        ["if",TokenType.IF],
        ["else",TokenType.ELSE],
        ["return",TokenType.RETURN],
    ]);

    static LookupIdent(i: string): TokenType {
        if (Token.KeyWords.has(i)) {
            // don't use Token.KeyWords[i],  -> "undefined"
            // but use Token.KeyWords.get(i) -> value for i
            return Token.KeyWords.get(i)
        }
        return TokenType.IDENT
    }
}
