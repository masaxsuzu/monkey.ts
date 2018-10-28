import * as ast from "../ast/ast"
import * as object from "../object/object"

export function Evaluate(node: ast.Node): object.Object {
    if (node instanceof ast.Program) {
        return EvaluateStatements(node.Statements);
    } else if (node instanceof ast.ExpressionStatement) {
        return Evaluate(node.Expression.Node());
    } else if (node instanceof ast.IntegerLiteral) {
        return new object.Integer(node.Value);
    }
    return null;
}

function EvaluateStatements(statements: ast.Statement[]): object.Object {
    let v: object.Object;
    statements.forEach(s => {
        v = Evaluate(s.Node());
    });
    return v;
}