// Session-only presentation metadata. Owners are combat entities/effects, never saves.
const cycles = new WeakMap<object, Map<string, {until:number;duration:number}>>();
export function statusExpiry(owner:object,key:string,at:number,duration:number):number {
 let entries=cycles.get(owner);if(!entries){entries=new Map();cycles.set(owner,entries);}
 entries.set(key,{until:at+duration,duration});return at+duration;
}
export function statusDuration(owner:object,key:string,fallback:number):number {
 return cycles.get(owner)?.get(key)?.duration ?? fallback;
}

export function extendStatusRemaining(owner:object,key:string,current:number,next:number,at:number):number {
 if(next>current)statusExpiry(owner,key,at,next);
 return Math.max(current,next);
}
