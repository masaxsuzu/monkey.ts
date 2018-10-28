import * as readline from 'readline';
import { Lexer } from "../src/lexer/lexer"
import { TokenType } from "../src/token/token"
import { Parser } from './parser/parser';
import { Evaluate } from './evaluator/evaluator';

interface writer{
    write(data: string | Buffer, key?: readline.Key);
}

function ep(input: string,o:writer) {
    let l = new Lexer(input);
    let p = Parser.New(l);
    let program = p.ToProgram();
        if(p.Errors().length != 0){
            printParseErrors(p.Errors(),o);
            return;
        }

        let got = Evaluate(program);
        o.write(got.Inspect());
        o.write("\n");
}

function repl(rl: readline.ReadLine) {
    rl.question('monkey > ', (r: string) => {
        ep(r,rl);
        repl(rl);
    })
}

function printParseErrors(errors:string[],o:writer){
    errors.forEach(e => {
        o.write(`\t${e}\n`);
    });
}

repl(readline.createInterface({
    input: process.stdin,
    output: process.stdout
}))