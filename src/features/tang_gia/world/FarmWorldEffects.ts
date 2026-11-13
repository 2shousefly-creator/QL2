import { Container, Graphics, GraphicsContext, Text } from 'pixi.js';
import { FARM_ANCHORS, plotWorldPoint, toFarmScreen } from '../farmWorldLayout';
import type { FarmPoint } from '../farmWorkerTypes';
import type { FarmVisualEvent } from './farmPixiTypes';

type ActiveParticle = {
  graphic: Graphics;
  active: boolean;
  startX: number;
  startY: number;
  vx: number;
  vy: number;
  gravity: number;
  startedAt: number;
  durationMs: number;
  baseScale: number;
};

type ActiveFloatText = {
  node: Text;
  active: boolean;
  startX: number;
  startY: number;
  startedAt: number;
  durationMs: number;
};

const MAX_PARTICLES = 96;
const MAX_TEXTS = 32;
const EVENT_PRUNE_MS = 4500;

/** Pooled Pixi particle burst + floating reward text manager for the 2.5D world. */
export class FarmWorldEffects {
  readonly root = new Container();
  private particleContext = new GraphicsContext().circle(0, 0, 4.5).fill(0xffffff);
  private particles: ActiveParticle[];
  private texts: ActiveFloatText[];
  private seen = new Map<string, number>();

  constructor() {
    this.root.eventMode = 'none';
    this.root.zIndex = 99999;

    this.particles = Array.from({ length: MAX_PARTICLES }, () => {
      const graphic = this.root.addChild(new Graphics(this.particleContext));
      graphic.visible = false;
      graphic.eventMode = 'none';
      return {
        graphic,
        active: false,
        startX: 0,
        startY: 0,
        vx: 0,
        vy: 0,
        gravity: 220,
        startedAt: 0,
        durationMs: 750,
        baseScale: 1,
      };
    });

    this.texts = Array.from({ length: MAX_TEXTS }, () => {
      const node = this.root.addChild(
        new Text({
          text: '',
          style: {
            fontFamily: 'system-ui, sans-serif',
            fontSize: 13,
            fontWeight: '800',
            fill: 0xfff8d6,
            stroke: { color: 0x0f1b13, width: 3.5 },
            align: 'center',
          },
        })
      );
      node.anchor.set(0.5, 1);
      node.visible = false;
      node.eventMode = 'none';
      return {
        node,
        active: false,
        startX: 0,
        startY: 0,
        startedAt: 0,
        durationMs: 1350,
      };
    });
  }

  private resolveOrigin(event: FarmVisualEvent): FarmPoint {
    if (event.plotIndex >= 0) {
      return toFarmScreen(plotWorldPoint(event.plotIndex));
    }
    if (event.kind === 'egg') return toFarmScreen(FARM_ANCHORS.market);
    if (event.kind === 'feed') return toFarmScreen(FARM_ANCHORS.trough);
    return toFarmScreen(FARM_ANCHORS.pen);
  }

  private spawnBurst(
    x: number,
    y: number,
    now: number,
    count: number,
    palette: readonly number[],
    upwardSpeed: number,
    gravity: number,
    durationMs: number
  ) {
    let spawned = 0;
    for (let i = 0; i < this.particles.length && spawned < count; i++) {
      const slot = this.particles[i];
      if (slot.active) continue;
      const angle = (spawned / Math.max(1, count)) * Math.PI * 2 + (i % 3) * 0.25;
      const speed = 32 + ((spawned * 37 + i * 13) % 58);
      slot.active = true;
      slot.startX = x + Math.cos(angle) * 8;
      slot.startY = y - 16;
      slot.vx = Math.cos(angle) * speed;
      slot.vy = Math.sin(angle) * speed * 0.45 - upwardSpeed;
      slot.gravity = gravity;
      slot.startedAt = now;
      slot.durationMs = durationMs;
      slot.baseScale = 0.75 + ((spawned % 4) * 0.16);
      slot.graphic.tint = palette[spawned % palette.length];
      slot.graphic.visible = true;
      slot.graphic.position.set(slot.startX, slot.startY);
      slot.graphic.alpha = 1;
      slot.graphic.scale.set(slot.baseScale);
      spawned++;
    }
  }

  private spawnText(
    x: number,
    y: number,
    text: string,
    color: number,
    now: number,
    durationMs: number = 1350
  ) {
    if (!text) return;
    const slot = this.texts.find((entry) => !entry.active) ?? this.texts[0];
    slot.active = true;
    slot.startX = x;
    slot.startY = y - 28;
    slot.startedAt = now;
    slot.durationMs = durationMs;
    slot.node.text = text;
    slot.node.style.fill = color;
    slot.node.visible = true;
    slot.node.position.set(slot.startX, slot.startY);
    slot.node.alpha = 1;
    slot.node.scale.set(0.88);
  }

  receive(events: readonly FarmVisualEvent[], now: number, reduced: boolean) {
    for (const [id, ts] of this.seen) {
      if (now - ts > EVENT_PRUNE_MS) this.seen.delete(id);
    }

    for (const event of events) {
      if (this.seen.has(event.id)) continue;
      if (now - event.startedAt > 2500 || now < event.startedAt - 200) continue;
      this.seen.set(event.id, now);

      const pos = this.resolveOrigin(event);
      let floatText = event.label ?? '';
      let textColor = 0xfff8d6;
      let palette: readonly number[] = [0xfef08a, 0xa7f3d0];
      let burstCount = 8;
      let upwardSpeed = 95;
      let gravity = 200;

      switch (event.kind) {
        case 'harvest': {
          const isPerfect = event.quality === 'hoan_my';
          const isRare = event.quality === 'hiem';
          palette = isPerfect
            ? [0xfde047, 0xfbbf24, 0xf9a8d4, 0xffffff]
            : isRare
              ? [0xc4b5fd, 0x34d399, 0xfef08a]
              : [0xfef08a, 0x86efac, 0x4ade80];
          textColor = isPerfect ? 0xfde047 : isRare ? 0xd8b4fe : 0xd9f99d;
          if (!floatText) {
            const parts: string[] = [];
            if (event.gold && event.gold > 0) parts.push(`+${event.gold} 🪙`);
            if (event.xp && event.xp > 0) parts.push(`+${Math.round(event.xp)} EXP`);
            if (isPerfect) parts.push('Hoàn Mỹ!');
            floatText = parts.join('  ');
          }
          burstCount = isPerfect ? 14 : 10;
          upwardSpeed = 125;
          gravity = 210;
          break;
        }
        case 'water':
          palette = [0x7dd3fc, 0x38bdf8, 0xe0f2fe];
          textColor = 0x93c5fd;
          if (!floatText) {
            floatText = event.amount ? `+${Math.round(event.amount)}% 💧` : '+💧 Đủ ẩm';
          }
          burstCount = 8;
          upwardSpeed = 105;
          gravity = 260;
          break;
        case 'pest':
          palette = [0x6ee7b7, 0x34d399, 0xfef08a];
          textColor = 0x86efac;
          if (!floatText) floatText = '✓ Sạch sâu';
          burstCount = 9;
          upwardSpeed = 90;
          gravity = 130;
          break;
        case 'fertilizer':
          palette = [0xfde047, 0x4ade80, 0xfdba74];
          textColor = 0xfef08a;
          if (!floatText) floatText = '✨ Đã bón phân';
          burstCount = 10;
          upwardSpeed = 85;
          gravity = 110;
          break;
        case 'sow':
          palette = [0xa3e635, 0x4ade80, 0xd6d3d1];
          textColor = 0xbef264;
          if (!floatText) floatText = '🌱 Đã gieo';
          burstCount = 7;
          upwardSpeed = 78;
          gravity = 175;
          break;
        case 'feed':
          palette = [0xfbbf24, 0xf59e0b, 0xfef08a];
          textColor = 0xfde68a;
          if (!floatText) floatText = '🌾 +Cám';
          burstCount = 8;
          upwardSpeed = 85;
          gravity = 150;
          break;
        case 'egg':
          palette = [0xfef08a, 0xfbbf24, 0xffffff];
          textColor = 0xfde047;
          if (!floatText) {
            floatText = event.gold && event.gold > 0 ? `+${event.gold} 🪙` : '🥚 Thu trứng';
          }
          burstCount = 10;
          upwardSpeed = 110;
          gravity = 165;
          break;
        case 'unlock':
          palette = [0xfde047, 0x38bdf8, 0xf472b6, 0x86efac];
          textColor = 0xfef08a;
          if (!floatText) floatText = '🔓 Mở đất mới!';
          burstCount = 16;
          upwardSpeed = 140;
          gravity = 210;
          break;
      }

      if (!reduced) {
        this.spawnBurst(
          pos.x,
          pos.y,
          now,
          burstCount,
          palette,
          upwardSpeed,
          gravity,
          event.kind === 'unlock' ? 1050 : 820
        );
      }
      this.spawnText(pos.x, pos.y, floatText, textColor, now);
    }
  }

  hasActive(): boolean {
    return (
      this.particles.some((slot) => slot.active) ||
      this.texts.some((slot) => slot.active)
    );
  }

  update(now: number, reduced: boolean) {
    for (const slot of this.particles) {
      if (!slot.active) continue;
      if (reduced) {
        slot.active = false;
        slot.graphic.visible = false;
        continue;
      }
      const elapsedMs = now - slot.startedAt;
      const t = elapsedMs / slot.durationMs;
      if (t >= 1) {
        slot.active = false;
        slot.graphic.visible = false;
        continue;
      }
      const sec = Math.max(0, elapsedMs / 1000);
      slot.graphic.position.set(
        slot.startX + slot.vx * sec,
        slot.startY + slot.vy * sec + 0.5 * slot.gravity * sec * sec
      );
      slot.graphic.alpha = 1 - Math.pow(t, 1.5);
      slot.graphic.scale.set(slot.baseScale * (1 - 0.45 * t));
    }

    for (const slot of this.texts) {
      if (!slot.active) continue;
      const elapsedMs = now - slot.startedAt;
      const t = elapsedMs / slot.durationMs;
      if (t >= 1) {
        slot.active = false;
        slot.node.visible = false;
        continue;
      }
      const rise = reduced ? 16 * t : 38 * (1 - Math.pow(1 - t, 2.2));
      const pop = reduced ? 1 : t < 0.16 ? 0.85 + (t / 0.16) * 0.22 : 1.07 - 0.07 * t;
      slot.node.position.set(slot.startX, slot.startY - rise);
      slot.node.scale.set(pop);
      slot.node.alpha = t > 0.7 ? Math.max(0, 1 - (t - 0.7) / 0.3) : 1;
    }
  }

  destroy() {
    this.root.destroy({ children: true });
    this.particleContext.destroy();
  }
}
