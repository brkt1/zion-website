class SafeStorage {
  constructor() {
    this.memoryStore = new Map();
  }

  getItem(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return this.memoryStore.get(key);
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      this.memoryStore.set(key, value);
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      this.memoryStore.delete(key);
    }
  }

  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      this.memoryStore.clear();
    }
  }
}


export default SafeStorage;
