import {assert} from "chai"
import {TokenType} from "../src/token/token"
import {Lexer} from "../src/lexer/lexer"


describe ('TestNextToken',()=>{
    let input = new Lexer("=+(){},;")

    let wants: [TokenType,string][] =
    [
        [TokenType.ASSIGN,"="],
        [TokenType.PlUS,"+"],
        [TokenType.LPAREN,"("],
        [TokenType.RPAREN,")"],
        [TokenType.LBRACE,"{"],
        [TokenType.RBRACE,"}"],
        [TokenType.COMMA,","],
        [TokenType.SEMICOLON,";"],
        [TokenType.EOF,""],
    ]
    it('Case1',() =>{
        wants.forEach(want => {
            let token = input.NextToken()
            assert.equal(token.Type,want["0"]);
            assert.strictEqual(token.Literal,want["1"]);
        })
    })
});