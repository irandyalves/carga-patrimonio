import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { INITIAL_ASSETS, INITIAL_CAUTELAS } from '../constants/sampleData';

const STORAGE_KEY_CONFIG = 'carga_patrimonio_firebase_config';
const STORAGE_KEY_ASSETS = 'carga_patrimonio_local_assets';
const STORAGE_KEY_CAUTELAS = 'carga_patrimonio_local_cautelas';

// Get stored Firebase config or null
export const getStoredFirebaseConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading Firebase config from localStorage:', e);
  }
  return null;
};

// Save Firebase config
export const saveFirebaseConfig = (config) => {
  if (config) {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } else {
    localStorage.removeItem(STORAGE_KEY_CONFIG);
  }
};

let app = null;
let db = null;
let storage = null;

// Initialize Firebase if config exists
export const initFirebase = (customConfig = null) => {
  const config = customConfig || getStoredFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return { isConfigured: false, db: null, storage: null };
  }

  try {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
    db = getFirestore(app);
    storage = getStorage(app);
    return { isConfigured: true, db, storage, app };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return { isConfigured: false, error, db: null, storage: null };
  }
};

// Local storage fallback helpers
export const loadLocalData = () => {
  let assets = INITIAL_ASSETS;
  let cautelas = INITIAL_CAUTELAS;

  try {
    const storedAssets = localStorage.getItem(STORAGE_KEY_ASSETS);
    if (storedAssets) {
      assets = JSON.parse(storedAssets);
    } else {
      localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(INITIAL_ASSETS));
    }

    const storedCautelas = localStorage.getItem(STORAGE_KEY_CAUTELAS);
    if (storedCautelas) {
      cautelas = JSON.parse(storedCautelas);
    } else {
      localStorage.setItem(STORAGE_KEY_CAUTELAS, JSON.stringify(INITIAL_CAUTELAS));
    }
  } catch (e) {
    console.error('Error loading local data:', e);
  }

  return { assets, cautelas };
};

export const saveLocalAssets = (assets) => {
  try {
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
  } catch (e) {
    console.error('Error saving local assets:', e);
  }
};

export const saveLocalCautelas = (cautelas) => {
  try {
    localStorage.setItem(STORAGE_KEY_CAUTELAS, JSON.stringify(cautelas));
  } catch (e) {
    console.error('Error saving local cautelas:', e);
  }
};

// Storage file upload helper (Firebase Storage or local Base64 fallback)
export const uploadFileAttachment = async (file, path = 'documentos_baixa') => {
  const { isConfigured } = initFirebase();
  if (isConfigured && storage) {
    const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return {
      nome: file.name,
      url: downloadUrl,
      tipo: file.type,
      tamanho: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    };
  }

  // Fallback: Read as Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        nome: file.name,
        url: reader.result,
        tipo: file.type,
        tamanho: (file.size / 1024 > 1024 ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : (file.size / 1024).toFixed(1) + ' KB')
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
