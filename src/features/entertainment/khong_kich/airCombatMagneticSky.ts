import type { CombatWorld } from "./airCombatRuntime";

interface StormFlight { elapsed: number; distance: number }
const flights = new WeakMap<CombatWorld, StormFlight>();
/** Presentation-only integration, shared by Pixi and Canvas. Combat elapsed is
 * unchanged while paused, including when a renderer keeps drawing UI frames. */
export function magneticFlight(world: CombatWorld, reducedMotion: boolean) {
  let flight = flights.get(world);
  if (!flight) { flight = { elapsed: world.elapsed, distance: 0 }; flights.set(world, flight); }
  const boss = world.bossSpawned && !world.bossDefeated;
  const speed = world.magnetic?.director?.overload ? 95 : boss ? [60, 60, 68, 76, 84, 84][Math.min(5, world.bossPhase)]
    : world.stage.waves[world.waveIndex]?.elite ? 65 : 55;
  const dt = Math.max(0, world.elapsed - flight.elapsed);
  flight.distance += dt * speed * (reducedMotion ? .3 : 1);
  flight.elapsed = world.elapsed;
  return flight.distance;
}
export function stormTile(distance: number, index: number) {
  const period = 700, step = Math.floor(distance / period);
  return { y: distance % period - period + index * period, flipped: (step + index) % 2 === 0 };
}
