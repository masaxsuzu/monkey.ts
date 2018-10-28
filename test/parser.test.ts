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

    public static InfixExpressionFrom(left: ast.Expression, operator: string, right: ast.Expression): ast.InfixExpression {
        let inf = new ast.InfixExpression();
        inf.Left = left;
        inf.Operator = operator;
        inf.Right = right;
        return inf;
    }
    public static IfExpressionFrom(condition: ast.Expression, block: ast.BlockStatement): ast.IfExpression {
        let _if = new ast.IfExpression();
        _if.Condition = condition;
        _if.Consequence = block;

        return _if
    }

    public static SimpleIfExpressionFrom(left: string, operator: token.Token, right: string, body: string): ast.IfExpression {
        let c = this.SimpleConditionFrom(left, operator, right);
        let b = this.SimpleBlockStatement(body);

        return this.IfExpressionFrom(c, b);
    }
    public static SimpleIfElseExpressionFrom(left: string, operator: token.Token, right: string, cons: string, alt: string): ast.IfExpression {
        let c = this.SimpleConditionFrom(left, operator, right);
        let b1 = this.SimpleBlockStatement(cons);
        let b2 = this.SimpleBlockStatement(alt);

        let if_else = this.IfExpressionFrom(c, b1);
        if_else.Alternative = b2;
        return if_else;
    }

    public static SimpleConditionFrom(left: string, operator: token.Token, right: string): ast.InfixExpression {
        let leftid = this.IdentifierFrom(new token.Token(token.TokenType.IDENT, left), left);
        let rightid = this.IdentifierFrom(new token.Token(token.TokenType.IDENT, right), right);

        let c = new ast.InfixExpression();
        c.Left = leftid;
        c.Operator = operator.Literal;
        c.Right = rightid;
        c.Token = operator
        return c;
    }
    public static SimpleBlockStatement(body: string): ast.BlockStatement {
        let id = this.IdentifierFrom(new token.Token(token.TokenType.IDENT, body), body);
        id.Value = body;
        let ex = new ExpressionStatement();
        ex.Token = id.Token;
        ex.Expression = id;
        let b = new ast.BlockStatement();
        b.Statements = [];
        b.Statements.push(ex);

        return b
    }

    public static SimpleFunctionLiteralFrom(p1:string,p2:string,body:ast.BlockStatement):ast.FunctionLiteral{
        let f = new ast.FunctionLiteral();
        f.Parameters = [];
        f.Parameters.push(this.IdentifierFrom(new token.Token(token.TokenType.IDENT,p1),p1));
        f.Parameters.push(this.IdentifierFrom(new token.Token(token.TokenType.IDENT,p2),p2));
        f.Token = new token.Token(token.TokenType.FUNCTION,"fn");
        f.Body = body;

        return f;

    }
}

describe('ParseLetStatements', () => {
    interface test {
        name: string;
        input: string;
        wants: {name:string,value:string}[];
    }
    let tests: test[] = [
        {
            name: "3 let statements",
            input: `
            let x = 5;
            let y = 10;
            let foobar = 114514;
            `,
            wants: [{name:"x",value:"5"},{name:"y",value:"10"}, {name:"foobar",value:"114514"}]
        } as test,
        {
            name: "2 let statements",
            input: `let x = 114;let y = 514;`,
            wants: [{name:"x",value:"114"},{name:"y",value:"514"}]
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
                chai.expect(statement.Name.Value, "value of name").equal(want.name);
                chai.expect(statement.Value.Node().String(), "literal of name").equal(want.value);
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
        { input: "a + add(b * c) + d", want: "((a + add((b * c))) + d)", },
        { input: "a + add(b * c) + d", want: "((a + add((b * c))) + d)", },
        { input: "add(a,b,1,2*3,4+5,add(6,7*8))", want: "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))", },
        { input: "add(a + b + c+ d /f +g)", want: "add(((((a + b) + c) + (d / f)) + g))", },

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

describe('IfExpression', () => {
    interface test {
        input: string
        want: ast.IfExpression
    }
    let tests: test[] = [
        {
            input: "if ( x < y ) {x}",
            want: To.SimpleIfExpressionFrom("x", new token.Token(token.TokenType.LT, "<"), "y", "x")
        },
        {
            input: "if ( x > y ) {y}",
            want: To.SimpleIfExpressionFrom("x", new token.Token(token.TokenType.GT, ">"), "y", "y")
        },
        {
            input: "if ( x < y ) {x} else {y}",
            want: To.SimpleIfElseExpressionFrom("x", new token.Token(token.TokenType.LT, "<"), "y", "x", "y")
        },
        {
            input: "if ( x > y ) {y} else {y}",
            want: To.SimpleIfElseExpressionFrom("x", new token.Token(token.TokenType.GT, ">"), "y", "y", "y")
        },


    ];
    tests.forEach(tt => {
        it(`${tt.input} -> ${tt.want.String()}`, () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            chai.expect(p.Errors().length).equal(0, Helper.ToString(p.Errors()));

            chai.expect(program.Statements.length).equal(1);

            let s = <ExpressionStatement>program.Statements[0];
            let _if = <ast.IfExpression>s.Expression;
            chai.expect(_if.Condition, "condition").deep.equal(tt.want.Condition);
            chai.expect(_if.Consequence, "consequence").deep.equal(tt.want.Consequence);
            chai.expect(_if.Alternative, "Alternative").deep.equal(tt.want.Alternative);

        });
    });
})

describe('FunctionLiteralParsing', () => {
    interface test {
        input: string
        want: ast.FunctionLiteral
    }
    let tests: test[] = [
        {
            input: "fn ( x , y ) {x}",
            want: To.SimpleFunctionLiteralFrom("x","y",To.SimpleBlockStatement("x")),
        },
        {
            input: "fn ( y , z ) {x}",
            want: To.SimpleFunctionLiteralFrom("y","z",To.SimpleBlockStatement("x")),
        },
    ];
    tests.forEach(tt => {
        it(`${tt.input} -> ${tt.want.String()}`, () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            chai.expect(p.Errors().length).equal(0, Helper.ToString(p.Errors()));

            chai.expect(program.Statements.length).equal(1);

            let s = <ExpressionStatement>program.Statements[0];
            let fn= <ast.FunctionLiteral>s.Expression;
            chai.expect(fn.Parameters, "condition").deep.equal(tt.want.Parameters);
            chai.expect(fn.Body, "consequence").deep.equal(tt.want.Body);

        });
    });
})

describe('CallExpressionParsing', () => {
    interface test {
        input: string
        want: {caller:string,args:string[]}
    }
    let tests: test[] = [
        {
            input: "add(x , y);",
            want: {caller:"add",args:["x","y"]},
        } as test,
    ];
    tests.forEach(tt => {
        it(`${tt.input}`, () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            chai.expect(p.Errors().length).equal(0, Helper.ToString(p.Errors()));

            chai.expect(program.Statements.length).equal(1);

            let s = <ExpressionStatement>program.Statements[0];
            let call= <ast.CallExpression>s.Expression;
            chai.expect(call.Function.Node().String(),"function").equals(tt.want.caller);

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