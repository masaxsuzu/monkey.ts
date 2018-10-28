import * as chai from "chai"
import * as lexer from "../src/lexer/lexer"
import * as parser from "../src/parser/parser"
import * as object from "../src/object/object"
import * as evaluator from "../src/evaluator/evaluator"

interface test {
    input: string
    want: { value: any, literal: string }
}

describe('IntegerObject', () => {

    let tests: test[] = [
        { input: "1", want: { value: 1, literal: "1" }, },
        { input: "-5", want: { value: -5, literal: "-5" }, },
        { input: "-15", want: { value: -15, literal: "-15" }, },
        { input: "5+5", want: { value: 10, literal: "10" }, },
        { input: "5-5", want: { value: 0, literal: "0" }, },
        { input: "5*5", want: { value: 25, literal: "25" }, },
        { input: "5/5", want: { value: 1, literal: "1" }, },
        
    ];
    tests.forEach(tt => {
        let got = <object.Integer>Eval(tt.input);
        it(`${tt.input} -> ${tt.want.value}`, () => {
            chai.expect(got.Value, "Value").equal(tt.want.value);
        })
    });
})

describe('BoolObject', () => {

    let tests: test[] = [
        { input: "true", want: { value: true, literal: "true" }, },
        { input: "false", want: { value: false, literal: "false" }, },
        { input: "!5", want: { value: false, literal: "false" }, },
        { input: "!!5", want: { value: true, literal: "true" }, },
        // { input: "1<2", want: { value: true, literal: "false" }, },
        // { input: "1>2", want: { value: false, literal: "false" }, },
        // { input: "1<1", want: { value: false, literal: "false" }, },
        // { input: "1>1", want: { value: false, literal: "false" }, },
        // { input: "1==1", want: { value: true, literal: "false" }, },
        // { input: "1!=1", want: { value: false, literal: "false" }, },
        // { input: "1==2", want: { value: false, literal: "false" }, },
        // { input: "1!=2", want: { value: true, literal: "false" }, },
    ];
    tests.forEach(tt => {
        let got = <object.Bool>Eval(tt.input);
        it(`${tt.input} -> ${tt.want.value}`, () => {
            chai.expect(got.Value, "Value").equal(tt.want.value);
        })
    });
})

describe('NullObject', () => {

    let tests: test[] = [
        { input: "-true", want: { value: object.Type.NULL_OBJ, literal: "null" }, },
        { input: "true + 1", want: { value: object.Type.NULL_OBJ, literal: "null" }, },
        { input: "true - 1", want: { value: object.Type.NULL_OBJ, literal: "null" }, },
        { input: "true * 1", want: { value: object.Type.NULL_OBJ, literal: "null" }, },
        { input: "true / 1", want: { value: object.Type.NULL_OBJ, literal: "null" }, },
    ];
    tests.forEach(tt => {
        let got = <object.Null>Eval(tt.input);
        it(`${tt.input} -> ${tt.want.value}`, () => {
            chai.expect(got.Inspect()).equal(tt.want.literal);
            chai.expect(got.Type()).equal(tt.want.value);
        })
    });
})


function Eval(input: string): Object {
    let l = new lexer.Lexer(input);
    let p = parser.Parser.New(l);
    let program = p.ToProgram();
    chai.expect(p.Errors().length).equal(0, ToString(p.Errors()));
    return evaluator.Evaluate(program);
}
function ToString(values: string[]): string {
    let s = "";

    values.forEach(element => {
        s += ("\t" + element + "\n");
    });
    return s;
}