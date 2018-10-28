import { inspect } from "util";

export enum Type {
    NULL_OBJ = "NULL",
    INTEGER_OBJ = "INTEGER",
    BOOL_OBJ = "BOOL"
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


