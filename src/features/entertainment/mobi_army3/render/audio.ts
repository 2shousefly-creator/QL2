import type { CombatEvent } from "../types";
/** Original synthesized cues, no external recordings. All voices owned by this battle. */
export class BattleAudio {
  private context: AudioContext | null = null;
  private voices = new Set<OscillatorNode>();
  constructor(private volume: number) {}
  unlock() {
    if (!this.volume) return;
    try {
      this.context ??= new AudioContext();
      void this.context.resume().catch(() => {});
    } catch {
      /* Audio is optional. */
    }
  }
  play(event: CombatEvent) {
    const ctx = this.context;
    if (
      !ctx ||
      ctx.state !== "running" ||
      !this.volume ||
      this.voices.size >= 6
    )
      return;
    const frequencies: Partial<Record<CombatEvent["type"], number>> = {
      turn: 520,
      fire: 160,
      explosion: 65,
      damage: 240,
      heal: 720,
      phase: 320,
      finish: 880,
      skill: 440,
      death: 90,
      fall: 110,
    };
    const hz = frequencies[event.type];
    if (!hz) return;
    const osc = ctx.createOscillator(),
      gain = ctx.createGain(),
      now = ctx.currentTime;
    osc.type = event.type === "explosion" ? "sawtooth" : "triangle";
    osc.frequency.setValueAtTime(hz, now);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(25, hz * 0.45),
      now + 0.18,
    );
    gain.gain.setValueAtTime(this.volume * 0.075, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    this.voices.add(osc);
    osc.onended = () => {
      this.voices.delete(osc);
      osc.disconnect();
      gain.disconnect();
    };
    osc.start(now);
    osc.stop(now + 0.22);
  }
  pause() {
    if (this.context) void this.context.suspend().catch(() => {});
  }
  destroy() {
    for (const voice of this.voices) {
      try {
        voice.stop();
      } catch {
        /* Already stopped. */
      }
    }
    this.voices.clear();
    if (this.context) void this.context.close().catch(() => {});
    this.context = null;
  }
}
