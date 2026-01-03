/**
 * Avatar Cache - IndexedDB Storage for Cropped Avatar Images
 *
 * Provides a minimal IndexedDB helper for caching cropped avatar blobs.
 * This allows users to crop and save avatar images locally before uploading,
 * improving performance and reducing server load.
 *
 * @module utils/avatarCache
 *
 * Features:
 * - Save cropped avatar blobs with unique IDs
 * - Retrieve cached avatars by ID
 * - Delete individual cached avatars
 * - Clear entire avatar cache
 * - Count cached images
 *
 * Database: "phenom-avatar-cache"
 * Store: "avatars"
 */

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

const DB_NAME = "phenom-avatar-cache";
const STORE = "avatars";
const DB_VERSION = 1;

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

/**
 * Open the IndexedDB database connection
 * Creates the object store if it doesn't exist (on upgrade)
 * @returns {Promise<IDBDatabase>} Database connection
 * @private
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    // Handle database upgrades (create object store)
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

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Save a cropped avatar image blob to IndexedDB
 * @param {Blob} blob - Image blob to save
 * @returns {Promise<string>} Unique ID for the saved image
 * @throws {Error} If no blob is provided
 */
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

/**
 * Retrieve a cached avatar image by ID
 * @param {string} id - Avatar ID to retrieve
 * @returns {Promise<Blob|null>} Image blob or null if not found
 */
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

/**
 * Delete a cached avatar image by ID
 * @param {string} id - Avatar ID to delete
 * @returns {Promise<boolean>} True on success
 */
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

/**
 * Clear the entire avatar cache
 * @returns {Promise<boolean>} True on success
 */
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Count the number of cached avatar images
 * @returns {Promise<number>} Count of cached images
 */
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

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  saveCroppedImage,
  getCroppedImage,
  deleteCroppedImage,
  clearAvatarCache,
  countCachedImages,
};
