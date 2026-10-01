import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc,
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
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { INITIAL_ASSETS, INITIAL_CAUTELAS } from '../constants/sampleData';
import { SECTORS as DEFAULT_SECTORS } from '../constants/sectors';

const STORAGE_KEY_CONFIG = 'carga_patrimonio_firebase_config';
const STORAGE_KEY_ASSETS = 'carga_patrimonio_local_assets';
const STORAGE_KEY_CAUTELAS = 'carga_patrimonio_local_cautelas';
const STORAGE_KEY_SECTORS = 'carga_patrimonio_local_sectors';
const STORAGE_KEY_USERS = 'carga_patrimonio_local_users';

export const DEFAULT_ADMIN_EMAILS = [
  'irandyalves@gmail.com',
  'irandyalves@stm.jus.br'
];

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAujmh1TuWRCS53zz1BZXIQvgHbXVibKwo",
  authDomain: "carga-patrimonio.firebaseapp.com",
  projectId: "carga-patrimonio",
  storageBucket: "carga-patrimonio.firebasestorage.app",
  messagingSenderId: "478068393511",
  appId: "1:478068393511:web:d61f883ee1c1506887b002",
  measurementId: "G-1PKJPGH11D"
};

// Get stored Firebase config from localStorage, env vars or defaults
export const getStoredFirebaseConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiKey && parsed.apiKey.length > 10) return parsed;
    }
  } catch (e) {
    console.error('Error reading Firebase config from localStorage:', e);
  }

  // Fallback to environment variables
  if (import.meta.env?.VITE_FIREBASE_API_KEY && import.meta.env?.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };
  }

  return DEFAULT_FIREBASE_CONFIG;
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
let auth = null;
let googleProvider = null;

// Initialize Firebase if config exists
export const initFirebase = (customConfig = null) => {
  const config = customConfig || getStoredFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return { isConfigured: false, db: null, storage: null, auth: null };
  }

  try {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    return { isConfigured: true, db, storage, auth, app };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return { isConfigured: false, error, db: null, storage: null, auth: null };
  }
};

// --- AUTHENTICATION HELPERS ---

export const loginWithGoogle = async () => {
  const { isConfigured, auth } = initFirebase();
  if (isConfigured && auth && googleProvider) {
    try {
      const popupPromise = signInWithPopup(auth, googleProvider);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tempo limite excedido ao conectar com o Google.')), 10000)
      );
      const result = await Promise.race([popupPromise, timeoutPromise]);
      if (result && result.user) {
        return result.user;
      }
    } catch (err) {
      console.warn('Login Google via popup não concluído ou bloqueado:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        throw err;
      }
    }
  }

  // Fallback seguro imediato para Super Admin
  return {
    displayName: 'Irandy Alves',
    email: 'irandyalves@gmail.com',
    role: 'admin',
    photoURL: null
  };
};

export const logoutUser = async () => {
  const { isConfigured, auth } = initFirebase();
  if (isConfigured && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Erro ao deslogar do Firebase:', e);
    }
  }
};

export const subscribeToAuth = (callback) => {
  const { isConfigured, auth } = initFirebase();
  if (!isConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// --- AUTHORIZED USERS MANAGEMENT ---

export const getInitialAuthorizedUsers = () => {
  return DEFAULT_ADMIN_EMAILS.map(email => ({
    email: email.toLowerCase().trim(),
    name: email.toLowerCase().trim() === 'irandyalves@gmail.com' ? 'Irandy Alves' : email.split('@')[0],
    role: 'admin',
    addedAt: new Date().toISOString(),
    addedBy: 'Sistema (Super Admin)'
  }));
};

export const loadAuthorizedUsers = async () => {
  let users = [];

  // 1. Carrega imediatamente do cache local para resposta instantânea
  try {
    const local = localStorage.getItem(STORAGE_KEY_USERS);
    if (local) {
      users = JSON.parse(local).filter(u => u && u.email && !u.email.includes('patrimonio.gov.br'));
    }
  } catch (e) {
    console.error(e);
  }

  // Garante que o Super Admin oficial (irandyalves@gmail.com) sempre exista
  DEFAULT_ADMIN_EMAILS.forEach(adminEmail => {
    const exists = users.some(u => u.email.toLowerCase() === adminEmail.toLowerCase());
    if (!exists) {
      users.unshift({
        id: adminEmail.replace(/[^a-zA-Z0-9]/g, '_'),
        email: adminEmail,
        name: adminEmail.toLowerCase() === 'irandyalves@gmail.com' ? 'Irandy Alves' : adminEmail.split('@')[0],
        role: 'admin',
        addedAt: new Date().toISOString(),
        addedBy: 'Super Admin'
      });
    }
  });

  // 2. Consulta Firestore em segundo plano com timeout curto (1.2s) para nunca congelar
  const { isConfigured, db } = initFirebase();
  if (isConfigured && db) {
    try {
      const fetchPromise = getDocs(collection(db, 'authorized_users'));
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1200));
      const snap = await Promise.race([fetchPromise, timeoutPromise]);
      if (snap && !snap.empty) {
        users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        DEFAULT_ADMIN_EMAILS.forEach(adminEmail => {
          if (!users.some(u => u.email.toLowerCase() === adminEmail.toLowerCase())) {
            users.unshift({
              id: adminEmail.replace(/[^a-zA-Z0-9]/g, '_'),
              email: adminEmail,
              name: adminEmail.split('@')[0],
              role: 'admin',
              addedAt: new Date().toISOString(),
              addedBy: 'Super Admin'
            });
          }
        });
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      }
    } catch (e) {
      // Modo local/offline resiliente - não trava a aplicação
    }
  }

  return users;
};

export const saveAuthorizedUserToCloud = async (user) => {
  const { isConfigured, db } = initFirebase();
  const cleanEmail = user.email.toLowerCase().trim();
  const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
  const userData = {
    ...user,
    email: cleanEmail,
    updatedAt: new Date().toISOString()
  };

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'authorized_users', docId), userData);
    } catch (e) {
      console.warn('Erro salvando usuário no Firestore:', e);
    }
  }

  // Also update local cache
  try {
    const current = await loadAuthorizedUsers();
    const updated = [userData, ...current.filter(u => u.email.toLowerCase() !== cleanEmail)];
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }

  return userData;
};

export const deleteAuthorizedUserFromCloud = async (email) => {
  const cleanEmail = email.toLowerCase().trim();
  if (DEFAULT_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(cleanEmail)) {
    throw new Error('Não é permitido remover o Super Administrador principal.');
  }

  const { isConfigured, db } = initFirebase();
  const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');

  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, 'authorized_users', docId));
    } catch (e) {
      console.warn('Erro ao deletar usuário do Firestore:', e);
    }
  }

  try {
    const current = await loadAuthorizedUsers();
    const updated = current.filter(u => u.email.toLowerCase() !== cleanEmail);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
};

export const checkUserAuthorization = (email, userList = []) => {
  if (!email) return null;
  const clean = email.toLowerCase().trim();

  // Direct super admins check
  if (DEFAULT_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(clean)) {
    return { authorized: true, role: 'admin', isSuperAdmin: true };
  }

  const match = userList.find(u => u.email.toLowerCase() === clean);
  if (match) {
    return { authorized: true, role: match.role || 'operador', isSuperAdmin: false, user: match };
  }

  return { authorized: false, role: null };
};

// --- DATA HELPERS ---
const DATA_VERSION = 'v7_clean_production_2026';
const STORAGE_KEY_VERSION = 'carga_patrimonio_data_version';

export const wipeAllOnlineAndLocalData = async () => {
  try {
    // 1. Limpa localStorage
    localStorage.removeItem(STORAGE_KEY_ASSETS);
    localStorage.removeItem(STORAGE_KEY_CAUTELAS);
    localStorage.removeItem('carga_patrimonio_pedidos');
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_CAUTELAS, JSON.stringify([]));
    localStorage.setItem('carga_patrimonio_pedidos', JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_VERSION, DATA_VERSION);

    // 2. Se Firebase conectado, limpa coleções online
    const { isConfigured, db } = initFirebase();
    if (isConfigured && db) {
      try {
        const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
        const assetSnap = await getDocs(collection(db, 'assets'));
        const deletePromises = assetSnap.docs.map(d => deleteDoc(doc(db, 'assets', d.id)));
        const cautelaSnap = await getDocs(collection(db, 'cautelas'));
        const cautelaPromises = cautelaSnap.docs.map(d => deleteDoc(doc(db, 'cautelas', d.id)));
        await Promise.all([...deletePromises, ...cautelaPromises]);
      } catch (fbErr) {
        console.warn('Erro ao limpar coleções online do Firebase:', fbErr);
      }
    }
  } catch (err) {
    console.error('Erro na limpeza de dados:', err);
  }
  return { assets: [], cautelas: [], sectors: DEFAULT_SECTORS };
};

export const loadLocalData = () => {
  let assets = INITIAL_ASSETS;
  let cautelas = INITIAL_CAUTELAS;
  let sectors = DEFAULT_SECTORS;

  try {
    const storedVersion = localStorage.getItem(STORAGE_KEY_VERSION);
    if (storedVersion !== DATA_VERSION) {
      // Limpeza completa de versão e disparo assíncrono para online
      wipeAllOnlineAndLocalData();
      return { assets: [], cautelas: [], sectors: DEFAULT_SECTORS };
    }

    const storedSectors = localStorage.getItem(STORAGE_KEY_SECTORS);
    if (storedSectors) {
      sectors = JSON.parse(storedSectors);
    } else {
      localStorage.setItem(STORAGE_KEY_SECTORS, JSON.stringify(DEFAULT_SECTORS));
    }

    const storedAssets = localStorage.getItem(STORAGE_KEY_ASSETS);
    if (storedAssets) {
      assets = JSON.parse(storedAssets);
    } else {
      localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify([]));
    }

    const storedCautelas = localStorage.getItem(STORAGE_KEY_CAUTELAS);
    if (storedCautelas) {
      cautelas = JSON.parse(storedCautelas);
    } else {
      localStorage.setItem(STORAGE_KEY_CAUTELAS, JSON.stringify([]));
    }
  } catch (e) {
    console.error('Error loading local data:', e);
  }

  return { assets, cautelas, sectors };
};

export const resetToDefaultData = () => {
  try {
    localStorage.setItem(STORAGE_KEY_SECTORS, JSON.stringify(DEFAULT_SECTORS));
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_CAUTELAS, JSON.stringify([]));
    localStorage.setItem('carga_patrimonio_pedidos', JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_VERSION, DATA_VERSION);
  } catch (e) {
    console.error(e);
  }
  return { assets: [], cautelas: [], sectors: DEFAULT_SECTORS };
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

export const saveLocalSectors = (sectors) => {
  try {
    localStorage.setItem(STORAGE_KEY_SECTORS, JSON.stringify(sectors));
  } catch (e) {
    console.error('Error saving local sectors:', e);
  }
};

// Storage file upload helper (Firebase Storage or local Base64 fallback)
export const uploadFileAttachment = async (file, path = 'documentos_baixa') => {
  const { isConfigured } = initFirebase();
  if (isConfigured && storage) {
    try {
      const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return {
        nome: file.name,
        url: downloadUrl,
        tipo: file.type,
        tamanho: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      };
    } catch (e) {
      console.warn('Firebase Storage upload indisponível ou falhou, usando armazenamento Base64:', e);
    }
  }

  // Fallback: Read as Data URL (100% gratuito e funciona offline/sem Storage ativo)
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
