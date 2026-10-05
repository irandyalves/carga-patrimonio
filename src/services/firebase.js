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
  writeBatch,
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
      const result = await signInWithPopup(auth, googleProvider);
      if (result && result.user) {
        return result.user;
      }
    } catch (err) {
      console.warn('Login Google via popup não concluído ou bloqueado:', err);
      throw err;
    }
  }

  // Fallback seguro imediato se o Firebase não estiver configurado
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

export const DEFAULT_AUTHORIZED_USERS = [
  {
    id: 'irandyalves_gmail_com',
    email: 'irandyalves@gmail.com',
    name: 'Irandy Alves',
    role: 'admin',
    addedAt: '2026-01-01T00:00:00.000Z',
    addedBy: 'Super Admin'
  },
  {
    id: 'irandyalves_stm_jus_br',
    email: 'irandyalves@stm.jus.br',
    name: 'irandyalves',
    role: 'admin',
    addedAt: '2026-01-01T00:00:00.000Z',
    addedBy: 'Super Admin'
  },
  {
    id: 'albernaz_stm_jus_br',
    email: 'albernaz@stm.jus.br',
    name: 'Alex',
    role: 'operador',
    addedAt: '2026-01-01T00:00:00.000Z',
    addedBy: 'Super Admin'
  }
];

export const getInitialAuthorizedUsers = () => {
  return DEFAULT_AUTHORIZED_USERS.map(u => ({ ...u }));
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

  // Garante que os 3 usuários oficiais sempre existam com seus nomes corretos
  DEFAULT_AUTHORIZED_USERS.forEach(defaultUser => {
    const idx = users.findIndex(u => u && u.email && u.email.toLowerCase() === defaultUser.email.toLowerCase());
    if (idx === -1) {
      users.push({ ...defaultUser });
    } else if (!users[idx].name || users[idx].name === users[idx].email.split('@')[0]) {
      users[idx] = { ...users[idx], name: defaultUser.name };
    }
  });

  // 2. Consulta Firestore em segundo plano com timeout de 1.5s
  const { isConfigured, db } = initFirebase();
  if (isConfigured && db) {
    try {
      const fetchPromise = getDocs(collection(db, 'authorized_users'));
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500));
      const snap = await Promise.race([fetchPromise, timeoutPromise]);
      if (snap && !snap.empty) {
        const cloudUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const mergedMap = new Map();
        
        // Insere defaults primeiro
        DEFAULT_AUTHORIZED_USERS.forEach(u => mergedMap.set(u.email.toLowerCase(), { ...u }));
        // Sobrescreve com dados da nuvem
        cloudUsers.forEach(u => {
          if (u && u.email) {
            const key = u.email.toLowerCase().trim();
            const existing = mergedMap.get(key) || {};
            mergedMap.set(key, { ...existing, ...u });
          }
        });

        users = Array.from(mergedMap.values());
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      } else {
        // Se a coleção estiver vazia no Firestore, faz seed automático dos 3 usuários
        try {
          const batch = writeBatch(db);
          DEFAULT_AUTHORIZED_USERS.forEach(u => {
            const docId = u.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
            batch.set(doc(db, 'authorized_users', docId), u, { merge: true });
          });
          await batch.commit();
        } catch (seedErr) {
          console.warn('Erro ao semear usuários autorizados no Firestore:', seedErr);
        }
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
  if (!email) return { authorized: false, role: null, user: null };
  const clean = email.toLowerCase().trim();

  // 1. Procura na lista informada
  let match = (userList || []).find(u => u && u.email && u.email.toLowerCase().trim() === clean);

  // 2. Se não encontrou, procura nos padrões do sistema
  if (!match) {
    match = DEFAULT_AUTHORIZED_USERS.find(u => u.email.toLowerCase().trim() === clean);
  }

  // 3. Verifica se é Super Admin oficial
  if (DEFAULT_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(clean)) {
    const superAdminUser = match || {
      email: clean,
      name: clean === 'irandyalves@gmail.com' ? 'Irandy Alves' : 'irandyalves',
      role: 'admin'
    };
    return { 
      authorized: true, 
      role: 'admin', 
      isSuperAdmin: true, 
      user: superAdminUser 
    };
  }

  // 4. Usuário cadastrado (ex: Alex)
  if (match) {
    return { 
      authorized: true, 
      role: match.role || 'operador', 
      isSuperAdmin: match.role === 'admin', 
      user: match 
    };
  }

  return { authorized: false, role: null, user: null };
};

// --- DATA HELPERS ---
const DATA_VERSION = 'v9_production_real_sync';
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
  let assets = [];
  let cautelas = [];
  let sectors = DEFAULT_SECTORS;

  try {
    const storedSectors = localStorage.getItem(STORAGE_KEY_SECTORS);
    if (storedSectors) {
      sectors = JSON.parse(storedSectors);
    } else {
      localStorage.setItem(STORAGE_KEY_SECTORS, JSON.stringify(DEFAULT_SECTORS));
    }

    const storedAssets = localStorage.getItem(STORAGE_KEY_ASSETS);
    if (storedAssets) {
      assets = JSON.parse(storedAssets);
    }

    const storedCautelas = localStorage.getItem(STORAGE_KEY_CAUTELAS);
    if (storedCautelas) {
      cautelas = JSON.parse(storedCautelas);
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

// --- REALTIME CLOUD SYNCHRONIZATION ---

export const subscribeToCloudSectors = (callback) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db) return () => {};

  try {
    const unsub = onSnapshot(collection(db, 'sectors'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudSectors = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(cloudSectors);
        saveLocalSectors(cloudSectors);
      } else {
        // Se ainda não houver setores na nuvem, faz seed inicial dos padrões
        saveSectorsBatchToCloud(DEFAULT_SECTORS).catch(console.warn);
      }
    }, (error) => {
      console.warn('Realtime sectors listener notice:', error);
    });
    return unsub;
  } catch (e) {
    console.warn('Erro ao conectar listener de setores:', e);
    return () => {};
  }
};

export const saveSectorToCloud = async (sector) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !sector || !sector.id) return;
  try {
    await setDoc(doc(db, 'sectors', String(sector.id)), sector, { merge: true });
  } catch (e) {
    console.warn('Erro ao salvar setor no Firestore:', e);
  }
};

export const deleteSectorFromCloud = async (sectorId) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !sectorId) return;
  try {
    await deleteDoc(doc(db, 'sectors', String(sectorId)));
  } catch (e) {
    console.warn('Erro ao excluir setor no Firestore:', e);
  }
};

export const saveSectorsBatchToCloud = async (sectorsList) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !sectorsList || sectorsList.length === 0) return;

  try {
    const batch = writeBatch(db);
    sectorsList.forEach(sec => {
      if (sec && sec.id) {
        batch.set(doc(db, 'sectors', String(sec.id)), sec, { merge: true });
      }
    });
    await batch.commit();
  } catch (e) {
    console.warn('Erro ao salvar lote de setores no Firestore:', e);
  }
};

export const subscribeToCloudAssets = (callback) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db) return () => {};

  try {
    const unsub = onSnapshot(collection(db, 'assets'), (snapshot) => {
      const cloudAssets = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(cloudAssets);
      saveLocalAssets(cloudAssets);
    }, (error) => {
      console.warn('Realtime assets listener notice:', error);
    });
    return unsub;
  } catch (e) {
    console.warn('Erro ao conectar listener de bens:', e);
    return () => {};
  }
};

export const subscribeToCloudCautelas = (callback) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db) return () => {};

  try {
    const unsub = onSnapshot(collection(db, 'cautelas'), (snapshot) => {
      const cloudCautelas = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(cloudCautelas);
      saveLocalCautelas(cloudCautelas);
    }, (error) => {
      console.warn('Realtime cautelas listener notice:', error);
    });
    return unsub;
  } catch (e) {
    console.warn('Erro ao conectar listener de cautelas:', e);
    return () => {};
  }
};

export const saveCautelaToCloud = async (cautela) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !cautela || !cautela.id) return;
  try {
    await setDoc(doc(db, 'cautelas', String(cautela.id)), cautela, { merge: true });
  } catch (e) {
    console.warn('Erro ao salvar cautela no Firestore:', e);
  }
};

export const deleteCautelaFromCloud = async (cautelaId) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !cautelaId) return;
  try {
    await deleteDoc(doc(db, 'cautelas', String(cautelaId)));
  } catch (e) {
    console.warn('Erro ao excluir cautela no Firestore:', e);
  }
};

export const subscribeToCloudPedidos = (callback) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db) return () => {};

  try {
    const unsub = onSnapshot(collection(db, 'pedidos_carga'), (snapshot) => {
      const cloudPedidos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(cloudPedidos);
      try {
        localStorage.setItem('carga_patrimonio_pedidos', JSON.stringify(cloudPedidos));
      } catch (e) {}
    }, (error) => {
      console.warn('Realtime pedidos listener notice:', error);
    });
    return unsub;
  } catch (e) {
    console.warn('Erro ao conectar listener de pedidos:', e);
    return () => {};
  }
};

export const savePedidoToCloud = async (pedido) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !pedido || !pedido.id) return;
  try {
    await setDoc(doc(db, 'pedidos_carga', String(pedido.id)), pedido, { merge: true });
  } catch (e) {
    console.warn('Erro ao salvar pedido no Firestore:', e);
  }
};

export const savePedidosBatchToCloud = async (pedidosList) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !pedidosList || pedidosList.length === 0) return;

  const chunkSize = 250;
  for (let i = 0; i < pedidosList.length; i += chunkSize) {
    const chunk = pedidosList.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach(item => {
      if (item && item.id) {
        batch.set(doc(db, 'pedidos_carga', String(item.id)), item, { merge: true });
      }
    });
    try {
      await batch.commit();
    } catch (e) {
      console.warn('Erro ao salvar lote de pedidos no Firestore:', e);
    }
  }
};

export const subscribeToCloudServidores = (callback) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db) return () => {};

  try {
    const unsub = onSnapshot(collection(db, 'servidores'), (snapshot) => {
      const cloudServidores = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(cloudServidores);
      try {
        localStorage.setItem('carga_patrimonio_servidores', JSON.stringify(cloudServidores));
      } catch (e) {}
    }, (error) => {
      console.warn('Realtime servidores listener notice:', error);
    });
    return unsub;
  } catch (e) {
    console.warn('Erro ao conectar listener de servidores:', e);
    return () => {};
  }
};

export const saveServidorToCloud = async (servidor) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !servidor || !servidor.id) return;
  try {
    await setDoc(doc(db, 'servidores', String(servidor.id)), servidor, { merge: true });
  } catch (e) {
    console.warn('Erro ao salvar servidor no Firestore:', e);
  }
};

export const deleteServidorFromCloud = async (servidorId) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !servidorId) return;
  try {
    await deleteDoc(doc(db, 'servidores', String(servidorId)));
  } catch (e) {
    console.warn('Erro ao excluir servidor no Firestore:', e);
  }
};

export const saveServidoresBatchToCloud = async (servidoresList) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !servidoresList || servidoresList.length === 0) return;

  const chunkSize = 250;
  for (let i = 0; i < servidoresList.length; i += chunkSize) {
    const chunk = servidoresList.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach(item => {
      if (item && item.id) {
        batch.set(doc(db, 'servidores', String(item.id)), item, { merge: true });
      }
    });
    try {
      await batch.commit();
    } catch (e) {
      console.warn('Erro ao salvar lote de servidores no Firestore:', e);
    }
  }
};

export const deletePedidoFromCloud = async (pedidoId) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !pedidoId) return;
  try {
    await deleteDoc(doc(db, 'pedidos_carga', String(pedidoId)));
  } catch (e) {
    console.warn('Erro ao excluir pedido no Firestore:', e);
  }
};

export const saveAssetToCloud = async (asset) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !asset || !asset.id) return;
  try {
    await setDoc(doc(db, 'assets', String(asset.id)), asset, { merge: true });
  } catch (e) {
    console.warn('Erro ao salvar bem no Firestore:', e);
  }
};

export const deleteAssetFromCloud = async (assetId) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !assetId) return;
  try {
    await deleteDoc(doc(db, 'assets', String(assetId)));
  } catch (e) {
    console.warn('Erro ao excluir bem no Firestore:', e);
  }
};

export const saveAssetsBatchToCloud = async (assetsList, onProgress = null) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !assetsList || assetsList.length === 0) return;

  const chunkSize = 250;
  for (let i = 0; i < assetsList.length; i += chunkSize) {
    const chunk = assetsList.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach(item => {
      if (item && item.id) {
        batch.set(doc(db, 'assets', String(item.id)), item, { merge: true });
      }
    });
    await batch.commit();
    if (onProgress) {
      onProgress(Math.min(i + chunkSize, assetsList.length), assetsList.length);
    }
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

// --- CONFIGURAÇÕES VISUAIS NA NUVEM (FIRESTORE) ---
const STORAGE_KEY_DISPLAY_SETTINGS = 'carga_patrimonio_display_settings';

export const subscribeToCloudDisplaySettings = (callback) => {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db) return () => {};

  try {
    const unsub = onSnapshot(doc(db, 'app_config', 'display_settings'), (snapshot) => {
      if (snapshot.exists()) {
        const cloudSettings = snapshot.data();
        callback(cloudSettings);
        try {
          localStorage.setItem(STORAGE_KEY_DISPLAY_SETTINGS, JSON.stringify(cloudSettings));
        } catch (e) {}
      }
    }, (error) => {
      console.warn('Realtime display settings listener notice:', error);
    });
    return unsub;
  } catch (e) {
    console.warn('Erro ao conectar listener de configurações visuais:', e);
    return () => {};
  }
};

export const saveDisplaySettingsToCloud = async (settings) => {
  const { isConfigured, db } = initFirebase();
  if (!settings) return;

  // Atualiza cache local imediatamente
  try {
    localStorage.setItem(STORAGE_KEY_DISPLAY_SETTINGS, JSON.stringify(settings));
  } catch (e) {}

  // Salva no Firestore
  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'app_config', 'display_settings'), {
        ...settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Erro ao salvar configurações visuais no Firestore:', e);
    }
  }
};

export const loadDisplaySettingsFromCloud = async () => {
  const { isConfigured, db } = initFirebase();
  if (isConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'app_config', 'display_settings'));
      if (snap.exists()) {
        const data = snap.data();
        localStorage.setItem(STORAGE_KEY_DISPLAY_SETTINGS, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Modo offline/local para configurações visuais:', e);
    }
  }
  try {
    const local = localStorage.getItem(STORAGE_KEY_DISPLAY_SETTINGS);
    if (local) return JSON.parse(local);
  } catch (e) {}
  return null;
};

