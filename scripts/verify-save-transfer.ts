import assert from 'node:assert/strict';
import { LocalGameRepository } from '../src/storage/LocalGameRepository';
import { createInitialGameState } from '../src/storage/GameRepository';
import { parseTransfer } from '../src/storage/saveTransfer';

const values = new Map<string, string>();
let failArchive = false;
let failNextPrimary = false;
const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem(key: string, value: string) {
    if (failArchive && key.startsWith('quan_lo_import_archive_')) throw new Error('Quota');
    if (failNextPrimary && key === 'quan_lo_game_state_v1') { failNextPrimary = false; throw new Error('Write failure'); }
    values.set(key, value);
  },
  removeItem: (key: string) => values.delete(key),
};
Object.assign(globalThis, { window: { localStorage: storage }, localStorage: storage });
const repo = new LocalGameRepository();
await assert.rejects(repo.export(), /Không tìm thấy/);
values.set('quan_lo_game_state_backup_v1', '{}');
await assert.rejects(repo.export(), /Không tìm thấy/);
const original = createInitialGameState('Synthetic destination');
const originalJson = JSON.stringify({ ...original, futureExtension: { keep: 'synthetic' } });
values.set('quan_lo_game_state_v1', originalJson);
values.set('quan_lo_air_combat_v1', '{"version":1,"synthetic":true}');
const exported = await repo.export();
assert.equal(JSON.parse(exported).gameState.futureExtension.keep, 'synthetic');
assert.equal(values.get('quan_lo_game_state_v1'), originalJson, 'Export must not mutate source');
assert.equal(JSON.parse(exported).extraSaves.quan_lo_air_combat_v1, '{"version":1,"synthetic":true}');
for (const text of ['null', '[]', '{}', '{', JSON.stringify({ ...original, schemaVersion: 999 }), JSON.stringify({ ...original, progression: {} })]) {
  await assert.rejects(repo.import(text));
  assert.equal(values.get('quan_lo_game_state_v1'), originalJson);
}
values.set('quan_lo_app_update_pending_v1', '{}');
await assert.rejects(repo.import(exported), /cập nhật/);
values.delete('quan_lo_app_update_pending_v1');
failArchive = true;
await assert.rejects(repo.import(exported));
assert.equal(values.get('quan_lo_game_state_v1'), originalJson);
failArchive = false;
failNextPrimary = true;
await assert.rejects(repo.import(exported));
assert.equal(values.get('quan_lo_game_state_v1'), originalJson);
const incoming = createInitialGameState('Synthetic incoming');
const incomingJson = JSON.stringify(incoming);
assert.equal(parseTransfer(incomingJson).state.player.displayName, 'Synthetic incoming');
await repo.import(incomingJson);
assert.equal(JSON.parse(values.get('quan_lo_game_state_v1')!).player.displayName, 'Synthetic incoming');
assert.equal(values.get('quan_lo_air_combat_v1'), '{"version":1,"synthetic":true}', 'Old format does not erase side saves');
await repo.save(original);
assert.equal(JSON.parse(values.get('quan_lo_game_state_v1')!).player.displayName, 'Synthetic incoming', 'Autosave guard');
assert.ok([...values].some(([key, value]) => key.startsWith('quan_lo_import_archive_') && JSON.parse(value).incoming === incomingJson && JSON.parse(value).before.quan_lo_game_state_v1 === originalJson));
console.log('PASS save transfer: absence, exact export, legacy input, validation, quota, rollback, archive, autosave guard (synthetic storage)');
