import { GameRepository, createInitialGameState } from "./GameRepository";
import { sanitizeAndMigrateState } from "./migrations";
import { GameState } from "../game/types";

const STORAGE_KEY = "quan_lo_game_state_v1";
const BACKUP_STORAGE_KEY = "quan_lo_game_state_backup_v1";
const DB_NAME = "quan_lo_db";
const DB_STORE = "game_state";
const DB_KEY = "current";

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
      return state;
    } catch (err) {
      console.error("Failed to load game state:", err);
      return null;
    }
  }

  public async save(state: GameState): Promise<void> {
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
    const state = await this.load();
    if (!state) {
      const initial = createInitialGameState();
      return JSON.stringify(initial, null, 2);
    }
    return JSON.stringify(state, null, 2);
  }

  public async import(rawJson: string): Promise<GameState> {
    const raw = JSON.parse(rawJson);
    const state = sanitizeAndMigrateState(raw);
    await this.save(state);
    return state;
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
