import type { Application } from "pixi.js";
export interface PixiSceneController<Props> {
  /** Optional scene-owned scheduler; legacy decorative scenes keep immediate rendering. */
  requestRender?(paint?: () => void): void;
  update(props: Props): void;
  resize(width: number, height: number): void;
  setReducedMotion(reduced: boolean): void;
  tick(seconds: number): void;
  destroy(): void;
}
export type PixiSceneFactory<Props> = (app: Application, props: Props) => PixiSceneController<Props>;
export interface PixiRuntime<Props> {
  update(props: Props, reducedMotion: boolean): void;
  destroy(): void;
}
