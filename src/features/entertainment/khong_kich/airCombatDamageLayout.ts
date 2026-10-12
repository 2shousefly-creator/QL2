import { GAMEPLAY_SAFE_RECT as R } from './airCombatConfig';

interface LabelBox { x:number; y:number; width:number; height:number }
export const DAMAGE_LINE_GAP = 4;

/** Screen-space layout shared by both aircraft and both renderers. Place after
 * float/pop/rotation, using measured text bounds including its outline. */
export class DamageTextLayout {
  private boxes: LabelBox[] = [];
  private frame = 0;
  private floating = new Map<object,{generation:number;dx:number;dy:number;seen:number;box?:LabelBox}>();
  constructor(private limits: { maxLabels?:number; maxOffsetX?:number; maxOffsetY?:number } = {}) {}
  begin() {
    this.frame++; this.boxes.length = 0;
    for(const [key,entry] of this.floating){
      if(entry.seen < this.frame-1){this.floating.delete(key);continue;}
      if(entry.box)this.boxes.push(entry.box);
    }
  }

  /** Choose a nearby lane once. Later frames only follow the label's upward path. */
  placeFloating(key:object,generation:number,x:number,y:number,width:number,height:number):LabelBox|undefined {
    let entry=this.floating.get(key);
    if(entry?.generation===generation){
      entry.seen=this.frame;
      if(entry.box)Object.assign(entry.box,{x:x+entry.dx,y:y+entry.dy,width,height});
      return entry.box;
    }
    if(entry?.box){const index=this.boxes.indexOf(entry.box);if(index>=0)this.boxes.splice(index,1);}
    const box=this.place(x,y,width,height,24);
    entry={generation,dx:box?box.x-x:0,dy:box?box.y-y:0,seen:this.frame,box};
    this.floating.set(key,entry);
    return box;
  }

  place(x:number,y:number,width:number,height:number,maxOffset=Infinity):LabelBox|undefined {
    const gap=DAMAGE_LINE_GAP;
    if(this.boxes.length >= (this.limits.maxLabels ?? Infinity))return undefined;
    if(![x,y,width,height].every(Number.isFinite))return undefined;
    width=Math.max(1,width); height=Math.max(1,height);
    if(width>R.width||height>R.height)return undefined;
    const left=R.left+width/2,right=R.right-width/2;
    const top=R.top+height/2,bottom=R.bottom-height/2;
    const anchorX=Math.max(left,Math.min(right,x)),anchorY=Math.max(top,Math.min(bottom,y));
    const localTop=Math.max(top,anchorY-Math.min(maxOffset,this.limits.maxOffsetY??Infinity));
    const localBottom=Math.min(bottom,anchorY+Math.min(maxOffset,this.limits.maxOffsetY??Infinity));
    // Prefer one vertical stack. Only spill sideways when that column is full.
    const columns=[...new Set([anchorX,...this.boxes.flatMap(b=>[b.x-(b.width+width)/2-gap-.01,b.x+(b.width+width)/2+gap+.01]),left,right])]
      .filter(px=>px>=left&&px<=right&&Math.abs(px-anchorX)<=Math.min(maxOffset,this.limits.maxOffsetX??Infinity)).sort((a,b)=>Math.abs(a-anchorX)-Math.abs(b-anchorX));
    for(const px of columns){
      const blocked=this.boxes.filter(b=>Math.abs(px-b.x)<(width+b.width)/2+gap)
        .map(b=>({top:b.y-(b.height+height)/2-gap-.01,bottom:b.y+(b.height+height)/2+gap+.01}))
        .sort((a,b)=>a.top-b.top);
      let cursor=localTop,best:number|undefined;
      const consider=(start:number,end:number)=>{
        if(end<start)return;
        const candidate=Math.max(start,Math.min(end,anchorY));
        if(best===undefined||Math.abs(candidate-anchorY)<Math.abs(best-anchorY))best=candidate;
      };
      for(const interval of blocked){
        if(interval.bottom<cursor)continue;
        consider(cursor,Math.min(localBottom,interval.top));
        cursor=Math.max(cursor,interval.bottom);
        if(cursor>localBottom)break;
      }
      consider(cursor,localBottom);
      if(best!==undefined){
        const box={x:px,y:best,width,height};this.boxes.push(box);return box;
      }
    }
    // The existing finite label pool may saturate the screen; never overlap or
    // move text under HUD controls to force an extra label into a full viewport.
    return undefined;
  }
}
