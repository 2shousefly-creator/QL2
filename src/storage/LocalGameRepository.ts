import { GameRepository } from "./GameRepository";
import { sanitizeAndMigrateState } from "./migrations";
import { GameState } from "../game/types";
import { EXTRA_SAVE_KEYS, RETIRED_EXTRA_SAVE_KEYS, makeTransfer, parseTransfer } from './saveTransfer';

const STORAGE_KEY = "quan_lo_game_state_v1";
const BACKUP_STORAGE_KEY = "quan_lo_game_state_backup_v1";
const DB_NAME = "quan_lo_db";
const DB_STORE = "game_state";
const DB_KEY = "current";
let importInProgress = false;
function cleanupRetiredExtras(): void {
  // Best effort only after the main save has loaded/migrated successfully.
  for (const key of RETIRED_EXTRA_SAVE_KEYS) {
    try { window.localStorage.removeItem(key); } catch { /* Storage may be unavailable. */ }
  }
}

function openIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function saveToIndexedDB(json: string): Promise<void> {
  const db = await openIndexedDB();
  if (!db) return;
  try {
    const tx = db.transaction(DB_STORE, "readwrite");
    const store = tx.objectStore(DB_STORE);
    store.put(json, DB_KEY);
  } catch (err) {
    console.error("IndexedDB save error:", err);
  }
}

async function loadFromIndexedDB(): Promise<string | null> {
  const db = await openIndexedDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DB_STORE, "readonly");
      const store = tx.objectStore(DB_STORE);
      const req = store.get(DB_KEY);
      req.onsuccess = () => resolve((req.result as string) || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function clearIndexedDB(): Promise<void> {
  const db = await openIndexedDB();
  if (!db) return;
  try {
    const tx = db.transaction(DB_STORE, "readwrite");
    const store = tx.objectStore(DB_STORE);
    store.delete(DB_KEY);
  } catch (err) {
    console.error("IndexedDB clear error:", err);
  }
}

export class LocalGameRepository implements GameRepository {
  public async load(): Promise<GameState | null> {
    if (typeof window === "undefined") {
      return null;
    }

    let json: string | null = null;
    if (window.localStorage) {
      json = localStorage.getItem(STORAGE_KEY);
      if (!json) {
        json = localStorage.getItem(BACKUP_STORAGE_KEY);
      }
      if (!json) {
        json = localStorage.getItem("quan_lo_manual_update_backup");
      }
    }

    if (!json) {
      json = await loadFromIndexedDB();
    }

    if (!json) {
      return null;
    }

    try {
      const raw = JSON.parse(json);
      const state = sanitizeAndMigrateState(raw);
      // Synchronize back to all stores
      await this.save(state);
      cleanupRetiredExtras();
      return state;
    } catch (err) {
      console.error("Failed to load game state:", err);
      return null;
    }
  }

  public async save(state: GameState): Promise<void> {
    // Keep old in-memory autosave/beforeunload from overwriting an accepted import.
    // Successful interactive imports reload the page; failures release this guard.
    if (importInProgress) return;
    if (typeof window === "undefined") {
      return;
    }
    try {
      const json = JSON.stringify(state);
      if (window.localStorage) {
        localStorage.setItem(STORAGE_KEY, json);
        localStorage.setItem(BACKUP_STORAGE_KEY, json);
      }
      await saveToIndexedDB(json);
    } catch (err) {
      console.error("Failed to save game state:", err);
    }
  }

  public async export(): Promise<string> {
    const storage = window.localStorage;
    let current = storage.getItem(STORAGE_KEY);
    let source = 'localStorage/current';
    if (!current) { current = await loadFromIndexedDB(); source = 'IndexedDB/current'; }
    if (!current) throw new Error('Không tìm thấy save hiện tại. Không tạo bản sao lưu giả; hãy phục hồi bản backup trước.');
    return makeTransfer(current, storage, source);
  }

  public async import(rawJson: string): Promise<GameState> {
    const { state, extras } = parseTransfer(rawJson);
    if (importInProgress) throw new Error('Đang nhập dữ liệu, hãy tải lại trang trước khi thử lại.');
    const storage = window.localStorage;
    if (storage.getItem('quan_lo_app_update_pending_v1')) throw new Error('Hãy hoàn tất phục hồi/cập nhật đang chờ trước khi nhập save.');
    importInProgress = true;
    const keys = [STORAGE_KEY, BACKUP_STORAGE_KEY, 'quan_lo_manual_update_backup', 'quan_lo_app_update_backup_v1', ...EXTRA_SAVE_KEYS];
    const before: Record<string, string | null> = {};
    let previousIdb: string | null = null;
    let changed = false;
    try {
      // All archives must succeed BEFORE any destination state is replaced.
      for (const key of keys) before[key] = storage.getItem(key);
      previousIdb = await readImportIndexedDB();
      const archiveId = `quan_lo_import_archive_${crypto.randomUUID()}`;
      storage.setItem(archiveId, JSON.stringify({ createdAt: Date.now(), before, indexedDB: previousIdb, incoming: rawJson }));
      const json = JSON.stringify(state);
      changed = true;
      storage.setItem(STORAGE_KEY, json);
      storage.setItem(BACKUP_STORAGE_KEY, json);
      for (const [key, value] of Object.entries(extras)) storage.setItem(key, value);
      await writeImportedIndexedDB(json);
      if (storage.getItem(STORAGE_KEY) !== json) throw new Error('Không xác minh được dữ liệu sau khi ghi.');
      cleanupRetiredExtras();
      return state;
    } catch {
      if (changed) {
        // Archive remains available even if quota/device failure prevents rollback.
        try {
          for (const [key, value] of Object.entries(before)) {
            if (value === null) storage.removeItem(key); else storage.setItem(key, value);
          }
          await writeImportedIndexedDB(previousIdb);
        } catch { throw new Error('Nhập chưa hoàn tất. Dừng chơi và phục hồi từ quan_lo_import_archive_ hoặc file backup đã tải; không xóa dữ liệu trình duyệt.'); }
        importInProgress = false;
      } else importInProgress = false;
      throw new Error('Không thể nhập hoặc lưu bản backup an toàn. Dữ liệu đích chưa được thay thế hoặc đã được phục hồi.');
    }
  }

  public async clear(): Promise<void> {
    if (typeof window !== "undefined") {
      if (window.localStorage) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(BACKUP_STORAGE_KEY);
      }
      await clearIndexedDB();
    }
  }
}

export const localGameRepository = new LocalGameRepository();

// Import requires commit acknowledgement; ordinary legacy save behavior is unchanged.
async function writeImportedIndexedDB(json: string | null): Promise<void> {
  if (!window.indexedDB) return; // localStorage remains the durable source.
  const db = await openIndexedDB();
  if (!db) throw new Error('IndexedDB unavailable');
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      if (json === null) tx.objectStore(DB_STORE).delete(DB_KEY);
      else tx.objectStore(DB_STORE).put(json, DB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = tx.onabort = () => reject(new Error('IndexedDB import failed'));
    });
  } finally { db.close(); }
}

async function readImportIndexedDB(): Promise<string | null> {
  if (!window.indexedDB) return null;
  const db = await openIndexedDB();
  if (!db) throw new Error('Cannot back up IndexedDB');
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const request = tx.objectStore(DB_STORE).get(DB_KEY);
      tx.oncomplete = () => resolve(request.result ?? null);
      tx.onerror = tx.onabort = () => reject(new Error('Cannot read IndexedDB backup'));
    });
  } finally { db.close(); }
}
