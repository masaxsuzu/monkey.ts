import * as chai from "chai"
import { TokenType } from "../src/token/token"
import { Lexer } from "../src/lexer/lexer"

describe('TestNextToken', () => {
    interface test {
        name: string;
        input: string;
        wants: [TokenType, string][];
    }
    let tests: test[] = [
        {
            name: "Easy",
            input: "=+(){},;",
            wants: [
                [TokenType.ASSIGN, "="],
                [TokenType.PlUS, "+"],
                [TokenType.LPAREN, "("],
                [TokenType.RPAREN, ")"],
                [TokenType.LBRACE, "{"],
                [TokenType.RBRACE, "}"],
                [TokenType.COMMA, ","],
                [TokenType.SEMICOLON, ";"],
                [TokenType.EOF, ""],
            ]
        } as test,
        {
            name: "Declaration & Assignment",
            input: `let xy = 15;`,
            wants: [
                [TokenType.LET, "let"],
                [TokenType.IDENT, "xy"],
                [TokenType.ASSIGN, "="],
                [TokenType.INT, "15"],
                [TokenType.SEMICOLON, ";"],
                [TokenType.EOF, ""],
            ]
        } as test,
        {
            name: "Function",
            input: `let add = fn(x, y){x + y}; let ret = add(5,10);`,
            wants: [
                [TokenType.LET, "let"],
                [TokenType.IDENT, "add"],
                [TokenType.ASSIGN, "="],
                [TokenType.FUNCTION, "fn"],
                [TokenType.LPAREN, "("],
                [TokenType.IDENT, "x"],
                [TokenType.COMMA, ","],
                [TokenType.IDENT, "y"],
                [TokenType.RPAREN, ")"],
                [TokenType.LBRACE, "{"],
                [TokenType.IDENT, "x"],
                [TokenType.PlUS, "+"],
                [TokenType.IDENT, "y"],
                [TokenType.RBRACE, "}"],
                [TokenType.SEMICOLON, ";"],
                [TokenType.LET, "let"],
                [TokenType.IDENT, "ret"],
                [TokenType.ASSIGN, "="],
                [TokenType.IDENT, "add"],
                [TokenType.LPAREN, "("],
                [TokenType.INT, "5"],
                [TokenType.COMMA, ","],
                [TokenType.INT, "10"],
                [TokenType.RPAREN, ")"],
                [TokenType.SEMICOLON, ";"],
                [TokenType.EOF, ""],
            ]
        } as test,
    ]

    tests.forEach(tt => {
        it(tt.name, () => {
            let l = new Lexer(tt.input)
            tt.wants.forEach(want => {
                let got = l.NextToken()
                chai.expect(got.Type).equal(want["0"], "NextToke()")
                chai.expect(got.Literal).equal(want["1"], "NextToke()")
            })
        })
    })
})