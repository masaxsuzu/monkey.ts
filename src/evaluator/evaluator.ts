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
    }else if (node instanceof ast.Bool) {
        return nativeBoolObject(node.Value.valueOf());
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

function nativeBoolObject(input:boolean):object.Bool{
    if(input){
        return TRUE;
    }
    return FALSE;
}