# Writing an interpreter in TypeScript
This is an implementation of the Monkey interpreter from Thorsten Ball's book [Writing an interpreter in Go](https://interpreterbook.com).

Monkey interpreter implements a repl.
```
monkey > let hello = monkey
let hello = monkey;
```

## Syntax
As of now, these syntaxes are available.
* literal
  * integer: "1" -> 1
  * true: "true" -> true
  * false: "false" -> false
  * function: "fn(x) {return x}" -> fn(x) return x;

* statement
  * let: "let x = 1" -> let x = 1;
  * return: "return x" -> return x;

* expression
  * if: "if(x) {return x}" -> if x return x;
  * if-else: "if(x) {return x} else{return 0}" -> if x return x; else return 0;
  * call: "add(1,2)" -> add(1, 2)

* operator
  * "!": "!x" -> (!x)
  * "+": "x + y" -> (x + y)
  * "-": "x - y" -> (x - y)
  * "*": "x * y" -> (x * y)
  * "/": "x / y" -> (x / y)
  * "==": "x == y" -> (x == y)
  * "!=": "x != y" -> (x != y)
  * ">": "x > y" -> (x > y)
  * "<": "x < y" -> (x < y)
