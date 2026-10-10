/**
 * storage.js
 * 
 * Reusable, browser-specific storage manager for MAHE Marena Portal.
 * 
 * Storage Architecture:
 * - localStorage:
 *     Stores text-based user personal details (name, employee code, email, mobile, gender, dob, address, institution).
 *     Isolated by website origin and browser profile.
 * - IndexedDB (Database: MarenaPortalDB):
 *     Stores binary data for user profile pictures and custom receipt file attachments as native Blobs.
 *     Avoids localStorage quota issues and avoids serializing large base64 strings.
 */

// Storage Keys
export const STORAGE_KEY_USER_DETAILS = 'marena_user_profile_data';

// Default Details (Anonymous dummy data for Uppal, Hyderabad)
export const DEFAULT_USER_DETAILS = {
  employeeCode: '235809142',
  name: 'KARTHIK REDDY M',
  email: 'karthik.reddy.hyd26@gmail.com',
  mobileNumber: '9849123456',
  gender: 'Male',
  dob: '12-05-2005',
  address: 'Plot No. 42, Sri Sai Nagar Colony, Near Uppal Metro Station, Uppal, Hyderabad, Telangana, India, 500039',
  institutionName: 'Manipal Institute of Technology, Bengaluru MAHE Bengaluru Campus, Karnataka,India',
};

// Field metadata configuration
export const USER_FIELD_CONFIG = [
  { key: 'employeeCode', label: 'Employee Code', type: 'text', placeholder: 'e.g. 235809142' },
  { key: 'name', label: 'Name', type: 'text', placeholder: 'Full Name' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'name@example.com' },
  { key: 'mobileNumber', label: 'Mobile Number', type: 'tel', placeholder: '10-digit mobile number' },
  { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
  { key: 'dob', label: 'Date Of Birth', type: 'text', placeholder: 'DD-MM-YYYY' },
  { key: 'address', label: 'Address', type: 'textarea', placeholder: 'Full residential address' },
  { key: 'institutionName', label: 'Institution Name', type: 'textarea', placeholder: 'Institution / Campus' },
];

// Validation Helper
export function validateField(key, value) {
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
    return 'This field cannot be empty.';
  }

  const trimmed = typeof value === 'string' ? value.trim() : String(value);

  if (key === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address (e.g. name@domain.com).';
    }
  }

  if (key === 'mobileNumber') {
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return 'Please enter a valid phone number (at least 7 to 15 digits).';
    }
  }

  if (key === 'dob') {
    const dateRegex = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
    if (!dateRegex.test(trimmed)) {
      return 'Please enter a date in DD-MM-YYYY format (e.g. 12-05-2005).';
    }
  }

  return null; // Valid
}

// ========================================================
// LOCALSTORAGE HELPERS (Personal Details)
// ========================================================

/**
 * Reads user details from localStorage.
 * Handles missing, corrupted, or partial data by falling back to DEFAULT_USER_DETAILS.
 */
export function getUserDetails() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_DETAILS);
    if (!raw) {
      return { ...DEFAULT_USER_DETAILS };
    }
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return { ...DEFAULT_USER_DETAILS };
    }
    return { ...DEFAULT_USER_DETAILS, ...parsed };
  } catch (err) {
    console.warn('Unable to read user details from localStorage, returning defaults:', err);
    return { ...DEFAULT_USER_DETAILS };
  }
}

/**
 * Persists an updated value for a single field in localStorage.
 */
export function saveUserField(fieldKey, value) {
  try {
    const current = getUserDetails();
    current[fieldKey] = typeof value === 'string' ? value.trim() : value;
    localStorage.setItem(STORAGE_KEY_USER_DETAILS, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('marena_user_details_updated', { detail: current }));
    return { success: true, data: current };
  } catch (err) {
    console.error('Failed to save field to localStorage:', err);
    return { success: false, error: 'Browser storage quota exceeded or storage disabled.' };
  }
}

/**
 * Resets user details to the original defaults.
 */
export function resetUserDetails() {
  try {
    localStorage.removeItem(STORAGE_KEY_USER_DETAILS);
    window.dispatchEvent(new CustomEvent('marena_user_details_updated', { detail: DEFAULT_USER_DETAILS }));
    return { success: true, data: { ...DEFAULT_USER_DETAILS } };
  } catch (err) {
    console.error('Failed to reset details in localStorage:', err);
    return { success: false, error: err.message };
  }
}

// ========================================================
// INDEXEDDB HELPERS (Binary Assets: Avatar & Receipt File)
// ========================================================

const DB_NAME = 'MarenaPortalDB';
const DB_VERSION = 1;
const STORE_NAME = 'binary_assets';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }
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
      reject(event.target.error || new Error('Failed to open IndexedDB database.'));
    };
  });
}

/**
 * Profile Picture: Persist Blob into IndexedDB.
 */
export async function saveProfilePictureBlob(blobOrFile, filename = 'custom_avatar.jpg') {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        id: 'profile_picture',
        blob: blobOrFile,
        mimeType: blobOrFile.type || 'image/jpeg',
        filename,
        updatedAt: Date.now(),
      };
      const req = store.put(record);
      req.onsuccess = () => {
        window.dispatchEvent(new Event('marena_avatar_updated'));
        resolve({ success: true });
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error saving profile picture in IndexedDB:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Profile Picture: Read Blob from IndexedDB and return as ObjectURL.
 */
export async function getProfilePictureBlob() {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('profile_picture');
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error reading profile picture from IndexedDB:', err);
    return null;
  }
}

/**
 * Profile Picture: Remove custom image from IndexedDB.
 */
export async function deleteProfilePictureBlob() {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete('profile_picture');
      req.onsuccess = () => {
        window.dispatchEvent(new Event('marena_avatar_updated'));
        resolve({ success: true });
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error deleting profile picture from IndexedDB:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Receipt Attachment: Persist file Blob and metadata into IndexedDB.
 */
export async function saveReceiptAttachmentBlob(file) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        id: 'receipt_attachment',
        blob: file,
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        updatedAt: Date.now(),
      };
      const req = store.put(record);
      req.onsuccess = () => {
        resolve({
          success: true,
          metadata: {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            type: file.type || 'application/octet-stream',
          },
        });
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error saving receipt attachment in IndexedDB:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Receipt Attachment: Retrieve saved attachment record from IndexedDB.
 */
export async function getReceiptAttachmentBlob() {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('receipt_attachment');
      req.onsuccess = () => {
        resolve(req.result || null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error reading receipt attachment from IndexedDB:', err);
    return null;
  }
}

/**
 * Receipt Attachment: Delete custom attachment from IndexedDB.
 */
export async function deleteReceiptAttachmentBlob() {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete('receipt_attachment');
      req.onsuccess = () => resolve({ success: true });
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error deleting receipt attachment from IndexedDB:', err);
    return { success: false, error: err.message };
  }
}
