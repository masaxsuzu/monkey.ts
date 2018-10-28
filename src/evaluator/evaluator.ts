import * as ast from "../ast/ast"
import * as object from "../object/object"

const TRUE = new object.Bool(true);
const FALSE = new object.Bool(false);
const NULL = new object.Null();

export function Evaluate(node: ast.Node): object.Object {
    if (node instanceof ast.Program) {
        return EvaluateStatements(node.Statements);
    } else if (node instanceof ast.ExpressionStatement) {
        return Evaluate(node.Expression.Node());
    } else if (node instanceof ast.IntegerLiteral) {
        return new object.Integer(node.Value);
    } else if (node instanceof ast.Bool) {
        return nativeBoolObject(node.Value.valueOf());
    } else if (node instanceof ast.PrefixExpression) {
        let right = Evaluate(node.Right.Node());
        return EvaluatePrefixExpression(node.Operator, right);
    } else if (node instanceof ast.InfixExpression) {
        let right = Evaluate(node.Right.Node());
        let left = Evaluate(node.Left.Node());

        return EvaluateInfixExpression(node.Operator, left, right);
    }
    return NULL;
}

function EvaluateStatements(statements: ast.Statement[]): object.Object {
    let v: object.Object;
    statements.forEach(s => {
        v = Evaluate(s.Node());
    });
    return v;
}

function EvaluatePrefixExpression(op: string, right: object.Object): object.Object {
    switch (op) {
        case "!":
            return EvaluateBangOperatorExpression(right);
        case "-":
            return EvaluateMinusOperatorExpression(right);
        default:
            NULL;
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
    }
    return NULL;
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
        return NULL;
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
            return NULL;
    }
}