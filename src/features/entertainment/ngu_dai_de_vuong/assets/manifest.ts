export const assetRoot = '/assets/ngu-dai-de-vuong';
// Atlas and layout must use the same revision so an existing browser cache cannot
// pair V1 frames with the new per-hero atlas dimensions during deployment.
export const characterAsset = (id: string, file: string) => `${assetRoot}/${id}/${file}${id.startsWith('H') ? '?v=combat-visual-2' : ''}`;
export const portrait = (id: string) => characterAsset(id, ['H001','H017','B001'].includes(id) ? 'portrait-v2.webp' : 'portrait.webp');
export const skillIcon = (heroId: string, slot: number) => characterAsset(heroId, `skill-${slot}.webp`);
export interface SpineExport { skeleton: string; atlas: string; texture: string; skin?: string; scale?: number; markers: Partial<Record<string, number[]>>; }
export const SPINE_EXPORTS: Record<string, SpineExport> = Object.fromEntries(['H001','H017','B001'].map(id => {
  const root = `${assetRoot}/${id}/spine-v2`;
  return [id, { skeleton: `${root}/skeleton.json`, atlas: `${root}/character.atlas`, texture: `${root}/character.webp`, skin: 'default', scale: 1,
    markers: { basicAttack: [.45], skill1: [.45], skill2: id === 'H017' ? [.45,.53,.61,.69,.77] : [.45], jump: [.45] } }];
}));
export const ANIMATION_NAMES = ['idle', 'move', 'basicAttack', 'skill1', 'skill2', 'hit', 'stun', 'knockback', 'death', 'victory', 'jump'] as const;
export const ANIMATION_EVENTS = ['basic_hit', 'projectile_spawn', 'skill_hit', 'vfx_burst'] as const;
