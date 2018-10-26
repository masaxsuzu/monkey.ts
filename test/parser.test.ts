import * as chai from "chai"
import * as lexer from "../src/lexer/lexer"
import * as ast from "../src/ast/ast"
import * as parser from "../src/parser/parser"

describe('ParseProgram', () => {
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
    ];
    tests.forEach(tt => {
        it(tt.name, () => {
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
    })
})