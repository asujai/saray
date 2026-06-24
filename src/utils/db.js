const DB_NAME = 'Saray3DNotesDB';
const DB_VERSION = 1;
const STORE_NAME = 'notes';

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export function getAllNotes() {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result || []);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  });
}

export function saveAllNotesToDB(notes) {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        if (notes.length === 0) {
          resolve();
          return;
        }
        
        let count = 0;
        let hasError = false;
        
        notes.forEach((note) => {
          const request = store.put(note);
          request.onsuccess = () => {
            count++;
            if (count === notes.length && !hasError) {
              resolve();
            }
          };
          request.onerror = (event) => {
            if (!hasError) {
              hasError = true;
              reject(event.target.error);
            }
          };
        });
      };
      
      clearRequest.onerror = (event) => {
        reject(event.target.error);
      };
    });
  });
}
