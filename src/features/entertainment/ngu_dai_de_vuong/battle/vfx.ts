import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import type { Actor, Projectile, VisualEvent } from './types';
import { QUALITY } from '../data/config';
import { SKILL_VFX_PRESETS } from '../data/skillVfxPresets';
import { HERO_VISUAL_PROFILES } from '../data/heroVisualProfiles';
import { drawMotif } from './vfxShapes';
import { shieldTotal } from './stats';

const COLORS: Record<string, number> = { slash: 0xf6dda3, arrow: 0xe8d9a6, physical: 0xf8ecd2, magic: 0xb4c9ff, lightning: 0x99cbfa, fire: 0xf4a66b, ice: 0xb7e8ed, wind: 0xa9dfd6, heal: 0x9be3b2, shield: 0xc1dbf5, buff: 0xd4edb7, earth: 0xdcc58f, dust: 0xa79d89, enrage: 0xf29c71, absorb: 0xc5dbe7 };
type Particle = { sprite: Sprite; life: number; total: number; vx: number; vy: number; };
type Label = { text: Text; life: number; total: number; };
type Indicator = { graphic: Graphics; life: number; total: number; };
type Motif = Indicator & { size: number; expand: boolean; ground: boolean };
type StatusView = { g: Graphics; keys: Set<string>; shield: number; pulse: number };
export class VfxPool {
  back = new Container(); front = new Container(); labels = new Container();
  private particles: Particle[] = [];
  private texts: Label[] = [];
  private indicators: Indicator[] = [];
  private projectiles: Graphics[] = [];
  private motifs: Motif[] = [];
  private statuses = new Map<string, StatusView>();
  private time = 0;
  private trailClock = 0;
  constructor(private quality: keyof typeof QUALITY, private texture: Texture) {}
  private motif(kind:string,x:number,y:number,color:number,accent:number,duration=.6,size=1,ground=false,expand=true) {
    let item = this.motifs.find(p=>p.life<=0 && p.ground===ground);
    if(!item && this.motifs.length<180){item={graphic:new Graphics(),life:0,total:1,size:1,ground,expand};this.motifs.push(item);(ground?this.back:this.front).addChild(item.graphic);}
    if(!item)return;
    item.life=item.total=duration;item.size=size;item.expand=expand;
    const g=item.graphic.clear();g.visible=true;g.alpha=1;g.rotation=0;g.position.set(x,y);g.scale.set(size,ground?size*.34:size);
    drawMotif(g,kind,color,accent);
  }
  emit(e: VisualEvent, labelsOnly = false) {
    const preset=e.skillId?SKILL_VFX_PRESETS[e.skillId]:undefined;
    if (!labelsOnly) {
    if(preset && e.phase){
      if(e.phase==='cast')this.motif(preset.cast,e.x,e.y+95,preset.color,preset.accent,Math.max(.15,e.duration||.4),preset.size*.55,false,false);
      else if(e.phase==='release')this.motif(preset.weaponTrail,e.x,e.y,preset.color,preset.accent,.23,preset.size*.65);
      else {this.motif(preset.impact,e.x,e.y,preset.color,preset.accent,preset.duration,preset.size);this.motif(preset.ground,e.x,e.y+95,preset.color,preset.accent,preset.duration+.3,preset.size,true);}
    }else if(e.phase==='release'||e.phase==='impact'){
      const hero=HERO_VISUAL_PROFILES[e.heroId||''];
      if(hero)this.motif(e.phase==='release'?'slash':hero.projectile,e.x,e.y,parseInt(hero.palette[0].slice(1),16),parseInt(hero.palette[1].slice(1),16),.24,.48);
    }
    if(e.kind==='chain'||e.kind==='knockback'){
      let item=this.indicators.find(p=>p.life<=0);
      if(!item){item={graphic:new Graphics(),life:0,total:1};this.indicators.push(item);this.front.addChild(item.graphic);}
      const g=item.graphic.clear();g.position.set(0,0);g.scale.set(1);g.rotation=0;g.visible=true;item.life=item.total=e.kind==='chain'?.22:.35;
      const dx=(e.toX??e.x)-e.x,dy=(e.toY??e.y)-e.y,d=Math.hypot(dx,dy)||1,points:number[]=[];
      for(let i=0;i<=8;i++){const jitter=i===0||i===8?0:(i%2?1:-1)*14;points.push(e.x+dx*i/8-dy/d*jitter,e.y+dy*i/8+dx/d*jitter);}
      g.poly(points,false).stroke({color:preset?.accent||0xc6d8ea,width:e.kind==='chain'?4:2,alpha:.8});
      if(e.kind==='chain')g.poly(points,false).stroke({color:0xf4ffff,width:1.5});
      return;
    }
    if(e.kind==='shieldRipple')this.motif('shield',e.x,e.y,0xa6d3f1,0xf5ffff,.3,1.45);
    if (e.kind === 'telegraph') {
      let item = this.indicators.find(p => p.life <= 0);
      if (!item) { item = { graphic: new Graphics(), life: 0, total: 1 }; this.indicators.push(item); this.back.addChild(item.graphic); }
      const g = item.graphic.clear(); item.life = item.total = e.duration || 1; g.visible = true;g.position.set(0,0);g.scale.set(1);g.rotation=0;
      if (e.shape === 'all') g.roundRect(110, 410, 1700, 325, 40).fill({ color: 0xf07865, alpha: .17 }).stroke({ color: 0xffac7d, width: 3, alpha: .65 });
      else if (e.shape === 'line' || e.shape === 'cone') { const dx=(e.toX||0)-e.x,dy=(e.toY||0)-e.y,d=Math.hypot(dx,dy)||1, width=e.shape==='cone'?220:65,r=e.radius||500; g.poly([e.x-dy/d*width*.2,e.y+dx/d*width*.2,e.x+dx/d*r-dy/d*width,e.y+dy/d*r+dx/d*width,e.x+dx/d*r+dy/d*width,e.y+dy/d*r-dx/d*width,e.x+dy/d*width*.2,e.y-dx/d*width*.2]).fill({color:0xf07865,alpha:.18}).stroke({color:0xffac7d,width:3,alpha:.7}); }
      else g.ellipse(e.x, e.y, Math.min(e.radius || 100, 250), 70).fill({ color: 0xf07865, alpha: .22 }).stroke({ color: 0xffac7d, width: 4 });
      return;
    }
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
    if (labelsOnly) return;
    const count = Math.round((e.kind === 'heal' || e.kind === 'shield' ? 10 : 7) * QUALITY[this.quality].density);
    for (let i = 0; i < count; i++) {
      let item = this.particles.find(p => p.life <= 0);
      if (!item && this.particles.length < QUALITY[this.quality].particles) { item = { sprite: new Sprite(this.texture), life: 0, total: 1, vx: 0, vy: 0 }; item.sprite.anchor.set(.5); this.particles.push(item); this.front.addChild(item.sprite); }
      if (!item) break;
      const angle = Math.random() * Math.PI * 2;
      item.life = item.total = .3 + Math.random() * .5; item.vx = Math.cos(angle) * (60 + Math.random() * 130); item.vy = Math.sin(angle) * 100 - 30;
      item.sprite.position.set(e.x, e.y); item.sprite.tint = preset?.accent || COLORS[e.kind] || 0xe3d7ac; item.sprite.alpha = .85; item.sprite.visible = true;
      item.sprite.scale.set(e.kind === 'slash' || e.kind === 'lightning' ? .8 : .25, .2);
      item.sprite.rotation = angle;
    }
  }
  update(dt: number, projectiles: Projectile[], actors: Actor[]) {
    this.time+=dt;this.trailClock+=dt;const trail=this.trailClock>.065;if(trail)this.trailClock=0;
    for(const m of this.motifs)if(m.life>0){m.life-=dt;const progress=1-Math.max(0,m.life/m.total);m.graphic.visible=m.life>0;m.graphic.alpha=Math.min(1,(1-progress)*2);const s=m.size*(m.expand?.7+progress*.65:1);m.graphic.scale.set(s,m.ground?s*.34:s);}
    for (const p of this.particles) if (p.life > 0) { p.life -= dt; p.sprite.x += p.vx * dt; p.sprite.y += p.vy * dt; p.sprite.alpha = Math.max(0, p.life / p.total); p.sprite.visible = p.life > 0; }
    for (const t of this.texts) if (t.life > 0) { t.life -= dt; t.text.y -= dt * 37; t.text.alpha = Math.min(1, Math.max(0, t.life / t.total * 2)); t.text.visible = t.life > 0; }
    for (const t of this.indicators) if (t.life > 0) { t.life -= dt; t.graphic.alpha = .6 + .4 * Math.sin(t.life * 13) ** 2; t.graphic.visible = t.life > 0; }
    let index = 0;
    for (const p of projectiles) if (p.active) {
      let sprite = this.projectiles[index];
      if (!sprite) { sprite = new Graphics(); this.projectiles.push(sprite); this.front.addChild(sprite); }
      const preset=p.skill?SKILL_VFX_PRESETS[p.skill.id]:undefined,hero=HERO_VISUAL_PROFILES[p.heroId];
      const color=preset?.color||parseInt(hero?.palette[0].slice(1)||'b4c9ff',16),accent=preset?.accent||parseInt(hero?.palette[1].slice(1)||'e8d9a6',16);
      const shape=preset?.projectile||hero?.projectile||p.vfx;
      sprite.clear();drawMotif(sprite,shape,color,accent);sprite.visible=true;sprite.position.set(p.x,p.y);sprite.rotation=p.rotation;sprite.scale.set(p.basic?.4:.6);
      if(trail)this.motif(preset?.weaponTrail||shape,p.x-Math.cos(p.rotation)*15,p.y-Math.sin(p.rotation)*15,color,accent,.2,.18,false,false);
      index++;
    }
    for (let i = index; i < this.projectiles.length; i++) this.projectiles[i].visible = false;
    this.updateStatuses(dt,actors);
  }
  private updateStatuses(dt:number,actors:Actor[]){
    for(const a of actors){
      let view=this.statuses.get(a.id);
      if(!view){view={g:new Graphics(),keys:new Set(),shield:0,pulse:0};this.statuses.set(a.id,view);this.front.addChild(view.g);}
      const g=view.g.clear(),keys=new Set(a.statuses.map(s=>s.kind)),shield=shieldTotal(a);
      if(view.keys.has('freeze')&&!keys.has('freeze'))this.motif('frostPrison',a.x,a.y-95,0x9fcdda,0xf0ffff,.45,1.2);
      if(view.keys.has('knockup')&&!keys.has('knockup'))this.motif('crater',a.x,a.y,0x998e73,0xe8d6ad,.45,1,true);
      view.keys=keys;view.shield=shield;view.pulse+=dt;g.visible=a.hp>0;if(!g.visible)continue;
      const up=a.statuses.find(s=>s.kind==='knockup'),lift=up?Math.sin(Math.PI*Math.max(0,Math.min(1,1-up.remaining/up.duration)))*95:0;
      g.position.set(a.x,a.y-lift);const pulse=.55+Math.sin(this.time*4)*.15;
      if(keys.has('freeze')){for(let i=0;i<5;i++){const x=(i-2)*23;g.poly([x-15,-7,x-9,-85-Math.abs(i-2)*9,x+3,-108,x+16,-12]).fill({color:0x99e0ee,alpha:.18}).stroke({color:0xc6f4ff,width:1.5,alpha:.65});}g.ellipse(0,-8,66,17).fill({color:0xc1f5ff,alpha:.12});}
      let icon=0;
      const badge=(kind:string,color:number)=>{const x=(icon++-1)*29,y=-265;g.circle(x,y,12).fill({color:0x182a37,alpha:.85});if(kind==='stun'){for(let i=0;i<3;i++){const angle=this.time*3+i*Math.PI*2/3;g.star(x+Math.cos(angle)*10,y+Math.sin(angle)*5,4,4,2).fill(color);}}else if(kind==='silence'){g.circle(x,y,7).stroke({color,width:2});g.moveTo(x-7,y-7).lineTo(x+7,y+7).stroke({color,width:2});}else if(kind==='taunt'){g.poly([x-8,y-6,x+8,y-6,x+8,y+3,x,y+8,x-8,y+3]).stroke({color,width:2});g.moveTo(x,y-3).lineTo(x,y+2).stroke({color,width:2});}else if(kind==='mark'){g.poly([x,y-9,x+7,y+5,x-7,y+5]).stroke({color,width:2});}else{g.poly([x-7,y+5,x,y-5,x+7,y+5]).stroke({color,width:2});}};
      if(keys.has('stun'))badge('stun',0xffd578);
      if(keys.has('silence'))badge('silence',0xb7a1e2);
      if(keys.has('taunt'))badge('taunt',0xee936e);
      if(keys.has('mark'))badge('mark',0xe5718d);
      if(a.statuses.some(s=>s.kind==='armorPct'&&s.value<0)){g.poly([-24,-110,-4,-116,-11,-98,-2,-93,-19,-70,-25,-88]).stroke({color:0xe6b475,width:2});g.poly([5,-115,24,-110,21,-86,1,-70,10,-94,1,-102]).stroke({color:0xe6b475,width:2});}
      if(a.statuses.some(s=>['attackSpeed','moveSpeed','damageBonus','crit','atk'].includes(s.kind)&&s.value>0)){badge('buff',0xb4e3b5);for(let i=0;i<3;i++){const y=-20-((this.time*30+i*22)%60);g.poly([-39,y,-31,y-7,-23,y]).stroke({color:0xa9e0c5,width:2,alpha:.55});}}
      if(keys.has('eagleEye')){g.ellipse(0,-216,24,10).stroke({color:0xd5b9f1,width:2});g.circle(0,-216,5).fill(0xd5b9f1);}
      if(keys.has('untargetable'))g.ellipse(0,-4,55,15).fill({color:0x665488,alpha:.2});
      if(view.pulse>=1)view.pulse=0;
    }
  }
  destroy() { this.back.destroy({ children: true }); this.front.destroy({ children: true }); this.labels.destroy({ children: true }); }
}
