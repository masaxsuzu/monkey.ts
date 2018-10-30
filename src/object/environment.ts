import * as object from "../object/object"

export function NewEnvironment(): Environment{
    let env = new Environment();
    env.store = new Map<string,object.Object>();
    return env;
}

export class Environment{
    store: Map<string,object.Object>

    Get(name:string):{value:object.Object,exist:boolean}{
        if(this.store.has(name)){
            return {value:this.store.get(name),exist:true};
        }
        return {value:undefined,exist:false}
    }
    Set(name:string,v:object.Object){
        this.store.set(name,v);
    }
}