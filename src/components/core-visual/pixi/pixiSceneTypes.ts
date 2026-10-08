import type { Application } from "pixi.js";
export interface PixiSceneController<Props> {
  /** Opt-in artwork gate. Legacy scenes, including Uniform, retain their lifecycle. */
  ready?: Promise<boolean>;
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
  ready?: Promise<boolean>;
  update(props: Props, reducedMotion: boolean): void;
  destroy(): void;
}
