import type { Hero, Stage } from '../types';
export const STARTER_IDS = ['H001', 'H005', 'H012', 'H018'];
export const RARITY_COLORS = { C: '#5FAE5A', B: '#4E8FD8', A: '#8B5CC7', S: '#E9A23B' };
export const overrideHero = (hero: Hero): Hero => ({ ...hero, attackInterval: 1, moveSpeed: 1, maxMana: 10 });
export const overrideStage = (stage: Stage): Stage => ({ ...stage, firstTickets: stage.bossId ? 10 : 0 });
// Only explicit normalized fields leave the importer. Legacy progression and Item_Config stat text never enter runtime data.
