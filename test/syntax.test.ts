import * as chai from "chai"
import * as lexer from "../src/lexer/lexer"
import * as parser from "../src/parser/parser"

describe('literal', () => {
    interface test {
        name: string
        input: string
        want: string
    }
    let tests: test[] = [
        { name:"integer",input: "1", want: "1", },
        { name:"true",input: "true", want: "true", },
        { name:"false",input: "false", want: "false", },
        { name:"string",input: `"monkey"`, want: "monkey", },
        { name:"function",input: "fn(x) {return x}", want: "fn(x) return x;", },
    ];
    tests.forEach(tt => {
        it(`${tt.name}: \"${tt.input}\" -> ${tt.want}`, () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            chai.expect(p.Errors().length).equal(0, Helper.ToString(p.Errors()));
            chai.expect(program.Statements[0].Node().String()).equal(tt.want);
        });
    });
})

describe('statement', () => {
    interface test {
        name: string
        input: string
        want: string
    }
    let tests: test[] = [
        { name:"let",input: "let x = 1", want: "let x = 1;", },
        { name:"return",input: "return x", want: "return x;", },
    ];
    tests.forEach(tt => {
        it(`${tt.name}: \"${tt.input}\" -> ${tt.want}`, () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            chai.expect(p.Errors().length).equal(0, Helper.ToString(p.Errors()));
            chai.expect(program.Statements[0].Node().String()).equal(tt.want);
        });
    });
})

describe('expression', () => {
    interface test {
        name: string
        input: string
        want: string
    }
    let tests: test[] = [
        { name:"if",input: "if(x) {return x}", want: "if x return x;", },
        { name:"if-else",input: "if(x) {return x} else{return 0}", want: "if x return x; else return 0;", },
        { name:"call",input: "add(1,2)", want: "add(1, 2)", },
    ];
    tests.forEach(tt => {
        it(`${tt.name}: \"${tt.input}\" -> ${tt.want}`, () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            chai.expect(p.Errors().length).equal(0, Helper.ToString(p.Errors()));
            chai.expect(program.Statements[0].Node().String()).equal(tt.want);
        });
    });
})

describe('operator', () => {
    interface test {
        name: string
        input: string
        want: string
    }
    let tests: test[] = [
        { name:"!",input: "!x", want: "(!x)", },
        { name:"+",input: "x + y", want: "(x + y)", },
        { name:"-",input: "x - y", want: "(x - y)", },
        { name:"*",input: "x * y", want: "(x * y)", },
        { name:"/",input: "x / y", want: "(x / y)", },
        { name:"==",input: "x == y", want: "(x == y)", },
        { name:"!=",input: "x != y", want: "(x != y)", },
        { name:">",input: "x > y", want: "(x > y)", },
        { name:"<",input: "x < y", want: "(x < y)", },
    ];
    tests.forEach(tt => {
        it(`${tt.name}: \"${tt.input}\" -> ${tt.want}`, () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            chai.expect(p.Errors().length).equal(0, Helper.ToString(p.Errors()));
            chai.expect(program.Statements[0].Node().String()).equal(tt.want);
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