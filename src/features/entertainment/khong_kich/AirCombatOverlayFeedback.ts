import { getCoreDefinition } from "./airCombatConfig";
import { HealthBarPresentation } from "./airCombatFeedback";
import type { CombatWorld } from "./airCombatRuntime";
import { equipmentState, type AcquisitionEvent, type CoreConversionSource } from "./airCombatEquipmentState";
import { EQUIPMENT_CATALOG, EQUIPMENT_NAME_COLORS } from "./airCombatEquipmentCatalog";
import { EQUIPMENT_ART, equipmentIconIndex } from "./airCombatEquipmentArt";

type Acquisition = AcquisitionEvent;
const CONVERSION_SOURCE_LABELS: Record<CoreConversionSource, string> = {
  core_050: "CHUYỂN ĐỔI: VÀNG",
  core_051: "CHUYỂN ĐỔI: KIM CƯƠNG",
  core_052: "CHUYỂN ĐỔI: HỖN LOẠN",
  core_216: "HỘP PANDORA",
};
interface Toast { node: HTMLDivElement; age: number; y: number; height: number; width: number }
/** Fixed DOM pool. Explicit acquisition events drive content, never an ownership diff. */
export class AirCombatOverlayFeedback {
  private lastAcquisition = 0;
  private world?: CombatWorld;
  private waiting: Acquisition[] = [];
  private active: Toast[] = [];
  private free: Toast[] = [];
  private health = new HealthBarPresentation();
  private width = 0;
  private flights = new Set<HTMLElement>();
  private pulse: Animation | null = null;
  constructor(private host: HTMLDivElement) {
    for (let i = 0; i < 6; i++) {
      const node = document.createElement("div");
      node.className = "air-core-toast"; node.hidden = true;
      host.appendChild(node); this.free.push({ node, age: 0, y: 0, height: 0, width: 0 });
    }
  }
  render(world: CombatWorld, delta: number, hidden: boolean, reducedMotion: boolean,
    bossHp: HTMLDivElement | null, bossChip: HTMLDivElement | null, bossShield: HTMLDivElement | null) {
    if (this.world !== world) {
      this.world = world; this.lastAcquisition = 0; this.waiting.length = 0; this.health.clear();
      for (const toast of this.active) { toast.node.hidden = true; this.free.push(toast); }
      this.active.length = 0; this.pulse?.cancel();
      for (const flight of this.flights) flight.remove();
      this.flights.clear();
    }
    this.health.begin(delta);
    const boss = world.enemies.find(e => e.type === "boss");
    if (boss) {
      const bar = this.health.get(boss.id, boss.hp, boss.maxHp, boss.shieldUntil > world.aircraft.coreState.time ? boss.shield : 0);
      if (bossHp) {
        bossHp.style.width = `${bar.hpRatio * 100}%`;
        const frame=bossHp.closest<HTMLElement>(".air-boss-hud");
        if(frame)frame.dataset.aegisActive=String(boss.hp/boss.maxHp>=.15 && boss.aegisUntil>world.aircraft.coreState.time);
      }
      if (bossChip) bossChip.style.width = `${bar.chipRatio * 100}%`;
      if (bossShield) bossShield.style.width = `${bar.shieldEnd * 100}%`;
    }
    this.health.end();
    for (const event of world.aircraft.coreState.acquisitions) if (event.id > this.lastAcquisition) {
      this.waiting.push(event); this.lastAcquisition = event.id;
    }
    world.aircraft.coreState.acquisitions = world.aircraft.coreState.acquisitions.filter(e=>e.id>this.lastAcquisition);
    this.host.style.visibility = hidden ? "hidden" : "visible";
    let changed = false;
    for (let i = this.active.length - 1; i >= 0; i--) {
      const toast = this.active[i];
      if (toast.age >= 3) {
        toast.node.hidden = true; this.active.splice(i, 1); this.free.push(toast); changed = true;
      }
    }
    const button=this.host.closest(".air-combat-surface")?.querySelector<HTMLElement>("[data-equipment-target]");
    if(button){const b=button.getBoundingClientRect(),surface=this.host.closest(".air-combat-surface")?.getBoundingClientRect();if(surface&&surface.width&&surface.height)equipmentState(world.aircraft).hubTarget={x:(b.left+b.width/2-surface.left)/surface.width*360,y:(b.top+b.height/2-surface.top)/surface.height*640};}
    while (!hidden && this.waiting.length && this.free.length) {
      const pending=this.waiting[0];
      if(pending.kind!=="core" && (!button || !button.getClientRects().length))break;
      const event = this.waiting.shift()!, toast = this.free.pop()!;
      toast.age = 0; toast.node.replaceChildren();delete toast.node.dataset.tier;
      if(event.kind==="core"){
        const core=getCoreDefinition(event.coreId);
        toast.node.textContent=event.conversionSourceCoreId
          ? `${CONVERSION_SOURCE_LABELS[event.conversionSourceCoreId]} → NHẬN LÕI ${core.name}`
          : `Đã nhận lõi: ${core.name}`;
        toast.node.dataset.tier=core.tiers[0];
      }else{
        const item=event.definitionId==="VP01",definition=item?null:EQUIPMENT_CATALOG[event.definitionId];
        const name=document.createElement("span");name.textContent=definition?.name??"Nam Châm Ma Thuật";name.style.color=EQUIPMENT_NAME_COLORS[definition?.rarity??"item"];
        toast.node.append(document.createTextNode(item?"Đã nhận vật phẩm ":"Đã nhận trang bị "),name);
        if(button){
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
      toast.node.hidden = false;
      toast.node.style.opacity = "0";
      toast.node.style.transition = reducedMotion ? "none" : "transform .18s ease-out";
      this.active.push(toast); changed = true;
    }
    const width = this.host.parentElement?.clientWidth || 360;
    if (changed || width !== this.width) {
      this.width = width;
      let y = 0;
      for (const toast of this.active) {
        toast.y = y; toast.height = toast.node.offsetHeight; toast.width = toast.node.offsetWidth;
        toast.node.style.transform = `translateY(${y}px)`;
        y += toast.height + 5;
      }
    }
    const scale = width / 360;
    for (const toast of this.active) {
      const top = 200 + toast.y / scale, bottom = top + toast.height / scale;
      const occluded = world.playerX - 35 < 7.2 + toast.width / scale && world.playerY + 66 > top && world.playerY - 35 < bottom;
      // Keep a toast's full lifetime visible if the pilot crosses its content-sized anchor.
      if (!hidden && !occluded) toast.age += delta;
      toast.node.style.opacity = hidden || occluded ? "0" : String(Math.max(0, Math.min(1, toast.age / .18, (3 - toast.age) / .45)));
    }
  }
  destroy() {
    this.pulse?.cancel();for(const node of this.flights)node.remove();this.flights.clear();
    for (const toast of [...this.active, ...this.free]) toast.node.remove();
    this.active.length = 0; this.free.length = 0; this.waiting.length = 0; this.health.clear();
  }
}
