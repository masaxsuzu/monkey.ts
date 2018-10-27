import * as chai from "chai"
import * as token from "../src/token/token"
import * as lexer from "../src/lexer/lexer"
import * as ast from "../src/ast/ast"
import * as parser from "../src/parser/parser"
import { EROFS } from "constants";
import { ExpressionStatement } from "../src/ast/ast";


class To {
    public static ProgramFrom(statements: ast.Statement[]): ast.Program {
        let p: ast.Program = new ast.Program();

        p.Statements = statements;
        return p;
    }
    public static LetStatementFrom(t: token.Token, i1: ast.Identifier, i2: ast.Identifier): ast.LetStatement {
        let ls: ast.LetStatement = new ast.LetStatement();
        ls.Token = t;
        ls.Name = i1;
        ls.Value = i2;
        return ls;
    }
    public static ReturnStatementFrom(t: token.Token, i1: ast.Identifier): ast.ReturnStatement {
        let rs: ast.ReturnStatement = new ast.ReturnStatement();
        rs.Token = t;
        rs.ReturnValue = i1;
        return rs;
    }
    public static IdentifierFrom(t: token.Token, v: string): ast.Identifier {
        let i = new ast.Identifier();
        i.Token = t;
        i.Value = v;
        return i;
    }
}

describe('ParseLetStatements', () => {
    interface test {
        name: string;
        input: string;
        wants: string[];
    }
    let tests: test[] = [
        {
            name: "3 let statements",
            input: `
            let x = 5;
            let y = 10;
            let foobar = 114514;
            `,
            wants: ["x", "y", "foobar"]
        } as test,
        {
            name: "2 let statements",
            input: `let x = 114;let y = 514;`,
            wants: ["x", "y"]
        } as test,
    ];
    tests.forEach(tt => {
        it(tt.name + " are all let statements", () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();

            chai.expect(program, "p.ToProgram()").not.null;
            chai.expect(program.Statements, "p.ToProgram().Statements").not.null;
            chai.expect(program.Statements.length, "p.ToProgram().Statements.length").equals(tt.wants.length);
            tt.wants.forEach((want, index) => {
                let statement: ast.LetStatement = program.Statements[`${index}`];

                chai.expect(statement.Token.Type, "type").is.not.null;
                chai.expect(statement.Name.Value, "value of name").equal(want);
                chai.expect(statement.Name.TokenLiteral(), "literal of name").equal(want);
            })
        })
        it(tt.name + " have no error", () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            let e: string[] = p.Errors();

            chai.expect(e.length, "num of errors").equal(0, e.toString());
        })
    })
})

describe('ParseReturnStatements', () => {
    interface test {
        name: string;
        input: string;
        wants: number;
    }
    let tests: test[] = [
        {
            name: "3 return statements",
            input: `
            return 1;
            return 10;
            return 114514;
            `,
            wants: 3
        } as test,
        {
            name: "2 return statements in a line",
            input: `return 12;return 1;`,
            wants: 2
        } as test,
    ];
    tests.forEach(tt => {
        it(tt.name + " are all return statements", () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();

            chai.expect(program, "p.ToProgram()").not.null;
            chai.expect(program.Statements, "p.ToProgram().Statements").not.null;
            chai.expect(program.Statements.length, "p.ToProgram().Statements.length").equals(tt.wants);
            program.Statements.forEach((s) => {
                let rs: ast.ReturnStatement = s as ast.ReturnStatement;
                chai.expect(rs).is.not.null;
                chai.expect(rs.Token.Type).equal(token.TokenType.RETURN);
            })
        })
        it(tt.name + " have no error", () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            let e: string[] = p.Errors();

            chai.expect(e.length, "num of errors").equal(0, e.toString());
        })
    })
})

describe('IdentifierExpression', () => {
    interface test {
        name: string
        input: string
        want: string
    }
    let tests: test[] = [
        {
            name: "1 expression statement",
            input: "foobar;",
            want: "foobar",
        } as test,
    ];

    tests.forEach(tt => {
        it(tt.name, () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            chai.expect(program.Statements.length).equal(1);

            let ex: ast.ExpressionStatement = program.Statements[0] as ast.ExpressionStatement;
            chai.expect(program.Statements['0']).is.not.null;
            chai.expect(ex.Token.Type).equal(token.TokenType.IDENT);
            chai.expect(ex.String()).equal(tt.want);
        });
    });
})

describe('IntegerLiteralExpression', () => {
    interface test {
        name: string
        input: string
        want: { l: string, v: number }
    }
    let tests: test[] = [
        {
            name: "5",
            input: "5",
            want: { l: "5", v: 5 },
        } as test,
    ];

    tests.forEach(tt => {
        it(tt.name, () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            chai.expect(program.Statements.length).equal(1);
            let e = <ast.ExpressionStatement>program.Statements[0];
            let lt = <ast.IntegerLiteral>e.Expression;
            chai.expect(lt.TokenLiteral(), "literal").equal(tt.want.l);
            chai.expect(lt.Value, "value").equal(tt.want.v);
        });
    });
})

describe('ParsingPrefixExpression', () => {
    interface test {
        name: string
        input: string
        want: { op: string, num: number, literal: string }
    }
    let tests: test[] = [
        {
            name: "!5",
            input: "!5",
            want: { op: "!", num: 5, literal: "5" },
        } as test,
        {
            name: "-15",
            input: "-15",
            want: { op: "-", num: 15, literal: "15" },
        } as test,
    ];
    tests.forEach(tt => {
        it(tt.name, () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            chai.expect(p.Errors().length).equal(0, p.Errors().toString());
            chai.expect(program.Statements.length).equal(1);

            let s = <ExpressionStatement>program.Statements[0];
            let e = <ast.PrefixExpression>s.Expression;

            chai.expect(e.Operator).equal(tt.want.op);

            let int = <ast.IntegerLiteral>e.Right;
            chai.expect(int.Value).equal(tt.want.num);
            chai.expect(int.TokenLiteral()).equal(tt.want.literal);
        });
    });
})

describe('ParsingInfixExpression', () => {
    interface test {
        name: string
        input: string
        want: { left: number, operator: string, right: number }
    }
    let tests: test[] = [
        { name: "5+5", input: "5+5", want: { left: 5, operator: "+", right: 5 }, },
        { name: "5-5", input: "5-5", want: { left: 5, operator: "-", right: 5 }, },
        { name: "5*5", input: "5*5", want: { left: 5, operator: "*", right: 5 }, },
        { name: "5/5", input: "5/5", want: { left: 5, operator: "/", right: 5 }, },
        { name: "5>5", input: "5>5", want: { left: 5, operator: ">", right: 5 }, },
        { name: "5<5", input: "5<5", want: { left: 5, operator: "<", right: 5 }, },
        { name: "5==5", input: "5==5", want: { left: 5, operator: "==", right: 5 }, },
        { name: "5!=5", input: "5!=5", want: { left: 5, operator: "!=", right: 5 }, },
    ];
    tests.forEach(tt => {
        it(tt.name, () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            chai.expect(p.Errors().length).equal(0, p.Errors().toString());
            chai.expect(program.Statements.length).equal(1);

            let s = <ExpressionStatement>program.Statements[0];
            let e = <ast.InfixExpression>s.Expression;

            let left = <ast.IntegerLiteral>e.Left;
            let operator = e.Operator;
            let right = <ast.IntegerLiteral>e.Right;

            chai.expect(left.Value).equal(tt.want.left);
            chai.expect(left.TokenLiteral()).equal(tt.want.left.toString());
            chai.expect(operator).equal(tt.want.operator);
            chai.expect(right.Value).equal(tt.want.right);
            chai.expect(right.TokenLiteral()).equal(tt.want.right.toString());

        });
    });
})

describe('OperatorPrecedenceParsing', () => {
    interface test {
        input: string
        want: string
    }
    let tests: test[] = [
        { input: "a", want: "a", },
        { input: "a+b", want: "(a + b)", },
        { input: "-a*b", want: "((-a) * b)", },
        { input: "a+-b", want: "(a + (-b))", },
        { input: "!-a", want: "(!(-a))", },
        { input: "a + b + c", want: "((a + b) + c)", },
        { input: "a + b - c", want: "((a + b) - c)", },
        { input: "a * b / c", want: "((a * b) / c)", },
        { input: "a + b / c", want: "(a + (b / c))", },
        { input: "a + b * c + d / e - f", want: "(((a + (b * c)) + (d / e)) - f)", },
        { input: "3 + 4; -5 * 5", want: "(3 + 4)((-5) * 5)", },
        { input: "5 > 4 == 3 < 4", want: "((5 > 4) == (3 < 4))", },
        { input: "5 > 4 != 3 < 4", want: "((5 > 4) != (3 < 4))", },
        { input: "true", want: "true", },
        { input: "false", want: "false", },
        { input: "5 > 4 == true", want: "((5 > 4) == true)", },
        { input: "5 < 4 != false ", want: "((5 < 4) != false)", },
        { input: "1 + (2 + 3) + 4 ", want: "((1 + (2 + 3)) + 4)", },

    ];
    tests.forEach(tt => {
        it(`${tt.input} -> ${tt.want}`, () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            chai.expect(p.Errors().length).equal(0, Helper.ToString(p.Errors()));

            chai.expect(program.String()).equal(tt.want);
        });
    });
})



describe('ProgramToString', () => {
    interface test {
        name: string
        input: ast.Program
        want: string
    }
    let tests: test[] = [
        {
            name: "1 let statement",
            input: To.ProgramFrom(
                [
                    To.LetStatementFrom(
                        new token.Token(token.TokenType.LET, "let"),
                        To.IdentifierFrom(new token.Token(token.TokenType.IDENT, "myVar"), "myVar"),
                        To.IdentifierFrom(new token.Token(token.TokenType.IDENT, "anotherVar"), "anotherVar")),
                ]
            ),
            want: 'let myVar = anotherVar;',
        } as test,
        {
            name: "1 return statement",
            input: To.ProgramFrom(
                [
                    To.ReturnStatementFrom(
                        new token.Token(token.TokenType.RETURN, "return"),
                        To.IdentifierFrom(new token.Token(token.TokenType.IDENT, "x"), "x"),
                    ),
                ]),
            want: 'return x;',
        } as test,
    ];

    tests.forEach(tt => {
        it(tt.name, () => {
            chai.expect(tt.input.String()).equals(tt.want)
        });
    });
})

class Helper {
    static ToString(values: string[]): string {
        let s = "";

        values.forEach(element => {
            s += ("\t" + element + "\n");
        });
        return s;
    }
}