import * as ast from "../ast/ast"
import { Environment } from "./environment";

export enum Type {
    NULL_OBJ = "NULL",
    INTEGER_OBJ = "INTEGER",
    BOOL_OBJ = "BOOL",
    RETURN_VALUE_OBJ = "RETURN_VALUE",
    FUNCTION_OBJ = "FUNCTION_VALUE",
    ERROR_OBJ = "ERROR",
}

export interface Object {
    Type(): Type
    Inspect(): string
}

export class Integer {
    Value: number

    constructor(v: number) {
        this.Value = v;
    }
    Type(): Type {
        return Type.INTEGER_OBJ;
    }
    Inspect(): string {
        return `${this.Value}`;
    }
}

export class Bool {
    Value: boolean

    constructor(v: boolean) {
        this.Value = v;
    }
    Type(): Type {
        return Type.BOOL_OBJ;
    }
    Inspect(): string {
        return `${this.Value}`;
    }
}

export class ReturnValue {
    Value: Object
    Type(): Type { return Type.RETURN_VALUE_OBJ; }
    Inspect(): string { return this.Value.Inspect(); }
}

export class Function{
    Parameters: ast.Identifier[]
    Body: ast.BlockStatement
    Env: Environment

    Type():Type{return Type.FUNCTION_OBJ;}
    Inspect():string{
        let out = "";
        let params:string[] = [];
        this.Parameters.forEach(element => {
            params.push(element.String());
        });

        out += "fn";
        out += "(";
        out += params.join(", ");
        out += ") ";
        out += "{\n";
        out += this.Body.String();
        out += "\n}";
        return out;
    }
}
export class Error{
    Message:string
    Type():Type{return Type.ERROR_OBJ;}
    Inspect():string{return `ERROR: ${this.Message}`;}
}

export class Null {

    constructor() {
    }
    Type(): Type {
        return Type.NULL_OBJ;
    }
    Inspect(): string {
        return `null`;
    }
}


