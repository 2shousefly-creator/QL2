/** Presentation-only geometry. Never consumes the combat random stream. */
export function lightningPath(id: number, fromX: number, fromY: number, x: number, y: number, reducedMotion: boolean) {
    const dx = x - fromX, dy = y - fromY, length = Math.max(1, Math.hypot(dx, dy));
    const segments = reducedMotion ? 5 : 8;
    return Array.from({ length: segments + 1 }, (_, i) => {
        const t = i / segments;
        const offset = i === 0 || i === segments ? 0 : Math.sin(id * 1.73 + i * 2.7) * Math.min(11, length * .12);
        return { x: fromX + dx * t - dy / length * offset, y: fromY + dy * t + dx / length * offset };
    });
}

export function healingCrossPlacement(id: number, index: number, reducedMotion: boolean) {
    const phase = id * 2.4 + index * 2.1;
    return {
        x: Math.cos(phase) * (17 + index * 3),
        y: Math.sin(phase) * 15,
        size: 9 + Math.sin(phase) * 2,
        drift: reducedMotion ? -9 : -25,
    };
}
