import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import type { Projectile, VisualEvent } from './types';
import { QUALITY } from '../data/config';

const COLORS: Record<string, number> = { slash: 0xf6dda3, arrow: 0xe8d9a6, physical: 0xf8ecd2, magic: 0xb4c9ff, lightning: 0x99cbfa, fire: 0xf4a66b, ice: 0xb7e8ed, wind: 0xa9dfd6, heal: 0x9be3b2, shield: 0xc1dbf5, buff: 0xd4edb7, earth: 0xdcc58f, dust: 0xa79d89, enrage: 0xf29c71, absorb: 0xc5dbe7 };
type Particle = { sprite: Sprite; life: number; total: number; vx: number; vy: number; };
type Label = { text: Text; life: number; total: number; };
type Indicator = { graphic: Graphics; life: number; total: number; };
export class VfxPool {
  back = new Container(); front = new Container(); labels = new Container();
  private particles: Particle[] = [];
  private texts: Label[] = [];
  private indicators: Indicator[] = [];
  private projectiles: Sprite[] = [];
  constructor(private quality: keyof typeof QUALITY, private texture: Texture) {}
  emit(e: VisualEvent) {
    if (e.kind === 'telegraph') {
      let item = this.indicators.find(p => p.life <= 0);
      if (!item) { item = { graphic: new Graphics(), life: 0, total: 1 }; this.indicators.push(item); this.back.addChild(item.graphic); }
      const g = item.graphic.clear(); item.life = item.total = e.duration || 1; g.visible = true;
      if (e.shape === 'all') g.roundRect(110, 410, 1700, 325, 40).fill({ color: 0xf07865, alpha: .17 }).stroke({ color: 0xffac7d, width: 3, alpha: .65 });
      else if (e.shape === 'line' || e.shape === 'cone') { const dx=(e.toX||0)-e.x,dy=(e.toY||0)-e.y,d=Math.hypot(dx,dy)||1, width=e.shape==='cone'?220:65,r=e.radius||500; g.poly([e.x-dy/d*width*.2,e.y+dx/d*width*.2,e.x+dx/d*r-dy/d*width,e.y+dy/d*r+dx/d*width,e.x+dx/d*r+dy/d*width,e.y+dy/d*r-dx/d*width,e.x+dy/d*width*.2,e.y-dx/d*width*.2]).fill({color:0xf07865,alpha:.18}).stroke({color:0xffac7d,width:3,alpha:.7}); }
      else g.ellipse(e.x, e.y, Math.min(e.radius || 100, 250), 70).fill({ color: 0xf07865, alpha: .22 }).stroke({ color: 0xffac7d, width: 4 });
      return;
    }
    if (e.amount !== undefined || e.text) {
      let item = this.texts.find(p => p.life <= 0);
      if (!item && this.texts.length < 48) { item = { text: new Text({ text: '', style: { fontFamily: 'Georgia, serif', fontSize: 25, fontWeight: 'bold', fill: 0xffffff, stroke: { color: 0x202333, width: 4 } } }), life: 0, total: 1 }; this.texts.push(item); this.labels.addChild(item.text); }
      if (item) {
        item.life = item.total = e.text ? 1.35 : .9;
        item.text.text = e.text || `${e.kind === 'heal' || e.kind === 'shield' ? '+' : ''}${Math.round(e.amount!)}`;
        item.text.style.fill = e.crit ? 0xffd681 : COLORS[e.kind] || 0xffe5bb;
        item.text.style.fontSize = e.text ? 21 : e.crit ? 34 : 25;
        item.text.anchor.set(.5); item.text.position.set(e.x + (Math.random() - .5) * 24, e.y); item.text.visible = true; item.text.alpha = 1;
      }
    }
    const count = Math.round((e.kind === 'heal' || e.kind === 'shield' ? 10 : 7) * QUALITY[this.quality].density);
    for (let i = 0; i < count; i++) {
      let item = this.particles.find(p => p.life <= 0);
      if (!item && this.particles.length < QUALITY[this.quality].particles) { item = { sprite: new Sprite(this.texture), life: 0, total: 1, vx: 0, vy: 0 }; item.sprite.anchor.set(.5); this.particles.push(item); this.front.addChild(item.sprite); }
      if (!item) break;
      const angle = Math.random() * Math.PI * 2;
      item.life = item.total = .3 + Math.random() * .5; item.vx = Math.cos(angle) * (60 + Math.random() * 130); item.vy = Math.sin(angle) * 100 - 30;
      item.sprite.position.set(e.x, e.y); item.sprite.tint = COLORS[e.kind] || 0xe3d7ac; item.sprite.alpha = .85; item.sprite.visible = true;
      item.sprite.scale.set(e.kind === 'slash' || e.kind === 'lightning' ? .8 : .25, .2);
      item.sprite.rotation = angle;
    }
  }
  update(dt: number, projectiles: Projectile[]) {
    for (const p of this.particles) if (p.life > 0) { p.life -= dt; p.sprite.x += p.vx * dt; p.sprite.y += p.vy * dt; p.sprite.alpha = Math.max(0, p.life / p.total); p.sprite.visible = p.life > 0; }
    for (const t of this.texts) if (t.life > 0) { t.life -= dt; t.text.y -= dt * 37; t.text.alpha = Math.min(1, Math.max(0, t.life / t.total * 2)); t.text.visible = t.life > 0; }
    for (const t of this.indicators) if (t.life > 0) { t.life -= dt; t.graphic.alpha = .6 + .4 * Math.sin(t.life * 13) ** 2; t.graphic.visible = t.life > 0; }
    let index = 0;
    for (const p of projectiles) if (p.active) {
      let sprite = this.projectiles[index];
      if (!sprite) { sprite = new Sprite(this.texture); sprite.anchor.set(.5); this.projectiles.push(sprite); this.front.addChild(sprite); }
      sprite.visible = true; sprite.position.set(p.x, p.y); sprite.tint = COLORS[p.vfx] || COLORS.magic; sprite.scale.set(1, .24); index++;
    }
    for (let i = index; i < this.projectiles.length; i++) this.projectiles[i].visible = false;
  }
  destroy() { this.back.destroy({ children: true }); this.front.destroy({ children: true }); this.labels.destroy({ children: true }); }
}
