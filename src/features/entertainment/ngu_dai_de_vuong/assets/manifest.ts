export const assetRoot = '/assets/ngu-dai-de-vuong';
// Atlas and layout must use the same revision so an existing browser cache cannot
// pair V1 frames with the new per-hero atlas dimensions during deployment.
export const characterAsset = (id: string, file: string) => `${assetRoot}/${id}/${file}${id.startsWith('H') ? '?v=combat-visual-2' : ''}`;
export const portrait = (id: string) => characterAsset(id, 'portrait.webp');
export const skillIcon = (heroId: string, slot: number) => characterAsset(heroId, `skill-${slot}.webp`);
export interface SpineExport { skeleton: string; atlas: string; skin?: string; scale?: number; }
// Populate per character with licensed Spine 4.2 exports. The animator automatically
// prefers these exports and uses the original layered rig if loading fails.
export const SPINE_EXPORTS: Record<string, SpineExport> = {};
export const ANIMATION_NAMES = ['idle', 'move', 'basicAttack', 'skill1', 'skill2', 'hit', 'stun', 'knockback', 'death', 'victory', 'jump'] as const;
export const ANIMATION_EVENTS = ['basic_hit', 'projectile_spawn', 'skill_hit', 'vfx_burst'] as const;
