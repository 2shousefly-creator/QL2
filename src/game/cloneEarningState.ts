import type { GameState } from './types';
/** Only domains touched by earning, farm commands and medal evaluation. Large
 * training/game records and immutable catalogs remain structurally shared. */
export function cloneEarningState(state: GameState): GameState {
  return { ...state, ...structuredClone({ time: state.time, progression: state.progression, energy: state.energy,
    farm: state.farm, medals: state.medals, mastery: state.mastery, globalStats: state.globalStats, journal: state.journal, ui: state.ui }) };
}
