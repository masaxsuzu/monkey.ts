import * as chai from "chai"
import * as lexer from "../src/lexer/lexer"
import * as parser from "../src/parser/parser"
import * as object from "../src/object/object"
import * as evaluator from "../src/evaluator/evaluator"

describe('IntegerObject', () => {
    interface test {
        name: string
        input: string
        want: number
    }
    let tests: test[] = [
        { name:"one",input: "1", want: 1, },
    ];
    tests.forEach(tt => {
        it(`${tt.name}`, () => {
            let got = <object.Integer>Helper.Eval(tt.input);

            chai.expect(got.Value).equal(tt.want);
        });
    });
})

class Helper{
    public static Eval(input:string):Object{
        let l = new lexer.Lexer(input);
            let p = parser.Parser.New(l);
            let program = p.ToProgram();
            chai.expect(p.Errors().length).equal(0, Helper.ToString(p.Errors()));
            return evaluator.Evaluate(program);
    }
    static ToString(values: string[]): string {
        let s = "";

        values.forEach(element => {
            s += ("\t" + element + "\n");
        });
        return s;
    }
}