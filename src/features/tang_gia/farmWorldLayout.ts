import type { FarmPoint, FarmWorkerState } from './farmWorkerTypes';
import { FARM_WALK_SPEED } from './farmWorkerConfig';
export const FARM_WORLD = { width: 1800, height: 1120 };
export const FARM_ANCHORS = { rest: { x: 12, y: 0 }, store: { x: 14, y: 4 }, warehouse: { x: 10, y: 4 }, market: { x: 16, y: 6 }, trough: { x: 10, y: 8 }, pen: { x: 12, y: 10 } };
export const FARM_PEN = { left: 10.5, right: 17.5, top: 6.5, bottom: 13.5, barn: { x: 16, y: 8 }, westGateY: 10, southGateX: 14 };
const inPen = (p: FarmPoint) => p.x > FARM_PEN.left && p.x < FARM_PEN.right && p.y > FARM_PEN.top && p.y < FARM_PEN.bottom;
export function farmCanStep(a: FarmPoint, b: FarmPoint): boolean {
  if (inPen(a) === inPen(b)) return true;
  return (a.y === FARM_PEN.westGateY && b.y === a.y && Math.min(a.x,b.x) === 10)
    || (a.x === FARM_PEN.southGateX && b.x === a.x && Math.min(a.y,b.y) === 13);
}
export const plotWorldPoint = (index: number): FarmPoint => ({ x: 1 + (index % 4) * 2, y: 11 - Math.floor(index / 4) * 2 });
export const plotWorkAnchor = (index: number): FarmPoint => { const p = plotWorldPoint(index); return { x: p.x, y: p.y + 1 }; };
export const toFarmScreen = ({ x, y }: FarmPoint): FarmPoint => ({ x: 780 + (x - y) * 51, y: 60 + (x + y) * 27 });
export function farmWalkable(x: number, y: number): boolean {
  if (x < 0 || y < 0 || x > 17 || y > 14) return false;
  if (x >= 1 && x <= 7 && y >= 1 && y <= 11 && x % 2 === 1 && y % 2 === 1) return false;
  if (x >= 11 && x <= 15 && y >= 1 && y <= 3) return false;
  if (x >= 15 && x <= 17 && y >= 7 && y <= 9) return false;
  return true;
}
/** Fixed topology shared by drawing, input and the canonical worker. */
export function findFarmPath(from: FarmPoint, to: FarmPoint): FarmPoint[] {
  const key = (p: FarmPoint) => `${p.x},${p.y}`;
  const start = { x: Math.round(from.x), y: Math.round(from.y) };
  const queue = [start], parent = new Map<string, FarmPoint | null>([[key(start), null]]);
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const p = queue[cursor];
    if (key(p) === key(to)) {
      const path: FarmPoint[] = [p]; let prev = parent.get(key(p));
      while (prev) { path.unshift(prev); prev = parent.get(key(prev)); }
      if (from.x !== start.x || from.y !== start.y) path.unshift({ ...from });
      return path;
    }
    for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const next = { x: p.x + dx, y: p.y + dy };
      if (farmWalkable(next.x, next.y) && farmCanStep(p,next) && !parent.has(key(next))) { parent.set(key(next), p); queue.push(next); }
    }
  }
  return [];
}
export function farmPathDuration(path: FarmPoint[]): number {
  return path.slice(1).reduce((total, point, index) => total + Math.hypot(point.x - path[index].x, point.y - path[index].y), 0) / FARM_WALK_SPEED * 1000;
}
export function workerPositionAt(worker: FarmWorkerState, now: number): FarmPoint {
  const action = worker.action;
  if (!action) {
    const stroll=worker.stroll;
    if(worker.status!=='employed'||!stroll||stroll.duration<=0)return worker.position;
    return pointAlongFarmPath(stroll.path, (Math.max(0,now-stroll.startedAt)%stroll.duration)/1000*.8);
  }
  if (now >= action.arrivedAt) return action.workAnchor;
  return pointAlongFarmPath(action.path, Math.max(0,now-action.departedAt)/1000*FARM_WALK_SPEED);
}
function pointAlongFarmPath(path: FarmPoint[], distance: number): FarmPoint {
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i], length = Math.hypot(b.x - a.x, b.y - a.y);
    if(length===0)continue;
    if (distance <= length) return { x: a.x + (b.x - a.x) * distance / length, y: a.y + (b.y - a.y) * distance / length };
    distance -= length;
  }
  return path[path.length-1] ?? FARM_ANCHORS.rest;
}
/** One closed route, sampled analytically: no extra offline timeline events. */
export function createFarmStroll(position: FarmPoint, at: number): NonNullable<FarmWorkerState['stroll']> | undefined {
  const path: FarmPoint[]=[position];
  const home={x:Math.round(position.x),y:Math.round(position.y)};
  for(const stop of [{x:8,y:12},{x:0,y:12},{x:0,y:0},{x:8,y:0},{x:9,y:6},home]) {
    const leg=findFarmPath(path[path.length-1],stop);
    if(leg.length)path.push(...leg.slice(1));
  }
  if(path[path.length-1].x===home.x&&path[path.length-1].y===home.y&&(home.x!==position.x||home.y!==position.y))path.push(position);
  if(path.length<2||path[path.length-1].x!==position.x||path[path.length-1].y!==position.y)return;
  return {path,startedAt:at,duration:farmPathDuration(path)*FARM_WALK_SPEED/.8};
}
