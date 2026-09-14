import { Container, Graphics } from 'pixi.js';

/** All coordinates are garden-local. The parent owns world → viewport translation. */
export class GardenAmbientLayer {
  readonly root = new Container();
  private clip = this.root.addChild(new Graphics());
  private creatures = this.root.addChild(new Container());
  private butterflies = Array.from({ length: 3 }, (_, i) => {
    const root = this.creatures.addChild(new Container());
    const color = [0xffbf55, 0xff9dc2, 0xa8dbff][i];
    const left = root.addChild(new Graphics().ellipse(-3, 0, 4.5, 3).fill(color));
    const right = root.addChild(new Graphics().ellipse(3, 0, 4.5, 3).fill(color));
    root.addChild(new Graphics().roundRect(-.7, -2.5, 1.4, 6, .7).fill(0x725435));
    return { root, left, right };
  });
  private bird = this.creatures.addChild(new Container());
  private birdLeft = this.bird.addChild(new Graphics().moveTo(-10, 0).quadraticCurveTo(-4, -5, 0, 0).stroke({ color: 0x426b68, width: 2.2 }));
  private birdRight = this.bird.addChild(new Graphics().moveTo(0, 0).quadraticCurveTo(4, -5, 10, 0).stroke({ color: 0x426b68, width: 2.2 }));
  private pollen = Array.from({ length: 6 }, () => this.creatures.addChild(new Graphics().circle(0, 0, 1.5).fill(0xfff6c1)));
  private fireflies = Array.from({ length: 8 }, () => this.creatures.addChild(new Graphics().circle(0, 0, 4).fill({ color: 0xffe88e, alpha: .12 }).circle(0, 0, 1.7).fill(0xffedac)));
  private width = 1;
  private height = 1;
  private top = 0;
  constructor(parent: Container) {
    parent.addChild(this.root); this.creatures.mask = this.clip;
    this.root.eventMode = 'none'; this.bird.alpha = .45;
  }
  layout(width: number, gardenTop: number, gardenBottom: number) {
    const height = Math.max(1, gardenBottom - gardenTop);
    if (width === this.width && height === this.height && gardenTop === this.top) return;
    this.width = width; this.height = height; this.top = gardenTop;
    this.root.y = gardenTop;
    this.clip.clear().rect(0, 0, width, height).fill(0xffffff);
  }
  viewport(scroll: number, height: number) {
    this.root.renderable = this.top + this.height > scroll && this.top < scroll + height;
  }
  tick(clock: number, reduced: boolean, night: boolean, rainy: boolean) {
    this.creatures.visible = !rainy;
    if (rainy || !this.root.renderable) return;
    const time = reduced ? 0 : clock;
    const width = Math.max(1, this.width - 48), height = Math.max(1, this.height - 64);
    this.bird.visible = !night && !reduced && time % 24 < 4;
    if (this.bird.visible) {
      const pass = time % 24;
      this.bird.position.set(-14 + (this.width + 28) * pass / 4, 32 + height * .3 + Math.sin(pass) * 16);
      this.birdLeft.rotation = Math.sin(time * 9) * .32; this.birdRight.rotation = -this.birdLeft.rotation;
    }
    this.butterflies.forEach(({ root, left, right }, i) => {
      root.visible = !night;
      if (night) return;
      root.position.set(24 + (time * 8 + i * 113) % width,
        32 + height * (.2 + i * .27) + Math.sin(time * .7 + i * 2) * Math.min(14, height * .08));
      left.scale.x = right.scale.x = reduced ? .8 : .35 + Math.abs(Math.sin(time * 7 + i * 1.7)) * .65;
    });
    this.pollen.forEach((node, i) => {
      node.visible = !night; node.alpha = .4;
      if (!night) node.position.set(24 + (i * 91 + time * 3) % width, 32 + (i * 137 + time * 5) % height);
    });
    this.fireflies.forEach((node, i) => {
      node.visible = night;
      if (!night) return;
      node.position.set(24 + (time * 3 + i * 113) % width,
        32 + height * ((i + .5) / 8) + Math.sin(time * .7 + i) * Math.min(12, height / 32));
      node.alpha = reduced ? .6 : .55 + Math.sin(time * 2 + i * 1.7) * .35;
    });
  }
}
