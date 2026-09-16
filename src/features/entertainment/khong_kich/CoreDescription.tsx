import React from "react";
import { Swords, Shield, Heart, HeartPulse, Crosshair, Zap, Timer, BatteryCharging, Gauge } from "lucide-react";

export const COMBAT_STAT_SEMANTICS = {
  firepower:{Icon:Swords,color:"#ef4444",names:["Hỏa Lực"]},
  armor:{Icon:Shield,color:"#60a5fa",names:["Giáp"]},
  maxHp:{Icon:Heart,color:"#22c55e",names:["Máu Tối Đa","HP tối đa"]},
  regen:{Icon:HeartPulse,color:"#86efac",names:["Hồi Máu mỗi giây","Hồi Máu/s","HP Regen","Hồi HP"]},
  crit:{Icon:Crosshair,color:"#f97316",names:["Tỷ Lệ Chí Mạng"]},
  critDamage:{Icon:Zap,color:"#fb923c",names:["Sát Thương Chí Mạng"]},
  cooldown:{Icon:Timer,color:"#f9a8d4",names:["Thời Gian Hồi Chiêu","Giảm Hồi Chiêu","Hồi Chiêu"]},
  resource:{Icon:BatteryCharging,color:"#c4b5fd",names:["Hồi Tài Nguyên","Hồi Mana","Hồi Điện","Mana Tối Đa","Tài Nguyên Tối Đa","Điện"]},
  fireRate:{Icon:Gauge,color:"#facc15",names:["Tốc Độ Bắn"]},
} as const;
type Semantic = keyof typeof COMBAT_STAT_SEMANTICS;
const names=Object.entries(COMBAT_STAT_SEMANTICS).flatMap(([key,value])=>value.names.map(name=>({key:key as Semantic,name}))).sort((a,b)=>b.name.length-a.name.length);
const value=String.raw`[+−-]?\d+(?:[.,]\d+)*(?:%|s)?`;
const stat=names.map(v=>v.name).join("|");
// Only the explicit stat vocabulary assigns semantics. Other numbers remain gold.
const pattern=new RegExp(`((?:Giảm\\s+)?${value}(?:\\s+giây)?\\s+(?:${stat})|(?:${stat})\\s*:\\s*${value}|${value})`,"giu");
export function combatTextTokens(text:string): {text:string;semantic?:Semantic;number?:boolean;value?:string;label?:string}[] {
  return text.split(pattern).filter(Boolean).map(part=>{
    if(!/\d/.test(part))return {text:part};
    const match=names.find(v=>part.toLocaleLowerCase("vi").includes(v.name.toLocaleLowerCase("vi")));
    if (!match) return {text:part,number:true};
    const amount=(/^Giảm\s+\d/i.test(part) ? "Giảm " : "") + (part.match(new RegExp(value))?.[0] ?? "") + (/\d\s+giây/i.test(part) ? "s" : "");
    const label=match.key === "cooldown" && match.name === "Hồi Chiêu" ? "Thời Gian Hồi Chiêu"
      : part.slice(part.toLocaleLowerCase("vi").indexOf(match.name.toLocaleLowerCase("vi"))).replace(/\s*:\s*.*$/, "");
    return {text:part,semantic:match.key,number:true,value:amount,label};
  });
}
export function CoreDescription({text}:{text:string}) {
  return <>{combatTextTokens(text).map((token,i)=>{
    if(token.semantic){const {Icon,color}=COMBAT_STAT_SEMANTICS[token.semantic];return <strong key={i} style={{color}}>{token.value}{" "}<Icon aria-hidden="true" style={{display:"inline",width:"1em",height:"1em",verticalAlign:"-.12em",marginRight:".15em"}}/>{token.label}</strong>;}
    return token.number?<strong key={i} style={{color:"#fde047"}}>{token.text}</strong>:token.text;
  })}</>;
}
/** Hidden icon prototypes let the existing status DOM updater share the same renderer vocabulary. */
export function CombatStatIconTemplates(){return <span hidden aria-hidden="true">{Object.entries(COMBAT_STAT_SEMANTICS).map(([key,{Icon}])=><span data-semantic-icon={key} key={key}><Icon/></span>)}</span>;}
export function updateCombatRichText(node:Element,text:string,templates:Element){
  if(node.getAttribute("data-rich-text")===text)return;
  const children=combatTextTokens(text).map(token=>{
    if(!token.number)return document.createTextNode(token.text);
    const strong=document.createElement("strong");strong.style.color=token.semantic?COMBAT_STAT_SEMANTICS[token.semantic].color:"#fde047";
    if(token.semantic){strong.append(document.createTextNode(`${token.value} `));const icon=templates.querySelector(`[data-semantic-icon="${token.semantic}"] svg`)?.cloneNode(true) as SVGElement|undefined;
      if(icon){icon.setAttribute("aria-hidden","true");icon.style.cssText="display:inline;width:1em;height:1em;vertical-align:-.12em;margin-right:.15em";strong.append(icon);}}
    strong.append(document.createTextNode(token.semantic ? token.label! : token.text));return strong;
  });
  node.replaceChildren(...children);node.setAttribute("data-rich-text",text);
}
