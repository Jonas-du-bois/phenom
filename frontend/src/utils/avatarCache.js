// Minimal IndexedDB helper for caching cropped avatar blobs
const DB_NAME = "phenom-avatar-cache";
const STORE = "avatars";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCroppedImage(blob) {
  if (!blob) throw new Error("No blob to save");
  const id = `avatar-${Date.now()}`;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const entry = { id, blob, createdAt: Date.now() };
    const req = store.put(entry);
    req.onsuccess = () => {
      resolve(id);
      db.close();
    };
    req.onerror = () => {
      reject(req.error);
      db.close();
    };
  });
}

export async function getCroppedImage(id) {
  if (!id) return null;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(id);
    req.onsuccess = () => {
      const res = req.result;
      resolve(res?.blob || null);
      db.close();
    };
    req.onerror = () => {
      reject(req.error);
      db.close();
    };
  });
}

export async function deleteCroppedImage(id) {
  if (!id) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.delete(id);
    req.onsuccess = () => {
      resolve(true);
      db.close();
    };
    req.onerror = () => {
      reject(req.error);
      db.close();
    };
  });
}

export async function clearAvatarCache() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.clear();
    req.onsuccess = () => {
      resolve(true);
      db.close();
    };
    req.onerror = () => {
      reject(req.error);
      db.close();
    };
  });
}

export async function countCachedImages() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.count();
    req.onsuccess = () => {
      resolve(Number(req.result));
      db.close();
    };
    req.onerror = () => {
      reject(req.error);
      db.close();
    };
  });
}

export default {
  saveCroppedImage,
  getCroppedImage,
  deleteCroppedImage,
  clearAvatarCache,
  countCachedImages,
};
