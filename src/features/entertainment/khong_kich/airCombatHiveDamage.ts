import { DamageLabelPool } from './airCombatFeedback';
import { DamageTextLayout } from './airCombatDamageLayout';

// A squad shares one screen, including HP/shield parts and burn totals.
// Merge only matching damage kinds/critical states; gameplay damage is untouched.
export const createHiveDamagePool = () => new DamageLabelPool({limit:28,mergeWindow:.12});
export const createHiveDamageLayout = () => new DamageTextLayout({maxLabels:28,maxOffsetX:36,maxOffsetY:44});
