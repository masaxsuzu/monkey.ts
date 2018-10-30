import * as object from "../object/object"

export function NewEnvironment(): Environment{
    let env = new Environment();
    env.store = new Map<string,object.Object>();
    env.outer = null;
    return env;
}

export function NewEnclosedEnvironment(outer:Environment):Environment{
    let env = NewEnvironment();
    env.outer = outer;

    return env;
}

export class Environment{
    store: Map<string,object.Object>
    outer:Environment

    Get(name:string):{value:object.Object,exist:boolean}{
        if(!this.store.has(name) && this.outer != null){
            return this.outer.Get(name);
        }
        return {value:this.store.get(name),exist:this.store.has(name)};
    }
    Set(name:string,v:object.Object){
        this.store.set(name,v);
    }
}