import type { EnemyType } from './airCombatTypes';

/** Numeric references only: Forest behavior and artwork are independently authored. */
export const FOREST_SPEC = {
 forest_mantis: ['razor_glider','Bọ Ngựa Tàng Ảnh'],
 forest_stinger: ['swarm_needler','Ong Sát Thủ'],
 forest_fae_moth: ['signal_weaver','Bướm Tinh Vân'],
 forest_acid_bat: ['siege_spitter','Dơi Hủ Thực'],
 forest_web_spider: ['aegis_beetle','Nhện Tơ Quang'],
 forest_spirit_firefly: ['repair_wasp','Đom Đóm Tinh Linh'],
 forest_mantis_lord: ['razor_marshal','Ảnh Liêm Chúa'],
 forest_moth_queen: ['disruptor_monarch','Bướm Nữ Hoàng'],
 forest_bat_lord: ['bombard_prelate','Dơi Chúa Hủ Thực'],
 forest_weaver_matriarch: ['aegis_regent','Nhện Chúa Dệt Mộng'],
 forest_firefly_ancient: ['forge_matron','Linh Đom Đóm Cổ Đại'],
 forest_brood_queen: ['brood_ark','Ong Chúa Mẫu Thể'],
 forest_ancient_cocoon: ['crucible_ark','Kén Bướm Cổ Đại'],
} as const;
export type ForestEnemyType = keyof typeof FOREST_SPEC;
export const FOREST_NORMALS = Object.keys(FOREST_SPEC).slice(0,6) as ForestEnemyType[];
export const FOREST_ELITES = Object.keys(FOREST_SPEC).slice(6,11) as ForestEnemyType[];
export const FOREST_MOTHERS = Object.keys(FOREST_SPEC).slice(11) as ForestEnemyType[];
export const isForestEnemy = (type:EnemyType):type is ForestEnemyType => type in FOREST_SPEC;
export const isSquadStage = (id:number) => id===5 || id===6;
export const isSquadMother = (type:EnemyType) => type==='brood_ark'||type==='crucible_ark'||FOREST_MOTHERS.includes(type as ForestEnemyType);
