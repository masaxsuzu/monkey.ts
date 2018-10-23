import {assert} from "chai"
import {TokenType} from "../src/token/token"
import {Lexer} from "../src/lexer/lexer"


describe ('TestNextToken',()=>{
    let input = "=+(){},;"

    let tests: [TokenType,string][] =
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
        let l = new Lexer(input)

        tests.forEach(tt => {
            let token = l.NextToken()
            assert.strictEqual(token.Type,tt["0"]);
            assert.strictEqual(token.Literal,tt["1"]);
        })
    })
});