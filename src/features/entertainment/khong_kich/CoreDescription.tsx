import React from "react";
import { Swords, Shield, Heart, HeartPulse, Crosshair, Zap, Timer, BatteryCharging, Gauge } from "lucide-react";

export const COMBAT_STAT_SEMANTICS = {
  firepower:{Icon:Swords,color:"#ef4444",names:["Hỏa Lực","Hoả Lực"]},
  armor:{Icon:Shield,color:"#60a5fa",names:["Giáp"]},
  maxHp:{Icon:Heart,color:"#22c55e",names:["Máu Tối Đa","HP tối đa"]},
  regen:{Icon:HeartPulse,color:"#86efac",names:["Hồi Máu mỗi giây","Hồi Máu/giây","Hồi Máu/s","Hồi Máu","HP Regen","Hồi HP","HP/s"]},
  crit:{Icon:Crosshair,color:"#f97316",names:["Tỷ Lệ Chí Mạng","Crit Chance"]},
  critDamage:{Icon:Zap,color:"#fb923c",names:["Sát Thương Chí Mạng"]},
  cooldown:{Icon:Timer,color:"#f9a8d4",names:["Thời Gian Hồi Chiêu","Giảm Hồi Chiêu","Hồi Chiêu"]},
  resource:{Icon:BatteryCharging,color:"#c4b5fd",names:["tốc độ hồi phục tài nguyên mỗi giây","tốc độ hồi phục tài nguyên","tốc độ Hồi Tài Nguyên mỗi giây","tốc độ Hồi Tài Nguyên/s","tốc độ Hồi Tài Nguyên","hồi phục tài nguyên","Hồi Tài Nguyên mỗi giây","Hồi Tài Nguyên/s","Hồi Tài Nguyên","Hồi Mana","Hồi Điện","Mana Tối Đa","Điện Tối Đa","Tài Nguyên Tối Đa","Điện"]},
  fireRate:{Icon:Gauge,color:"#facc15",names:["Tốc Độ Bắn"]},
} as const;
type Semantic = keyof typeof COMBAT_STAT_SEMANTICS;
const names=Object.entries(COMBAT_STAT_SEMANTICS).flatMap(([key,value])=>value.names.map(name=>({key:key as Semantic,name}))).sort((a,b)=>b.name.length-a.name.length);
const value=String.raw`[+−-]?\d+(?:[.,]\d+)*(?:%|s)?`;
const stat=names.map(v=>v.name === "Điện" ? String.raw`Điện(?!\s+Năng)` : v.name).join("|");
const bareStat=names.filter(v=>v.name !== "Điện").map(v=>v.name).join("|");
const units=String.raw`(?:\s+điểm\s+phần\s+trăm|\s+giây)?`;
// Stat-only mentions and aliases share exactly the same icon/color vocabulary.
const pattern=new RegExp(`(${value}${units}\\s+(?:tổng\\s+)?(?:${stat})|(?:${bareStat})(?:\\s*:\\s*${value})?|${value})`,"giu");
export function combatTextTokens(text:string): {text:string;semantic?:Semantic;number?:boolean;value?:string;label?:string}[] {
  return text.split(pattern).map((part,index)=>{
    if(index%2===0)return {text:part};
    const match=names.find(v=>part.toLocaleLowerCase("vi").includes(v.name.toLocaleLowerCase("vi")));
    if (!match) return {text:part,number:/\d/.test(part)};
    const amount=part.match(new RegExp(value))?.[0] ?? "";
    const unit=/điểm\s+phần\s+trăm/i.test(part)?" điểm phần trăm":/\d\s+giây/i.test(part)?"s":"";
    let label:string=match.name;
    if(match.key==="firepower")label="Hỏa Lực";
    else if(match.key==="crit")label="Tỷ Lệ Chí Mạng";
    else if(match.key==="regen")label=/mỗi giây|\/giây|\/s|Regen/i.test(match.name)?"Hồi Máu/s":"Hồi Máu";
    else if(match.key==="maxHp")label="Máu Tối Đa";
    else if(match.key==="resource"&&/tài nguyên/i.test(match.name)&&!/tối đa/i.test(match.name))label=/mỗi giây|\/s/i.test(match.name)?"Hồi Tài Nguyên/s":"Hồi Tài Nguyên";
    else if(match.key==="cooldown"&&match.name==="Hồi Chiêu")label="Thời Gian Hồi Chiêu";
    if(/\btổng\s/i.test(part))label=`tổng ${label}`;
    return {text:part,semantic:match.key,number:!!amount,value:amount+unit,label};
  }).filter(token=>!!token.text);
}
export function CoreDescription({text}:{text:string}) {
  return <>{combatTextTokens(text).map((token,i)=>{
    if(token.semantic){const {Icon,color}=COMBAT_STAT_SEMANTICS[token.semantic];return <strong key={i} style={{color}}>{token.value && <>{token.value}{" "}</>}<Icon aria-hidden="true" style={{display:"inline",width:"1em",height:"1em",verticalAlign:"-.12em",marginRight:".15em"}}/>{token.label}</strong>;}
    return token.number?<strong key={i} style={{color:"#fde047"}}>{token.text}</strong>:token.text;
  })}</>;
}
/** Hidden icon prototypes let the existing status DOM updater share the same renderer vocabulary. */
export function CombatStatIconTemplates(){return <span hidden aria-hidden="true">{Object.entries(COMBAT_STAT_SEMANTICS).map(([key,{Icon}])=><span data-semantic-icon={key} key={key}><Icon/></span>)}</span>;}
export function updateCombatRichText(node:Element,text:string,templates:Element){
  if(node.getAttribute("data-rich-text")===text)return;
  const children=combatTextTokens(text).map(token=>{
    if(!token.number&&!token.semantic)return document.createTextNode(token.text);
    const strong=document.createElement("strong");strong.style.color=token.semantic?COMBAT_STAT_SEMANTICS[token.semantic].color:"#fde047";
    if(token.semantic){if(token.value)strong.append(document.createTextNode(`${token.value} `));const icon=templates.querySelector(`[data-semantic-icon="${token.semantic}"] svg`)?.cloneNode(true) as SVGElement|undefined;
      if(icon){icon.setAttribute("aria-hidden","true");icon.style.cssText="display:inline;width:1em;height:1em;vertical-align:-.12em;margin-right:.15em";strong.append(icon);}}
    strong.append(document.createTextNode(token.semantic ? token.label! : token.text));return strong;
  });
  node.replaceChildren(...children);node.setAttribute("data-rich-text",text);
}
