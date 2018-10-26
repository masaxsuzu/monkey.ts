import * as chai from "chai"
import * as token from "../src/token/token"
import * as lexer from "../src/lexer/lexer"
import * as ast from "../src/ast/ast"
import * as parser from "../src/parser/parser"

describe('ParseLetStatements', () => {
    interface test {
        name: string;
        input: string;
        wants: string[];
    }
    let tests: test[]= [
        {
            name: "3 let statements",
            input: `
            let x = 5;
            let y = 10;
            let foobar = 114514;
            `,
            wants: ["x","y","foobar"]
        } as test,
        {
            name: "2 let statements",
            input: `let x = 114;let y = 514;`,
            wants: ["x","y"]
        } as test,
    ];
    tests.forEach(tt => {
        it(tt.name+" are all let statements", () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();

            chai.expect(program,"p.ToProgram()").not.null;
            chai.expect(program.Statements,"p.ToProgram().Statements").not.null;
            chai.expect(program.Statements.length,"p.ToProgram().Statements.length").equals(tt.wants.length);
            tt.wants.forEach((want,index) => {
                let statement:ast.LetStatement = program.Statements[`${index}`];
                
                chai.expect(statement.Token.Type,"type").is.not.null;
                chai.expect(statement.Name.Value,"value of name").equal(want);
                chai.expect(statement.Name.TokenLiteral(),"literal of name").equal(want);
            })
        })
        it(tt.name+" have no error",()=>{
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            let e :string[] = p.Errors();

            chai.expect(e.length,"num of errors").equal(0,e.toString());
        })
    })
})

describe('ParseReturnStatements', () => {
    interface test {
        name: string;
        input: string;
        wants: number;
    }
    let tests: test[]= [
        {
            name: "3 return statements",
            input: `
            return 1;
            return 10;
            return 114514;
            `,
            wants:3
        } as test,
        {
            name: "2 return statements in a line",
            input: `return 12;return 1;`,
            wants:2
        } as test,
    ];
    tests.forEach(tt => {
        it(tt.name+" are all return statements", () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();

            chai.expect(program,"p.ToProgram()").not.null;
            chai.expect(program.Statements,"p.ToProgram().Statements").not.null;
            chai.expect(program.Statements.length,"p.ToProgram().Statements.length").equals(tt.wants);
            program.Statements.forEach((s) => {
                let rs:ast.ReturnStatement = s as ast.ReturnStatement;
                chai.expect(rs).is.not.null;
                chai.expect(rs.Token.Type).equal(token.TokenType.RETURN);
            })
        })
        it(tt.name+" have no error",()=>{
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            let e :string[] = p.Errors();

            chai.expect(e.length,"num of errors").equal(0,e.toString());
        })
    })
})