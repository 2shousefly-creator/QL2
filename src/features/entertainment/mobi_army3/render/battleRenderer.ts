import { BALANCE, clamp, radians } from "../config";
import { weaponById } from "../content/equipment";
import type { ArmyProfile, Battle, CombatEvent, Unit } from "../types";
import type { TerrainMask } from "../terrain/terrainMask";
import { getActive, launch, muzzle, stepTrajectory } from "../core/ballistics";
import { sprite, type Assets } from "./assets";
import { TerrainRenderer } from "./terrainRenderer";
type Effect = { event: CombatEvent; age: number };
export class BattleRenderer {
  private ctx: CanvasRenderingContext2D;
  private terrainRenderer: TerrainRenderer;
  private effects: Effect[] = [];
  private spare: Effect[] = [];
  private lastEvent = 0;
  private camera = { x: 0, y: 0 };
  private panX: number | null = null;
  private zoom = 1;
  constructor(
    private canvas: HTMLCanvasElement,
    private b: Battle,
    private t: TerrainMask,
    private assets: Assets,
    private settings: ArmyProfile["settings"],
  ) {
    canvas.width = BALANCE.viewportWidth;
    canvas.height = BALANCE.viewportHeight;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Thiết bị không hỗ trợ Canvas 2D.");
    this.ctx = ctx;
    this.terrainRenderer = new TerrainRenderer(t, assets);
    const u = getActive(b);
    this.camera = {
      x: clamp(u.x - 640, 0, t.map.width - 1280),
      y: clamp(u.y - 480, 0, t.map.height - 720),
    };
  }
  pan(delta: number) {
    this.panX = clamp(
      (this.panX ?? this.camera.x) + delta,
      0,
      Math.max(0, this.t.map.width - 1280 / this.zoom),
    );
  }
  focus(target: boolean) {
    const u = target
      ? this.b.units.find((u) => u.team === "enemy" && u.hp > 0)
      : getActive(this.b);
    this.panX = u
      ? clamp(
          u.x - 640 / this.zoom,
          0,
          Math.max(0, this.t.map.width - 1280 / this.zoom),
        )
      : null;
  }
  changeZoom() {
    this.zoom = this.zoom === 1 ? 0.75 : 1;
    this.panX = null;
  }
  private unit(u: Unit) {
    const c = this.ctx,
      a = this.assets;
    let frame = u.sprite;
    if (u.kind === "player") {
      const animation =
        a.manifest.animations[u.animation] ?? a.manifest.animations.idle;
      const index = animation.loop
        ? Math.floor(u.animTime * animation.fps) % animation.frames.length
        : Math.min(
            animation.frames.length - 1,
            Math.floor(u.animTime * animation.fps),
          );
      frame = animation.frames[index];
    }
    const height = u.kind === "boss" ? u.height + 32 : u.height + 18,
      width = height * (u.kind === "boss" ? 1.25 : 0.8);
    c.save();
    c.translate(u.x, u.y);
    c.scale(u.facing, 1);
    if (u.hp <= 0) {
      c.globalAlpha = 0.35;
      c.rotate(-0.8);
    } else if (u.animation === "hit" && u.animTime < 0.18) c.globalAlpha = 0.55;
    if (u.kind === "player" && this.b.run.loadout.cosmetic === "steel")
      c.filter = "hue-rotate(125deg)";
    if (u.kind === "player" && this.b.run.loadout.cosmetic === "amber")
      c.filter = "sepia(0.55)";
    sprite(c, a, frame, 0, 0, width, height);
    c.restore();
    if (u.hp <= 0) return;
    if (
      u.kind !== "boss" &&
      u.kind !== "ally" &&
      u.ai !== "dummy" &&
      u.ai !== "structure"
    ) {
      c.save();
      c.translate(u.x, u.y - u.height * 0.58);
      c.scale(u.facing, 1);
      c.rotate(-radians(u.angle));
      // Cannon source has a wheeled base; starter attachment is an explicitly temporary cutout.
      sprite(c, a, "weapon", 10, 7, 44, 25, 0.5, 0.5);
      c.restore();
    }
    c.fillStyle = "#14252deb";
    c.fillRect(u.x - 30, u.y - height - 14, 60, 6);
    c.fillStyle = u.team === "player" ? "#67d391" : "#ef7972";
    c.fillRect(u.x - 30, u.y - height - 14, (60 * u.hp) / u.maxHp, 6);
    c.font = "bold 12px Nunito, sans-serif";
    c.textAlign = "center";
    c.fillStyle = "#12282e";
    c.fillText(
      `${Math.ceil(u.hp)}${u.shield ? ` +${u.shield} khiên` : ""}${u.statuses.some((s) => s.id === "burn") ? " · cháy" : ""}`,
      u.x,
      u.y - height - 20,
    );
    if (u.boss && u.shield === 0) {
      c.strokeStyle = "#ffe17b";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(u.x, u.y - u.height * 0.75, 12, 0, Math.PI * 2);
      c.stroke();
    }
    if (u.id === this.b.active) {
      c.fillStyle = "#ffe17b";
      c.beginPath();
      c.moveTo(u.x - 7, u.y - height - 35);
      c.lineTo(u.x + 7, u.y - height - 35);
      c.lineTo(u.x, u.y - height - 27);
      c.fill();
    }
  }
  draw(dt: number, onEvent: (e: CombatEvent) => void) {
    const c = this.ctx,
      b = this.b,
      t = this.t;
    for (const event of b.events)
      if (event.id > this.lastEvent) {
        this.lastEvent = event.id;
        onEvent(event);
        if (event.type === "turn") this.panX = null;
        if (
          ["explosion", "damage", "heal", "skill", "phase"].includes(event.type)
        ) {
          const effect = this.spare.pop() ?? { event, age: 0 };
          effect.event = event;
          effect.age = 0;
          this.effects.push(effect);
          if (
            this.effects.length >
            (this.settings.quality === "low" ? 12 : BALANCE.maxVfx)
          )
            this.spare.push(this.effects.shift()!);
        }
      }
    const active = getActive(b),
      flying = b.projectiles[0];
    const falling = b.units.find((u) => u.hp > 0 && !u.grounded);
    const focus = flying ?? falling ?? active;
    const targetX =
      this.panX ??
      clamp(
        focus.x - 640 / this.zoom,
        0,
        Math.max(0, t.map.width - 1280 / this.zoom),
      );
    const targetY = clamp(
      focus.y - 460 / this.zoom,
      0,
      Math.max(0, t.map.height - 720 / this.zoom),
    );
    const smooth = this.settings.reducedMotion ? 1 : Math.min(1, dt * 6);
    this.camera.x += (targetX - this.camera.x) * smooth;
    this.camera.y += (targetY - this.camera.y) * smooth;
    c.setTransform(1, 0, 0, 1, 0, 0);
    const bg = this.assets.background,
      sourceHeight = (bg.width * 720) / 1280;
    c.drawImage(
      bg,
      0,
      Math.max(0, bg.height - sourceHeight),
      bg.width,
      Math.min(bg.height, sourceHeight),
      0,
      0,
      1280,
      720,
    );
    if (t.map.tint !== "transparent") {
      c.fillStyle = t.map.tint;
      c.fillRect(0, 0, 1280, 720);
    }
    c.save();
    c.scale(this.zoom, this.zoom);
    c.translate(-this.camera.x, -this.camera.y);
    this.terrainRenderer.update();
    this.terrainRenderer.draw(c);
    for (const h of b.hazards) {
      const y = t.surface(h.x) ?? t.map.height;
      c.fillStyle = h.burnTurns ? "#ef6b2638" : "#dc262638";
      c.fillRect(h.x - h.radius, y - 140, h.radius * 2, 140);
      c.strokeStyle = "#bc302b";
      c.lineWidth = 2;
      c.setLineDash([6, 5]);
      c.strokeRect(h.x - h.radius, y - 140, h.radius * 2, 140);
      c.setLineDash([]);
      c.font = "bold 14px Nunito, sans-serif";
      c.textAlign = "center";
      c.fillStyle = "#6f1611";
      c.fillText(
        h.burnTurns ? "Vùng cháy" : `Nổ: vòng ${h.dueRound}`,
        h.x,
        y - 148,
      );
    }
    if (
      this.settings.aimAssist &&
      active.kind === "player" &&
      ["planning", "charge"].includes(b.phase)
    ) {
      const preview = launch(
        active,
        active.angle,
        active.power,
        0,
        b.windScale,
      );
      c.fillStyle = "#fff8d0";
      for (let i = 0; i < 24; i++) {
        stepTrajectory(preview, b.wind, BALANCE.step);
        if (t.solidAt(preview.x, preview.y)) break;
        if (i % 3 === 0) {
          c.beginPath();
          c.arc(preview.x, preview.y, 2.5, 0, Math.PI * 2);
          c.fill();
        }
      }
      const m = muzzle(active);
      c.strokeStyle = "#b35f27";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(active.x, active.y - active.height * 0.58);
      c.lineTo(m.x, m.y);
      c.stroke();
    }
    for (const u of b.units)
      if (
        u.x > this.camera.x - 130 &&
        u.x < this.camera.x + 1280 / this.zoom + 130
      )
        this.unit(u);
    for (const p of b.projectiles) {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(Math.atan2(p.vy, p.vx));
      sprite(c, this.assets, "shell", 0, 0, 24, 13, 0.5, 0.5);
      c.restore();
    }
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.age += dt;
      if (e.age > 1.05) {
        this.spare.push(e);
        this.effects.splice(i, 1);
        continue;
      }
      c.save();
      c.globalAlpha = Math.max(0, 1 - e.age);
      const { event } = e;
      if (event.type === "explosion") {
        const size = (event.value ?? 70) * 2 * (0.5 + Math.min(0.5, e.age * 2));
        sprite(
          c,
          this.assets,
          "explosion",
          event.x,
          event.y,
          size,
          size,
          0.5,
          0.5,
        );
      } else {
        c.font = "900 18px Nunito, sans-serif";
        c.textAlign = "center";
        c.fillStyle = event.type === "heal" ? "#126c40" : "#842721";
        c.strokeStyle = "#ffefd7";
        c.lineWidth = 3;
        const text =
          event.text ??
          `${event.type === "heal" ? "+" : "−"}${event.value ?? ""}`;
        const y = event.y - 30 - (this.settings.reducedMotion ? 0 : e.age * 32);
        c.strokeText(text, event.x, y);
        c.fillText(text, event.x, y);
      }
      c.restore();
    }
    c.restore();
    c.font = "bold 13px Nunito, sans-serif";
    c.fillStyle = "#18333b";
    c.textAlign = "left";
    c.fillText(`${t.map.name} · ${weaponById[active.weapon].name}`, 22, 26);
    if (flying && flying.y < 0)
      c.fillText("Đạn đang bay phía trên khung hình", 22, 48);
  }
  destroy() {
    this.terrainRenderer.destroy();
    this.effects = [];
    this.spare = [];
    this.canvas.width = 0;
    this.canvas.height = 0;
  }
}
