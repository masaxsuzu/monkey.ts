import * as ast from "../ast/ast"
import * as object from "../object/object"
import { Environment,NewEnvironment,NewEnclosedEnvironment } from "../object/environment"
import { BlockStatement } from "../ast/ast";

const TRUE = new object.Bool(true);
const FALSE = new object.Bool(false);
const NULL = new object.Null();

export function GetNULL(): object.Null {
    return NULL;
}

export function Evaluate(node: ast.Node, e: Environment): object.Object {
    if (node instanceof ast.Program) {
        return EvaluateProgram(node, e);
    } else if (node instanceof ast.ExpressionStatement) {
        return Evaluate(node.Expression.Node(), e);
    } else if (node instanceof ast.LetStatement) {
        let v = Evaluate(node.Value.Node(), e);
        if (isError(v)) {
            return v;
        }
        e.Set(node.Name.Value, v);

    } else if (node instanceof ast.ReturnStatement) {
        let v = Evaluate(node.ReturnValue.Node(), e);
        if (isError(v)) {
            return v;
        }
        let rv = new object.ReturnValue();
        rv.Value = v;
        return rv;
    } else if (node instanceof ast.BlockStatement) {
        return EvaluateBlockStatement(node, e);
    } else if (node instanceof ast.IntegerLiteral) {
        return new object.Integer(node.Value);
    } else if (node instanceof ast.Bool) {
        return nativeBoolObject(node.Value.valueOf());
    } else if (node instanceof ast.Identifier) {
        return EvaluateIdentifier(node,e);
    } else if (node instanceof ast.FunctionLiteral){
        let p = node.Parameters;
        let body = node.Body;
        let f = new object.Function();
        f.Parameters = p;
        f.Body = body;
        f.Env = e;
        return f;
    } else if (node instanceof ast.PrefixExpression) {
        let right = Evaluate(node.Right.Node(), e);
        if (isError(right)) {
            return right;
        }
        return EvaluatePrefixExpression(node.Operator, right);
    } else if (node instanceof ast.InfixExpression) {
        let right = Evaluate(node.Right.Node(), e);
        if (isError(right)) {
            return right;
        }
        let left = Evaluate(node.Left.Node(), e);
        if (isError(left)) {
            return left;
        }
        return EvaluateInfixExpression(node.Operator, left, right);
    } else if (node instanceof ast.CallExpression){
        let f = Evaluate(node.Function.Node(),e);
        if (isError(f)){
            return f;
        }
        let args = EvaluateExpression(node.Arguments,e);
        if (args.length == 1 && isError(args[0])){
            return args[0];
        }

        return applyFunction(f,args);
    }else if (node instanceof ast.IfExpression) {
        let condition = Evaluate(node.Condition.Node(), e);
        if (isError(condition)) {
            return condition;
        }
        if (isTruth(condition)) {
            return Evaluate(node.Consequence, e)
        } else if (node.Alternative != null) {
            return Evaluate(node.Alternative, e);
        } else {
            return NULL;
        }
    }
    return null;
}

function isTruth(obj: object.Object): boolean {
    switch (obj) {
        case NULL:
            return false;
        case TRUE:
            return true;
        case FALSE:
            return false;
        default:
            return true;
    }
}

function isError(obj: object.Object): boolean {
    if (obj != null) {
        return obj.Type() == object.Type.ERROR_OBJ;
    }

    return false;
}

function EvaluateProgram(program: ast.Program, e: Environment): object.Object {
    let obj: object.Object;

    for (let index = 0; index < program.Statements.length; index++) {
        const statement = program.Statements[index];
        obj = Evaluate(statement.Node(), e);
        if (obj instanceof object.ReturnValue) {
            return obj.Value;
        }
        if (obj instanceof object.Error) {
            return obj;
        }
    }

    return obj;
}

function EvaluateIdentifier(node:ast.Identifier,e:Environment):object.Object{
    let v = e.Get(node.Value);
    if(!v.exist){
        return NewError(`identifier not found: ${node.Value}`)
    }
    return v.value;
}

function EvaluatePrefixExpression(op: string, right: object.Object): object.Object {
    switch (op) {
        case "!":
            return EvaluateBangOperatorExpression(right);
        case "-":
            return EvaluateMinusOperatorExpression(right);
        default:
            return NewError(`unknown operator: ${op + right.Type()}`);
    }
}

function EvaluateInfixExpression(op: string, left: object.Object, right: object.Object): object.Object {
    if (left instanceof object.Integer && right instanceof object.Integer) {
        return EvaluateIntegerInfixExpression(op, left, right);
    }
    // ch3p140
    // As now now, Bool and Null objects are constant.
    // So we can compare them by references.
    else if (op == "==") {
        return nativeBoolObject(left == right)
    } else if (op == "!=") {
        return nativeBoolObject(left != right)
    } else if (left.Type() != right.Type()) {
        return NewError(`type mismatch: ${left.Type()} ${op} ${right.Type()}`);
    }
    return NewError(`unknown operator: ${left.Type()} ${op} ${right.Type()}`);
}

function EvaluateExpression(expressions:ast.Expression[],e:Environment):object.Object[]{
    let results = []
    expressions.forEach(element => {
        let got = Evaluate(element.Node(),e);
        if(isError(got)){
            return results;
        }
        results.push(got);
    })
    return results;
}

function EvaluateBlockStatement(block: BlockStatement, e: Environment): object.Object {
    let v: object.Object;
    for (let index = 0; index < block.Statements.length; index++) {
        const s = block.Statements[index];
        v = Evaluate(s.Node(), e);
        if (v instanceof object.ReturnValue) {
            return v;
        }
        if (v instanceof object.Error) {
            return v;
        }
    }
    return v;

}

function nativeBoolObject(input: boolean): object.Bool {
    if (input) {
        return TRUE;
    }
    return FALSE;
}

function EvaluateBangOperatorExpression(right: object.Object): object.Object {
    switch (right) {
        case TRUE:
            return FALSE;
        case FALSE:
            return TRUE;
        case NULL:
            return TRUE;
        default:
            return FALSE;
    }
}

function EvaluateMinusOperatorExpression(right: object.Object): object.Object {
    if (!(right instanceof object.Integer)) {
        return NewError(`unknown operator: -${right.Type()}`);
    }
    return new object.Integer(-1 * right.Value);
}

function EvaluateIntegerInfixExpression(op: string, left: object.Integer, right: object.Integer): object.Object {
    switch (op) {
        case "+":
            return new object.Integer(left.Value + right.Value);
        case "-":
            return new object.Integer(left.Value - right.Value);
        case "/":
            return new object.Integer(left.Value / right.Value);
        case "*":
            return new object.Integer(left.Value * right.Value);
        case "<":
            return nativeBoolObject(left.Value < right.Value);
        case ">":
            return nativeBoolObject(left.Value > right.Value);
        case "==":
            return nativeBoolObject(left.Value == right.Value);
        case "!=":
            return nativeBoolObject(left.Value != right.Value);
        default:
            return NewError(`unknown operator: ${left.Type()} ${op} ${right.Type()}`);
    }
}

function applyFunction(f:object.Object,args:object.Object[]):object.Object{
    if (f instanceof object.Function){
        let newEnv = ExtendedFunctionEnvironment(f,args);
        let got = Evaluate(f.Body,newEnv)
        return UnwrapReturnValue(got);
    }
    return NewError(`not a function: ${f.Type()}`);
}

function ExtendedFunctionEnvironment(f:object.Function,args:object.Object[]):Environment{
    let env = NewEnclosedEnvironment(f.Env);
    for (let index = 0; index < f.Parameters.length; index++) {
        const element = f.Parameters[index];
        env.Set(element.Value,args[index]);
    }
    return env;
}

function UnwrapReturnValue(obj:object.Object):object.Object{
    if (obj instanceof object.ReturnValue){
        return obj.Value;
    }

    return obj;
}

function NewError(msg: string): object.Error {
    let e = new object.Error();
    e.Message = msg;
    return e;
}