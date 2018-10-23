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
        switch (this._current) {
            case "=":
                t = new Token(TokenType.ASSIGN,this._current)
                break;       
            case ";":
                t = new Token(TokenType.SEMICOLON,this._current)
                break;  
            case "(":
                t = new Token(TokenType.LPAREN,this._current)
                break;  
            case ")":
                t = new Token(TokenType.RPAREN,this._current)
                break;  
            case ",":
                t = new Token(TokenType.COMMA,this._current)
                break;  
            case "+":
                t = new Token(TokenType.PlUS,this._current)
                break;  
            case "{":
                t = new Token(TokenType.LBRACE,this._current)
                break;  
            case "}":
                t = new Token(TokenType.RBRACE,this._current)
                break;  
            case "":
                t = new Token(TokenType.EOF,this._current)
                break;
            default:
                t = new Token(TokenType.ILLEGAL,this._current)
                break;
        }
        this.Read()
        return t
    }

    private Read(){
        if (this._nextPosition >= this._input.length){
            this._current = "";
        }else{
            this._current = this._input[""+this._nextPosition];
        }
        this._currentPosition = this._nextPosition;
        this._nextPosition +=1;

    }

    private _input :string[];
    private _currentPosition : number;
    private _nextPosition : number;
    private _current :string;
}

