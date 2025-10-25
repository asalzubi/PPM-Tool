import type { AppData } from './dataService';
import { mockProjects, mockUsers, mockAppSettings, mockTimelineEvents, mockStakeholders, mockWeeklyTasks } from '../data/mockData';

const DB_NAME = 'PPM_DB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error("IndexedDB error:", request.error);
                reject(request.error);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                
                // Create object stores and seed them with initial mock data
                if (!db.objectStoreNames.contains('projects')) {
                    const store = db.createObjectStore('projects', { keyPath: 'id' });
                    mockProjects.forEach(item => store.add(item));
                }
                if (!db.objectStoreNames.contains('users')) {
                    const store = db.createObjectStore('users', { keyPath: 'id' });
                    mockUsers.forEach(item => store.add(item));
                }
                if (!db.objectStoreNames.contains('settings')) {
                    const store = db.createObjectStore('settings');
                    store.add(mockAppSettings, 'current'); // Use a fixed key
                }
                if (!db.objectStoreNames.contains('timelineEvents')) {
                    const store = db.createObjectStore('timelineEvents', { keyPath: 'id' });
                    mockTimelineEvents.forEach(item => store.add(item));
                }
                if (!db.objectStoreNames.contains('stakeholders')) {
                    const store = db.createObjectStore('stakeholders', { keyPath: 'id' });
                    mockStakeholders.forEach(item => store.add(item));
                }
                 if (!db.objectStoreNames.contains('weeklyTasks')) {
                    const store = db.createObjectStore('weeklyTasks', { keyPath: 'id' });
                    mockWeeklyTasks.forEach(item => store.add(item));
                }
                if (!db.objectStoreNames.contains('logs')) {
                    db.createObjectStore('logs', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                resolve(db);
            };
        });
    }
    return dbPromise;
};

// Generic helper for database transactions
const performTransaction = <T>(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest): Promise<T> => {
    return getDb().then(db => {
        return new Promise<T>((resolve, reject) => {
            const transaction = db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            const request = action(store);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    });
};

export const getAll = <T>(storeName: string): Promise<T[]> => {
    return performTransaction<T[]>(storeName, 'readonly', store => store.getAll());
};

export const get = <T>(storeName: string, key: IDBValidKey): Promise<T> => {
    return performTransaction<T>(storeName, 'readonly', store => store.get(key));
};

export const put = <T>(storeName: string, item: any, key?: IDBValidKey): Promise<IDBValidKey> => {
    return performTransaction<IDBValidKey>(storeName, 'readwrite', store => store.put(item, key));
};

export const remove = (storeName: string, key: IDBValidKey): Promise<void> => {
    return performTransaction<void>(storeName, 'readwrite', store => store.delete(key));
};

export const capStore = async (storeName: string, maxItems: number): Promise<void> => {
    const db = await getDb();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
        const countRequest = store.count();
        countRequest.onsuccess = () => {
            const count = countRequest.result;
            if (count > maxItems) {
                const cursorRequest = store.openCursor(); // Oldest items appear first
                let toDelete = count - maxItems;
                cursorRequest.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                    if (cursor && toDelete > 0) {
                        cursor.delete();
                        toDelete--;
                        cursor.continue();
                    }
                };
            }
        };
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const deleteDatabase = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Close any existing connection before deleting
        if (dbPromise) {
            dbPromise.then(db => db.close());
            dbPromise = null;
        }
        const deleteRequest = indexedDB.deleteDatabase(DB_NAME);

        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
        deleteRequest.onblocked = () => {
            console.warn("Database deletion blocked. Please close other tabs with this app open.");
            // Resolve anyway, assuming user will refresh.
            resolve();
        };
    });
};

export const importAllData = async (data: AppData): Promise<void> => {
    const db = await getDb();
    const storeNames = Array.from(db.objectStoreNames);
    const transaction = db.transaction(storeNames, 'readwrite');
    
    return new Promise((resolve, reject) => {
        storeNames.forEach(storeName => {
            const store = transaction.objectStore(storeName);
            store.clear(); // Clear existing data
            const items = (data as any)[storeName];

            if (Array.isArray(items)) {
                items.forEach(item => store.add(item));
            } else if (storeName === 'settings' && items) {
                store.add(items, 'current'); // Special handling for settings object
            }
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};
