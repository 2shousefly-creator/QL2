import { getCoreDefinition } from "./airCombatConfig";
import { HealthBarPresentation } from "./airCombatFeedback";
import { COMBAT_NOTICE_DURATION_MS } from "./airCombatNotices";
import type { CombatWorld } from "./airCombatRuntime";
import type { CombatAnnouncement } from "./airCombatTypes";
import { equipmentState, type AcquisitionEvent, type CoreConversionSource } from "./airCombatEquipmentState";
import { EQUIPMENT_CATALOG, EQUIPMENT_NAME_COLORS } from "./airCombatEquipmentCatalog";
import { EQUIPMENT_ART, equipmentIconIndex } from "./airCombatEquipmentArt";

interface SoloAcquisitionToast { text: string; durationMs: number; createdAtMs?: number }
type Notice = (AcquisitionEvent | (SoloAcquisitionToast & { kind: "solo_ai" }) | { kind: "message"; text: string }) & { createdAtMs: number };
const CONVERSION_SOURCE_LABELS: Record<CoreConversionSource, string> = {
  core_050: "CHUYỂN ĐỔI: VÀNG", core_051: "CHUYỂN ĐỔI: KIM CƯƠNG",
  core_052: "CHUYỂN ĐỔI: HỖN LOẠN", core_216: "HỘP PANDORA",
};
/** One DOM notice for every source. No backlog, stacking or suspended lifetimes. */
export class AirCombatOverlayFeedback {
  private lastAcquisition = 0;
  private world?: CombatWorld;
  private announcement?: CombatAnnouncement;
  private node: HTMLDivElement;
  private latestAt = -Infinity;
  private expiresAt = 0;
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;
  private health = new HealthBarPresentation();
  private flights = new Set<HTMLElement>();
  private pulse: Animation | null = null;
  constructor(private host: HTMLDivElement) {
    this.node = document.createElement("div");
    this.node.className = "air-core-toast"; this.node.hidden = true;
    host.appendChild(this.node);
  }
  private clear() {
    clearTimeout(this.expiryTimer); this.expiryTimer = undefined;
    this.node.hidden = true; this.expiresAt = 0;
  }
  private show(event: Notice, now: number) {
    if (event.createdAtMs < this.latestAt) return;
    this.latestAt = event.createdAtMs;
    this.clear();
    const expiresAt = event.createdAtMs + COMBAT_NOTICE_DURATION_MS;
    if (expiresAt <= now) return;
    this.node.replaceChildren(); delete this.node.dataset.tier;
    this.host.dataset.notice = event.kind === "message" ? "combat" : "acquisition";
    if (event.kind === "message" || event.kind === "solo_ai") this.node.textContent = event.text;
    else if (event.kind === "core") {
      const core = getCoreDefinition(event.coreId);
      this.node.textContent = event.conversionSourceCoreId
        ? CONVERSION_SOURCE_LABELS[event.conversionSourceCoreId] + " → NHẬN LÕI " + core.name
        : "Đã nhận lõi: " + core.name;
      this.node.dataset.tier = core.tiers[0];
    } else {
      const item = event.definitionId === "VP01", definition = item ? null : EQUIPMENT_CATALOG[event.definitionId];
      const name = document.createElement("span");
      name.textContent = definition?.name ?? "Nam Châm Ma Thuật";
      name.style.color = EQUIPMENT_NAME_COLORS[definition?.rarity ?? "item"];
      this.node.append(document.createTextNode(item ? "Đã nhận vật phẩm " : "Đã nhận trang bị "), name);
    }
    this.expiresAt = expiresAt; this.node.hidden = false; this.node.style.opacity = "1";
    this.expiryTimer = setTimeout(() => this.clear(), Math.max(0, expiresAt - performance.now()));
  }
  render(world: CombatWorld, delta: number, hidden: boolean, reducedMotion: boolean,
    bossHp: HTMLDivElement | null, bossChip: HTMLDivElement | null, bossShield: HTMLDivElement | null,
    announcements: readonly SoloAcquisitionToast[] = []) {
    if (this.world !== world) {
      this.world = world; this.lastAcquisition = 0; this.announcement = undefined; this.latestAt = -Infinity;
      this.clear(); this.health.clear(); this.pulse?.cancel();
      for (const flight of this.flights) flight.remove();
      this.flights.clear();
    }
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
    const now = performance.now(), pending: Notice[] = [];
    if (this.announcement !== world.announcement) {
      this.announcement = world.announcement;
      pending.push({ kind: "message", text: world.announcement.text,
        createdAtMs: world.announcement.expiresAtMs - world.announcement.durationMs });
    }
    for (const event of world.aircraft.coreState.acquisitions) if (event.id > this.lastAcquisition) {
      pending.push({ ...event, createdAtMs: event.createdAtMs ?? now }); this.lastAcquisition = event.id;
    }
    world.aircraft.coreState.acquisitions = world.aircraft.coreState.acquisitions.filter(e=>e.id>this.lastAcquisition);
    pending.push(...announcements.map(event => ({ ...event, kind: "solo_ai" as const, createdAtMs: event.createdAtMs ?? now })));
    const button=this.host.closest(".air-combat-surface")?.querySelector<HTMLElement>("[data-equipment-target]") ?? null;
    if(button){const b=button.getBoundingClientRect(),surface=this.host.closest(".air-combat-surface")?.getBoundingClientRect();if(surface&&surface.width&&surface.height)equipmentState(world.aircraft).hubTarget={x:(b.left+b.width/2-surface.left)/surface.width*360,y:(b.top+b.height/2-surface.top)/surface.height*640};}
    // A newer skill/status notice wins over older rewards even if they arrive in this frame.
    pending.sort((a,b)=>a.createdAtMs-b.createdAtMs);
    for (const event of pending) {
      if (!hidden && now < event.createdAtMs + COMBAT_NOTICE_DURATION_MS && (event.kind === "equipment" || event.kind === "item"))
        this.equipmentFlight(world,event,button,reducedMotion);
      this.show(event,now);
    }
    this.host.style.visibility = hidden ? "hidden" : "visible";
    if (this.expiresAt && now >= this.expiresAt) this.clear();
    else if (this.expiresAt) this.node.style.opacity = String(reducedMotion ? 1 : Math.min(1,(this.expiresAt-now)/300));
  }
  private equipmentFlight(world: CombatWorld, event: Extract<AcquisitionEvent, { kind: "equipment" | "item" }>, button: HTMLElement | null, reducedMotion: boolean) {
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
  destroy() {
    this.clear(); this.pulse?.cancel();
    for(const node of this.flights)node.remove();
    this.flights.clear(); this.node.remove(); this.health.clear();
  }
}
