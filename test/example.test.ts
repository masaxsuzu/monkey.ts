import * as chai from "chai"
import * as lexer from "../src/lexer/lexer"
import * as parser from "../src/parser/parser"
import * as environment from "../src/object/environment"
import * as object from "../src/object/object"
import * as evaluator from "../src/evaluator/evaluator"
import { NewEnvironment } from "../src/object/environment";

interface test {
    input: string
    want: string
}

describe('Let statement', () => {

    let tests: test[] = [
        { input: `
        let x = 200;
        let y = 100;
        x + y;`, want: "300", },
      ];
    Assert(tests);
})

describe('Return statement', () => {

    let tests: test[] = [
        { input: `
        return 200;
        let x = 100;
        3 * x;`, want: "200", },
      ];
    Assert(tests);
})

describe('If-else expression', () => {

    let tests: test[] = [
        { input: `
        if(1 > 0) {
            return 100;
        } else {
            return 200;
        }`, want: "100", },
        { input: `
        if(1) {
            return 200;
        } else {
            return 0;
        }`, want: "200", },
      ];
    Assert(tests);
})

describe('Function literal & calling function', () => {

    let tests: test[] = [
        { input: `
        let f = fn(x) {
            return x * 100;
        };
        f(10);`, want: "1000", },
      ];
    Assert(tests);
})

describe('Closure', () => {

    let tests: test[] = [
        { input: `
        let f = fn(x){
            let z = 3 * x;
            return fn(y){
                z + y;
            }
        };
        f(1)(2);`, want: "5", },
        { input: `
        let multiplier = fn(x){
            fn(f){
                x * f() ;
            }
        };
        let identity = fn(x){
            fn(){
                x;
            }
        };
        multiplier(2)(identity(4));`, want: "8", },
      ];
    Assert(tests);
})

describe('Recursive function', () => {

    let tests: test[] = [
        { input: `
        let fib = fn(x){
            if(x < 2) {
                return x;
            }
            return fib(x-1) + fib(x-2); 
        };
        fib(6);`, want: "8", },
      ];
    Assert(tests);
})

function Assert(tests: test[]) {
    tests.forEach(tt => {
        it(`${tt.input} -> ${tt.want}`, () => {
            let l = new lexer.Lexer(tt.input);
            let p = parser.Parser.New(l);
            let env = NewEnvironment();
            let program = p.ToProgram();
            let got = evaluator.Evaluate(program,env);
            chai.expect(p.Errors().length).equal(0, ToString(p.Errors()));
            chai.expect(got.Inspect()).equal(tt.want);
        });
    });
}
function ToString(values: string[]): string {
    let s = "";

    values.forEach(element => {
        s += ("\t" + element + "\n");
    });
    return s;
}