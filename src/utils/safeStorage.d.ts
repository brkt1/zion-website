// safeStorage.d.ts
declare class SafeStorage {
  constructor();
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  engine: Storage; // Added engine property
  get<T>(key: string): T | null; // Added get method
  set<T>(key: string, value: T): void; // Added set method
}


export default SafeStorage;
