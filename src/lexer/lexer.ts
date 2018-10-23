import { Token, TokenType } from "../token/token";

export class Lexer {
    public constructor(input:string) {
        this._input = input.split('');
        this._current = "";
        this._currentPosition = 0;
        this._nextPosition = 0;

        this.Read()
    }
    public NextToken():Token{
        var t :Token
        let current = this._current
        switch (current) {
            case "=":
                t = new Token(TokenType.ASSIGN,current)
                break;       
            case ";":
                t = new Token(TokenType.SEMICOLON,current)
                break;  
            case "(":
                t = new Token(TokenType.LPAREN,current)
                break;  
            case ")":
                t = new Token(TokenType.RPAREN,current)
                break;  
            case ",":
                t = new Token(TokenType.COMMA,current)
                break;  
            case "+":
                t = new Token(TokenType.PlUS,current)
                break;  
            case "{":
                t = new Token(TokenType.LBRACE,current)
                break;  
            case "}":
                t = new Token(TokenType.RBRACE,current)
                break;  
            case "":
                t = new Token(TokenType.EOF,current)
                break;
            default:
                t = new Token(TokenType.ILLEGAL,current)
                break;
        }
        this.Read()
        return t
    }

    private Read(){
        if (this._nextPosition >= this._input.length){
            this._current = "";
        }else{
            this._current = this._input[`${this._nextPosition}`];
        }
        this._currentPosition = this._nextPosition;
        this._nextPosition +=1;

    }

    private _input :string[];
    private _currentPosition : number;
    private _nextPosition : number;
    private _current :string;
}

