// Authoring only: serialize existing presentation/configuration data, without running a battle.
import { build } from 'esbuild';
import { resolve, relative } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
await mkdir('.tools/art-authoring', { recursive: true });
const base = './src/features/entertainment/khong_kich/';
await build({
  stdin: { contents: `
import { writeFileSync } from 'node:fs';
import { AIRCRAFT_CONFIGS, SKILL_CONFIGS, ENEMY_CONFIGS } from '${base}airCombatConfig';
import { SKILL_RANKS } from '${base}airCombatSkillRanks';
import { ENEMY_VISUALS } from '${base}airCombatEnemyArt';
import { STAGE2_ENEMY_ART, STAGE2_VFX_ART, TEMPEST_WEAKPOINT_ART } from '${base}airCombatStage2Art';
import { STAGE3_ENEMY_ART, STAGE3_VFX_ART, STORMBREAKER_BOSS_ART } from '${base}airCombatStage3Art';
import { STAGE4_ENEMY_ART, STAGE4_VFX_ART, PARALLAX_BOSS_ART, MIRAGE_HELPER_ART } from '${base}airCombatStage4Art';
import { VFX_VISUALS } from '${base}pixi/AirCombatPixiAssets';
writeFileSync('art/khong-kich/26.25.0/art-inputs.json', JSON.stringify({
aircraft:AIRCRAFT_CONFIGS,skills:SKILL_CONFIGS,ranks:SKILL_RANKS,enemies:ENEMY_CONFIGS,
enemyFrames:ENEMY_VISUALS,stage2:STAGE2_ENEMY_ART,stage3:STAGE3_ENEMY_ART,stage4:STAGE4_ENEMY_ART,
bossFrames:[ENEMY_VISUALS.boss,STAGE2_ENEMY_ART.boss,STORMBREAKER_BOSS_ART[0],PARALLAX_BOSS_ART[0]],
helpers:{tempest_weakpoint:TEMPEST_WEAKPOINT_ART,mirage_helper:MIRAGE_HELPER_ART},
vfx:{...VFX_VISUALS,...STAGE2_VFX_ART,...STAGE3_VFX_ART,...STAGE4_VFX_ART}
},null,2)+String.fromCharCode(10));`, resolveDir: root, loader: 'ts' },
  outfile: '.tools/art-authoring/inputs.mjs', bundle: true, platform: 'node', format: 'esm',
  packages: 'external', plugins: [{ name: 'art-paths', setup(b) {
    b.onLoad({ filter: /\.(png|svg)$/ }, async a => ({ contents: `export default ${JSON.stringify(relative(root,a.path).replaceAll('\\','/'))}`, loader:'js' }));
  } }],
});
await import(pathToFileURL(resolve('.tools/art-authoring/inputs.mjs')).href);
console.log('Wrote authoring configuration and frame inputs.');
