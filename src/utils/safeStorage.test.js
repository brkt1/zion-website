import SafeStorage from './safeStorage';

describe('SafeStorage', () => {
  let storage;

  beforeEach(() => {
    storage = new SafeStorage();
    // Mock localStorage
    global.localStorage = {
      getItem: jest.fn((key) => global.localStorage[key]),
      setItem: jest.fn((key, value) => {
        global.localStorage[key] = value;
      }),
      removeItem: jest.fn((key) => {
        delete global.localStorage[key];
      }),
      clear: jest.fn(() => {
        global.localStorage = {};
      }),
    };


  });

  test('should set and get an item from localStorage', () => {
    storage.setItem('testKey', 'testValue');
    // Remove unnecessary mockImplementation calls


    expect(storage.getItem('testKey')).toBe('testValue');
  });

  test('should set and get an object from localStorage', () => {
    const testObject = { name: 'Test', value: 42 };
    storage.setItem('testObject', testObject);
    // Remove unnecessary mockImplementation calls


    expect(storage.getItem('testObject')).toEqual(testObject);
  });


  test('should set and get an object from localStorage', () => {
    const testObject = { name: 'Test', value: 42 };
    storage.setItem('testObject', testObject);
    expect(storage.getItem('testObject')).toEqual(testObject);
  });

  test('should fall back to memory storage when localStorage is unavailable', () => {
    // Mock localStorage to simulate unavailability
    global.localStorage = undefined;


    storage.setItem('fallbackKey', 'fallbackValue');
    expect(storage.getItem('fallbackKey')).toBe('fallbackValue');
  });

  test('should remove an item from localStorage', () => {
    storage.setItem('removeKey', 'removeValue');
    storage.removeItem('removeKey');
    expect(storage.getItem('removeKey')).toBeNull();
  });

  test('should clear all items from localStorage', () => {
    storage.setItem('key1', 'value1');
    storage.setItem('key2', 'value2');
    storage.clear();
    expect(storage.getItem('key1')).toBeNull();
    expect(storage.getItem('key2')).toBeNull();
  });
});
