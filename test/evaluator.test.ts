import * as chai from "chai"
import * as lexer from "../src/lexer/lexer"
import * as parser from "../src/parser/parser"
import * as object from "../src/object/object"
import * as evaluator from "../src/evaluator/evaluator"

describe('Object', () => {
    interface test {
        input: string
        want: {value:any,literal:string}
    }
    let tests: test[] = [
        { input: "1", want: {value:1,literal:"1"}, },
        { input: "2", want: {value:2,literal:"2"}, },
        { input: "true", want: {value:true,literal:"true"}, },
        { input: "false", want: {value:false,literal:"false"}, },
        { input: "!true", want: {value:false,literal:"false"}, },
        { input: "!false", want: {value:true,literal:"true"}, },
        { input: "!5", want: {value:false,literal:"false"}, },
        { input: "!!5", want: {value:true,literal:"true"}, },
    ];
    tests.forEach(tt => {
        it(`${tt.input} -> ${tt.want.value}`, () => {
            let got = <object.Integer>Helper.Eval(tt.input);

            chai.expect(got.Value,"Value").equal(tt.want.value);
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