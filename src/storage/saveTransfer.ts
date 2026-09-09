import { gameConfig } from '../game/config';
import { sanitizeAndMigrateState } from './migrations';

export const TRANSFER_FORMAT = 'quan-lo-save-transfer';
export const TRANSFER_MAX_BYTES = 20 * 1024 * 1024;
export const EXTRA_SAVE_KEYS = ['quan_lo_air_combat_v1', 'quan_lo_tank_battle_v1', 'quan_lo_chien_tuyen_v1'] as const;
const record = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);

export function validateSave(raw: unknown) {
  if (!record(raw) || !record(raw.player) || typeof raw.player.id !== 'string' || !raw.player.id ||
      !record(raw.progression) || !record(raw.time)) throw new Error('Không nhận diện được save Quân Lộ.');
  for (const [field, max] of [['schemaVersion', gameConfig.schemaVersion], ['catalogVersion', gameConfig.catalogVersion]] as const) {
    if (raw[field] !== undefined && (!Number.isInteger(raw[field]) || raw[field] < 1 || raw[field] > max)) {
      throw new Error('Phiên bản save không được hỗ trợ. Hãy giữ file gốc và dùng phiên bản game phù hợp.');
    }
  }
  for (const value of [raw.progression.currentRankIndex, raw.progression.xpIntoCurrentRankTicks, raw.progression.totalXpEarnedTicks, raw.time.lastSettledAt]) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new Error('Tiến trình hoặc thời gian trong save không hợp lệ.');
  }
  return sanitizeAndMigrateState(raw);
}

export function parseTransfer(text: string) {
  if (new TextEncoder().encode(text).length > TRANSFER_MAX_BYTES) throw new Error('File vượt giới hạn 20 MiB.');
  let raw: any;
  try {
    raw = JSON.parse(text, (key, value) => {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error();
      return value;
    });
  } catch { throw new Error('JSON không hợp lệ hoặc chứa trường không an toàn.'); }
  const extras: Record<string, string> = {};
  let game = raw;
  if (record(raw) && 'format' in raw) {
    if (raw.format !== TRANSFER_FORMAT || raw.formatVersion !== 1 || !record(raw.extraSaves)) throw new Error('Định dạng sao lưu chưa được hỗ trợ.');
    game = raw.gameState;
    for (const [key, value] of Object.entries(raw.extraSaves)) {
      if (!(EXTRA_SAVE_KEYS as readonly string[]).includes(key) || typeof value !== 'string') throw new Error('Kho dữ liệu bổ sung chưa được hỗ trợ; chưa nhập dữ liệu.');
      try { if (!record(JSON.parse(value))) throw new Error(); }
      catch { throw new Error('Save minigame không hợp lệ; chưa nhập dữ liệu.'); }
      extras[key] = value;
    }
  }
  return { state: validateSave(game), extras };
}

export function makeTransfer(gameRaw: string, storage: Storage, source: string) {
  const gameState = JSON.parse(gameRaw);
  validateSave(gameState);
  const extraSaves: Record<string, string> = {};
  for (const key of EXTRA_SAVE_KEYS) {
    const value = storage.getItem(key);
    if (value !== null) extraSaves[key] = value;
  }
  // Export the ORIGINAL data, not the sanitizer output: unknown fields survive.
  return JSON.stringify({ format: TRANSFER_FORMAT, formatVersion: 1, exportedAt: new Date().toISOString(), source, gameState, extraSaves }, null, 2);
}
