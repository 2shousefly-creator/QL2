import { DamageLabelPool } from './airCombatFeedback';
import { DamageTextLayout } from './airCombatDamageLayout';

// Only the player's damage is displayed, including HP/shield parts and burn totals.
// Merge only matching damage kinds/critical states; gameplay damage is untouched.
export const createHiveDamagePool = () => new DamageLabelPool({limit:28,mergeWindow:.12,preserveLifetime:true});
export const createHiveDamageLayout = () => new DamageTextLayout({maxLabels:28,maxOffsetX:36,maxOffsetY:44});
