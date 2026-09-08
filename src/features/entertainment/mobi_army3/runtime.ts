import { BALANCE } from "./config";
import {
  createBattle,
  command,
  itemUnavailable,
  stepBattle,
} from "./core/battleEngine";
import { getActive } from "./core/ballistics";
import { InputController } from "./input/inputController";
import { BattleRenderer } from "./render/battleRenderer";
import { BattleAudio } from "./render/audio";
import type { Assets } from "./render/assets";
import type {
  ArmyProfile,
  Command,
  ItemId,
  RunResult,
  RunTicket,
} from "./types";
import { ITEMS } from "./content/equipment";
export interface Hud {
  round: number;
  seconds: number;
  active: string;
  playerTurn: boolean;
  phase: string;
  angle: number;
  power: number;
  wind: number;
  hp: number;
  maxHp: number;
  movement: number;
  maxMovement: number;
  paused: boolean;
  message: string;
  items: { id: ItemId; quantity: number; reason: string | null }[];
  enemies: {
    id: number;
    name: string;
    hp: number;
    maxHp: number;
    phase: number;
    shield: number;
  }[];
  tutorial: { moved: boolean; aimed: boolean; fired: boolean; item: boolean };
  rescue: boolean;
}
export class ArmyRuntime {
  readonly world: ReturnType<typeof createBattle>;
  readonly input: InputController;
  private renderer: BattleRenderer;
  private audio: BattleAudio;
  private frame = 0;
  private last = 0;
  private accumulator = 0;
  private lastPublish = 0;
  private paused = false;
  private destroyed = false;
  private reported = false;
  private message = "";
  constructor(
    canvas: HTMLCanvasElement,
    root: HTMLElement,
    run: RunTicket,
    assets: Assets,
    settings: ArmyProfile["settings"],
    private publish: (hud: Hud) => void,
    private complete: (result: RunResult) => void,
  ) {
    this.world = createBattle(run, settings.difficulty);
    this.renderer = new BattleRenderer(
      canvas,
      this.world.battle,
      this.world.terrain,
      assets,
      settings,
    );
    this.audio = new BattleAudio(settings.volume);
    this.input = new InputController(
      root,
      (c) => this.send(c),
      () => getActive(this.world.battle).angle,
      () => this.setPaused(true),
      () => this.audio.unlock(),
      run.loadout.items.map((id) => ({ type: "item", id })),
    );
    document.addEventListener("visibilitychange", this.visibility);
    window.addEventListener("resize", this.resize);
    this.resize();
    this.push();
    this.frame = requestAnimationFrame(this.loop);
  }
  send(c: Command): boolean {
    if (this.destroyed || this.paused) return false;
    this.audio.unlock();
    const accepted = command(this.world.battle, this.world.terrain, c);
    if (!accepted && c.type === "item")
      this.message =
        itemUnavailable(this.world.battle, c.id) ??
        "Không có vị trí hoặc mục tiêu hợp lệ.";
    else if (accepted) this.message = "";
    return accepted;
  }
  setPaused(value: boolean) {
    if (this.destroyed) return;
    if (!value && (document.hidden || this.portrait())) return;
    if (value) this.input.clear();
    this.paused = value;
    this.last = 0;
    this.accumulator = 0;
    if (value) this.audio.pause();
    else this.audio.unlock();
    this.push();
  }
  camera(action: "left" | "right" | "self" | "enemy" | "zoom") {
    if (action === "left" || action === "right")
      this.renderer.pan(action === "left" ? -220 : 220);
    else if (action === "zoom") this.renderer.changeZoom();
    else this.renderer.focus(action === "enemy");
  }
  private portrait() {
    return window.matchMedia("(orientation: portrait) and (max-width: 900px)")
      .matches;
  }
  private resize = () => {
    if (this.portrait()) this.setPaused(true);
  };
  private visibility = () => {
    if (document.hidden) this.setPaused(true);
  };
  private push() {
    const b = this.world.battle,
      u = getActive(b),
      p = b.units[0];
    this.publish({
      round: b.round,
      seconds: b.seconds,
      active: u.name,
      playerTurn: u.kind === "player" && u.hp > 0,
      phase: b.phase,
      angle: u.angle,
      power: u.power,
      wind: b.wind,
      hp: p.hp,
      maxHp: p.maxHp,
      movement: u.movement,
      maxMovement: u.maxMovement,
      paused: this.paused,
      message: this.message,
      items: ITEMS.filter((i) => b.run.loadout.items.includes(i.id)).map(
        (i) => ({
          id: i.id,
          quantity: b.items[i.id],
          reason: itemUnavailable(b, i.id),
        }),
      ),
      enemies: b.units
        .filter((v) => v.team === "enemy" && v.hp > 0)
        .map((v) => ({
          id: v.id,
          name: v.name,
          hp: v.hp,
          maxHp: v.maxHp,
          phase: v.boss ? v.bossPhase + 1 : 0,
          shield: v.shield,
        })),
      tutorial: { ...b.tutorial },
      rescue: b.rescue,
    });
  }
  private loop = (now: number) => {
    if (this.destroyed) return;
    const dt = this.last
      ? Math.min(BALANCE.maxCatchup, Math.max(0, (now - this.last) / 1000))
      : 0;
    this.last = now;
    if (!this.paused) {
      this.accumulator = Math.min(BALANCE.maxCatchup, this.accumulator + dt);
      while (this.accumulator >= BALANCE.step) {
        const active = getActive(this.world.battle);
        if (active.animation === "walk") active.animation = "aim";
        this.input.tick();
        stepBattle(this.world.battle, this.world.terrain);
        if (!["planning", "charge"].includes(this.world.battle.phase))
          this.input.clear();
        this.accumulator -= BALANCE.step;
      }
    }
    this.renderer.draw(this.paused ? 0 : dt, (e) => this.audio.play(e));
    if (now - this.lastPublish >= 100) {
      this.push();
      this.lastPublish = now;
    }
    if (this.world.battle.result && !this.reported) {
      this.reported = true;
      this.push();
      this.complete(this.world.battle.result);
    }
    this.frame = requestAnimationFrame(this.loop);
  };
  destroy() {
    if (this.destroyed) return;
    this.input.destroy();
    this.destroyed = true;
    cancelAnimationFrame(this.frame);
    document.removeEventListener("visibilitychange", this.visibility);
    window.removeEventListener("resize", this.resize);
    this.audio.destroy();
    this.renderer.destroy();
  }
}
