import { Container, Graphics, Sprite, Text } from 'pixi.js';
import type { Texture } from 'pixi.js';
import type { MobileAction, MobileHit, MobileRect, MobileSheet } from './mobileTypes';

export const FARM_PALETTE = { cream: 0xf7f1e3, ink: 0x293d32, green: 0x436b49, pale: 0xe4e8d4, amber: 0xd9a347, danger: 0x9b3f32 };
export function panel(parent: Container, rect: MobileRect, color = FARM_PALETTE.cream, radius = 16) {
  return parent.addChild(new Graphics().roundRect(rect.x, rect.y, rect.width, rect.height, radius).fill(color));
}
export function label(parent: Container, text: string, x: number, y: number, width: number, size = 15, color = FARM_PALETTE.ink, bold = false) {
  const node = parent.addChild(new Text({ text, style: { fontFamily: 'system-ui, sans-serif', fontSize: size,
    fill: color, fontWeight: bold ? '600' : '400', wordWrap: true, wordWrapWidth: Math.max(1, width), breakWords: true, lineHeight: size * 1.3 } }));
  node.position.set(x, y); return node;
}
export function sprite(parent: Container, texture: Texture | undefined, rect: MobileRect, anchorY = .5) {
  if (!texture) return null;
  const node = parent.addChild(new Sprite(texture)); node.anchor.set(.5, anchorY);
  node.position.set(rect.x + rect.width / 2, rect.y + rect.height * anchorY);
  node.scale.set(Math.min(rect.width / texture.width, rect.height / texture.height));
  return node;
}

/** Rebuilt only for display-state/input/size changes; never from the animation tick. */
export class FarmUiLayer {
  readonly root = new Container();
  hits: MobileHit[] = [];
  scrollRegion: MobileRect | null = null;
  maxScroll = 0;
  constructor(parent: Container, private texture: (path: string) => Texture | undefined) { parent.addChild(this.root); this.root.eventMode = 'none'; }
  clear() { this.root.removeChildren().forEach(node => node.destroy({ children: true })); this.hits = []; this.scrollRegion = null; this.maxScroll = 0; }
  button(action: MobileAction, rect: MobileRect, pressed: string | null, parent = this.root, register = true) {
    const fill = action.reason ? 0xe2ded1 : pressed === action.id ? 0xc3d3b8 : action.primary ? FARM_PALETTE.green : FARM_PALETTE.pale;
    panel(parent, rect, fill, 12);
    const text = label(parent, action.label, rect.x + 8, rect.y + 8, rect.width - 16, 14, action.primary && !action.reason ? 0xffffff : FARM_PALETTE.ink, true);
    text.y = rect.y + Math.max(6, (rect.height - text.height) / 2);
    if (register) this.hits.push({ ...rect, action });
  }
  sheet(sheet: MobileSheet, width: number, height: number, scroll: number, pressed: string | null) {
    // Replace all world/HUD hits while a sheet owns interaction.
    this.hits = [];
    const shade = panel(this.root, { x: 0, y: 0, width, height }, 0x182c24, 0); shade.alpha = .45;
    const top = Math.max(8, Math.min(140, height * .16)), inset = 12;
    panel(this.root, { x: 0, y: top, width, height: height - top }, FARM_PALETTE.cream, 22);
    label(this.root, sheet.title, inset + 4, top + 16, width - 100, 19, FARM_PALETTE.ink, true);
    this.button({ id: 'sheet-close', label: 'Đóng', run: sheet.close }, { x: width - 76, y: top + 8, width: 64, height: 48 }, pressed);
    const actions = sheet.actions ?? [];
    const footerHeight = actions.length ? actions.length * 56 + 8 : 0;
    const body: MobileRect = { x: inset, y: top + 68, width: width - inset * 2, height: Math.max(32, height - top - 80 - footerHeight) };
    this.scrollRegion = body;
    const mask = this.root.addChild(new Graphics().rect(body.x, body.y, body.width, body.height).fill(0xffffff));
    const content = this.root.addChild(new Container()); content.mask = mask;
    let y = body.y - scroll;
    if (sheet.description) { const text = label(content, sheet.description, body.x + 4, y, body.width - 8); y += text.height + 16; }
    const contentHits: MobileHit[] = [];
    for (const row of sheet.rows) {
      const rowTop = y;
      const image = row.icon ? this.texture(row.icon) : undefined;
      const indent = image ? 54 : 4;
      const title = label(content, row.title, body.x + indent, y + 9, body.width - indent - 8, 15, FARM_PALETTE.ink, true);
      const detail = row.detail ? label(content, row.detail, body.x + indent, title.y + title.height + 4, body.width - indent - 8, 14, 0x596758) : null;
      const rowHeight = Math.max(64, title.height + (detail?.height ?? 0) + 26);
      if (image) sprite(content, image, { x: body.x, y: y + 8, width: 48, height: 48 });
      if (row.accent) content.addChild(new Graphics().circle(body.x + body.width - 8, y + 10, 4).fill(row.accent).stroke({ color: 0x586154, width: 1 }));
      if (row.action) {
        const background = new Graphics().roundRect(body.x, y, body.width, rowHeight, 10).fill(pressed === row.action.id ? 0xc3d3b8 : 0xe9ebdf);
        content.addChildAt(background, Math.max(0, content.children.indexOf(title)));
        contentHits.push({ x: body.x, y, width: body.width, height: rowHeight, action: row.action, scroll: true });
      }
      y = rowTop + rowHeight + 8;
    }
    this.maxScroll = Math.max(0, y + scroll - body.y - body.height);
    for (const hit of contentHits) {
      const y1 = Math.max(body.y, hit.y), y2 = Math.min(body.y + body.height, hit.y + hit.height);
      if (y2 - y1 >= 24) this.hits.push({ ...hit, y: y1, height: y2 - y1 });
    }
    if (this.maxScroll > 0) {
      const thumb = Math.max(24, body.height * body.height / (body.height + this.maxScroll));
      panel(this.root, { x: width - 6, y: body.y + (body.height - thumb) * Math.min(scroll / this.maxScroll, 1), width: 3, height: thumb }, 0xa7b59e, 2);
    }
    actions.forEach((action, index) => this.button(action.reason ? { ...action, label: `${action.label} · ${action.reason}` } : action,
      { x: inset, y: height - footerHeight + index * 56, width: width - 24, height: 48 }, pressed));
  }
}
