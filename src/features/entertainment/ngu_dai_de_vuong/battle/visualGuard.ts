/** A failed presentation component is quarantined for this scene's lifetime. */
export class VisualGuard {
  readonly health: Record<string, boolean> = {};
  run<T>(name: string, fn: () => T, cleanup?: () => void): T | undefined {
    if (this.health[name] === false) return;
    this.health[name] = true;
    try { return fn(); } catch (error) {
      this.health[name] = false;
      console.warn(`[Ngũ Đại] Disabled visual subsystem: ${name}`, error);
      try { cleanup?.(); } catch { /* Cleanup must not interrupt the battle. */ }
    }
  }
}
