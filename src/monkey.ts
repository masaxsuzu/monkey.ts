import * as readline from 'readline';
import { Lexer } from "../src/lexer/lexer"
import { TokenType } from "../src/token/token"

function ep(name: string) {
    let l = new Lexer(name)
    while (true) {
        let t = l.NextToken()
        console.log(t)
        if (t.Type == TokenType.EOF) {
            return
        }
    }
}

function repl(rl: readline.ReadLine) {
    rl.question('monkey > ', (r: string) => {
        ep(r);
        repl(rl)
    })
}

repl(readline.createInterface({
    input: process.stdin,
    output: process.stdout
}))