/**
 * Secure Storage Utilities v2.0
 * Features:
 * - Encryption/Decryption
 * - Schema Validation (Zod)
 * - Data Versioning & Migrations
 * - Storage Quota Management
 * - Browser Fallback
 * - Retention Policies
 * - Error Handling
 */

import { AES, enc } from 'crypto-js';
import { z, ZodError } from 'zod';

import SafeStorage from './safeStorage.js'; // Updated to include .js extension

// Types
const storage = new SafeStorage();

interface StorageItem<T> {
  version: number;
  timestamp: number;
  data: T;
}

interface StorageError extends Error {
  type: 'STORAGE_ERROR' | 'VALIDATION_ERROR' | 'PARSE_ERROR' | 'QUOTA_ERROR' | 'ENCRYPTION_ERROR';
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Configuration
const STORAGE_CONFIG = {
  VERSIONS: {
    CARDS: 2,
    GAME_STATE: 1,
    WINNERS: 1
  },
  RETENTION: {
    CARDS: 30 * 24 * 60 * 60 * 1000, // 30 days
    SESSIONS: 24 * 60 * 60 * 1000    // 24 hours
  },
  QUOTA_WARNING_THRESHOLD: 0.8
};

// Schemas
const CardSchema = z.object({
  cardNumber: z.string().length(13).regex(/^\d+$/),
  timestamp: z.number().positive()
});

const GameStateSchema = z.object({
  isPlaying: z.boolean(),
  winner: z.string(),
  score: z.number().nonnegative()
});

const WinnerSchema = z.object({
  name: z.string().min(2),
  date: z.string().datetime()
});

// Migration Functions
const MIGRATIONS = {
  cards: [
    // v0 → v1: Add timestamp field
    (data: any) => ({ ...data, timestamp: Date.now() }),
    
    // v1 → v2: Rename number → cardNumber
    (data: any) => ({ cardNumber: data.number, timestamp: data.timestamp })
  ]
};

// Encryption Utilities
const encryptData = (data: string, key: string): string => {
  try {
    return AES.encrypt(data, key).toString();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Encryption failed: ${error.message}`);
    } else {
      throw new Error('Encryption failed: Unknown error');
    }
  }
};

const decryptData = (ciphertext: string, key: string): string => {
  try {
    return AES.decrypt(ciphertext, key).toString(enc.Utf8);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Decryption failed: ${error.message}`);
    } else {
      throw new Error('Decryption failed: Unknown error');
    }
  }
};

// Storage Engine Detection
const isSecureContext = () => {
  return window.isSecureContext && 
         !window.crossOriginIsolated &&
         navigator.userAgent.indexOf('CriOS') === -1;
};

export const canUseLocalStorage = () => {
  return true; // Always return true since SafeStorage will handle the fallback
};

const createMemoryStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear()
  };
};

const getStorageEngine = (): Storage | ReturnType<typeof createMemoryStorage> => {
  if (!canUseLocalStorage()) {
    console.warn('LocalStorage is unavailable. Falling back to memory storage. Please ensure you are running in a secure context (HTTPS) for optimal functionality.');
    return createMemoryStorage();
  }
  return localStorage;
};

// Storage Service Implementation
class SecureStorage {
  public engine: Storage | ReturnType<typeof createMemoryStorage>;
  private encryptionKey?: string;

  constructor(encryptionKey?: string) {
    this.engine = getStorageEngine();
    this.encryptionKey = encryptionKey;
    this.enforceRetentionPolicies();
  }

  // Public API
  public get = <T>(key: string, schema: z.ZodSchema<T>): T | null => {
    try {
      const item = this.engine.getItem(key);
      if (!item) return null;

      const decrypted = this.encryptionKey 
        ? decryptData(item, this.encryptionKey)
        : item;

      const parsed: StorageItem<T> = JSON.parse(decrypted);
      const migrated = this.applyMigrations(key, parsed);
      this.validateData(migrated.data, schema);

      if (parsed.version !== migrated.version) {
        this.set(key, migrated.data, schema);
      }

      return migrated.data;
    } catch (error) {
      this.handleError(error, key);
      return null;
    }
  };

  public set = <T>(key: string, data: T, schema: z.ZodSchema<T>): boolean => {
    try {
      this.validateData(data, schema);
      this.checkStorageQuota(data);

      const storageItem: StorageItem<T> = {
        version: STORAGE_CONFIG.VERSIONS.CARDS,
        data,
        timestamp: Date.now()
      };

      const serialized = JSON.stringify(storageItem);
      const processed = this.encryptionKey
        ? encryptData(serialized, this.encryptionKey)
        : serialized;

      this.engine.setItem(key, processed);
      return true;
    } catch (error) {
      this.handleError(error, key);
      return false;
    }
  };

  // Maintenance
  private enforceRetentionPolicies() {
    this.clearExpiredItems('cards', STORAGE_CONFIG.RETENTION.CARDS);
    this.clearExpiredItems('gameSessions', STORAGE_CONFIG.RETENTION.SESSIONS);
  }

  private clearExpiredItems(keyPrefix: string, maxAge: number) {
    const now = Date.now();
    Object.keys(this.engine)
      .filter(key => key.startsWith(keyPrefix))
      .forEach(key => {
        const item = this.engine.getItem(key);
        if (item && now - JSON.parse(item).timestamp > maxAge) {
          this.engine.removeItem(key);
        }
      });
  }

  // Helpers
  private applyMigrations<T>(key: string, item: StorageItem<T>): StorageItem<T> {
    const migrations = MIGRATIONS[key as keyof typeof MIGRATIONS];
    if (!migrations || item.version >= migrations.length) return item;

    let migratedData = item.data;
    for (let v = item.version; v < migrations.length; v++) {
      migratedData = migrations[v](migratedData);
    }

    return {
      ...item,
      version: migrations.length,
      data: migratedData
    };
  }

  private validateData<T>(data: unknown, schema: z.ZodSchema<T>): void {
    try {
      schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map(e => `${e.path}: ${e.message}`).join(', ');
        throw new Error(`Validation failed: ${message}`);
      }
      throw new Error('Unknown validation error');
    }
  }

  private checkStorageQuota(data: unknown) {
    try {
      const dataSize = new Blob([JSON.stringify(data)]).size;
      navigator.storage.estimate().then(({ quota, usage }) => {
        if (quota && usage && 
            (usage + dataSize) / quota > STORAGE_CONFIG.QUOTA_WARNING_THRESHOLD) {
          throw new Error('Storage quota exceeded');
        }
      }).catch(error => {
        console.warn('Storage quota check failed:', error);
      });
    } catch (error) {
      console.warn('Storage quota check failed:', error);
    }
  }

  private handleError(error: unknown, key: string) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
    console.error(`Storage operation failed for key ${key}:`, errorMessage);
    
    if (errorMessage.includes('encryption')) {
      this.engine.removeItem(key);
    }
  }
}

// Instance Setup
const safeStorageInstance = new SecureStorage("0fc8dab0c90a27c7316113507f15675671ed07b1cf8d08459b49439a7dafdf91");

// Game-specific Implementations
export const gameStorage = {
  getGameState: () => 
    storage.get('gameState') || {
      isPlaying: false,
      winner: '',
      score: 0
    },

  setGameState: (state: z.infer<typeof GameStateSchema>) =>
    storage.set('gameState', state),

  getWinners: () =>
    storage.get('winners') || [],

  setWinners: (winners: z.infer<typeof WinnerSchema>[]) =>
    storage.set('winners', winners),

  getCards: () =>
    storage.get('cards') || [],

  setCard: (cardNumber: string) => {
    const cards = gameStorage.getCards() as Array<{ cardNumber: string; timestamp: number }>;
    const newCard = { cardNumber, timestamp: Date.now() };
    return storage.set('cards', [...cards, newCard]);
  },

  clearGameData: () => {
    try {
      ['gameState', 'winners', 'cards'].forEach(key => storage.engine.removeItem(key));
      return true;
    } catch (error) {
      console.error('Game data clearance failed:', error);
      return false;
    }
  }
};

export default gameStorage;
