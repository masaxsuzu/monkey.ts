import { Lexer } from "../src/lexer/lexer"
import { Parser } from './parser/parser';
import { Evaluate } from './evaluator/evaluator';
import { NewEnvironment } from './object/environment';

var env = NewEnvironment();
var src,run,out;

export function Run(input: string): string {
    let l = new Lexer(input);
    let p = Parser.New(l);
    let program = p.ToProgram();
    if (p.Errors().length != 0) {
        return printParseErrors(p.Errors());
    }

    let got = Evaluate(program, env);
    if (got == null) { return "" }

    return got.Inspect();
}

function printParseErrors(errors: string[]): string {
    let out = "";
    errors.forEach(e => {
        out += `${e}\n`;
    });

    return out;
}
onload = function () {
    src = document.getElementById('text1');
    out = document.getElementById('text2');
    run = document.getElementById('run');
    run.onclick  = function () {
        let got = Run(src.innerText);
        out.innerText = got; 
    }
}