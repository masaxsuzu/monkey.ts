# monkey.ts
monkey interpreter in TypeScript

Inspired by https://github.com/masa-suzu/monkey.

``` bash
$ tsc
$ node "./bin/src/monkey.js"
```

``` None
monkey > Hello Monkey!
Token { Type: 'IDENT', Literal: 'Hello' }
Token { Type: 'IDENT', Literal: 'Monkey' }
Token { Type: '!', Literal: '!' }
Token { Type: 'EOF', Literal: '' }
monkey >
...
```
