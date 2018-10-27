import * as chai from "chai"
import * as token from "../src/token/token"
import * as lexer from "../src/lexer/lexer"
import * as ast from "../src/ast/ast"
import * as parser from "../src/parser/parser"


class To{
    public static ProgramFrom(statements:ast.Statement[]): ast.Program{
        let p :ast.Program = new ast.Program();

        p.Statements = statements;
        return p;
    }
    public static LetStatementFrom(t:token.Token,i1 :ast.Identifier,i2:ast.Identifier): ast.LetStatement{
        let ls :ast.LetStatement = new ast.LetStatement();
        ls.Token = t;
        ls.Name = i1;
        ls.Value =i2;
        return ls;
    }
    public static ReturnStatementFrom(t:token.Token,i1 :ast.Identifier): ast.ReturnStatement{
        let rs :ast.ReturnStatement= new ast.ReturnStatement();
        rs.Token = t;
        rs.ReturnValue =i1;
        return rs;
    }
}

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

describe('IndentifilerExpression',()=>{
    interface test{
        name:string
        input:string
        want:string
    }
    let tests:test[] = [
        {
                name:"1 expression statement",
                input:"foobar;",
                want:"foobar",
        }as test,
    ];

    tests.forEach(tt => {
        it(tt.name,() =>{
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            chai.expect(program.Statements.length).equal(1);

            let ex:ast.ExpressionStatement = program.Statements[0] as ast.ExpressionStatement;
            chai.expect(program.Statements['0']).is.not.null;
            chai.expect(ex.Token.Type).equal(token.TokenType.IDENT);
            chai.expect(ex.String()).equal(tt.want);
        });
    });  
})

describe('ProgramToString',()=>{
    interface test{
        name:string
        input:ast.Program
        want:string
    }
    let tests:test[] = [
        {
                name:"1 let statement",
                input: To.ProgramFrom(
                    [
                        To.LetStatementFrom(
                            new token.Token(token.TokenType.LET,"let"),
                            new ast.Identifier(new token.Token(token.TokenType.IDENT,"myVar"),"myVar"),
                            new ast.Identifier(new token.Token(token.TokenType.IDENT,"anotherVar"),"anotherVar")),
                    ]
                ),
                want:'let myVar = anotherVar;',
        }as test,
        {
            name:"1 return statement",
            input: To.ProgramFrom(
                [
                    To.ReturnStatementFrom(
                        new token.Token(token.TokenType.RETURN,"return"),
                        new ast.Identifier(new token.Token(token.TokenType.IDENT,"x"),"x"),
                    ),
                ]),
            want:'return x;',
    }as test,
    ];

    tests.forEach(tt => {
        it(tt.name,() =>{
            chai.expect(tt.input.String()).equals(tt.want)
        });
    });
})
