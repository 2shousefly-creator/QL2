import { BALANCE } from "../config";
import type { Command } from "../types";
export class InputController {
  private held = new Map<string, string>();
  private charging: string | null = null;
  constructor(
    private root: HTMLElement,
    private send: (c: Command) => boolean,
    private getAngle: () => number,
    private pause: () => void,
    private unlock: () => void,
    private items: Command[] = [],
  ) {
    root.addEventListener("keydown", this.down);
    root.addEventListener("keyup", this.up);
    window.addEventListener("blur", this.blur);
  }
  hold(source: string, action: string) {
    this.held.set(source, action);
  }
  release(source: string) {
    this.held.delete(source);
  }
  charge(source: string) {
    this.unlock();
    if (this.charging === null && this.send({ type: "charge" }))
      this.charging = source;
  }
  fire(source: string) {
    if (this.charging !== source) return;
    this.charging = null;
    this.send({ type: "release" });
  }
  cancel(source?: string) {
    if (this.charging === null) return;
    if (source && this.charging !== source) return;
    this.charging = null;
    this.send({ type: "cancel" });
  }
  clear() {
    this.held.clear();
    this.cancel();
  }
  tick() {
    const actions = [...this.held.values()];
    const move =
      (actions.includes("right") ? 1 : 0) - (actions.includes("left") ? 1 : 0);
    const aim =
      (actions.includes("up") ? 1 : 0) - (actions.includes("down") ? 1 : 0);
    if (move)
      this.send({ type: "move", direction: move as -1 | 1, dt: BALANCE.step });
    if (aim)
      this.send({
        type: "aim",
        angle: this.getAngle() + aim * 36 * BALANCE.step,
      });
  }
  private editable(e: KeyboardEvent) {
    return (e.target as HTMLElement).matches(
      'input,select,textarea,[contenteditable="true"]',
    );
  }
  private down = (e: KeyboardEvent) => {
    if (this.editable(e)) return;
    if (
      (e.target as HTMLElement).closest("button") &&
      e.code === "Space" &&
      !(e.target as HTMLElement).closest("[data-army-fire]")
    )
      return;
    const itemIndex = ["Digit1", "Digit2", "Digit3"].indexOf(e.code);
    if (itemIndex >= 0 && this.items[itemIndex] && !e.repeat) {
      e.preventDefault();
      this.send(this.items[itemIndex]);
    }
    const map: Record<string, string> = {
      KeyA: "left",
      ArrowLeft: "left",
      KeyD: "right",
      ArrowRight: "right",
      KeyW: "up",
      ArrowUp: "up",
      KeyS: "down",
      ArrowDown: "down",
    };
    if (map[e.code]) {
      e.preventDefault();
      this.hold(e.code, map[e.code]);
    }
    if (e.code === "Space") {
      e.preventDefault();
      if (!e.repeat) this.charge("keyboard");
    }
    if (e.code === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      this.clear();
      this.pause();
    }
  };
  private up = (e: KeyboardEvent) => {
    this.release(e.code);
    if (e.code === "Space" && this.charging === "keyboard") {
      e.preventDefault();
      this.fire("keyboard");
    }
  };
  private blur = () => {
    this.clear();
    this.pause();
  };
  destroy() {
    this.clear();
    this.root.removeEventListener("keydown", this.down);
    this.root.removeEventListener("keyup", this.up);
    window.removeEventListener("blur", this.blur);
  }
}
