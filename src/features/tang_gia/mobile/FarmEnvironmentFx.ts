import { Container, Graphics } from 'pixi.js';

/** Ground-attached lights/wet patches and bounded ambient/weather geometry.
 * No filters, shaders, timers or saved state. Geometry objects are reused. */
export class FarmEnvironmentFx {
  private root: Container;
  private wet = new Graphics();
  private shade = new Graphics();
  private light = new Graphics();
  private rain = new Graphics();
  private ambient = new Graphics();
  private width = 1;
  private height = 1;
  private scroll = 0;
  private layoutKey = '';
  private staticKey = '';
  private lastMotionFrame = -1;
  private lastWeather = '';
  scrollTo(scroll: number) { this.scroll = scroll; this.wet.y = -scroll; this.light.y = -scroll; }
  private lamps: { x: number; y: number }[] = [];
  private patches: { x: number; y: number; radius: number }[] = [];
  constructor(parent: Container) {
    this.root = parent.addChild(new Container());
    this.root.addChild(this.wet, this.shade, this.light, this.rain, this.ambient);
  }
  layout(width: number, height: number, garden: number, penStart: number, penHeight: number, scroll: number) {
    this.scrollTo(scroll);
    const key = `${width}:${height}:${garden}:${penStart}:${penHeight}`;
    if (key === this.layoutKey) return;
    this.layoutKey = key; this.staticKey = '';
    this.width = width; this.height = height;
    this.lamps = [
      { x: 24, y: 70 }, { x: width - 25, y: garden - 50 },
      { x: 25, y: penStart + 80 }, { x: width - 25, y: penStart + penHeight - 55 },
    ];
    this.patches = Array.from({ length: 16 }, (_, i) => ({
      x: i % 2 ? width - 29 - i % 3 * 3 : 24 + i % 3 * 4,
      y: 82 + i * 97 % Math.max(1, penStart + penHeight - 120), radius: 12 + i % 4 * 4,
    }));
  }
  tick(clock: number, reduced: boolean, night: boolean, weather: string) {
    const { width, height, scroll } = this, rainy = weather === 'rain';
    const key = `${this.layoutKey}:${night}:${weather}`;
    if (key !== this.staticKey) {
      this.staticKey = key;
      this.wet.clear(); this.shade.clear(); this.light.clear();
      if (rainy) for (const patch of this.patches) {
        const y = patch.y;

        this.wet.ellipse(patch.x, y + 2, patch.radius + 4, 7).fill({ color: 0x26657c, alpha: .32 });
        this.wet.ellipse(patch.x, y, patch.radius, 5).fill({ color: 0x61c7e7, alpha: .48 });
        this.wet.moveTo(patch.x - patch.radius / 2, y - 2).lineTo(patch.x + 4, y - 2).stroke({ color: 0xd7f7ff, alpha: .4, width: 1 });
      }
      this.shade.rect(0, 0, width, height).fill({ color: night ? 0x051024 : rainy ? 0x336da1 : weather === 'cool' ? 0x78b9d1 : 0xffffff, alpha: night ? .68 : rainy ? .1 : weather === 'cool' ? .08 : 0 });
      for (const lamp of this.lamps) {
        const x = lamp.x, y = lamp.y;

        if (night) {
          // Several broad low-alpha ellipses illuminate earth and actor silhouettes.
          for (let radius = 86; radius >= 14; radius -= 12) this.light.ellipse(x, y + 19, radius, radius * .62).fill({ color: 0xffce70, alpha: .042 });
          this.light.poly([x - 5, y - 42, x + 5, y - 42, x + 51, y + 29, x - 51, y + 29]).fill({ color: 0xffdc86, alpha: .07 });
        }
        this.light.ellipse(x + 7, y + 27, 13, 4).fill({ color: 0x122b25, alpha: .25 });
        this.light.roundRect(x - 3, y - 42, 6, 70, 2).fill(0x875c34);
        this.light.moveTo(x - 1, y + 23).lineTo(x - 1, y - 38).stroke({ color: 0xe2b96b, width: 1 });
        this.light.roundRect(x - 9, y - 57, 18, 20, 3).fill(0x389857);
        this.light.rect(x - 6, y - 54, 12, 13).fill(night ? 0xffe9a9 : 0xc5deca);
        this.light.poly([x - 13, y - 56, x, y - 66, x + 13, y - 56]).fill(0x27a855);
        if (night) this.light.circle(x, y - 47, 16).fill({ color: 0xffdd83, alpha: .14 });
      }
    }
    const motionFrame = reduced ? 0 : Math.floor(clock * 30);
    if (motionFrame === this.lastMotionFrame && key === this.lastWeather) return;
    this.lastMotionFrame = motionFrame; this.lastWeather = key;
    this.rain.clear(); this.ambient.clear();
    if (rainy) {
      for (let i = 0; i < 42; i++) {
        const x = (i * 67.7 - (reduced ? 0 : clock * 38) % width + width) % width;
        const y = (i * 39.3 + (reduced ? 0 : clock * (235 + i % 3 * 28))) % height;
        this.rain.moveTo(x, y).lineTo(x - 4, y + 15 + i % 3 * 3).stroke({ color: 0xc5e7f3, alpha: .6, width: i % 3 ? 1.2 : 1.8 });
      }
      for (let i = 0; i < 12; i++) {
        const age = reduced ? .4 : (clock * 1.5 + i * .31) % 1;
        const x = 25 + i * 71 % Math.max(1, width - 50), y = (80 + i * 113 - scroll % height + height) % height;
        this.rain.ellipse(x, y, 2 + age * 10, 1 + age * 3).stroke({ color: 0xd7edeb, alpha: (1 - age) * .55, width: 1.2 });
      }
    } else if (!reduced) {
      if (!night) {
        // One brief overhead bird pass every 24 seconds, plus six faint pollen motes.
        const pass = clock % 24;
        if (pass < 4) {
          const x = -28 + (width + 56) * pass / 4, y = height * .3 + Math.sin(pass) * 18;
          const wing = Math.sin(clock * 9) * 5;
          this.ambient.moveTo(x - 10, y + wing).quadraticCurveTo(x - 3, y - 4, x, y)
            .quadraticCurveTo(x + 4, y - 4, x + 10, y + wing).stroke({ color: 0x254e43, alpha: .2, width: 2.5 });
        }
        for (let i = 0; i < 6; i++) {
          const x = (i * 91 + clock * 3) % width, y = (i * 137 + clock * 5) % height;
          this.ambient.circle(x, y, 1.3).fill({ color: 0xfff4b6, alpha: .28 });
        }
      }
      for (let i = 0; i < (night ? 8 : 3); i++) {
        const x = 24 + (clock * (night ? 3 : 8) + i * 113) % Math.max(1, width - 48);
        const y = 40 + (i * 157 + Math.sin(clock * .7 + i) * 16) % Math.max(1, height - 60);
        if (night) this.ambient.circle(x, y, 2).fill({ color: 0xffe69e, alpha: .35 + Math.sin(clock * 2 + i) * .3 });
        else {
          const wing = 2 + Math.abs(Math.sin(clock * 7 + i)) * 3;
          this.ambient.ellipse(x - 3, y, wing, 3).ellipse(x + 3, y, wing, 3).fill(i % 2 ? 0xffdb85 : 0xf5c0c7);
          this.ambient.moveTo(x, y - 2).lineTo(x, y + 3).stroke({ color: 0x665b42, width: 1 });
        }
      }
    }
  }
}
