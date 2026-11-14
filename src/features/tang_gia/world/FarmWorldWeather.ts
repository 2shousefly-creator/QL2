import { Container, Graphics, GraphicsContext } from 'pixi.js';
import type { SeasonType } from '../farmTypes';

const SEASON_PARTICLE_COLORS: Record<SeasonType, readonly number[]> = {
  spring: [0xfdb5c8, 0xffd7e5, 0xfbcfe8],
  summer: [0xd9f99d, 0xfef08a, 0xbef264],
  autumn: [0xf59e0b, 0xea580c, 0xfbbf24],
  winter: [0xe0f2fe, 0xffffff, 0xbae6fd],
};

export class FarmWorldWeather {
  readonly root = new Container();

  private rainContext = new GraphicsContext()
    .poly([0, 0, 1.6, 1, -4.5, 18, -6.1, 17])
    .fill({ color: 0xd8f3ff, alpha: 0.72 });
  private rippleContext = new GraphicsContext()
    .poly([0, -3.5, 9, 0, 0, 3.5, -9, 0])
    .stroke({ color: 0xe0f2fe, alpha: 0.52, width: 1.4 });
  private seasonalContext = new GraphicsContext()
    .poly([0, -4.2, 3.6, 0, 0, 4.2, -3.6, 0])
    .fill(0xffffff);

  private rain = Array.from({ length: 56 }, () =>
    this.root.addChild(new Graphics(this.rainContext))
  );
  private ripples = Array.from({ length: 14 }, () =>
    this.root.addChild(new Graphics(this.rippleContext))
  );
  private clouds = Array.from({ length: 4 }, () =>
    this.root.addChild(
      new Graphics()
        .poly([-140, 8, -95, -18, -25, -28, 35, -14, 85, -32, 145, -12, 165, 12, 70, 22, -65, 20])
        .fill({ color: 0xf1f8fc, alpha: 0.12 })
        .poly([-140, 8, -65, 20, 70, 22, 165, 12, 95, 28, -80, 26])
        .fill({ color: 0xcbd5e1, alpha: 0.09 })
    )
  );
  private sunbeams = Array.from({ length: 3 }, (_, i) =>
    this.root.addChild(
      new Graphics()
        .poly([0, 0, 120 + i * 30, 0, -90, 560, -250 - i * 25, 560])
        .fill({ color: 0xffe49e, alpha: 0.05 })
    )
  );
  private sun = this.root.addChild(
    new Graphics()
      .poly([0, -68, 48, -48, 68, 0, 48, 48, 0, 68, -48, 48, -68, 0, -48, -48])
      .fill({ color: 0xffe2a1, alpha: 0.06 })
      .poly([0, -40, 28, -28, 40, 0, 28, 28, 0, 40, -28, 28, -40, 0, -28, -28])
      .fill({ color: 0xffe2a1, alpha: 0.12 })
      .poly([0, -22, 16, -16, 22, 0, 16, 16, 0, 22, -16, 16, -22, 0, -16, -16])
      .fill({ color: 0xffec99, alpha: 0.72 })
  );
  private moon = this.root.addChild(
    new Graphics()
      .poly([0, -30, 21, -21, 30, 0, 21, 21, 0, 30, -21, 21, -30, 0, -21, -21])
      .fill({ color: 0xd6e7ff, alpha: 0.08 })
      .poly([-4, -18, 12, -12, 8, -2, 2, 8, 12, 14, -4, 18, -16, 8, -16, -8])
      .fill({ color: 0xe2f0ff, alpha: 0.85 })
  );
  private stars = Array.from({ length: 22 }, (_, i) =>
    this.root.addChild(
      new Graphics()
        .poly(
          i % 4 === 0
            ? [0, -3.2, 1.2, -1.2, 3.2, 0, 1.2, 1.2, 0, 3.2, -1.2, 1.2, -3.2, 0, -1.2, -1.2]
            : [0, -1.8, 1.8, 0, 0, 1.8, -1.8, 0]
        )
        .fill(0xe2f0ff)
    )
  );
  private breeze = Array.from({ length: 8 }, () =>
    this.root.addChild(
      new Graphics()
        .moveTo(0, 0)
        .lineTo(18, -6)
        .lineTo(36, -4)
        .lineTo(54, 2)
        .stroke({ color: 0xdceebc, alpha: 0.38, width: 1.6 })
    )
  );
  private seasonalParticles = Array.from({ length: 36 }, () =>
    this.root.addChild(new Graphics(this.seasonalContext))
  );

  constructor() {
    this.root.eventMode = 'none';
  }

  update(
    now: number,
    width: number,
    height: number,
    weather: string,
    night: boolean,
    reduced: boolean,
    low: boolean,
    season: SeasonType = 'spring'
  ) {
    const t = reduced ? 0 : now / 1000;

    this.sun.visible = !night && weather === 'sunny';
    this.sun.position.set(width * 0.8, 55);
    this.sun.scale.set(1 + Math.sin(t * 0.5) * 0.04);

    this.sunbeams.forEach((beam, i) => {
      beam.visible = !night && weather === 'sunny' && !low;
      if (beam.visible) {
        beam.position.set(width * (0.58 + i * 0.14), 0);
        beam.alpha = 0.6 + Math.sin(t * 0.7 + i * 1.4) * 0.25;
      }
    });

    this.moon.visible = night && weather !== 'rain';
    this.moon.position.set(width * 0.8, 50);

    const rainCount = low ? 28 : 56;
    this.rain.forEach((drop, i) => {
      drop.visible = weather === 'rain' && i < rainCount;
      if (drop.visible) {
        drop.position.set(
          (i * 137 + t * 37) % (width + 40) - 20,
          (i * 89 + t * 430) % (height + 30) - 20
        );
      }
    });

    this.ripples.forEach((ripple, i) => {
      ripple.visible = weather === 'rain' && !reduced && !low;
      if (ripple.visible) {
        const life = ((t * 1.35 + i * 0.29) % 1);
        ripple.position.set(
          ((i * 193 + 67) % Math.max(120, width - 80)) + 40,
          ((i * 127 + 91) % Math.max(120, height - 140)) + 90
        );
        ripple.scale.set(0.35 + life * 0.95);
        ripple.alpha = (1 - life) * 0.45;
      }
    });

    this.clouds.forEach((cloud, i) => {
      cloud.visible = weather === 'cool' || weather === 'rain';
      cloud.alpha = night ? 0.65 : 1;
      cloud.position.set(
        (i * width / 3 + t * (weather === 'cool' ? 10 : 5)) % (width + 400) - 200,
        height * (0.18 + i * 0.2)
      );
    });

    this.stars.forEach((star, i) => {
      star.visible = night && weather !== 'rain';
      if (star.visible) {
        star.position.set((i * 167 + 21) % width, 20 + (i * 41) % Math.max(40, height * 0.4));
        star.alpha = 0.28 + (Math.sin(t * 0.9 + i * 1.3) + 1) * 0.32;
      }
    });

    this.breeze.forEach((wind, i) => {
      wind.visible = weather === 'cool' || weather === 'calm';
      if (wind.visible) {
        wind.position.set(
          (i * 143 + t * 28) % (width + 80) - 60,
          height * 0.25 + (i * 83) % Math.max(80, height * 0.7)
        );
        wind.alpha = 0.22 + (Math.sin(t + i) + 1) * 0.25;
      }
    });

    const palette = SEASON_PARTICLE_COLORS[season];
    const showFireflies = season === 'summer' && night && weather !== 'rain';
    const maxSeasonal = reduced ? 0 : low ? 16 : 36;

    this.seasonalParticles.forEach((particle, i) => {
      const enabled =
        i < maxSeasonal &&
        weather !== 'rain' &&
        (season !== 'summer' || showFireflies || i % 3 === 0);
      particle.visible = enabled;
      if (!enabled) return;

      particle.tint = palette[i % palette.length];

      if (showFireflies) {
        const cx = ((i * 179 + 47) % Math.max(120, width - 60)) + 30;
        const cy = ((i * 113 + 73) % Math.max(120, height - 110)) + 70;
        particle.position.set(
          cx + Math.sin(t * 0.75 + i * 1.9) * 26,
          cy + Math.cos(t * 0.95 + i * 1.3) * 18
        );
        particle.rotation = 0;
        particle.scale.set(0.65 + (Math.sin(t * 2.4 + i) + 1) * 0.22);
        particle.alpha = 0.25 + (Math.sin(t * 2.2 + i * 0.8) + 1) * 0.36;
        return;
      }

      if (season === 'winter') {
        const x = (i * 131 + Math.sin(t * 0.9 + i) * 28 + t * 10) % (width + 40) - 20;
        const y = (i * 97 + t * 34) % (height + 30) - 15;
        particle.position.set(x < -20 ? x + width + 40 : x, y);
        particle.rotation = t * 0.5 + i;
        particle.scale.set(0.65 + (i % 3) * 0.16);
        particle.alpha = night ? 0.55 : 0.75;
        return;
      }

      // Spring blossoms, autumn falling leaves, subtle summer sun motes
      const fallSpeed = season === 'autumn' ? 28 : season === 'spring' ? 22 : 12;
      const driftSpeed = season === 'autumn' ? 18 : 24;
      const x =
        (i * 151 + t * driftSpeed + Math.sin(t * 1.1 + i * 0.9) * 22) % (width + 40) - 20;
      const y = (i * 89 + t * fallSpeed) % (height + 30) - 15;
      particle.position.set(x, y);
      particle.rotation = t * 1.4 + i;
      particle.scale.set(season === 'autumn' ? 1.05 : 0.85);
      particle.alpha = season === 'summer' ? 0.22 : night ? 0.45 : 0.78;
    });
  }

  destroy() {
    this.root.destroy({ children: true });
    this.rainContext.destroy();
    this.rippleContext.destroy();
    this.seasonalContext.destroy();
  }
}
