import { inspect } from "util";

export enum Type {
    NULL_OBJ = "NULL",
    INTEGER_OBJ = "INTEGER",
    BOOL_OBJ = "BOOL",
    RETURN_VALUE_OBJ = "RETURN_VALUE"
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


