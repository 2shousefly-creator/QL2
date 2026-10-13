import { hiveActors } from './airCombatHive';
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { AIRCRAFT_CONFIGS, getCoreDefinition } from "./airCombatConfig";
import { CoreSemanticIcon } from "./CoreSemanticIcon";
import { EquipmentIcon } from "./EquipmentIcon";
import { HealthBarPresentation } from "./airCombatFeedback";
import { COMBAT_NOTICE_DURATION_MS } from "./airCombatNotices";
import type { CombatWorld } from "./airCombatRuntime";
import type { CombatAnnouncement } from "./airCombatTypes";
import { equipmentState, type AcquisitionEvent } from "./airCombatEquipmentState";
import { EQUIPMENT_CATALOG, EQUIPMENT_NAME_COLORS } from "./airCombatEquipmentCatalog";
import { EQUIPMENT_ART, equipmentIconIndex } from "./airCombatEquipmentArt";

interface SoloAcquisitionToast { text:string; durationMs:number; createdAtMs?:number }
type ReceiptEntry={event:AcquisitionEvent;quantity:number;owner?:string}|{text:string;quantity:number};
interface Receipt {transactionId:string;entries:Map<string,ReceiptEntry>}
const receiptPriority=(entry:ReceiptEntry)=>!('event' in entry)?4:entry.event.kind==='core'&&entry.event.conversionSourceCoreId?0:entry.event.kind==='equipment'||entry.event.kind==='item'?1:entry.event.kind==='core'?2:3;
interface ReceiptState {owner:CombatWorld['aircraft']['coreState'];lastId:number;queue:Receipt[];seenAI:WeakSet<object>;allyLastIds:WeakMap<object,number>}
// Session-only receipts outlive a renderer remount, never a new run or saved profile.
const receipts=new WeakMap<CombatWorld,ReceiptState>();
const tierLabel:Record<string,string>={silver:'Bạc',gold:'Vàng',diamond:'Kim Cương',component:'Thành phần',completed:'Hoàn chỉnh',legendary:'Huyền thoại',item:'Vật phẩm'};
export class AirCombatOverlayFeedback {
 private world?:CombatWorld;
 private receipt?:ReceiptState;
 private announcement?:CombatAnnouncement;
 private pendingCombat?:string;
 private node:HTMLDivElement;
 private root:Root;
 private expiresAt=0;
 private activeReward=false;
 private pageKeys:string[]=[];
 private hidden=true;
 private expiryTimer:ReturnType<typeof setTimeout>|undefined;
 private health=new HealthBarPresentation();
 private flights=new Set<HTMLElement>();
 private pulse:Animation|null=null;
 private visibility=()=>{if(document.hidden&&this.activeReward)this.clear();};
 constructor(private host:HTMLDivElement){
  this.node=document.createElement('div');this.node.className='air-core-toast';this.node.hidden=true;
  this.node.setAttribute('role','status');this.node.setAttribute('aria-live','polite');this.node.setAttribute('aria-atomic','true');
  host.appendChild(this.node);this.root=createRoot(this.node);document.addEventListener('visibilitychange',this.visibility);
 }
 private clear(){clearTimeout(this.expiryTimer);this.expiryTimer=undefined;this.node.hidden=true;this.expiresAt=0;this.activeReward=false;this.pageKeys=[];}
 private expire(){
  if(this.activeReward&&!this.hidden&&!document.hidden){
   const receipt=this.receipt?.queue[0];
   if(receipt){for(const key of this.pageKeys)receipt.entries.delete(key);if(!receipt.entries.size)this.receipt!.queue.shift();}
  }
  this.clear();
 }
 private arm(until:number){this.expiresAt=until;this.node.hidden=false;this.node.style.opacity='1';this.expiryTimer=setTimeout(()=>this.expire(),Math.max(0,until-performance.now()));}
 private enqueue(transactionId:string,key:string,entry:ReceiptEntry){
  const queue=this.receipt!.queue;
  let receipt=queue.find(r=>r.transactionId===transactionId);
  // Merge overflow into a bounded summary, retaining every distinct name and quantity.
  if(!receipt){receipt=queue.length>=24?queue[queue.length-1]:{transactionId,entries:new Map()};if(!queue.includes(receipt))queue.push(receipt);}
  const existing=receipt.entries.get(key);if(existing)existing.quantity+=entry.quantity;else receipt.entries.set(key,entry);
 }
 private showReceipt(now:number){
  this.receipt?.queue.sort((a,b)=>Math.min(...[...a.entries.values()].map(receiptPriority))-Math.min(...[...b.entries.values()].map(receiptPriority)));
  const receipt=this.receipt?.queue[0];if(!receipt)return;
  this.clear();this.activeReward=true;this.host.dataset.notice='acquisition';
  const page=[...receipt.entries.entries()].sort((a,b)=>receiptPriority(a[1])-receiptPriority(b[1])).slice(0,6);this.pageKeys=page.map(([key])=>key);
  flushSync(()=>this.root.render(createElement('div',{className:'air-receipt'},
   createElement('strong',null,'Đã nhận'+(receipt.entries.size>6?' · Còn '+(receipt.entries.size-6)+' loại thưởng tiếp theo':'')),
   ...page.map(([key,entry])=>{
    if(!('event' in entry))return createElement('div',{key,className:'air-receipt-row'},entry.text);
    const e=entry.event,prefix=entry.owner?entry.owner+" · ":"";
    if(e.kind==='reward')return createElement('div',{key,className:'air-receipt-row'},createElement(CoreSemanticIcon,{id:e.coreId,className:'air-receipt-icon'}),createElement('span',null,prefix+e.name+' ×'+entry.quantity+' · '+e.source));
    if(e.kind==='core'){
     const core=getCoreDefinition(e.coreId),source=e.conversionSourceCoreId?getCoreDefinition(e.conversionSourceCoreId).name:null;
     return createElement('div',{key,className:'air-receipt-row','data-tier':core.tiers[0]},createElement(CoreSemanticIcon,{id:e.coreId,className:'air-receipt-icon'}),createElement('span',null,(entry.owner?entry.owner+' đã nhận lõi: ':'')+core.name+(entry.quantity>1?' ×'+entry.quantity:'')+' · '+tierLabel[core.tiers[0]]+(source?' · '+source:'')));
    }
    const d=e.definitionId==='VP01'?undefined:EQUIPMENT_CATALOG[e.definitionId],tier=d?.rarity??'item';
    const source=e.source==='craft'?'Chế tạo':e.source.startsWith('core_')?getCoreDefinition(e.source).name:'';
    return createElement('div',{key,className:'air-receipt-row'},createElement(EquipmentIcon,{id:e.definitionId,className:'air-receipt-icon'}),createElement('span',{style:{color:EQUIPMENT_NAME_COLORS[tier]}},prefix+(d?.name??'Nam Châm Ma Thuật')+' ×'+entry.quantity+' · '+(tierLabel[tier]??tier)+(source?' · '+source:'')));
   }))));
  this.arm(performance.now()+COMBAT_NOTICE_DURATION_MS);
 }
 render(world:CombatWorld,delta:number,hidden:boolean,reducedMotion:boolean,bossHp:HTMLDivElement|null,bossChip:HTMLDivElement|null,bossShield:HTMLDivElement|null,announcements:readonly SoloAcquisitionToast[]=[]){
  if(this.world!==world||this.receipt?.owner!==world.aircraft.coreState){this.clear();this.world=world;this.announcement=undefined;this.pendingCombat=undefined;
   this.receipt=receipts.get(world);if(!this.receipt||this.receipt.owner!==world.aircraft.coreState){this.receipt={owner:world.aircraft.coreState,lastId:0,queue:[],seenAI:new WeakSet(),allyLastIds:new WeakMap()};receipts.set(world,this.receipt);}
   this.health.clear();this.pulse?.cancel();for(const flight of this.flights)flight.remove();this.flights.clear();
  }
  this.hidden=hidden||document.hidden;
  if(this.hidden&&this.activeReward)this.clear();
    this.health.begin(delta);
    const boss = world.enemies.find(e => e.type === "boss");
    if (boss) {
      const bar = this.health.get(boss.id, boss.hp, boss.maxHp, boss.shieldUntil > world.aircraft.coreState.time ? boss.shield : 0);
      if (bossHp) {
        bossHp.style.width = bar.hpRatio * 100 + "%";
        const frame=bossHp.closest<HTMLElement>(".air-boss-hud");
        if(frame)frame.dataset.aegisActive=String(boss.hp/boss.maxHp>=.15 && boss.aegisUntil>world.aircraft.coreState.time);
      }
      if (bossChip) bossChip.style.width = bar.chipRatio * 100 + "%";
      if (bossShield) {bossShield.style.left=bar.shieldStart*100+"%";bossShield.style.width=(bar.shieldEnd-bar.shieldStart)*100+"%";}
    }
    this.health.end();

  const now=performance.now();
    const button=this.host.closest(".air-combat-surface")?.querySelector<HTMLElement>("[data-equipment-target]") ?? null;
    if(button){const b=button.getBoundingClientRect(),surface=this.host.closest(".air-combat-surface")?.getBoundingClientRect();if(surface&&surface.width&&surface.height)equipmentState(world.aircraft).hubTarget={x:(b.left+b.width/2-surface.left)/surface.width*360,y:(b.top+b.height/2-surface.top)/surface.height*640};}

  for(const [index,actor] of hiveActors(world).entries()) {
   const state=actor.aircraft.coreState,owner=index?AIRCRAFT_CONFIGS[actor.aircraft.aircraftId].name+' đồng minh':undefined;
   let lastId=index?(this.receipt!.allyLastIds.get(state)??0):this.receipt!.lastId;
   const target=index?this.host.closest('.air-combat-surface')?.querySelector<HTMLElement>('[data-hive-ally="'+(index-1)+'"]')??button:button;
   for(const event of state.acquisitions)if(event.id>lastId){
    const key=event.kind==='reward'?'reward:'+event.name+':'+event.source:event.kind==='core'?'core:'+event.coreId+':'+(event.conversionSourceCoreId??''):event.kind+':'+event.definitionId+':'+event.source;
    this.enqueue(index+':'+String(event.transactionId??event.id),index+':'+key,{event,quantity:event.quantity??1,owner});lastId=event.id;
    if(!this.hidden&&(event.kind==='equipment'||event.kind==='item'))this.equipmentFlight(actor,event,target,reducedMotion);
   }
   if(index)this.receipt!.allyLastIds.set(state,lastId);else this.receipt!.lastId=lastId;
   // Drain only after the shared presentation queue owns every acquisition.
   state.acquisitions=state.acquisitions.filter(e=>e.id>lastId);
  }
  for(const event of announcements)if(!this.receipt!.seenAI.has(event)){
   this.receipt!.seenAI.add(event);this.enqueue('ai:'+event.createdAtMs,'ai:'+event.text,{text:event.text,quantity:1});
  }
  if(this.announcement!==world.announcement){
   this.announcement=world.announcement;
   if(world.announcement.expiresAtMs>now&&world.announcement.text){
    this.pendingCombat=world.announcement.text;
    if(!this.activeReward&&!this.receipt!.queue.length)this.clear();
   }
  }
  if(this.expiresAt&&now>=this.expiresAt)this.expire();
  // Acquisitions preempt ordinary combat notices; a shown reward gets its full
  // page duration, and the latest other notice follows after all reward pages.
  if(this.receipt!.queue.length&&!this.activeReward)this.clear();
  if(!this.expiresAt&&!this.hidden){
   if(this.receipt!.queue.length)this.showReceipt(now);
   else if(this.pendingCombat){this.host.dataset.notice='combat';this.root.render(this.pendingCombat);this.pendingCombat=undefined;this.arm(now+COMBAT_NOTICE_DURATION_MS);}
  }
  this.host.style.visibility=this.hidden?'hidden':'visible';
  if(this.expiresAt)this.node.style.opacity=String(reducedMotion?1:Math.min(1,(this.expiresAt-now)/300));
 }
  private equipmentFlight(world: CombatWorld, event: Extract<AcquisitionEvent, { kind: "equipment" | "item" }>, button: HTMLElement | null, reducedMotion: boolean) {
    if(button&&this.flights.size<4){
      this.pulse?.cancel();this.pulse=button.animate(reducedMotion?[{boxShadow:"0 0 15px #a9f6ff"},{boxShadow:"0 0 0 transparent"}]:[{transform:"scale(1)",boxShadow:"0 0 0 transparent"},{transform:"scale(1.09)",boxShadow:"0 0 18px #a9f6ff",offset:.2},{transform:"scale(1)",boxShadow:"0 0 0 transparent"}],{duration:1500,easing:"ease-out"});
      const target=button.getBoundingClientRect(),surface=this.host.closest(".air-combat-surface")?.getBoundingClientRect();
      const x=surface?surface.left+(event.x??world.playerX)/360*surface.width:target.left,y=surface?surface.top+(event.y??world.playerY)/640*surface.height:target.top;
      const node=document.createElement("div"),index=equipmentIconIndex(event.definitionId);node.className="equipment-acquisition-flight";
      node.style.left=`${x-14}px`;node.style.top=`${y-14}px`;node.style.backgroundImage=`url(${EQUIPMENT_ART.icons})`;node.style.backgroundPosition=`${index%9/8*100}% ${Math.floor(index/9)/8*100}%`;
      document.body.appendChild(node);this.flights.add(node);
      const dx=target.left+target.width/2-x,dy=target.top+target.height/2-y;
      const animation=node.animate([{transform:"translate(0,0) scale(1)",opacity:1},{transform:`translate(${dx*.45-24}px,${dy*.45}px) scale(.9)`,opacity:1,offset:.45},{transform:`translate(${dx}px,${dy}px) scale(.35)`,opacity:0}],{duration:reducedMotion?120:650,easing:"cubic-bezier(.3,.1,.5,1)"});
      animation.onfinish=()=>{node.remove();this.flights.delete(node);};
    }
  }

 destroy(){this.clear();document.removeEventListener('visibilitychange',this.visibility);this.pulse?.cancel();for(const node of this.flights)node.remove();this.flights.clear();this.root.unmount();this.node.remove();this.health.clear();}
}
