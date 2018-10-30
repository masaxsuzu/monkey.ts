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
## Examples
* Let statement
```
let x = 200;
let y = 100;
x + y; // -> 300
```
* Return statement
```
return 200;
let x = 100;
3 * x; // -> 200
```
* If-else expression
```
if(1 > 0) {
    return 100;
} else {
    return 200;
} // -> 100
```

* Function literal & calling function
```
let f = fn(x) {
    return x * 100;
};
f(10); // -> 1000
```

* Closure
```
let f = fn(x){
    let z = 3 * x;
    return fn(y){
        z + y;
    }
};
f(1)(2); // -> 5
```

* Recursive function
```
let fib = fn(x){
    if(x < 2) {
        return x;
    }
    return fib(x-1) + fib(x-2);
};
fib(6); // -> 8
```
