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
            name: "Easy tokens",
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
            name: "Function keyword",
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
        {
            name: "Operators",
            input: "!-/*5;5<10>5;",
            wants: [
                [TokenType.BANG, "!"],
                [TokenType.MINUS, "-"],
                [TokenType.SLASH, "/"],
                [TokenType.ASTERISK, "*"],
                [TokenType.INT, "5"],
                [TokenType.SEMICOLON, ";"],
                [TokenType.INT, "5"],
                [TokenType.LT, "<"],
                [TokenType.INT, "10"],
                [TokenType.GT, ">"],
                [TokenType.INT, "5"],
                [TokenType.SEMICOLON, ";"],
                [TokenType.EOF, ""],
            ]
        },
        {
            name: "If-ELSE",
            input: "if (5 < 10){return false;} else {return true;}",
            wants: [
                [TokenType.IF, "if"],
                [TokenType.LPAREN, "("],
                [TokenType.INT, "5"],
                [TokenType.LT, "<"],
                [TokenType.INT, "10"],
                [TokenType.RPAREN, ")"],
                [TokenType.LBRACE, "{"],
                [TokenType.RETURN, "return"],
                [TokenType.FALSE, "false"],
                [TokenType.SEMICOLON, ";"],
                [TokenType.RBRACE, "}"],
                [TokenType.ELSE, "else"],
                [TokenType.LBRACE, "{"],
                [TokenType.RETURN, "return"],
                [TokenType.TRUE, "true"],
                [TokenType.SEMICOLON, ";"],
                [TokenType.RBRACE, "}"],
                [TokenType.EOF, ""],
            ]
        },
        {
            name: "EQUAL/NOTEQUAL",
            input: "10 == 10; 10 != 9;",
            wants: [
                [TokenType.INT, "10"],
                [TokenType.EQ, "=="],
                [TokenType.INT, "10"],
                [TokenType.SEMICOLON, ";"],
                [TokenType.INT, "10"],
                [TokenType.NOT_EQ, "!="],
                [TokenType.INT, "9"],
                [TokenType.SEMICOLON, ";"],
                [TokenType.EOF, ""],
            ]
        },
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