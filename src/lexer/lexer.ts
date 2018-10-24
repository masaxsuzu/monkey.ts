import { Token, TokenType } from "../token/token";

export class Lexer {
    public constructor(input: string) {
        this._input = input.split('');
        this._current = "";
        this._currentPosition = 0;
        this._nextPosition = 0;

        this.Read()
    }
    public NextToken(): Token {
        var t: Token

        this.SkipWhiteSpace()

        let current = this._current
        switch (current) {
            case "=":
                if (this.Peek() == "=") {
                    let s = this._current
                    this.Read()
                    let literal = s + this._current

                    t = new Token(TokenType.EQ, s + this._current)
                } else {
                    t = new Token(TokenType.ASSIGN, current)
                }
                break;
            case ";":
                t = new Token(TokenType.SEMICOLON, current)
                break;
            case "(":
                t = new Token(TokenType.LPAREN, current)
                break;
            case ")":
                t = new Token(TokenType.RPAREN, current)
                break;
            case ",":
                t = new Token(TokenType.COMMA, current)
                break;
            case "+":
                t = new Token(TokenType.PlUS, current)
                break;
            case "-":
                t = new Token(TokenType.MINUS, current)
                break;
            case "!":
                if (this.Peek() == "=") {
                    let s = this._current
                    this.Read()
                    let literal = s + this._current

                    t = new Token(TokenType.NOT_EQ, s + this._current)
                } else {
                    t = new Token(TokenType.BANG, current)
                }
                break;
            case "/":
                t = new Token(TokenType.SLASH, current)
                break;
            case "*":
                t = new Token(TokenType.ASTERISK, current)
                break
            case "<":
                t = new Token(TokenType.LT, current)
                break;
            case ">":
                t = new Token(TokenType.GT, current);
                break;
            case "{":
                t = new Token(TokenType.LBRACE, current)
                break;
            case "}":
                t = new Token(TokenType.RBRACE, current)
                break;
            case "":
                t = new Token(TokenType.EOF, current)
                break;
            default:
                // ch1p12: if call ReadXXX, then return here,
                // because Read() is already called.
                if (Lexer.isLetter(current)) {
                    let literal = this.ReadIdentifier();
                    let type = Token.LookupIdent(literal);
                    return new Token(type, literal);
                }
                else if (Lexer.isDisit(current)) {
                    let literal = this.ReadNumber();
                    return new Token(TokenType.INT, literal);
                } else {
                    t = new Token(TokenType.ILLEGAL, current)
                    break;
                }
        }
        this.Read()
        return t
    }

    private Read() {
        if (this._nextPosition >= this._input.length) {
            this._current = "";
        } else {
            this._current = this._input[`${this._nextPosition}`];
        }
        this._currentPosition = this._nextPosition;
        this._nextPosition += 1;

    }

    private ReadIdentifier(): string {
        let pos = this._currentPosition
        while (Lexer.isLetter(this._current)) {
            this.Read()
        }

        let v = this._input.slice(pos, this._currentPosition)

        return v.join('')
    }

    private ReadNumber(): string {
        let pos = this._currentPosition
        while (Lexer.isDisit(this._current)) {
            this.Read()
        }

        let v = this._input.slice(pos, this._currentPosition)

        return v.join('')
    }

    private Peek(): string {
        if (this._nextPosition >= this._input.length) {
            return ""
        }
        return this._input[`${this._nextPosition}`]
    }

    private SkipWhiteSpace() {
        while (this._current == " " || this._current == "\t" || this._current == "\n" || this._current == "\r") {
            this.Read()
        }
    }

    private static isLetter(s: string): boolean {
        let code = s.charCodeAt(0)
        let a = 97
        let z = a + 26 - 1
        let A = 65
        let Z = A + 26 - 1
        return (a <= code && code <= z) || (A <= code && code <= Z);
    }

    private static isDisit(s: string): boolean {
        let code = s.charCodeAt(0)
        let zero = 48
        return (48 <= code && code <= zero + 9);
    }

    private _input: string[];
    private _currentPosition: number;
    private _nextPosition: number;
    private _current: string;
}

