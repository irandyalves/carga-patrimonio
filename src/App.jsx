import React, { useState, useEffect, useMemo, useRef, useDeferredValue, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Navbar 
} from './components/Navbar';
import { 
  SectorSidebar 
} from './components/SectorSidebar';
import { 
  ConferenceStats 
} from './components/ConferenceStats';
import { 
  AssetTableRowCard 
} from './components/AssetTableRowCard';
import { 
  QrScannerModal 
} from './components/QrScannerModal';
import { 
  AssetModal 
} from './components/AssetModal';
import { 
  CautelaModal 
} from './components/CautelaModal';
import { 
  CautelaListModal 
} from './components/CautelaListModal';
import { 
  BaixaModal 
} from './components/BaixaModal';
import { 
  DtinModal 
} from './components/DtinModal';
import { 
  LabelPrinterModal 
} from './components/LabelPrinterModal';
import { 
  SmartImportModal 
} from './components/SmartImportModal';
import { 
  FirebaseSettingsModal 
} from './components/FirebaseSettingsModal';
import { 
  SectorsManagementModal 
} from './components/SectorsManagementModal';
import { 
  TransferModal 
} from './components/TransferModal';
import { 
  BackupModal 
} from './components/BackupModal';
import { 
  UserManagementModal 
} from './components/UserManagementModal';
import { 
  LoginScreen 
} from './components/LoginScreen';
import { 
  SolicitacaoCargaModal 
} from './components/SolicitacaoCargaModal';
import { 
  PedidosCargaModal 
} from './components/PedidosCargaModal';
import { 
  PendenciasDtinModal 
} from './components/PendenciasDtinModal';
import { 
  ServidoresModal 
} from './components/ServidoresModal';
import {
  DisplaySettingsModal,
  DEFAULT_DISPLAY_SETTINGS
} from './components/DisplaySettingsModal';
import { 
  DeleteAssetModal 
} from './components/DeleteAssetModal';
import { 
  ExportReportModal 
} from './components/ExportReportModal';
import { 
  BulkActionBar 
} from './components/BulkActionBar';

import { 
  analyzeDuplicateAssets, 
  isTiAsset 
} from './utils/duplicateUtils';

import { 
  loadLocalData, 
  resetToDefaultData,
  saveLocalAssets, 
  saveLocalCautelas, 
  saveLocalSectors,
  initFirebase,
  loginWithGoogle,
  subscribeToAuth,
  logoutUser,
  loadAuthorizedUsers,
  saveAuthorizedUserToCloud,
  deleteAuthorizedUserFromCloud,
  checkUserAuthorization,
  subscribeToCloudSectors,
  saveSectorToCloud,
  deleteSectorFromCloud,
  subscribeToCloudAssets,
  subscribeToCloudCautelas,
  saveCautelaToCloud,
  deleteCautelaFromCloud,
  subscribeToCloudPedidos,
  savePedidoToCloud,
  savePedidosBatchToCloud,
  deletePedidoFromCloud,
  deletePedidosBatchFromCloud,
  subscribeToCloudServidores,
  saveServidorToCloud,
  deleteServidorFromCloud,
  saveAssetToCloud,
  deleteAssetFromCloud,
  saveAssetsBatchToCloud,
  subscribeToCloudDisplaySettings,
  saveDisplaySettingsToCloud,
  loadDisplaySettingsFromCloud
} from './services/firebase';
import { 
  generateLabelsPDF, 
  generateInventoryReportPDF 
} from './services/pdfGenerator';
import { 
  formatPatrimonio, 
  formatLast5Patrimonio 
} from './utils/formatters';
import { matchesAsset } from './utils/searchUtils';
import { 
  Sparkles, 
  PackageSearch, 
  Hash, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  User, 
  Calendar, 
  DollarSign, 
  FileText, 
  Archive, 
  Eye, 
  EyeOff, 
  Columns3, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Building2, 
  X, 
  Eraser, 
  RotateCcw, 
  CheckCheck, 
  Plus,
  Copy,
  Server,
  Laptop,
  Monitor,
  Cpu,
  ChevronDown
} from 'lucide-react';

export function App() {
  // Authentication and Authorization States (Exige autenticação obrigatória via Google)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const isLocalhost = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1'
      );
      if (isLocalhost) {
        const stored = localStorage.getItem('carga_patrimonio_current_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email && !parsed.email.includes('patrimonio.gov.br')) {
            return parsed;
          }
        }
      }
    } catch (e) {}
    return null;
  });

  const [userRole, setUserRole] = useState(() => {
    try {
      const isLocalhost = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1'
      );
      if (isLocalhost) {
        const stored = localStorage.getItem('carga_patrimonio_current_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.role) return parsed.role;
        }
      }
    } catch (e) {}
    return 'operador';
  });

  const [isAuthorized, setIsAuthorized] = useState(() => {
    try {
      const isLocalhost = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1'
      );
      if (isLocalhost) {
        const stored = localStorage.getItem('carga_patrimonio_current_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) return true;
        }
      }
    } catch (e) {}
    return false;
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authorizedUsers, setAuthorizedUsers] = useState([]);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  // Main Data States
  const [sectors, setSectors] = useState([]);
  const [assets, setAssets] = useState([]);
  const [cautelas, setCautelas] = useState([]);
  const [isFirebaseActive, setIsFirebaseActive] = useState(false);

  // Sector and View Filters
  const [activeSectorId, setActiveSectorId] = useState('sec-foyer');
  const [filterMode, setFilterMode] = useState('ALL_SECTORS'); // 'ALL_SECTORS' | 'MY_SECTOR'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDENTES' | 'CONFERIDOS' | 'CAUTELAS' | 'BAIXADOS'
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persona Simulada para Teste de Operadores e Departamentos
  const [simulatedPersonaId, setSimulatedPersonaId] = useState('admin');
  const currentProfileKey = simulatedPersonaId || currentUser?.email || 'admin';

  // Padrões de Visibilidade de Colunas:
  // 1. DENTRO DE SETORES: Setor visível por padrão, Responsável retirado
  const DEFAULT_SECTOR_COLUMNS = useMemo(() => ({
    quantidade: false,
    marca: true,
    modelo: true,
    localizacao: true,
    responsavel: false,
    financeiro: true,
    dataAquisicao: true,
    valorOriginal: true,
    valorAtual: true,
    depreciacao: true
  }), []);

  // 2. VISUALIZAÇÃO GERAL (Todos os Setores): Todas as colunas visíveis por padrão (true)
  const DEFAULT_GENERAL_COLUMNS = useMemo(() => ({
    quantidade: true,
    marca: true,
    modelo: true,
    localizacao: true,
    responsavel: true,
    financeiro: true,
    dataAquisicao: true,
    valorOriginal: true,
    valorAtual: true,
    depreciacao: true
  }), []);

  const [sectorColumns, setSectorColumns] = useState(() => {
    try {
      const stored = localStorage.getItem(`carga_patrimonio_sector_cols_${currentProfileKey}`) || 
                     localStorage.getItem('carga_patrimonio_sector_visible_columns_v3');
      if (stored) {
        return {
          ...DEFAULT_SECTOR_COLUMNS,
          ...JSON.parse(stored),
          responsavel: false
        };
      }
    } catch (e) {}
    return DEFAULT_SECTOR_COLUMNS;
  });

  const [generalColumns, setGeneralColumns] = useState(() => {
    try {
      const stored = localStorage.getItem(`carga_patrimonio_general_cols_${currentProfileKey}`) ||
                     localStorage.getItem('carga_patrimonio_general_visible_columns_v3');
      if (stored) {
        return {
          ...DEFAULT_GENERAL_COLUMNS,
          ...JSON.parse(stored)
        };
      }
    } catch (e) {}
    return DEFAULT_GENERAL_COLUMNS;
  });

  // Modo de exibição da depreciação por perfil: 'currency' (R$) ou 'percent' (%)
  const [depreciationMode, setDepreciationMode] = useState(() => {
    try {
      return localStorage.getItem(`carga_patrimonio_depr_mode_${currentProfileKey}`) || 
             localStorage.getItem('carga_patrimonio_depr_mode') || 'currency';
    } catch (e) {
      return 'currency';
    }
  });

  // Configurações Visuais e de Exibição por perfil
  const [displaySettings, setDisplaySettings] = useState(() => {
    try {
      const stored = localStorage.getItem(`carga_patrimonio_display_settings_${currentProfileKey}`) ||
                     localStorage.getItem('carga_patrimonio_display_settings');
      return stored ? { ...DEFAULT_DISPLAY_SETTINGS, ...JSON.parse(stored) } : DEFAULT_DISPLAY_SETTINGS;
    } catch (e) {
      return DEFAULT_DISPLAY_SETTINGS;
    }
  });

  // Ao alternar de perfil/setor (Persona), carrega imediatamente as preferências visuais individuais
  useEffect(() => {
    try {
      const sCols = localStorage.getItem(`carga_patrimonio_sector_cols_${currentProfileKey}`);
      if (sCols) {
        setSectorColumns({ ...DEFAULT_SECTOR_COLUMNS, ...JSON.parse(sCols), responsavel: false });
      } else {
        setSectorColumns(DEFAULT_SECTOR_COLUMNS);
      }

      const gCols = localStorage.getItem(`carga_patrimonio_general_cols_${currentProfileKey}`);
      if (gCols) {
        setGeneralColumns({ ...DEFAULT_GENERAL_COLUMNS, ...JSON.parse(gCols) });
      } else {
        setGeneralColumns(DEFAULT_GENERAL_COLUMNS);
      }

      const dMode = localStorage.getItem(`carga_patrimonio_depr_mode_${currentProfileKey}`);
      if (dMode) {
        setDepreciationMode(dMode);
      } else {
        setDepreciationMode('currency');
      }

      const dSet = localStorage.getItem(`carga_patrimonio_display_settings_${currentProfileKey}`);
      if (dSet) {
        setDisplaySettings({ ...DEFAULT_DISPLAY_SETTINGS, ...JSON.parse(dSet) });
      } else {
        setDisplaySettings(DEFAULT_DISPLAY_SETTINGS);
      }
    } catch (e) {}
  }, [currentProfileKey, DEFAULT_SECTOR_COLUMNS, DEFAULT_GENERAL_COLUMNS]);

  // Colunas ativas dinâmicas com base no modo atual (Dentro de Setor vs Geral)
  const visibleColumns = useMemo(() => {
    return filterMode === 'MY_SECTOR' ? sectorColumns : generalColumns;
  }, [filterMode, sectorColumns, generalColumns]);

  const toggleColumn = (columnKey) => {
    if (filterMode === 'MY_SECTOR') {
      setSectorColumns(prev => {
        const next = {
          ...prev,
          [columnKey]: !prev[columnKey]
        };
        try {
          localStorage.setItem(`carga_patrimonio_sector_cols_${currentProfileKey}`, JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    } else {
      setGeneralColumns(prev => {
        const next = {
          ...prev,
          [columnKey]: !prev[columnKey]
        };
        try {
          localStorage.setItem(`carga_patrimonio_general_cols_${currentProfileKey}`, JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }
  };

  const showAllColumns = () => {
    if (filterMode === 'MY_SECTOR') {
      const allSec = {
        quantidade: true,
        marca: true,
        modelo: true,
        localizacao: true,
        responsavel: false,
        dataAquisicao: true,
        valorOriginal: true,
        valorAtual: true,
        depreciacao: true
      };
      setSectorColumns(allSec);
      try {
        localStorage.setItem(`carga_patrimonio_sector_cols_${currentProfileKey}`, JSON.stringify(allSec));
      } catch (e) {}
    } else {
      const allGen = {
        quantidade: true,
        marca: true,
        modelo: true,
        localizacao: true,
        responsavel: true,
        dataAquisicao: true,
        valorOriginal: true,
        valorAtual: true,
        depreciacao: true
      };
      setGeneralColumns(allGen);
      try {
        localStorage.setItem(`carga_patrimonio_general_cols_${currentProfileKey}`, JSON.stringify(allGen));
      } catch (e) {}
    }
  };

  const resetToModeDefaultColumns = () => {
    if (filterMode === 'MY_SECTOR') {
      setSectorColumns(DEFAULT_SECTOR_COLUMNS);
      try {
        localStorage.setItem(`carga_patrimonio_sector_cols_${currentProfileKey}`, JSON.stringify(DEFAULT_SECTOR_COLUMNS));
      } catch (e) {}
    } else {
      setGeneralColumns(DEFAULT_GENERAL_COLUMNS);
      try {
        localStorage.setItem(`carga_patrimonio_general_cols_${currentProfileKey}`, JSON.stringify(DEFAULT_GENERAL_COLUMNS));
      } catch (e) {}
    }
  };

  const hiddenColumnsCount = useMemo(() => {
    let count = 0;
    if (visibleColumns.quantidade === false) count++;
    if (visibleColumns.marca === false) count++;
    if (visibleColumns.modelo === false) count++;
    if (visibleColumns.localizacao === false) count++;
    if (filterMode === 'ALL_SECTORS' && visibleColumns.responsavel === false) count++;
    if (visibleColumns.dataAquisicao === false) count++;
    if (visibleColumns.valorOriginal === false) count++;
    if (visibleColumns.valorAtual === false) count++;
    if (visibleColumns.depreciacao === false) count++;
    return count;
  }, [visibleColumns, filterMode]);

  const tableMinWidth = useMemo(() => {
    let base = 600;
    if (visibleColumns.quantidade !== false) base += 48;
    if (visibleColumns.marca !== false) base += 112;
    if (visibleColumns.modelo !== false) base += 112;
    if (visibleColumns.localizacao !== false) base += 192;
    if (filterMode === 'ALL_SECTORS' && visibleColumns.responsavel !== false) base += 112;
    if (visibleColumns.dataAquisicao !== false) base += 96;
    if (visibleColumns.valorOriginal !== false) base += 112;
    if (visibleColumns.valorAtual !== false) base += 112;
    if (visibleColumns.depreciacao !== false) base += 112;
    return `${base}px`;
  }, [visibleColumns, filterMode]);

  // Dropdown de Gerenciamento de Colunas
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const columnDropdownRef = useRef(null);

  const toggleDepreciationMode = () => {
    setDepreciationMode(prev => {
      const next = prev === 'currency' ? 'percent' : 'currency';
      try {
        localStorage.setItem(`carga_patrimonio_depr_mode_${currentProfileKey}`, next);
      } catch (e) {}
      return next;
    });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(e.target)) {
        setIsColumnDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsColumnDropdownOpen(false);
      }
    };
    if (isColumnDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isColumnDropdownOpen]);

  // Dropdown de Setor dentro da Cortina de TI
  const [isCurtainSectorDropdownOpen, setIsCurtainSectorDropdownOpen] = useState(false);
  const curtainSectorDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (curtainSectorDropdownRef.current && !curtainSectorDropdownRef.current.contains(e.target)) {
        setIsCurtainSectorDropdownOpen(false);
      }
    };
    if (isCurtainSectorDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCurtainSectorDropdownOpen]);

  // Modal States
  const [isQrOpen, setIsQrOpen] = useState(false);
  
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState(null);
  
  const [isCautelaModalOpen, setIsCautelaModalOpen] = useState(false);
  const [assetForCautela, setAssetForCautela] = useState(null);
  const [isCautelaListOpen, setIsCautelaListOpen] = useState(false);
  
  const [isBaixaModalOpen, setIsBaixaModalOpen] = useState(false);
  const [assetForBaixa, setAssetForBaixa] = useState(null);

  const [isDtinModalOpen, setIsDtinModalOpen] = useState(false);
  const [assetForDtin, setAssetForDtin] = useState(null);
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [assetForTransfer, setAssetForTransfer] = useState(null);

  const [isManageSectorsOpen, setIsManageSectorsOpen] = useState(false);
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  
  // Estado do Modal de Confirmação Central para Limpar Bens de um Setor
  const [sectorToClear, setSectorToClear] = useState(null);
  const [isClearingSector, setIsClearingSector] = useState(false);

  // Pedidos e Solicitações de Carga
  const [pedidosCarga, setPedidosCarga] = useState(() => {
    try {
      const stored = localStorage.getItem('carga_patrimonio_pedidos');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [isSolicitacaoModalOpen, setIsSolicitacaoModalOpen] = useState(false);
  const [assetForSolicitacao, setAssetForSolicitacao] = useState(null);
  const [isPedidosModalOpen, setIsPedidosModalOpen] = useState(false);
  const [isPendenciasDtinOpen, setIsPendenciasDtinOpen] = useState(false);
  const [isServidoresModalOpen, setIsServidoresModalOpen] = useState(false);

  // Servidores & Pessoas onde os bens estão alocados
  const [servidores, setServidores] = useState(() => {
    try {
      const stored = localStorage.getItem('carga_patrimonio_servidores');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Modal de Exclusão Segura com Motivo Obrigatório
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);

  // Modal para Escolha de Ordenação ao Emitir Relatório (Patrimônio ou Item)
  const [isExportReportModalOpen, setIsExportReportModalOpen] = useState(false);
  const [exportReportSector, setExportReportSector] = useState(null);

  // Modal de Confirmação para Alteração em Lote (Tornar Todos Pendentes / Conferidos)
  const [batchStatusModalData, setBatchStatusModalData] = useState(null);
  const [isProcessingBatchStatus, setIsProcessingBatchStatus] = useState(false);

  const [isDisplaySettingsOpen, setIsDisplaySettingsOpen] = useState(false);

  const handleSaveDisplaySettings = (newSettings) => {
    setDisplaySettings(newSettings);
    try {
      localStorage.setItem(`carga_patrimonio_display_settings_${currentProfileKey}`, JSON.stringify(newSettings));
    } catch (e) {}
    if (effectiveUserRole === 'admin') {
      saveDisplaySettingsToCloud(newSettings).catch((err) => {
        console.warn('Erro ao sincronizar configurações na nuvem:', err);
      });
    }
    showToast('Configurações visuais salvas com sucesso!', 'success');
  };

  // Referência do scroll principal
  const mainScrollRef = useRef(null);

  // Barra de rolagem auto-hide: aparece ao rolar e desaparece suavemente quando para
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  const handleMainScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fullscreen / Tela Cheia Total no Mobile e Desktop
  const [isFullscreen, setIsFullscreen] = useState(() => {
    return typeof document !== 'undefined' && !!(document.fullscreenElement || document.webkitFullscreenElement);
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // Auto-ativação de Tela Cheia no primeiro toque/interação em mobile
    const handleMobileFirstInteraction = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && window.innerWidth <= 768) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen();
        }
      }
    };

    window.addEventListener('touchstart', handleMobileFirstInteraction, { once: true });
    window.addEventListener('click', handleMobileFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('touchstart', handleMobileFirstInteraction);
      window.removeEventListener('click', handleMobileFirstInteraction);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => console.warn(err));
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.warn(err));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  // 1. Initial Load & Auth Listener
  useEffect(() => {
    try {
      const stored = localStorage.getItem('carga_patrimonio_current_user');
      if (!stored || stored.includes('patrimonio.gov.br')) {
        const superAdmin = { displayName: 'Irandy Alves', email: 'irandyalves@gmail.com', role: 'admin' };
        localStorage.setItem('carga_patrimonio_current_user', JSON.stringify(superAdmin));
        setCurrentUser(superAdmin);
      }
    } catch (e) {}

    const { isConfigured } = initFirebase();
    setIsFirebaseActive(isConfigured);

    const { assets: initialAssets, cautelas: initialCautelas, sectors: initialSectors } = loadLocalData();
    const sortedSectors = [...initialSectors].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
    setSectors(sortedSectors);
    setAssets(initialAssets);
    setCautelas(initialCautelas);

    if (sortedSectors.length > 0) {
      setActiveSectorId(sortedSectors[0].id);
    }

    // Subscriptions to Firebase Realtime listeners
    let unsubscribe = () => {};
    let unsubSectors = () => {};
    let unsubAssets = () => {};
    let unsubCautelas = () => {};
    let unsubPedidos = () => {};
    let unsubSettings = () => {};
    let unsubServidores = () => {};

    if (isConfigured) {
      unsubSectors = subscribeToCloudSectors((cloudSectors) => {
        if (cloudSectors && cloudSectors.length > 0) {
          const sorted = [...cloudSectors].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
          setSectors(sorted);
        }
      });

      unsubAssets = subscribeToCloudAssets((cloudAssets) => {
        if (cloudAssets && cloudAssets.length > 0) {
          setAssets(cloudAssets);
        }
      });

      unsubCautelas = subscribeToCloudCautelas((cloudCautelas) => {
        if (cloudCautelas && cloudCautelas.length > 0) {
          setCautelas(cloudCautelas);
        }
      });

      unsubPedidos = subscribeToCloudPedidos((cloudPedidos) => {
        if (cloudPedidos) {
          setPedidosCarga(cloudPedidos);
        }
      });

      unsubServidores = subscribeToCloudServidores((cloudServidores) => {
        if (cloudServidores) {
          setServidores(cloudServidores);
        }
      });

      unsubSettings = subscribeToCloudDisplaySettings((cloudSettings) => {
        if (cloudSettings) {
          setDisplaySettings(prev => ({ ...prev, ...cloudSettings }));
        }
      });
    }

    loadAuthorizedUsers().then(usersList => {
      setAuthorizedUsers(usersList);

      unsubscribe = subscribeToAuth(async (authUser) => {
        if (authUser && authUser.email) {
          const cleanEmail = authUser.email.toLowerCase().trim();
          const authCheck = checkUserAuthorization(cleanEmail, usersList);
          if (authCheck && authCheck.authorized) {
            const registeredName = authCheck.user?.name;
            const finalName = registeredName || authUser.displayName || cleanEmail.split('@')[0];
            const resolvedUser = {
              uid: authUser.uid,
              displayName: finalName,
              name: finalName,
              email: cleanEmail,
              photoURL: authUser.photoURL || null,
              role: authCheck.role
            };
            setCurrentUser(resolvedUser);
            setUserRole(authCheck.role);
            setIsAuthorized(true);
            setAuthError(null);
            localStorage.setItem('carga_patrimonio_current_user', JSON.stringify(resolvedUser));
          } else {
            setIsAuthorized(false);
            setAuthError(`O e-mail "${cleanEmail}" não possui autorização de acesso ao sistema.`);
            setCurrentUser(null);
            localStorage.removeItem('carga_patrimonio_current_user');
          }
        } else {
          // Se não há usuário autenticado no Firebase: em produção / GitHub Pages, bloqueia imediatamente
          const isLocalhost = typeof window !== 'undefined' && (
            window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1'
          );
          if (!isLocalhost) {
            setIsAuthorized(false);
            setCurrentUser(null);
            localStorage.removeItem('carga_patrimonio_current_user');
          }
        }
        setAuthLoading(false);
      });
    }).catch(err => {
      console.warn('Firebase em modo local:', err);
      setAuthLoading(false);
    });

    return () => {
      unsubscribe();
      unsubSectors();
      unsubAssets();
      unsubCautelas();
      unsubPedidos();
      unsubServidores();
      unsubSettings();
    };
  }, []);

  // Save to persistence whenever assets, cautelas or sectors change
  useEffect(() => {
    if (sectors.length > 0) {
      saveLocalSectors(sectors);
    }
  }, [sectors]);

  useEffect(() => {
    if (assets.length > 0) {
      saveLocalAssets(assets);
    }
  }, [assets]);

  useEffect(() => {
    if (cautelas.length > 0) {
      saveLocalCautelas(cautelas);
    }
  }, [cautelas]);

  // Type-to-search global: ao começar a digitar qualquer caractere na tela do setor, foca no campo de busca e vai filtrando em tempo real
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ignora atalhos de sistema (Ctrl, Alt, Meta)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Se algum modal estiver aberto, não intercepta
      if (
        isAssetModalOpen || isCautelaModalOpen || isBaixaModalOpen || isDtinModalOpen ||
        isTransferModalOpen || isManageSectorsOpen || isLabelsModalOpen || 
        isExcelModalOpen || isBackupModalOpen || isFirebaseModalOpen || 
        isSolicitacaoModalOpen || isPedidosModalOpen || isQrOpen
      ) {
        return;
      }

      // Se já estiver com foco em algum input ou textarea
      const activeEl = document.activeElement;
      const tag = activeEl?.tagName?.toLowerCase();
      const isContentEditable = activeEl?.isContentEditable;
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || isContentEditable) {
        if (e.key === 'Escape') {
          setSearchTerm('');
          activeEl?.blur();
        }
        return;
      }

      // Se pressionou Escape sem estar focado no input
      if (e.key === 'Escape') {
        setSearchTerm('');
        return;
      }

      // Se for tecla imprimível comum (letras, números, hífen, ponto)
      if (e.key.length === 1) {
        const searchInput = document.getElementById('main-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isAssetModalOpen, isCautelaModalOpen, isBaixaModalOpen, 
    isTransferModalOpen, isManageSectorsOpen, isLabelsModalOpen, 
    isExcelModalOpen, isBackupModalOpen, isFirebaseModalOpen, 
    isSolicitacaoModalOpen, isPedidosModalOpen, isQrOpen
  ]);

  // Persona e Permissões Efetivas para Teste de Operadores e Departamentos (Suporte a múltiplos setores, ex: Tadeu -> Studio e Auditório)
  const simulatedPersona = useMemo(() => {
    if (simulatedPersonaId === 'admin') {
      return { id: 'admin', role: 'admin', sectorId: null, sectorIds: [], sectorName: 'Administrador' };
    }
    const sec = sectors.find(s => s.id === simulatedPersonaId);
    if (!sec) {
      return { id: 'operador', role: 'operador', sectorId: null, sectorIds: [], sectorName: 'Operador' };
    }

    const resp = (sec.responsavel || '').toLowerCase().trim();
    const email = (sec.email || '').toLowerCase().trim();

    // Encontra TODOS os setores atribuídos a esse mesmo responsável (ex: Tadeu -> Studio e Auditório)
    const matchedSectors = sectors.filter(s => {
      if (s.id === sec.id) return true;
      if (email && s.email && s.email.toLowerCase().trim() === email) return true;
      if (resp && s.responsavel && s.responsavel.toLowerCase().trim() === resp) return true;
      return false;
    });

    const sectorIds = matchedSectors.map(s => s.id);

    return {
      id: sec.id,
      role: 'operador',
      sectorId: sec.id,
      sectorIds: sectorIds,
      sectorName: sec.responsavel 
        ? `${sec.responsavel} (${matchedSectors.map(s => s.name).join(' & ')})` 
        : sec.name
    };
  }, [simulatedPersonaId, sectors]);

  // Setores vinculados ao responsável logado (reconhece por e-mail ou nome cadastrado - suporta múltiplos setores)
  const userLinkedSectorIds = useMemo(() => {
    if (!currentUser) return [];
    const userEmail = (currentUser.email || '').toLowerCase().trim();
    const userName = (currentUser.displayName || currentUser.name || '').toLowerCase().trim();

    const matched = sectors.filter(s => {
      const sEmail = (s.email || '').toLowerCase().trim();
      const sResp = (s.responsavel || '').toLowerCase().trim();
      if (userEmail && sEmail && sEmail === userEmail) return true;
      if (userName && sResp && (sResp === userName || userName.includes(sResp) || sResp.includes(userName))) return true;
      return false;
    });

    return matched.map(s => s.id);
  }, [currentUser, sectors]);

  const userLinkedSector = useMemo(() => {
    if (userLinkedSectorIds.length === 0) return null;
    return sectors.find(s => s.id === userLinkedSectorIds[0]) || null;
  }, [userLinkedSectorIds, sectors]);

  const effectiveUserRole = simulatedPersonaId !== 'admin' ? simulatedPersona?.role : (userRole || 'admin');
  
  const effectiveUserSectorIds = useMemo(() => {
    if (effectiveUserRole === 'admin') return [];
    if (simulatedPersonaId !== 'admin') {
      return simulatedPersona?.sectorIds || (simulatedPersona?.sectorId ? [simulatedPersona.sectorId] : []);
    }
    return userLinkedSectorIds;
  }, [effectiveUserRole, simulatedPersonaId, simulatedPersona, userLinkedSectorIds]);

  const effectiveUserSectorId = effectiveUserSectorIds.length > 0 ? effectiveUserSectorIds[0] : null;

  // Usuário efetivo para visualização e cabeçalho (quando operador é selecionado, exibe o nome e perfil do operador)
  const effectiveUser = useMemo(() => {
    if (simulatedPersonaId === 'admin') {
      return currentUser;
    }
    const sec = sectors.find(s => s.id === simulatedPersonaId);
    if (!sec) return currentUser;

    const resp = sec.responsavel || 'Operador';
    const email = sec.email || `${resp.toLowerCase().replace(/\s+/g, '.')}@empresa.gov.br`;

    return {
      displayName: resp,
      email: email,
      role: 'operador',
      photoURL: null,
      sectorId: sec.id,
      sectorName: sec.name
    };
  }, [simulatedPersonaId, sectors, currentUser]);

  // Verifica se o usuário atual tem permissão de gestão sobre um determinado setor
  const canUserManageSector = useCallback((sectorId) => {
    if (effectiveUserRole === 'admin') return true;
    if (!sectorId) return false;
    const sec = sectors.find(s => s.id === sectorId);
    if (!sec) return false;
    if (effectiveUserSectorIds && effectiveUserSectorIds.length > 0 && effectiveUserSectorIds.includes(sec.id)) return true;
    if (effectiveUserSectorId && effectiveUserSectorId === sec.id) return true;
    if (userLinkedSectorIds && userLinkedSectorIds.length > 0 && userLinkedSectorIds.includes(sec.id)) return true;
    const userObj = effectiveUser || currentUser;
    if (userObj) {
      const userEmail = (userObj.email || '').toLowerCase().trim();
      const userName = (userObj.displayName || userObj.name || '').toLowerCase().trim();
      const sEmail = (sec.email || '').toLowerCase().trim();
      const sResp = (sec.responsavel || '').toLowerCase().trim();
      if (userEmail && sEmail && sEmail === userEmail) return true;
      if (userName && sResp && (sResp === userName || userName.includes(sResp) || sResp.includes(userName))) return true;
    }
    return false;
  }, [effectiveUserRole, effectiveUserSectorIds, effectiveUserSectorId, userLinkedSectorIds, effectiveUser, currentUser, sectors]);

  // Verifica se o usuário atual tem permissão de gerenciar um bem específico
  const canUserManageAsset = useCallback((asset) => {
    if (!asset) return false;
    if (effectiveUserRole === 'admin') return true;
    return canUserManageSector(asset.setorId);
  }, [effectiveUserRole, canUserManageSector]);

  // Verifica se o setor atualmente selecionado na tela pode ser gerenciado pelo usuário
  const canManageActiveSector = useMemo(() => {
    if (effectiveUserRole === 'admin') return true;
    return canUserManageSector(activeSectorId);
  }, [effectiveUserRole, canUserManageSector, activeSectorId]);

  const handleSelectPersona = (personaId) => {
    setSimulatedPersonaId(personaId);
    if (personaId !== 'admin') {
      setActiveSectorId(personaId);
      setFilterMode('MY_SECTOR');
      const sec = sectors.find(s => s.id === personaId);
      const resp = (sec?.responsavel || '').toLowerCase().trim();
      const matched = sectors.filter(s => resp && s.responsavel && s.responsavel.toLowerCase().trim() === resp);
      const sectorNames = matched.length > 1 ? matched.map(s => s.name).join(' & ') : sec?.name;
      showToast(`Visão de Operador ativada: ${sec?.responsavel || 'Operador'} (${sectorNames})`, 'info');
    } else {
      setFilterMode('ALL_SECTORS');
      showToast('Visão de Administrador ativada (Acesso e alteração liberados em todos os departamentos)', 'success');
    }
  };

  // Auth Handlers
  const handleLoginSuccess = async (user) => {
    if (!user || !user.email) return;
    const cleanEmail = user.email.toLowerCase().trim();
    try {
      sessionStorage.setItem('last_attempted_email', cleanEmail);
      localStorage.setItem('last_attempted_email', cleanEmail);
    } catch (e) {}

    let usersList = authorizedUsers;
    if (!usersList || usersList.length === 0) {
      usersList = await loadAuthorizedUsers();
      setAuthorizedUsers(usersList);
    }

    const authCheck = checkUserAuthorization(cleanEmail, usersList);
    if (authCheck && authCheck.authorized) {
      const registeredName = authCheck.user?.name;
      const finalName = registeredName || user.displayName || cleanEmail.split('@')[0];

      const resolvedUser = {
        uid: user.uid || cleanEmail,
        displayName: finalName,
        name: finalName,
        email: cleanEmail,
        photoURL: user.photoURL || null,
        role: authCheck.role
      };

      setCurrentUser(resolvedUser);
      setUserRole(authCheck.role);
      setIsAuthorized(true);
      setAuthError(null);
      localStorage.setItem('carga_patrimonio_current_user', JSON.stringify(resolvedUser));

      // Se for operador e tiver setor vinculado, ativa automaticamente seu setor
      if (authCheck.role === 'operador') {
        const uName = finalName.toLowerCase().trim();
        const linked = sectors.find(s => 
          (s.email && s.email.toLowerCase().trim() === cleanEmail) ||
          (uName && s.responsavel && s.responsavel.toLowerCase().trim().includes(uName)) ||
          (uName && s.responsavel && uName.includes(s.responsavel.toLowerCase().trim()))
        );
        if (linked) {
          setActiveSectorId(linked.id);
          setFilterMode('MY_SECTOR');
          setSimulatedPersonaId(linked.id);
          showToast(`Bem-vindo, ${finalName}! Setor "${linked.name}" carregado.`, 'success');
          return;
        } else {
          setSimulatedPersonaId(null);
        }
      } else {
        setSimulatedPersonaId('admin');
      }

      showToast(`Bem-vindo, ${finalName}! Login efetuado com sucesso.`, 'success');
    } else {
      setIsAuthorized(false);
      setCurrentUser(null);
      localStorage.removeItem('carga_patrimonio_current_user');
      await logoutUser();
      const msg = `O e-mail "${cleanEmail}" não possui autorização de acesso ao sistema. Solicite liberação ao administrador.`;
      setAuthError(msg);
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {}
    localStorage.removeItem('carga_patrimonio_current_user');
    setCurrentUser(null);
    setIsAuthorized(false);
    setAuthError(null);
    setSimulatedPersonaId('admin');
    showToast('Você saiu da sua conta.', 'info');
  };

  const handleTriggerGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        await handleLoginSuccess(user);
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        showToast(err.message || 'Falha ao autenticar com o Google.', 'error');
      }
    }
  };

  const handleAddUser = async (newUserData) => {
    const saved = await saveAuthorizedUserToCloud(newUserData);
    setAuthorizedUsers(prev => [saved, ...prev.filter(u => u.email.toLowerCase() !== saved.email.toLowerCase())]);
    showToast(`Usuário ${saved.email} autorizado com sucesso!`);
  };

  const handleDeleteUser = async (email) => {
    await deleteAuthorizedUserFromCloud(email);
    setAuthorizedUsers(prev => prev.filter(u => u.email.toLowerCase() !== email.toLowerCase()));
    showToast(`Acesso de ${email} revogado.`);
  };

  const activeSector = useMemo(() => {
    return sectors.find(s => s.id === activeSectorId) || sectors[0] || {
      id: 'sec-ti',
      name: 'Setor Geral',
      responsavel: 'Responsável',
      sala: 'Sala 01'
    };
  }, [sectors, activeSectorId]);

  // Somente o Santana dentro do departamento dele (TI) ou Admin Geral pode criar novo envio para DTIN
  const isTISector = (activeSector?.name || '').toLowerCase().trim() === 'ti' || 
                     (activeSector?.name || '').toLowerCase().includes('tecnologia') ||
                     (activeSector?.responsavel || '').toLowerCase().includes('santana') ||
                     activeSector?.id === 'sec-ti';

  const isSantanaUser = (effectiveUser?.displayName || currentUser?.displayName || currentUser?.name || '').toLowerCase().includes('santana') ||
                        (simulatedPersona?.sectorName || '').toLowerCase().includes('santana') ||
                        effectiveUserRole === 'admin';

  const canCreateNovoEnvioDtin = isTISector && isSantanaUser;

  // Conference Statistics Calculation (Calcula por setor ou em TODOS os setores dinamicamente)
  const stats = useMemo(() => {
    const isAllSectors = filterMode === 'ALL_SECTORS';
    const targetAssets = isAllSectors ? assets : assets.filter(a => a.setorId === activeSectorId);
    const total = targetAssets.length;
    const conferidos = targetAssets.filter(a => a.status === 'CONFERIDO').length;
    const cautelasCount = targetAssets.filter(a => a.status === 'EM_CAUTELA').length;
    const baixados = targetAssets.filter(a => a.status === 'BAIXADO' || a.baixado).length;
    const pendentes = total - conferidos - baixados;
    const pctConferido = total > 0 ? Math.round((conferidos / (total - baixados || 1)) * 100) : 0;

    return {
      total,
      conferidos,
      pendentes: Math.max(0, pendentes),
      cautelas: cautelasCount,
      baixados,
      pctConferido: Math.min(100, pctConferido)
    };
  }, [assets, activeSectorId, filterMode]);

  // Lista de Equipamentos com Autorização de Envio ao DTIN Pendente
  const pendingDtinAssets = useMemo(() => {
    return assets.filter(a => a.pendenciaDtin && a.pendenciaDtin.status === 'PENDENTE');
  }, [assets]);

  // Contagem de pendências de DTIN visíveis para o usuário/perfil conectado
  const userPendingDtinCount = useMemo(() => {
    if (effectiveUserRole === 'admin') {
      return pendingDtinAssets.length;
    }
    const currentName = (effectiveUser?.displayName || currentUser?.displayName || '').toLowerCase().trim();
    return pendingDtinAssets.filter(a => {
      if (effectiveUserSectorIds && effectiveUserSectorIds.length > 0) {
        return effectiveUserSectorIds.includes(a.setorId);
      }
      if (effectiveUserSectorId && a.setorId === effectiveUserSectorId) return true;
      const aResp = (a.responsavel || '').toLowerCase().trim();
      if (currentName && aResp && (aResp === currentName || currentName.includes(aResp))) return true;
      return false;
    }).length;
  }, [pendingDtinAssets, effectiveUserRole, effectiveUserSectorIds, effectiveUserSectorId, effectiveUser, currentUser]);

  // Análise Detalhada de Patrimônios Duplicados em toda a base
  const { duplicateMap, duplicateCount } = useMemo(() => {
    return analyzeDuplicateAssets(assets, sectors);
  }, [assets, sectors]);

  // Se não houver duplicidades e o modo DUPLICATES estiver selecionado, reverte automaticamente para TODOS
  useEffect(() => {
    if (duplicateCount === 0 && filterMode === 'DUPLICATES') {
      setFilterMode('ALL_SECTORS');
    }
  }, [duplicateCount, filterMode]);

  // Modal de Gestão e Seleção de Bens de Informática (TI)
  const [isTiModalOpen, setIsTiModalOpen] = useState(false);

  // Lista de Bens de Informática (TI) identificados em toda a base
  const allTiAssets = useMemo(() => {
    return assets.filter(a => isTiAsset(a));
  }, [assets]);

  // Contagem por categorias de TI para a cortina no cabeçalho
  const tiCategoryCounts = useMemo(() => {
    const monitors = allTiAssets.filter(a => {
      const text = `${a.descricao || ''} ${a.modelo || ''}`.toLowerCase();
      return text.includes('monitor') || text.includes('display');
    }).length;
    const notebooks = allTiAssets.filter(a => {
      const text = `${a.descricao || ''} ${a.modelo || ''}`.toLowerCase();
      return text.includes('notebook') || text.includes('laptop') || text.includes('macbook');
    }).length;
    const desktops = allTiAssets.filter(a => {
      const text = `${a.descricao || ''} ${a.modelo || ''}`.toLowerCase();
      return text.includes('computador') || text.includes('desktop') || text.includes('cpu');
    }).length;
    const others = Math.max(0, allTiAssets.length - (monitors + notebooks + desktops));
    return { monitors, notebooks, desktops, others };
  }, [allTiAssets]);

  // Estado de Seleção em Lote (Bulk Select)
  const [selectedAssetIds, setSelectedAssetIds] = useState(() => new Set());
  const [displaySelectedCount, setDisplaySelectedCount] = useState(0);

  // Mantém o contador estável durante a animação de saída suave ao desmarcar
  useEffect(() => {
    if (selectedAssetIds.size > 0) {
      setDisplaySelectedCount(selectedAssetIds.size);
    }
  }, [selectedAssetIds.size]);

  // Limpa seleções ao trocar de setor ou modo de visão para evitar carregar seleções indevidas
  useEffect(() => {
    setSelectedAssetIds(new Set());
  }, [activeSectorId, filterMode]);

  // Alterna seleção de um item individual (apenas se o usuário tiver autorização de gestão sobre o bem)
  const handleToggleSelectAsset = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset || !canUserManageAsset(asset)) return;
    setSelectedAssetIds(prev => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  };

  // Selecionar / Desmarcar Todos os Itens Visíveis gerenciáveis pelo usuário
  const handleSelectAllVisible = () => {
    const manageableVisibleIds = filteredAssets
      .filter(a => canUserManageAsset(a))
      .map(a => a.id);
    if (manageableVisibleIds.length === 0) return;
    const allSelected = manageableVisibleIds.every(id => selectedAssetIds.has(id));
    if (allSelected) {
      setSelectedAssetIds(prev => {
        const next = new Set(prev);
        manageableVisibleIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedAssetIds(prev => {
        const next = new Set(prev);
        manageableVisibleIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  // Seleção Inteligente de Bens de Informática (apenas bens gerenciáveis pelo usuário)
  const handleSelectTiItems = (useAllBase = false) => {
    const targetPool = useAllBase 
      ? allTiAssets 
      : (filteredAssets.filter(a => isTiAsset(a)).length > 0 ? filteredAssets.filter(a => isTiAsset(a)) : allTiAssets);

    const manageablePool = targetPool.filter(a => canUserManageAsset(a));

    if (manageablePool.length === 0) {
      showToast('Nenhum item de Informática/TI sob sua responsabilidade encontrado.', 'info');
      return;
    }
    setSelectedAssetIds(prev => {
      const next = new Set(prev);
      manageablePool.forEach(a => next.add(a.id));
      return next;
    });
    showToast(`💻 ${manageablePool.length} itens de Informática/TI selecionados!`, 'info');
  };

  // Limpar Seleção
  const handleClearSelection = () => {
    setSelectedAssetIds(new Set());
  };

  // Controla se a barra/modal superior de ações em lote deve ser exibida:
  // Administradores ou responsáveis pelos bens selecionados. Jamais exibida se houver bens de outros setores ou setor de outrem!
  const canShowBulkActionBar = useMemo(() => {
    if (selectedAssetIds.size === 0) return false;
    if (isTiModalOpen) return false;
    if (effectiveUserRole === 'admin') return true;
    if (filterMode === 'MY_SECTOR') {
      return canManageActiveSector;
    }
    return Array.from(selectedAssetIds).every(id => {
      const asset = assets.find(a => a.id === id);
      return asset && canUserManageAsset(asset);
    });
  }, [selectedAssetIds, isTiModalOpen, effectiveUserRole, filterMode, canManageActiveSector, assets, canUserManageAsset]);

  // Atribuição em Massa de Setor (Gera Pedidos de Carga para Confirmação do Responsável)
  const handleBulkAssignSector = (targetSectorId) => {
    const targetSector = sectors.find(s => s.id === targetSectorId);
    if (!targetSector || selectedAssetIds.size === 0) return;

    // Filtra estritamente apenas os bens que pertencem ao usuário/setor sob sua responsabilidade
    const selectedAssetsList = assets.filter(a => selectedAssetIds.has(a.id) && canUserManageAsset(a));
    if (selectedAssetsList.length === 0) {
      showToast('Apenas o responsável pela carga dos bens pode transferi-los.', 'error');
      setSelectedAssetIds(new Set());
      return;
    }

    const nowStr = new Date().toLocaleString('pt-BR');
    const count = selectedAssetsList.length;
    const manageableSet = new Set(selectedAssetsList.map(a => a.id));

    // Cria pedidos de transferência de carga para cada item selecionado
    const newPedidos = selectedAssetsList.map((a, idx) => ({
      id: `ped-${Date.now()}-${idx}`,
      assetId: a.id,
      numeroPatrimonio: a.numeroPatrimonio,
      descricao: a.descricao,
      setorOrigemId: a.setorId,
      setorOrigemNome: a.setorNome || (sectors.find(s => s.id === a.setorId)?.name) || 'Setor de Origem',
      setorDestinoId: targetSector.id,
      setorDestinoNome: targetSector.name,
      responsavelOrigem: a.responsavel || (sectors.find(s => s.id === a.setorId)?.responsavel) || '',
      responsavelDestino: targetSector.responsavel || 'Responsável do Setor',
      solicitanteNome: currentUser?.displayName || currentUser?.email || 'Operador',
      dataSolicitacao: new Date().toISOString(),
      status: 'PENDENTE',
      motivo: `Transferência de carga: enviado de "${a.setorNome || 'Origem'}" para "${targetSector.name}"`,
      localizacaoFisica: targetSector.name
    }));

    // Atualiza o histórico dos bens informando a solicitação de transferência
    const updatedAssets = assets.map(a => {
      if (manageableSet.has(a.id)) {
        return {
          ...a,
          historico: [
            ...(a.historico || []),
            {
              data: nowStr,
              acao: `Pedido de Transferência de Carga: Enviado de "${a.setorNome || 'Origem'}" para "${targetSector.name}". Aguardando confirmação de ${targetSector.responsavel || 'Responsável'}.`,
              usuario: currentUser?.displayName || currentUser?.email || 'Operador'
            }
          ]
        };
      }
      return a;
    });

    setAssets(updatedAssets);
    saveLocalAssets(updatedAssets);
    setPedidosCarga(prev => [...newPedidos, ...prev]);

    if (isFirebaseActive) {
      newPedidos.forEach(ped => savePedidoToCloud(ped));
      const changedItems = updatedAssets.filter(a => selectedAssetIds.has(a.id));
      saveAssetsBatchToCloud(changedItems).catch(err => console.warn('Erro sync nuvem:', err));
    }

    showToast(`📨 Pedido de transferência de ${count} ${count === 1 ? 'item' : 'itens'} enviado para confirmação do responsável de "${targetSector.name}" (${targetSector.responsavel || 'Responsável'})!`, 'success');
    setSelectedAssetIds(new Set());
  };

  // Atribuição Rápida de TI em 1 Clique
  const handleBulkAssignTi = () => {
    const tiSector = sectors.find(s => s.id === 'sec-ti' || (s.name || '').toUpperCase().trim() === 'TI' || (s.name || '').toLowerCase().includes('tecnologia')) || sectors.find(s => (s.name || '').toUpperCase().includes('TI')) || sectors[0];
    if (tiSector) {
      handleBulkAssignSector(tiSector.id);
    }
  };

  // Marcar Selecionados como Conferidos
  const handleBulkMarkConferidos = () => {
    if (selectedAssetIds.size === 0) return;
    const now = new Date().toISOString();
    const count = selectedAssetIds.size;
    const updatedAssets = assets.map(a => {
      if (selectedAssetIds.has(a.id)) {
        return {
          ...a,
          status: 'CONFERIDO',
          conferidoEm: now,
          conferidoPor: currentUser?.displayName || 'Operador',
          updatedAt: now
        };
      }
      return a;
    });
    setAssets(updatedAssets);
    saveLocalAssets(updatedAssets);
    if (isFirebaseActive) {
      const changedItems = updatedAssets.filter(a => selectedAssetIds.has(a.id));
      saveAssetsBatchToCloud(changedItems).catch(err => console.warn('Erro sync nuvem:', err));
    }
    showToast(`✅ ${count} itens marcados como CONFERIDOS!`, 'success');
    setSelectedAssetIds(new Set());
  };

  // Marcar Selecionados como Pendentes
  const handleBulkMarkPendentes = () => {
    if (selectedAssetIds.size === 0) return;
    const now = new Date().toISOString();
    const count = selectedAssetIds.size;
    const updatedAssets = assets.map(a => {
      if (selectedAssetIds.has(a.id)) {
        return {
          ...a,
          status: 'PENDENTE',
          conferidoEm: null,
          conferidoPor: null,
          updatedAt: now
        };
      }
      return a;
    });
    setAssets(updatedAssets);
    saveLocalAssets(updatedAssets);
    if (isFirebaseActive) {
      const changedItems = updatedAssets.filter(a => selectedAssetIds.has(a.id));
      saveAssetsBatchToCloud(changedItems).catch(err => console.warn('Erro sync nuvem:', err));
    }
    showToast(`🔄 ${count} itens marcados como PENDENTES!`, 'info');
    setSelectedAssetIds(new Set());
  };

  // Excluir Selecionados em Lote
  const handleBulkDeleteSelected = () => {
    if (selectedAssetIds.size === 0) return;
    const count = selectedAssetIds.size;
    if (confirm(`Atenção: Deseja realmente excluir os ${count} bens selecionados? Esta ação é permanente.`)) {
      const remaining = assets.filter(a => !selectedAssetIds.has(a.id));
      setAssets(remaining);
      saveLocalAssets(remaining);
      if (isFirebaseActive) {
        selectedAssetIds.forEach(id => deleteAssetFromCloud(id));
      }
      showToast(`🗑️ ${count} bens selecionados foram excluídos com sucesso!`, 'info');
      setSelectedAssetIds(new Set());
    }
  };

  // Filtered Assets for Display
  const filteredAssets = useMemo(() => {
    return assets.filter(item => {
      // Filtro Exclusivo de Patrimônios Duplicados
      if (filterMode === 'DUPLICATES') {
        if (!duplicateMap.has(item.id)) return false;
      } else if (statusFilter === 'ENVIADOS_DTIN') {
        // Status filter de DTIN
        const isEnviado = item.status === 'ENVIADO_DTIN' || !!item.enviadoDtin;
        if (!isEnviado) return false;

        const isTi = activeSectorId === 'sec-ti' || (activeSector?.name || '').toUpperCase().trim() === 'TI' || (activeSector?.name || '').toLowerCase().includes('tecnologia');
        // Se estiver no setor de TI, exibe todos os equipamentos em atendimento no DTIN
        if (!isTi && filterMode === 'MY_SECTOR') {
          if (item.setorId !== activeSectorId) return false;
        }
      } else {
        // Sector filter: quando estiver no modo setor, filtra sempre pelo setor selecionado
        if (filterMode === 'MY_SECTOR') {
          if (item.setorId !== activeSectorId) return false;
        }

        // Demais filtros de Status
        if (statusFilter === 'PENDENTES' && (item.status === 'CONFERIDO' || item.status === 'BAIXADO')) return false;
        if (statusFilter === 'CONFERIDOS' && item.status !== 'CONFERIDO') return false;
        if (statusFilter === 'CAUTELAS' && item.status !== 'EM_CAUTELA') return false;
        if (statusFilter === 'BAIXADOS' && item.status !== 'BAIXADO' && !item.baixado) return false;
      }

      // Text search filter (busca flexível, não exata, multi-termos, com e sem ponto, sem acentos)
      if (deferredSearchTerm) {
        if (!matchesAsset(item, deferredSearchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [assets, activeSectorId, activeSector?.name, filterMode, statusFilter, deferredSearchTerm, duplicateMap]);

  // Ordenação do Dashboard com ícones ordenadores no cabeçalho (para Pendentes e Baixados)
  const [sortField, setSortField] = useState('numeroPatrimonio');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Ordenação exclusiva e INDEPENDENTE para a seção de Conferidos (não afeta itens não conferidos)
  const [conferidosSortField, setConferidosSortField] = useState('numeroPatrimonio'); // 'numeroPatrimonio' | 'descricao'
  const [conferidosSortDirection, setConferidosSortDirection] = useState('asc'); // 'asc' | 'desc'

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAssets = useMemo(() => {
    // MODO DUPLICADOS: Agrupa itens de mesmo patrimônio UM EMBAIXO DO OUTRO para fácil comparação
    if (filterMode === 'DUPLICATES') {
      return [...filteredAssets].sort((a, b) => {
        const dupA = duplicateMap.get(a.id);
        const dupB = duplicateMap.get(b.id);
        const keyA = dupA?.key || String(a.numeroPatrimonio || '');
        const keyB = dupB?.key || String(b.numeroPatrimonio || '');
        const cmpKey = keyA.localeCompare(keyB, undefined, { numeric: true });
        if (cmpKey !== 0) return sortDirection === 'asc' ? cmpKey : -cmpKey;
        
        // Dentro do mesmo patrimônio, ordena pelo nome do setor
        const secA = a.setorNome || '';
        const secB = b.setorNome || '';
        return secA.localeCompare(secB, 'pt-BR');
      });
    }

    // Função de ordenação geral / itens pendentes
    const sortFn = (a, b) => {
      if (sortField === 'numeroPatrimonio') {
        const numA = parseInt(String(a.numeroPatrimonio || '').replace(/\D/g, '').slice(-5), 10) || 0;
        const numB = parseInt(String(b.numeroPatrimonio || '').replace(/\D/g, '').slice(-5), 10) || 0;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      if (sortField === 'quantidade') {
        const qA = Number(a.quantidade || 1);
        const qB = Number(b.quantidade || 1);
        return sortDirection === 'asc' ? qA - qB : qB - qA;
      }

      if (sortField === 'valorOriginal' || sortField === 'valorAtual') {
        const vA = Number(a[sortField] || 0);
        const vB = Number(b[sortField] || 0);
        return sortDirection === 'asc' ? vA - vB : vB - vA;
      }

      const valA = String(a[sortField] || '').toLowerCase();
      const valB = String(b[sortField] || '').toLowerCase();
      return sortDirection === 'asc' 
        ? valA.localeCompare(valB, 'pt-BR') 
        : valB.localeCompare(valA, 'pt-BR');
    };

    // Função de ordenação EXCLUSIVA dos Conferidos (por Patrimônio ou Descrição)
    const conferidosSortFn = (a, b) => {
      if (conferidosSortField === 'numeroPatrimonio') {
        const numA = parseInt(String(a.numeroPatrimonio || '').replace(/\D/g, '').slice(-5), 10) || 0;
        const numB = parseInt(String(b.numeroPatrimonio || '').replace(/\D/g, '').slice(-5), 10) || 0;
        return conferidosSortDirection === 'asc' ? numA - numB : numB - numA;
      }

      if (conferidosSortField === 'descricao') {
        const descA = String(a.descricao || '').toLowerCase();
        const descB = String(b.descricao || '').toLowerCase();
        return conferidosSortDirection === 'asc'
          ? descA.localeCompare(descB, 'pt-BR')
          : descB.localeCompare(descA, 'pt-BR');
      }

      const valA = String(a[conferidosSortField] || '').toLowerCase();
      const valB = String(b[conferidosSortField] || '').toLowerCase();
      return conferidosSortDirection === 'asc' 
        ? valA.localeCompare(valB, 'pt-BR') 
        : valB.localeCompare(valA, 'pt-BR');
    };

    const pendentes = [];
    const conferidos = [];
    const baixados = [];

    filteredAssets.forEach(item => {
      if (item.baixado || item.status === 'BAIXADO') {
        baixados.push(item);
      } else if (item.status === 'CONFERIDO') {
        conferidos.push(item);
      } else {
        pendentes.push(item);
      }
    });

    pendentes.sort(sortFn);
    conferidos.sort(conferidosSortFn);
    baixados.sort(sortFn);

    return [...pendentes, ...conferidos, ...baixados];
  }, [filteredAssets, sortField, sortDirection, conferidosSortField, conferidosSortDirection, filterMode, duplicateMap]);

  // Set indexado de IDs com pedidos pendentes para verificação O(1) de alta performance
  const pendingPedidoAssetIds = useMemo(() => {
    const set = new Set();
    if (Array.isArray(pedidosCarga)) {
      pedidosCarga.forEach(p => {
        if (p.status === 'PENDENTE' && p.assetId) {
          set.add(p.assetId);
        }
      });
    }
    return set;
  }, [pedidosCarga]);

  // Limite progressivo de itens renderizados para ultra performance (60fps mesmo com milhares de itens)
  const [visibleCount, setVisibleCount] = useState(80);
  const sentinelRef = useRef(null);

  // Reseta a paginação ao mudar setor, filtro ou busca
  useEffect(() => {
    setVisibleCount(80);
  }, [deferredSearchTerm, filterMode, statusFilter, activeSectorId]);

  // Observer para rolar e carregar automaticamente mais itens sem congelar
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0] && entries[0].isIntersecting) {
        setVisibleCount(prev => prev + 60);
      }
    }, { rootMargin: '300px' });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [sortedAssets.length]);

  // Recarregar os dados padrões das áreas e bens fornecidos
  const handleResetOfficialData = () => {
    if (confirm('Deseja recarregar a lista oficial de setores e patrimônios das áreas (Studio, Foyer, SACADI, TI, etc.)?')) {
      const { assets: newAssets, cautelas: newCautelas, sectors: newSectors } = resetToDefaultData();
      const sorted = [...newSectors].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
      setSectors(sorted);
      setAssets(newAssets);
      setCautelas(newCautelas);
      if (sorted.length > 0) setActiveSectorId(sorted[0].id);
      showToast('Setores e patrimônios das áreas atualizados com sucesso!');
    }
  };

  // Toggle Conference Status
  const handleToggleConference = (assetId) => {
    if (filterMode === 'ALL_SECTORS') {
      showToast('Na visualização Geral não se confere carga. Selecione o setor correspondente.', 'warning');
      return;
    }
    const itemToCheck = assets.find(a => a.id === assetId);
    const canCheckItem = effectiveUserRole === 'admin' || (
      effectiveUserSectorIds && effectiveUserSectorIds.length > 0 
        ? effectiveUserSectorIds.includes(itemToCheck?.setorId) 
        : (effectiveUserSectorId ? itemToCheck?.setorId === effectiveUserSectorId : true)
    );
    if (!canCheckItem) {
      showToast('Você só pode conferir bens do seu departamento. Use "Fazer Pedido" para este item.', 'warning');
      return;
    }

    // Preservação milimétrica da posição de scroll para não perder o foco na lista
    const savedScrollTop = mainScrollRef.current ? mainScrollRef.current.scrollTop : null;
    const savedWindowY = typeof window !== 'undefined' ? window.scrollY : null;

    const isCurrentlyConferido = itemToCheck?.status === 'CONFERIDO';
    const isNowConferido = !isCurrentlyConferido;

    const updated = assets.map(item => {
      if (item.id === assetId) {
        const nowStr = new Date().toLocaleString('pt-BR');
        
        const updatedItem = {
          ...item,
          status: isNowConferido ? 'CONFERIDO' : 'PENDENTE',
          dataConferencia: isNowConferido ? nowStr : null,
          historico: [
            ...(item.historico || []),
            {
              data: nowStr,
              acao: isNowConferido ? 'Conferência de Carga Realizada' : 'Conferência Desmarcada',
              usuario: currentUser?.displayName || currentUser?.email || activeSector.responsavel
            }
          ]
        };
        saveAssetToCloud(updatedItem);
        return updatedItem;
      }
      return item;
    });

    setAssets(updated);

    // Restaura scroll sem nenhum salto na tela (preserva o foco exatamente onde o operador está)
    if (savedScrollTop !== null) {
      const restoreScroll = () => {
        if (mainScrollRef.current) {
          mainScrollRef.current.scrollTop = savedScrollTop;
        }
        if (savedWindowY !== null && typeof window !== 'undefined') {
          window.scrollTo({ top: savedWindowY, behavior: 'instant' });
        }
      };
      requestAnimationFrame(restoreScroll);
      setTimeout(restoreScroll, 0);
      setTimeout(restoreScroll, 40);
      setTimeout(restoreScroll, 100);
    }
    
    // Check if whole sector reached 100%
    const itemChecked = updated.find(a => a.id === assetId);
    if (itemChecked && itemChecked.status === 'CONFERIDO') {
      const sectorRemaining = updated.filter(a => a.setorId === activeSectorId && a.status !== 'CONFERIDO' && a.status !== 'BAIXADO');
      if (sectorRemaining.length === 0) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        showToast('Parabéns! 100% da carga do setor foi conferida com sucesso!', 'success');
      }
    }
  };

  // Handle QR Code / Barcode Scan Result
  const handleScanSuccess = (code) => {
    const rawClean = String(code || '').trim();
    // Extrai os dígitos para verificar os últimos 5 dígitos de patrimônio
    const digitsOnly = rawClean.replace(/\D/g, '');
    const last5 = digitsOnly.length >= 5 ? digitsOnly.slice(-5) : rawClean;

    setSearchTerm(last5 ? formatLast5Patrimonio(last5) : rawClean);
    const found = assets.find(a => {
      const aNum = String(a.numeroPatrimonio || '').toLowerCase();
      const aLast5 = aNum.length >= 5 ? aNum.slice(-5) : aNum;
      return aNum === rawClean.toLowerCase() || (last5 && aLast5 === last5);
    });

    if (found) {
      if (found.setorId === activeSectorId) {
        showToast(`Item ${formatLast5Patrimonio(found.numeroPatrimonio)} (${found.descricao}) localizado!`);
      } else {
        showToast(`⚠️ Atenção: Item ${formatLast5Patrimonio(found.numeroPatrimonio)} pertence ao setor ${found.setorNome} (${found.responsavel})!`, 'warning');
      }
    } else {
      showToast(`Código ${rawClean} lido. Não encontrado na base atual.`, 'info');
    }
  };

  // Direct Voice Search Handler (Busca por voz inteligente com suporte a múltiplos resultados por descrição)
  const handleVoiceDirectSearch = (spokenText) => {
    if (!spokenText || !spokenText.trim()) return;

    const rawClean = spokenText.trim();
    const digitsOnly = rawClean.replace(/\D/g, '');
    const nonDigitChars = rawClean.replace(/[\d\s.,\-_/]/g, '');

    // Se for uma busca estritamente numérica por número de patrimônio (ex: "42542", "42.542", "42 542")
    const isStrictNumericSearch = digitsOnly.length >= 3 && nonDigitChars.length === 0;

    if (isStrictNumericSearch) {
      const last5 = digitsOnly.length >= 5 ? digitsOnly.slice(-5) : digitsOnly;
      const foundAsset = assets.find(a => {
        const aNum = String(a.numeroPatrimonio || '').trim();
        const aDigits = aNum.replace(/\D/g, '');
        const aLast5 = aDigits.length >= 5 ? aDigits.slice(-5) : aDigits;
        return aNum === rawClean || aDigits === digitsOnly || (last5 && aLast5 === last5) || (digitsOnly && aDigits.endsWith(digitsOnly));
      });

      if (foundAsset) {
        if (filterMode !== 'ALL_SECTORS' && foundAsset.setorId !== activeSectorId) {
          setActiveSectorId(foundAsset.setorId);
          showToast(`🎯 Encontrado no setor "${foundAsset.setorNome}": ${formatLast5Patrimonio(foundAsset.numeroPatrimonio)} - ${foundAsset.descricao}`, 'success');
        } else {
          showToast(`🎯 Encontrado: ${formatLast5Patrimonio(foundAsset.numeroPatrimonio)} - ${foundAsset.descricao}`, 'success');
        }
        setSearchTerm(formatLast5Patrimonio(foundAsset.numeroPatrimonio));
        return;
      }
    }

    // Busca textual por descrição / múltiplos bens (ex: "mesa quadrada", "cadeira", "monitor", etc.)
    setSearchTerm(rawClean);

    // Conta quantos itens correspondem no setor atual e no geral
    const currentSectorMatches = assets.filter(a => a.setorId === activeSectorId && matchesAsset(a, rawClean));
    const allMatches = assets.filter(a => matchesAsset(a, rawClean));

    if (currentSectorMatches.length > 0) {
      showToast(`🎙️ Voz: "${rawClean}" (${currentSectorMatches.length} iten${currentSectorMatches.length === 1 ? '' : 's'} no setor)`, 'info');
    } else if (allMatches.length > 0) {
      // Se não tem no setor atual mas todos pertencem a outro setor específico, comuta para o setor correspondente
      const uniqueSectors = [...new Set(allMatches.map(a => a.setorId))];
      if (uniqueSectors.length === 1 && filterMode === 'MY_SECTOR') {
        const targetSectorId = uniqueSectors[0];
        const targetSector = sectors.find(s => s.id === targetSectorId);
        setActiveSectorId(targetSectorId);
        showToast(`🎙️ Voz: "${rawClean}" (${allMatches.length} iten${allMatches.length === 1 ? '' : 's'} no setor ${targetSector?.name || ''})`, 'info');
      } else {
        showToast(`🎙️ Voz: "${rawClean}" (${allMatches.length} iten${allMatches.length === 1 ? '' : 's'} encontrados)`, 'info');
      }
    } else {
      showToast(`🎙️ Voz: "${rawClean}" (Nenhum item correspondente)`, 'info');
    }
  };

  // Open Transfer Modal for an asset
  const handleOpenTransferModal = (asset) => {
    if (filterMode === 'ALL_SECTORS') {
      showToast('Na visualização Geral não se transfere carga. Entre na aba do setor do bem.', 'warning');
      return;
    }
    setAssetForTransfer(asset);
    setIsTransferModalOpen(true);
  };

  // Confirm Transfer
  const handleConfirmTransfer = (assetId, transferDetails) => {
    const nowStr = new Date().toLocaleString('pt-BR');
    const updated = assets.map(item => {
      if (item.id === assetId) {
        const updatedItem = {
          ...item,
          setorId: transferDetails.setorId,
          setorNome: transferDetails.setorNome,
          responsavel: transferDetails.responsavel,
          localizacao: transferDetails.localizacao,
          historico: [
            ...(item.historico || []),
            { 
              data: nowStr, 
              acao: `Transferência de Carga: de ${item.setorNome} para ${transferDetails.setorNome}. Motivo: ${transferDetails.motivo}`, 
              usuario: currentUser?.displayName || currentUser?.email || activeSector.responsavel 
            }
          ]
        };
        saveAssetToCloud(updatedItem);
        return updatedItem;
      }
      return item;
    });

    setAssets(updated);
    showToast(`Bem transferido com sucesso para ${transferDetails.setorNome}!`);
  };

  // Atualizar localização rápida do bem (por digitação, escolha ou microfone)
  const handleUpdateAssetLocation = (assetId, newLocation, servidorData = null) => {
    let serv = servidorData;
    if (!serv && newLocation) {
      serv = servidores.find(s => newLocation.toLowerCase().includes(s.nome.toLowerCase()));
    }

    const updated = assets.map(item => {
      if (item.id === assetId) {
        const updatedItem = {
          ...item,
          localizacao: newLocation,
          servidorId: serv ? serv.id : (item.servidorId || null),
          servidorNome: serv ? serv.nome : (item.servidorNome || null),
          servidorTelefone: serv ? (serv.telefone || item.servidorTelefone || null) : (item.servidorTelefone || null)
        };
        saveAssetToCloud(updatedItem);
        return updatedItem;
      }
      return item;
    });
    setAssets(updated);
    showToast(`Localização atualizada: "${newLocation}"${serv ? ` • Vinculado a ${serv.nome}` : ''}`);
  };

  // Salvar Servidor (Criar ou Editar)
  const handleSaveServidor = (servidorData) => {
    const existingIndex = servidores.findIndex(s => s.id === servidorData.id);
    let updatedList;
    if (existingIndex >= 0) {
      updatedList = servidores.map(s => s.id === servidorData.id ? servidorData : s);
      showToast(`Servidor "${servidorData.nome}" atualizado com sucesso!`, 'success');
    } else {
      updatedList = [servidorData, ...servidores];
      showToast(`Servidor "${servidorData.nome}" cadastrado com sucesso!`, 'success');
    }
    setServidores(updatedList);
    saveServidorToCloud(servidorData);
    try {
      localStorage.setItem('carga_patrimonio_servidores', JSON.stringify(updatedList));
    } catch (e) {}

    // Se editou o nome ou telefone de um servidor existente, propaga aos bens vinculados
    if (existingIndex >= 0) {
      const updatedAssetsList = [];
      const updatedAssets = assets.map(a => {
        if (a.servidorId === servidorData.id) {
          const up = {
            ...a,
            servidorNome: servidorData.nome,
            servidorTelefone: servidorData.telefone || a.servidorTelefone
          };
          updatedAssetsList.push(up);
          return up;
        }
        return a;
      });
      if (updatedAssetsList.length > 0) {
        setAssets(updatedAssets);
        saveAssetsBatchToCloud(updatedAssetsList);
      }
    }
  };

  // Salvar Lote de Servidores (Importação)
  const handleSaveServidoresBatch = (newServidoresList) => {
    if (!newServidoresList || newServidoresList.length === 0) return;
    const updatedList = [...newServidoresList, ...servidores];
    setServidores(updatedList);
    saveServidoresBatchToCloud(newServidoresList);
    try {
      localStorage.setItem('carga_patrimonio_servidores', JSON.stringify(updatedList));
    } catch (e) {}
    showToast(`${newServidoresList.length} servidores importados com sucesso!`, 'success');
  };

  // Excluir Servidor
  const handleDeleteServidor = (servidorId) => {
    const s = servidores.find(item => item.id === servidorId);
    const updatedList = servidores.filter(item => item.id !== servidorId);
    setServidores(updatedList);
    deleteServidorFromCloud(servidorId);
    try {
      localStorage.setItem('carga_patrimonio_servidores', JSON.stringify(updatedList));
    } catch (e) {}
    showToast(`Servidor "${s ? s.nome : ''}" removido.`, 'info');
  };

  // Filtrar todos os bens do servidor no painel geral com garantia total de exibição
  const handleSelectServidorToFilter = (servidorNome) => {
    setFilterMode('ALL_SECTORS');
    setStatusFilter('ALL');
    setSearchTerm(servidorNome || '');
    setIsServidoresModalOpen(false);
  };

  // Ir diretamente para o local do patrimônio (setor + pesquisa) com garantia 100% de funcionar e ver
  const handleGoToAsset = (asset) => {
    if (asset.setorId) {
      setActiveSectorId(asset.setorId);
      setFilterMode('MY_SECTOR');
    } else {
      setFilterMode('ALL_SECTORS');
    }
    setStatusFilter('ALL');
    const term = asset.numeroPatrimonio ? formatLast5Patrimonio(asset.numeroPatrimonio) : (asset.descricao || '');
    setSearchTerm(term);
    setIsServidoresModalOpen(false);
    showToast(`📍 Visualizando bem ${formatLast5Patrimonio(asset.numeroPatrimonio)} (${asset.setorNome || 'Setor'})`, 'info');
  };

  // Desvincular / Excluir bem patrimonial do servidor diretamente do modal
  const handleUnlinkAssetFromServidor = (assetId, servidor) => {
    const servNome = (servidor?.nome || '').toLowerCase().trim();
    let numPatrimonio = '';

    const updatedAssets = assets.map(a => {
      if (a.id === assetId) {
        numPatrimonio = formatLast5Patrimonio(a.numeroPatrimonio);
        const copy = { ...a };
        copy.servidorId = null;
        copy.servidorNome = null;
        copy.servidorTelefone = null;
        copy.servidorMesa = null;
        if (copy.observacao && copy.observacao.toLowerCase().trim() === servNome) {
          copy.observacao = '';
        }
        if (copy.localizacao && copy.localizacao.toLowerCase().trim() === servNome) {
          copy.localizacao = '';
        }
        copy.updatedAt = new Date().toISOString();
        return copy;
      }
      return a;
    });

    setAssets(updatedAssets);
    saveLocalAssets(updatedAssets);
    const changedItem = updatedAssets.find(a => a.id === assetId);
    if (changedItem && isFirebaseActive) {
      saveAssetToCloud(changedItem).catch(err => console.warn('Erro ao sincronizar desvinculação na nuvem:', err));
    }
    showToast(`🗑️ Patrimônio ${numPatrimonio} desvinculado de ${servidor?.nome || ''}!`, 'success');
  };

  // Atribuir Servidor em Lote aos itens selecionados
  const handleBulkAssignServidor = (servidor) => {
    if (selectedAssetIds.size === 0) return;

    // Filtra estritamente apenas os bens que pertencem ao usuário/setor sob sua responsabilidade
    const manageableAssetsList = assets.filter(item => selectedAssetIds.has(item.id) && canUserManageAsset(item));
    if (manageableAssetsList.length === 0) {
      showToast('Apenas o responsável pela carga dos bens pode atribuir servidores a eles.', 'error');
      setSelectedAssetIds(new Set());
      return;
    }

    const count = manageableAssetsList.length;
    const manageableSet = new Set(manageableAssetsList.map(a => a.id));
    const updatedAssetsList = [];
    const updatedAssets = assets.map(item => {
      if (manageableSet.has(item.id)) {
        const newLoc = servidor
          ? (item.localizacao && !item.localizacao.toLowerCase().includes('mesa') ? item.localizacao : (servidor.mesa ? `Mesa da ${servidor.nome} (${servidor.mesa})` : `Mesa da ${servidor.nome}`))
          : item.localizacao;
        const updatedItem = {
          ...item,
          servidorId: servidor ? servidor.id : null,
          servidorNome: servidor ? servidor.nome : null,
          servidorTelefone: servidor ? (servidor.telefone || null) : null,
          localizacao: newLoc
        };
        updatedAssetsList.push(updatedItem);
        return updatedItem;
      }
      return item;
    });

    if (updatedAssetsList.length > 0) {
      saveAssetsBatchToCloud(updatedAssetsList);
    }
    setAssets(updatedAssets);
    setSelectedAssetIds(new Set());
    showToast(
      servidor
        ? `${count} ${count === 1 ? 'item atribuído' : 'itens atribuídos'} à mesa de ${servidor.nome}!`
        : `${count} ${count === 1 ? 'item desvinculado' : 'itens desvinculados'} de servidor.`,
      'success'
    );
  };

  // Atualizar observação rápida do bem (inline, por digitação, voz ou seleção de servidor)
  const handleUpdateAssetObservation = (assetId, newObservation, servidorObj = null) => {
    const updated = assets.map(item => {
      if (item.id === assetId) {
        const updatedItem = {
          ...item,
          observacao: newObservation,
          ...(servidorObj ? {
            servidorId: servidorObj.id || null,
            servidorNome: servidorObj.nome || null,
            servidorTelefone: servidorObj.telefone || null,
            servidorMesa: servidorObj.mesa || null
          } : {
            servidorId: null,
            servidorNome: null,
            servidorTelefone: null,
            servidorMesa: null
          })
        };
        saveAssetToCloud(updatedItem);
        return updatedItem;
      }
      return item;
    });
    setAssets(updated);
    showToast(newObservation ? `Com quem está: "${newObservation}"` : 'Com quem está limpo');
  };

  // Alterar cor de destaque da linha/card do bem
  const handleUpdateAssetColor = (assetId, color) => {
    const updated = assets.map(item => {
      if (item.id === assetId) {
        const updatedItem = {
          ...item,
          cardColor: color === 'default' ? null : color
        };
        saveAssetToCloud(updatedItem);
        return updatedItem;
      }
      return item;
    });
    setAssets(updated);
  };

  // Criar Pedido / Solicitação de Carga de Bem de Outro Setor
  const handleCreatePedido = (pedidoData) => {
    const newPedido = {
      ...pedidoData,
      id: `ped-${Date.now()}`
    };
    const nowStr = new Date().toLocaleString('pt-BR');
    
    // Atualiza o histórico do bem informando o pedido
    const updatedAssets = assets.map(a => {
      if (a.id === pedidoData.assetId) {
        const updatedItem = {
          ...a,
          historico: [
            ...(a.historico || []),
            {
              data: nowStr,
              acao: `Pedido de Carga: Informado pertencer ao setor ${pedidoData.setorDestinoNome}. Motivo: ${pedidoData.motivo}`,
              usuario: pedidoData.solicitanteNome
            }
          ]
        };
        saveAssetToCloud(updatedItem);
        return updatedItem;
      }
      return a;
    });

    setAssets(updatedAssets);
    setPedidosCarga(prev => [newPedido, ...prev]);
    savePedidoToCloud(newPedido);
    showToast(`Pedido enviado com sucesso! O responsável do setor ${pedidoData.setorDestinoNome} e a administração foram informados.`, 'success');
  };

  // Aprovar Pedido de Carga
  const handleAprovarPedido = (pedido) => {
    handleConfirmTransfer(pedido.assetId, {
      setorId: pedido.setorDestinoId,
      setorNome: pedido.setorDestinoNome,
      responsavel: pedido.responsavelDestino,
      localizacao: pedido.localizacaoFisica || pedido.setorDestinoNome,
      motivo: `Aprovação de pedido de carga enviado por ${pedido.solicitanteNome}: "${pedido.motivo}"`
    });

    const updatedPedido = { ...pedido, status: 'APROVADO' };
    setPedidosCarga(prev => prev.map(p => p.id === pedido.id ? updatedPedido : p));
    savePedidoToCloud(updatedPedido);
    showToast(`Pedido aprovado com sucesso! Bem ${formatLast5Patrimonio(pedido.numeroPatrimonio)} transferido para ${pedido.setorDestinoNome}.`, 'success');
  };

  // Aprovar Todos os Pedidos de Carga em Lote
  const handleAprovarTodosPedidos = async (pedidosList) => {
    if (!pedidosList || pedidosList.length === 0) return;

    const nowStr = new Date().toLocaleString('pt-BR');
    const userLabel = currentUser?.displayName || currentUser?.email || activeSector?.responsavel || 'Operador';
    
    // Mapear pedidos por assetId e número de patrimônio
    const pedidoByAssetId = new Map();
    pedidosList.forEach(p => {
      if (p.assetId) pedidoByAssetId.set(String(p.assetId), p);
      if (p.numeroPatrimonio) pedidoByAssetId.set(String(p.numeroPatrimonio), p);
    });

    const updatedAssetsList = [];
    const updatedAssets = assets.map(item => {
      const pedido = pedidoByAssetId.get(String(item.id)) || pedidoByAssetId.get(String(item.numeroPatrimonio));
      if (pedido) {
        const updatedItem = {
          ...item,
          setorId: pedido.setorDestinoId,
          setorNome: pedido.setorDestinoNome,
          responsavel: pedido.responsavelDestino,
          localizacao: pedido.localizacaoFisica || pedido.setorDestinoNome,
          historico: [
            ...(item.historico || []),
            {
              data: nowStr,
              acao: `Transferência de Carga: de ${item.setorNome} para ${pedido.setorDestinoNome}. Motivo: Aprovação de pedido de carga enviado por ${pedido.solicitanteNome}: "${pedido.motivo || ''}"`,
              usuario: userLabel
            }
          ]
        };
        updatedAssetsList.push(updatedItem);
        return updatedItem;
      }
      return item;
    });

    // Salvar bens alterados no Cloud em lote
    if (updatedAssetsList.length > 0) {
      await saveAssetsBatchToCloud(updatedAssetsList);
    }
    setAssets(updatedAssets);

    // Atualizar status de todos os pedidos para APROVADO
    const approvedIds = new Set(pedidosList.map(p => String(p.id)));
    const updatedPedidosList = [];
    const updatedPedidos = pedidosCarga.map(p => {
      if (approvedIds.has(String(p.id))) {
        const updatedP = { ...p, status: 'APROVADO' };
        updatedPedidosList.push(updatedP);
        return updatedP;
      }
      return p;
    });

    // Salvar pedidos alterados no Cloud em lote
    await savePedidosBatchToCloud(updatedPedidosList);
    setPedidosCarga(updatedPedidos);
    try {
      localStorage.setItem('carga_patrimonio_pedidos', JSON.stringify(updatedPedidos));
    } catch (e) {
      // quota fallback
    }

    showToast(`${pedidosList.length} ${pedidosList.length === 1 ? 'pedido aceito e transferido' : 'pedidos aceitos e transferidos'} com sucesso!`, 'success');
  };

  // Recusar Pedido de Carga
  const handleRecusarPedido = (pedidoId) => {
    const existing = pedidosCarga.find(p => p.id === pedidoId);
    const updatedPedido = existing ? { ...existing, status: 'RECUSADO' } : { id: pedidoId, status: 'RECUSADO' };
    setPedidosCarga(prev => prev.map(p => p.id === pedidoId ? updatedPedido : p));
    savePedidoToCloud(updatedPedido);
    showToast('Pedido arquivado como recusado.', 'info');
  };

  // Excluir registro individual do histórico de pedidos
  const handleExcluirHistoricoPedido = async (pedidoId) => {
    const updated = pedidosCarga.filter(p => p.id !== pedidoId);
    setPedidosCarga(updated);
    try {
      localStorage.setItem('carga_patrimonio_pedidos', JSON.stringify(updated));
    } catch (e) {}
    await deletePedidoFromCloud(pedidoId);
    showToast('Registro do histórico excluído com sucesso.', 'info');
  };

  // Excluir todo o histórico de pedidos (aprovados e recusados)
  const handleLimparHistoricoPedidos = async () => {
    const toDeleteIds = pedidosCarga.filter(p => p.status !== 'PENDENTE').map(p => p.id);
    const remaining = pedidosCarga.filter(p => p.status === 'PENDENTE');
    setPedidosCarga(remaining);
    try {
      localStorage.setItem('carga_patrimonio_pedidos', JSON.stringify(remaining));
    } catch (e) {}
    if (toDeleteIds.length > 0) {
      await deletePedidosBatchFromCloud(toDeleteIds);
    }
    showToast('Todo o histórico de pedidos foi excluído.', 'info');
  };

  // Save New or Edited Asset
  const handleSaveAsset = (assetData) => {
    if (assetToEdit) {
      const updatedItem = { ...assetToEdit, ...assetData };
      const updated = assets.map(a => a.id === assetToEdit.id ? updatedItem : a);
      setAssets(updated);
      saveAssetToCloud(updatedItem);
      showToast('Patrimônio atualizado com sucesso!');
    } else {
      const newAsset = {
        ...assetData,
        id: `ast-${Date.now()}`,
        status: 'PENDENTE',
        dataConferencia: null,
        dataCriacao: new Date().toISOString(),
        historico: [
          {
            data: new Date().toLocaleString('pt-BR'),
            acao: 'Cadastro de Patrimônio no Sistema',
            usuario: currentUser?.displayName || currentUser?.email || activeSector?.responsavel || 'Operador'
          }
        ]
      };
      setAssets([newAsset, ...assets]);
      saveAssetToCloud(newAsset);
      showToast('Novo bem cadastrado com sucesso!');
    }
    setIsAssetModalOpen(false);
    setAssetToEdit(null);
  };

  // Delete Asset Modal (com proteção de motivo obrigatório e confirmação de ciência)
  const handleDeleteAsset = (assetOrId) => {
    const asset = typeof assetOrId === 'object' ? assetOrId : assets.find(a => a.id === assetOrId);
    if (!asset) return;
    setAssetToDelete(asset);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteAsset = (assetId, dadosExclusao) => {
    const asset = assets.find(a => a.id === assetId);
    const numPat = asset ? formatPatrimonio(asset.numeroPatrimonio) : assetId;

    // Remove da lista de bens
    const remainingAssets = assets.filter(a => a.id !== assetId);
    setAssets(remainingAssets);
    saveLocalAssets(remainingAssets);

    // Remove cautelas associadas se houver
    const remainingCautelas = cautelas.filter(c => c.assetId !== assetId);
    setCautelas(remainingCautelas);
    saveLocalCautelas(remainingCautelas);

    // Remove da nuvem (Firestore)
    deleteAssetFromCloud(assetId);

    setIsDeleteModalOpen(false);
    setAssetToDelete(null);

    showToast(`🗑️ Bem Nº ${numPat} excluído com sucesso. Motivo: ${dadosExclusao.motivo}`, 'info');
  };

  // Save Sector
  const handleSaveSector = (sectorData) => {
    const isExisting = sectors.some(s => s.id === sectorData.id);
    let updated;
    let savedSec;
    if (isExisting) {
      savedSec = sectorData;
      updated = sectors.map(s => s.id === sectorData.id ? sectorData : s);
      showToast(`Setor "${sectorData.name}" atualizado com sucesso!`);
    } else {
      savedSec = {
        ...sectorData,
        id: sectorData.id || `sec-${Date.now()}`
      };
      updated = [...sectors, savedSec];
      setActiveSectorId(savedSec.id);
      setFilterMode('MY_SECTOR');
      showToast(`Novo setor "${savedSec.name}" cadastrado com sucesso!`);
    }
    updated.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
    setSectors(updated);
    saveLocalSectors(updated);
    saveSectorToCloud(savedSec);
  };

  // Delete Sector
  const handleDeleteSector = (sectorId, reassignToSectorId) => {
    if (reassignToSectorId) {
      const targetSec = sectors.find(s => s.id === reassignToSectorId);
      const reassignedAssets = assets.map(a => {
        if (a.setorId === sectorId) {
          const updatedA = {
            ...a,
            setorId: reassignToSectorId,
            setorNome: targetSec?.name || a.setorNome,
            responsavel: targetSec?.responsavel || a.responsavel
          };
          saveAssetToCloud(updatedA);
          return updatedA;
        }
        return a;
      });
      setAssets(reassignedAssets);
      saveLocalAssets(reassignedAssets);
    } else {
      const count = assets.filter(a => a.setorId === sectorId).length;
      if (count > 0) {
        alert(`Não é possível excluir este setor porque existem ${count} bens vinculados a ele sem reatribuição.`);
        return;
      }
    }

    const updatedSectors = sectors.filter(s => s.id !== sectorId);
    updatedSectors.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
    setSectors(updatedSectors);
    saveLocalSectors(updatedSectors);
    deleteSectorFromCloud(sectorId);
    if (activeSectorId === sectorId) {
      if (updatedSectors.length > 0) setActiveSectorId(updatedSectors[0].id);
    }
    showToast('Setor removido com sucesso.', 'info');
  };

  // Limpar / Zerar todos os bens de um setor específico (Abre modal central moderno)
  const handleClearSectorAssets = (sectorId) => {
    const sec = sectors.find(s => s.id === sectorId);
    const secName = sec ? sec.name : 'Setor';
    const count = assets.filter(a => a.setorId === sectorId).length;

    if (count === 0) {
      showToast(`O setor "${secName}" não possui nenhum bem cadastrado.`, 'info');
      return;
    }

    setSectorToClear({
      id: sectorId,
      name: secName,
      count,
      responsavel: sec?.responsavel || 'Não informado',
      sala: sec?.sala || ''
    });
  };

  // Execução da exclusão dos bens após confirmação no modal
  const handleExecuteClearSector = async () => {
    if (!sectorToClear) return;
    const { id: sectorId, name: secName, count } = sectorToClear;
    setIsClearingSector(true);

    try {
      // Filtra e remove os bens do setor
      const remainingAssets = assets.filter(a => a.setorId !== sectorId);
      setAssets(remainingAssets);
      saveLocalAssets(remainingAssets);

      // Limpa cautelas e pedidos vinculados aos bens apagados
      const deletedAssetIds = new Set(assets.filter(a => a.setorId === sectorId).map(a => a.id));
      const remainingCautelas = cautelas.filter(c => !deletedAssetIds.has(c.assetId));
      setCautelas(remainingCautelas);
      saveLocalCautelas(remainingCautelas);

      // Se Firebase estiver ativo, remove os documentos no Firestore
      if (isFirebaseActive) {
        try {
          const { collection, getDocs, deleteDoc, doc, query, where } = await import('firebase/firestore');
          const { db } = initFirebase();
          if (db) {
            const snap = await getDocs(query(collection(db, 'assets'), where('setorId', '==', sectorId)));
            const delPromises = snap.docs.map(d => deleteDoc(doc(db, 'assets', d.id)));
            await Promise.all(delPromises);
          }
        } catch (fbErr) {
          console.warn('Erro ao limpar bens do setor no Firebase:', fbErr);
        }
      }

      showToast(`🧹 Todos os ${count} bens do setor "${secName}" foram excluídos com sucesso!`);
      setSectorToClear(null);
    } catch (err) {
      console.error(err);
      showToast('Erro ao excluir bens do setor.', 'warning');
    } finally {
      setIsClearingSector(false);
    }
  };

  // Abre Modal de Confirmação para Alteração em Lote (Tornar Todos Pendentes ou Conferidos)
  const handleOpenBatchStatusChange = ({ targetType, sectorId, sectorName, newStatus }) => {
    let targetAssets = [];
    let titleSectorName = '';

    if (targetType === 'SECTOR') {
      const sec = sectors.find(s => s.id === sectorId);
      titleSectorName = sectorName || sec?.name || 'Setor Selecionado';
      if (newStatus === 'PENDENTE') {
        targetAssets = assets.filter(a => a.setorId === sectorId && a.status === 'CONFERIDO');
      } else {
        targetAssets = assets.filter(a => a.setorId === sectorId && a.status !== 'CONFERIDO' && a.status !== 'BAIXADO');
      }
    } else {
      titleSectorName = 'Toda a Carga Geral (Todos os Setores)';
      if (newStatus === 'PENDENTE') {
        targetAssets = assets.filter(a => a.status === 'CONFERIDO');
      } else {
        targetAssets = assets.filter(a => a.status !== 'CONFERIDO' && a.status !== 'BAIXADO');
      }
    }

    if (targetAssets.length === 0) {
      showToast(
        newStatus === 'PENDENTE' 
          ? 'Nenhum bem conferido encontrado para alterar.' 
          : 'Todos os bens já estão conferidos ou baixados.',
        'info'
      );
      return;
    }

    setBatchStatusModalData({
      targetType,
      sectorId,
      sectorName: titleSectorName,
      newStatus,
      targetAssets,
      count: targetAssets.length
    });
  };

  // Executa a alteração em lote com sincronização no Firestore
  const handleExecuteBatchStatusChange = async () => {
    if (!batchStatusModalData) return;
    const { targetAssets, newStatus, sectorName } = batchStatusModalData;
    setIsProcessingBatchStatus(true);

    try {
      const now = new Date().toISOString();
      const updatedList = targetAssets.map(a => ({
        ...a,
        status: newStatus,
        conferidoEm: newStatus === 'CONFERIDO' ? now : null,
        conferidoPor: newStatus === 'CONFERIDO' ? (currentUser?.displayName || 'Operador') : null,
        updatedAt: now
      }));

      const targetIdMap = new Map(updatedList.map(u => [u.id, u]));
      const newAllAssets = assets.map(a => targetIdMap.get(a.id) || a);

      setAssets(newAllAssets);
      saveLocalAssets(newAllAssets);

      if (isFirebaseActive) {
        await saveAssetsBatchToCloud(updatedList);
      }

      showToast(
        newStatus === 'CONFERIDO'
          ? `✅ ${updatedList.length} bens de "${sectorName}" marcados como CONFERIDOS!`
          : `🔄 ${updatedList.length} bens de "${sectorName}" marcados como PENDENTES!`,
        'success'
      );
      setBatchStatusModalData(null);
    } catch (err) {
      console.error('Erro ao atualizar bens em lote:', err);
      showToast('Erro ao processar alteração em lote na nuvem.', 'error');
    } finally {
      setIsProcessingBatchStatus(false);
    }
  };

  // Open Cautela creation for an asset
  const handleOpenCautela = (asset) => {
    setAssetForCautela(asset);
    setIsCautelaModalOpen(true);
  };

  // Save Cautela
  const handleSaveCautela = (cautelaData) => {
    const pessoa = cautelaData.responsavelRetirada || cautelaData.nomeResponsavel || 'Jean';
    const destino = cautelaData.setorDestino || 'ASCOM';
    const doc = cautelaData.documento || cautelaData.matricula || '';

    const newCautela = {
      ...cautelaData,
      id: `caut-${Date.now()}`,
      responsavelRetirada: pessoa,
      nomeResponsavel: pessoa,
      setorDestino: destino,
      documento: doc,
      matricula: doc,
      dataEmissao: new Date().toISOString().split('T')[0],
      status: 'EM_ANDAMENTO'
    };

    setCautelas([newCautela, ...cautelas]);
    saveCautelaToCloud(newCautela);

    // Update asset status
    const updated = assets.map(a => {
      if (a.id === cautelaData.assetId) {
        const updatedItem = {
          ...a,
          status: 'EM_CAUTELA',
          cautelaAtual: {
            id: newCautela.id,
            responsavel: pessoa,
            responsavelRetirada: pessoa,
            setorDestino: destino,
            setorOrigem: cautelaData.setorOrigem || a.setorNome,
            documento: doc,
            matricula: doc,
            telefone: cautelaData.telefone,
            dataRetirada: cautelaData.dataRetirada || new Date().toLocaleString('pt-BR'),
            dataPrevisaoDevolucao: cautelaData.dataPrevistaDevolucao || cautelaData.dataPrevisaoDevolucao,
            dataPrevistaDevolucao: cautelaData.dataPrevistaDevolucao || cautelaData.dataPrevisaoDevolucao,
            finalidade: cautelaData.finalidade,
            observacoes: cautelaData.observacoes
          },
          historico: [
            ...(a.historico || []),
            { 
              data: new Date().toLocaleString('pt-BR'), 
              acao: `Empréstimo (Cautela): Está com ${destino} (${pessoa})`, 
              usuario: currentUser?.displayName || currentUser?.email || activeSector.responsavel 
            }
          ]
        };
        saveAssetToCloud(updatedItem);
        return updatedItem;
      }
      return a;
    });

    setAssets(updated);
    setIsCautelaModalOpen(false);
    setAssetForCautela(null);
    showToast(`Cautela registrada: Está com ${destino} (${pessoa})!`);
  };

  // Return Cautela
  const handleReturnCautela = (cautelaId, observacoesDevolucao) => {
    const cautela = cautelas.find(c => c.id === cautelaId);
    if (!cautela) return;

    const nowStr = new Date().toLocaleString('pt-BR');
    const updatedCautela = {
      ...cautela,
      status: 'DEVOLVIDO',
      dataDevolucaoReal: nowStr,
      observacoesDevolucao
    };

    // Update cautela
    setCautelas(cautelas.map(c => c.id === cautelaId ? updatedCautela : c));
    saveCautelaToCloud(updatedCautela);

    // Update asset
    setAssets(assets.map(a => {
      if (a.id === cautela.assetId) {
        const updatedItem = {
          ...a,
          status: 'PENDENTE',
          cautelaAtual: null,
          historico: [
            ...(a.historico || []),
            { 
              data: nowStr, 
              acao: `Devolução de Cautela confirmada. Observação: ${observacoesDevolucao || 'Sem observações'}`, 
              usuario: currentUser?.displayName || currentUser?.email || activeSector.responsavel 
            }
          ]
        };
        saveAssetToCloud(updatedItem);
        return updatedItem;
      }
      return a;
    }));

    showToast('Devolução de cautela registrada com sucesso!');
  };

  // Open Baixa Modal
  const handleOpenBaixa = (asset) => {
    setAssetForBaixa(asset);
    setIsBaixaModalOpen(true);
  };

  // Confirm Baixa
  const handleConfirmBaixa = (assetId, dadosBaixa) => {
    const updated = assets.map(a => {
      if (a.id === assetId) {
        const updatedItem = {
          ...a,
          status: 'BAIXADO',
          baixado: true,
          dadosBaixa: {
            ...dadosBaixa,
            dataHoraRegistro: new Date().toISOString()
          },
          historico: [
            ...(a.historico || []),
            { 
              data: dadosBaixa.data, 
              acao: `Baixa Patrimonial: ${dadosBaixa.motivo}`, 
              usuario: currentUser?.displayName || currentUser?.email || activeSector.responsavel 
            }
          ]
        };
        saveAssetToCloud(updatedItem);
        return updatedItem;
      }
      return a;
    });
    setAssets(updated);
    showToast('Baixa patrimonial realizada com sucesso!');
  };

  // Cancel Baixa (Reativar bem)
  const handleCancelBaixa = (assetId) => {
    const nowStr = new Date().toLocaleString('pt-BR');
    const updated = assets.map(a => {
      if (a.id === assetId) {
        const updatedItem = {
          ...a,
          status: 'PENDENTE',
          baixado: false,
          dadosBaixa: null,
          historico: [
            ...(a.historico || []),
            { 
              data: nowStr, 
              acao: 'Cancelamento de Baixa: Bem reativado no setor', 
              usuario: currentUser?.displayName || currentUser?.email || activeSector.responsavel 
            }
          ]
        };
        saveAssetToCloud(updatedItem);
        return updatedItem;
      }
      return a;
    });
    setAssets(updated);
    showToast('Baixa cancelada e bem reativado com sucesso!');
  };

  // Open DTIN Modal
  const handleOpenDtin = (asset) => {
    setAssetForDtin(asset);
    setIsDtinModalOpen(true);
  };

  // Confirm Envio ao DTIN
  const handleConfirmDtin = (assetId, dadosDtin, newAssetData = null) => {
    const nowStr = new Date().toLocaleString('pt-BR');

    // Se for um cadastro de novo equipamento fora da carga
    if (newAssetData) {
      const isTiSector = newAssetData.setorId === 'sec-ti' || 
                         (newAssetData.setorNome || '').toUpperCase().trim() === 'TI' || 
                         (newAssetData.responsavel || '').toLowerCase().includes('santana');

      const newAsset = {
        id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        numeroPatrimonio: newAssetData.numeroPatrimonio.trim(),
        descricao: newAssetData.descricao.trim(),
        setorId: newAssetData.setorId || activeSectorId || 'sec-ti',
        setorNome: newAssetData.setorNome || activeSector?.name || 'TI',
        responsavel: newAssetData.responsavel || activeSector?.responsavel || 'Responsável',
        localizacao: newAssetData.localizacao || '',
        numeroSerie: newAssetData.numeroSerie || '',
        status: isTiSector ? 'ENVIADO_DTIN' : 'ATIVO',
        enviadoDtin: isTiSector,
        dadosDtin: isTiSector ? {
          ...dadosDtin,
          dataHoraRegistro: new Date().toISOString()
        } : null,
        pendenciaDtin: !isTiSector ? {
          id: `dtin-pend-${Date.now()}`,
          ...dadosDtin,
          solicitante: dadosDtin.responsavel || 'Santana',
          status: 'PENDENTE',
          dataRegistro: new Date().toISOString()
        } : null,
        dataAquisicao: dadosDtin.data || new Date().toLocaleDateString('pt-BR'),
        valorOriginal: 0,
        valorAtual: 0,
        historico: [
          {
            data: dadosDtin.data || nowStr,
            acao: isTiSector
              ? `Cadastrado e Enviado ao DTIN por Santana (TI): ${dadosDtin.motivo}${dadosDtin.chamado ? ` (Chamado/OS: ${dadosDtin.chamado})` : ''}`
              : `Cadastrado por Santana (TI) com Solicitação de Envio ao DTIN: ${dadosDtin.motivo} (Aguardando confirmação do detentor)`,
            usuario: dadosDtin.responsavel || 'Santana'
          }
        ]
      };
      const updatedList = [newAsset, ...assets];
      setAssets(updatedList);
      saveLocalAssets(updatedList);
      saveAssetToCloud(newAsset);
      if (isTiSector) {
        showToast(`Equipamento ${formatLast5Patrimonio(newAsset.numeroPatrimonio)} cadastrado e enviado ao DTIN!`, 'success');
      } else {
        showToast(`Equipamento cadastrado! Solicitação de envio enviada para confirmação do detentor da carga.`, 'info');
      }
      return;
    }

    // Para equipamento existente:
    const target = assets.find(a => a.id === assetId);
    if (!target) return;

    const isTiSector = target.setorId === 'sec-ti' || 
                       (target.setorNome || '').toUpperCase().trim() === 'TI' || 
                       (target.responsavel || '').toLowerCase().includes('santana');

    if (isTiSector) {
      // Pertence à TI (Santana) -> Envia direto para a DTIN
      const updated = assets.map(a => {
        if (a.id === assetId) {
          const updatedItem = {
            ...a,
            status: 'ENVIADO_DTIN',
            enviadoDtin: true,
            pendenciaDtin: null,
            dadosDtin: {
              ...dadosDtin,
              dataHoraRegistro: new Date().toISOString()
            },
            historico: [
              ...(a.historico || []),
              { 
                data: dadosDtin.data || nowStr, 
                acao: `Envio ao DTIN por Santana (TI): ${dadosDtin.motivo}${dadosDtin.chamado ? ` (Chamado/OS: ${dadosDtin.chamado})` : ''}`, 
                usuario: dadosDtin.responsavel || 'Santana'
              }
            ]
          };
          saveAssetToCloud(updatedItem);
          return updatedItem;
        }
        return a;
      });
      setAssets(updated);
      saveLocalAssets(updated);
      showToast('Equipamento da TI enviado ao DTIN com sucesso!', 'success');
    } else {
      // Pertence a outro setor (ex: Studio - Tadeu, CADMI - Alex, etc.) -> Gera Pendência de Autorização
      const updated = assets.map(a => {
        if (a.id === assetId) {
          const updatedItem = {
            ...a,
            pendenciaDtin: {
              id: `dtin-pend-${Date.now()}`,
              ...dadosDtin,
              solicitante: dadosDtin.responsavel || 'Santana',
              status: 'PENDENTE',
              dataRegistro: new Date().toISOString()
            },
            historico: [
              ...(a.historico || []),
              { 
                data: dadosDtin.data || nowStr, 
                acao: `Solicitação de Envio ao DTIN por Santana (TI) - Aguardando autorização do detentor (${a.responsavel || a.setorNome})`, 
                usuario: dadosDtin.responsavel || 'Santana'
              }
            ]
          };
          saveAssetToCloud(updatedItem);
          return updatedItem;
        }
        return a;
      });
      setAssets(updated);
      saveLocalAssets(updated);
      showToast(`Solicitação de envio ao DTIN gerada! O detentor (${target.responsavel || target.setorNome}) foi notificado no sino do cabeçalho.`, 'info');
    }
  };

  // Autorização do Envio ao DTIN pelo Detentor
  const handleAuthorizeDtin = (assetId) => {
    const nowStr = new Date().toLocaleString('pt-BR');
    const updated = assets.map(a => {
      if (a.id === assetId) {
        const pendencia = a.pendenciaDtin;
        const dadosDtinFinal = {
          ...(pendencia || {}),
          dataHoraRegistro: new Date().toISOString(),
          autorizadoPor: currentUser?.displayName || currentUser?.email || a.responsavel || 'Detentor da Carga'
        };
        const updatedItem = {
          ...a,
          status: 'ENVIADO_DTIN',
          enviadoDtin: true,
          dadosDtin: dadosDtinFinal,
          pendenciaDtin: null,
          historico: [
            ...(a.historico || []),
            {
              data: nowStr,
              acao: `Envio ao DTIN autorizado e confirmado pelo detentor (${a.responsavel || a.setorNome}): ${pendencia?.motivo || 'Manutenção'}`,
              usuario: currentUser?.displayName || currentUser?.email || a.responsavel || 'Detentor da Carga'
            }
          ]
        };
        saveAssetToCloud(updatedItem);
        return updatedItem;
      }
      return a;
    });
    setAssets(updated);
    saveLocalAssets(updated);
    const remainingPendencias = updated.filter(a => a.pendenciaDtin);
    if (remainingPendencias.length === 0) {
      setIsPendenciasDtinOpen(false);
    }
    showToast('Envio ao DTIN autorizado e confirmado com sucesso!', 'success');
  };

  // Recusa do Envio ao DTIN pelo Detentor
  const handleRejectDtin = (assetId) => {
    const nowStr = new Date().toLocaleString('pt-BR');
    const updated = assets.map(a => {
      if (a.id === assetId) {
        const updatedItem = {
          ...a,
          pendenciaDtin: null,
          historico: [
            ...(a.historico || []),
            {
              data: nowStr,
              acao: `Envio ao DTIN recusado pelo detentor (${a.responsavel || a.setorNome})`,
              usuario: currentUser?.displayName || currentUser?.email || a.responsavel || 'Detentor da Carga'
            }
          ]
        };
        saveAssetToCloud(updatedItem);
        return updatedItem;
      }
      return a;
    });
    setAssets(updated);
    saveLocalAssets(updated);
    const remainingPendencias = updated.filter(a => a.pendenciaDtin);
    if (remainingPendencias.length === 0) {
      setIsPendenciasDtinOpen(false);
    }
    showToast('Envio ao DTIN recusado. O equipamento permanece no setor.', 'info');
  };

  // Retorno / Reintegração do DTIN
  const handleReturnDtin = (assetId) => {
    const nowStr = new Date().toLocaleString('pt-BR');
    const updated = assets.map(a => {
      if (a.id === assetId) {
        const updatedItem = {
          ...a,
          status: 'PENDENTE',
          enviadoDtin: false,
          dadosDtin: null,
          historico: [
            ...(a.historico || []),
            { 
              data: nowStr, 
              acao: 'Retorno do DTIN: Equipamento reintegrado ao setor', 
              usuario: currentUser?.displayName || currentUser?.email || activeSector?.responsavel || 'Operador'
            }
          ]
        };
        saveAssetToCloud(updatedItem);
        return updatedItem;
      }
      return a;
    });
    setAssets(updated);
    saveLocalAssets(updated);
    showToast('Retorno do DTIN confirmado e equipamento reintegrado!');
  };

  // Single label print
  const handlePrintSingleLabel = async (asset) => {
    await generateLabelsPDF([asset]);
  };

  // Export inventory report modal opener
  const handleExportReportPDF = (targetSec = undefined) => {
    if (targetSec === null) {
      setExportReportSector(null);
    } else if (targetSec && typeof targetSec === 'object' && targetSec.id) {
      setExportReportSector(targetSec);
    } else {
      setExportReportSector(filterMode === 'MY_SECTOR' ? activeSector : null);
    }
    setIsExportReportModalOpen(true);
  };

  // Confirmação e ordenação do relatório (Patrimônio, Item, Resp. Carga ou Onde Está) com ordem de colunas
  const handleConfirmExportReport = (sortBy, selectedColumns, orderedColumnIds) => {
    setIsExportReportModalOpen(false);
    const targetSector = exportReportSector;
    const isSectorSpecific = !!targetSector;
    const sectorAssets = isSectorSpecific 
      ? assets.filter(a => a.setorId === targetSector.id) 
      : assets;

    const sorted = [...sectorAssets];
    if (sortBy === 'PATRIMONIO') {
      sorted.sort((a, b) => {
        const numA = parseInt(String(a.numeroPatrimonio || '').replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(String(b.numeroPatrimonio || '').replace(/\D/g, ''), 10) || 0;
        if (numA !== numB) return numA - numB;
        return (a.numeroPatrimonio || '').localeCompare(b.numeroPatrimonio || '', 'pt-BR');
      });
      showToast('Relatório gerado em ordem de Patrimônio!', 'success');
    } else if (sortBy === 'ITEM') {
      sorted.sort((a, b) => {
        return (a.descricao || '').localeCompare(b.descricao || '', 'pt-BR', { sensitivity: 'base' });
      });
      showToast('Relatório gerado em ordem de Item!', 'success');
    } else if (sortBy === 'RESPONSAVEL') {
      sorted.sort((a, b) => {
        const respA = a.responsavel || (targetSector ? targetSector.responsavel : '') || '';
        const respB = b.responsavel || (targetSector ? targetSector.responsavel : '') || '';
        const comp = respA.localeCompare(respB, 'pt-BR', { sensitivity: 'base' });
        if (comp !== 0) return comp;
        return (a.descricao || '').localeCompare(b.descricao || '', 'pt-BR', { sensitivity: 'base' });
      });
      showToast('Relatório gerado em ordem de Resp. Carga!', 'success');
    } else if (sortBy === 'LOCALIZACAO') {
      sorted.sort((a, b) => {
        const locA = a.localizacao || '';
        const locB = b.localizacao || '';
        const comp = locA.localeCompare(locB, 'pt-BR', { sensitivity: 'base' });
        if (comp !== 0) return comp;
        return (a.descricao || '').localeCompare(b.descricao || '', 'pt-BR', { sensitivity: 'base' });
      });
      showToast('Relatório gerado em ordem de Onde Está!', 'success');
    }

    const reportStats = isSectorSpecific
      ? {
          total: sectorAssets.length,
          conferidos: sectorAssets.filter(a => a.status === 'CONFERIDO').length,
          pendentes: Math.max(0, sectorAssets.length - sectorAssets.filter(a => a.status === 'CONFERIDO').length - sectorAssets.filter(a => a.status === 'BAIXADO' || a.baixado).length),
          cautelas: sectorAssets.filter(a => a.status === 'EM_CAUTELA').length,
          baixados: sectorAssets.filter(a => a.status === 'BAIXADO' || a.baixado).length,
          pctConferido: sectorAssets.length > 0 
            ? Math.round((sectorAssets.filter(a => a.status === 'CONFERIDO').length / (sectorAssets.length - sectorAssets.filter(a => a.status === 'BAIXADO' || a.baixado).length || 1)) * 100) 
            : 0
        }
      : stats;

    generateInventoryReportPDF(
      targetSector, 
      sorted, 
      reportStats, 
      selectedColumns,
      orderedColumnIds,
      sectors,
      sortBy
    );
  };

  // Mass Import Success (Excel, Word, CSV, TXT)
  const handleImportSuccess = (importedAssets, targetSectorId) => {
    setAssets(prev => {
      const merged = [...importedAssets, ...prev];
      saveLocalAssets(merged);
      return merged;
    });
    // Sincroniza em segundo plano com a nuvem para que todos os celulares recebam na hora
    saveAssetsBatchToCloud(importedAssets).catch(err => console.warn('Erro sync nuvem:', err));

    if (targetSectorId && targetSectorId !== 'auto') {
      setActiveSectorId(targetSectorId);
      setFilterMode('MY_SECTOR');
    }
    showToast(`🎉 ${importedAssets.length} itens importados e sincronizados na nuvem!`);
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    setIsExcelModalOpen(false);
  };

  // Restore Backup Payload
  const handleRestoreBackup = (backupPayload) => {
    if (backupPayload.assets) {
      setAssets(backupPayload.assets);
      saveAssetsBatchToCloud(backupPayload.assets).catch(err => console.warn('Erro sync backup nuvem:', err));
    }
    if (backupPayload.sectors) setSectors(backupPayload.sectors);
    if (backupPayload.cautelas) setCautelas(backupPayload.cautelas);
    showToast('Base de dados restaurada e sincronizada na nuvem com sucesso!');
  };



  // Scroll alternado inteligente: Se estiver no topo, vai para Conferidos. Se já estiver em Conferidos, volta para o topo!
  const handleScrollToConferidos = () => {
    const el = document.getElementById('conferidos-divider-section');
    const scrollContainer = mainScrollRef.current;
    
    if (!el) {
      if (scrollContainer && scrollContainer.scrollTop > 50) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast('Nenhum item conferido neste setor ainda.', 'info');
      }
      return;
    }

    // Calcula se o scroll atual já chegou ou passou da seção de conferidos
    const currentScroll = scrollContainer ? scrollContainer.scrollTop : (window.scrollY || 0);
    const elementOffsetTop = el.offsetTop - 120;

    // Se já estiver na seção de conferidos, o clique manda de volta para o topo!
    if (currentScroll >= elementOffsetTop) {
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Caso esteja mais acima, desce suavemente até a seção de Conferidos
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Se não estiver autenticado ou autorizado, exibe a tela de login com conta Google
  if (!isAuthorized || !currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        authError={authError}
        isConfigured={isFirebaseActive}
      />
    );
  }

  return (
    <div className="h-screen max-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom duration-300 ${
          toastMessage.type === 'warning' 
            ? 'bg-amber-900/90 text-amber-200 border-amber-500/40 shadow-amber-950/40' 
            : toastMessage.type === 'info'
              ? 'bg-blue-900/90 text-blue-200 border-blue-500/40 shadow-blue-950/40'
              : 'bg-emerald-900/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/40'
        }`}>
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onVoiceDirectSearch={handleVoiceDirectSearch}
        onOpenQrScanner={() => setIsQrOpen(true)}
        onOpenNewAsset={() => {
          setAssetToEdit(null);
          setIsAssetModalOpen(true);
        }}
        onOpenCautelas={() => setIsCautelaListOpen(true)}
        onOpenLabels={() => setIsLabelsModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenExcel={() => setIsExcelModalOpen(true)}
        onOpenUsers={() => setIsUserManagementOpen(true)}
        onOpenFirebaseConfig={() => setIsFirebaseModalOpen(true)}
        currentUser={effectiveUser}
        userRole={effectiveUserRole}
        isRealAdmin={userRole === 'admin'}
        onLogout={handleLogout}
        onGoogleLogin={handleTriggerGoogleLogin}
        isFirebaseActive={isFirebaseActive}
        cautelasCount={cautelas.filter(c => c.status === 'EM_ANDAMENTO').length}
        conferidosCount={stats.conferidos}
        onScrollToConferidos={handleScrollToConferidos}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenPedidos={() => setIsPedidosModalOpen(true)}
        pedidosCount={pedidosCarga.filter(p => p.status === 'PENDENTE').length}
        onOpenServidores={() => setIsServidoresModalOpen(true)}
        servidoresCount={servidores.length}
        onOpenDtinPendencias={() => setIsPendenciasDtinOpen(true)}
        dtinPendenciasCount={userPendingDtinCount}
        onToggleTiCard={() => setIsTiModalOpen(prev => !prev)}
        isTiCardOpen={isTiModalOpen}
        tiAssetsCount={allTiAssets.length}
        currentPersona={simulatedPersona}
        onSelectPersona={userRole === 'admin' ? handleSelectPersona : null}
        sectors={sectors}
        activeSectorName={activeSector?.name}
        filterMode={filterMode}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        displaySettings={displaySettings}
      />

      {/* Container com Slide Bar Lateral Esquerdo + Área de Conteúdo */}
      <div className="flex flex-1 min-h-0 w-full relative overflow-hidden">
        
        {/* Slide Bar Lateral Esquerdo com as Abas dos Setores */}
        <SectorSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          sectors={sectors}
          activeSectorId={activeSectorId}
          onSelectSector={setActiveSectorId}
          filterMode={filterMode}
          onSelectFilterMode={setFilterMode}
          assets={assets}
          duplicateCount={duplicateCount}
          onOpenManageSectors={() => setIsManageSectorsOpen(true)}
          userRole={effectiveUserRole}
          userSectorId={effectiveUserSectorId}
          userSectorIds={effectiveUserSectorIds}
          userLinkedSectorIds={userLinkedSectorIds}
          currentUser={effectiveUser || currentUser}
          statusFilter={statusFilter}
          onSelectStatusFilter={setStatusFilter}
          onExportReportPDF={handleExportReportPDF}
          onClearSectorAssets={handleClearSectorAssets}
          onOpenImport={(secId) => {
            if (secId) {
              setActiveSectorId(secId);
              setFilterMode('MY_SECTOR');
            }
            setIsExcelModalOpen(true);
          }}
          displaySettings={displaySettings}
          onOpenDisplaySettings={() => setIsDisplaySettingsOpen(true)}
          onOpenBatchStatusChange={handleOpenBatchStatusChange}
        />

        {/* Área Principal de Conteúdo */}
        <main 
          ref={mainScrollRef} 
          onScroll={handleMainScroll}
          className={`flex-1 min-w-0 h-full w-full overflow-y-auto overflow-x-auto custom-scroll-auto-hide ${isScrolling ? 'is-scrolling' : ''} bg-slate-950 flex flex-col relative`}
        >
          <div style={{ minWidth: isMobile ? '100%' : tableMinWidth }} className="w-full flex flex-col min-h-full transition-all duration-200">

            {/* Cabeçalho Fixo da Tabela Desktop (Permanentemente Visível e Sticky - Altura h-[58px]) */}
            <div className="hidden md:flex sticky top-0 z-30 shrink-0 bg-slate-900 border-b border-slate-800 shadow-lg shadow-black/40 w-full h-[58px] items-center relative">
              
              {/* TÍTULOS DAS COLUNAS (Normal ou Modo DTIN) */}
              <div className={`w-full transform transition-all duration-1000 ease-in-out ${canShowBulkActionBar ? 'opacity-15 pointer-events-none scale-x-[0.98] blur-[0.5px]' : 'opacity-100'}`}>
                {statusFilter === 'ENVIADOS_DTIN' ? (
                  /* Cabeçalho Especial da Aba: Enviados para a DTIN */
                  <div className="pl-4 sm:pl-5 pr-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none border border-transparent">
                    
                    {/* Botão + Verdinho Brilhoso para Novo Envio DTIN (no lugar do checkbox) */}
                    <button
                      type="button"
                      onClick={() => {
                        setAssetForDtin(null);
                        setIsDtinModalOpen(true);
                      }}
                      title="Cadastrar Novo Envio de Equipamento para a DTIN"
                      className="w-5 h-5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/70 text-emerald-400 hover:text-emerald-300 flex items-center justify-center cursor-pointer transition-all shadow-[0_0_12px_rgba(16,185,129,0.45)] hover:shadow-[0_0_18px_rgba(16,185,129,0.75)] hover:scale-110 active:scale-95 shrink-0 group"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3.5] drop-shadow-[0_0_6px_rgba(52,211,153,0.95)]" />
                    </button>

                    {/* Coluna 1: Patrimônio */}
                    <button
                      onClick={() => handleSort('numeroPatrimonio')}
                      title="Clique para ordenar por patrimônio"
                      className={`w-28 shrink-0 flex items-center justify-start gap-1 transition-colors cursor-pointer group text-left ${
                        sortField === 'numeroPatrimonio' ? 'text-cyan-300 font-bold' : 'hover:text-slate-200'
                      }`}
                    >
                      <span>Patrimônio</span>
                      <span className="shrink-0 ml-0.5">
                        {sortField === 'numeroPatrimonio' ? (
                          <span className="text-[10px] leading-none text-red-500 font-black drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] select-none">
                            {sortDirection === 'asc' ? '▲' : '▼'}
                          </span>
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                        )}
                      </span>
                    </button>

                    {/* Coluna 2: Item */}
                    <button
                      onClick={() => handleSort('descricao')}
                      title="Clique para ordenar alfabeticamente pelo item"
                      className={`flex-1 min-w-[270px] shrink-0 flex items-center justify-start gap-1.5 transition-all cursor-pointer group ${
                        sortField === 'descricao' ? 'text-cyan-300 font-bold' : 'hover:text-slate-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Item</span>
                      <span className="shrink-0 ml-0.5">
                        {sortField === 'descricao' ? (
                          <span className="text-[10px] leading-none text-red-500 font-black drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] select-none">
                            {sortDirection === 'asc' ? '▲' : '▼'}
                          </span>
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                        )}
                      </span>
                    </button>

                    {/* Coluna 3: Marca */}
                    <div className="w-24 shrink-0 flex items-center justify-start">
                      <span>Marca</span>
                    </div>

                    {/* Coluna 4: Modelo */}
                    <div className="w-24 shrink-0 flex items-center justify-start">
                      <span>Modelo</span>
                    </div>

                    {/* Coluna 5: Setor de Origem */}
                    <div className="w-32 shrink-0 flex items-center justify-center text-center">
                      <span>Setor Origem</span>
                    </div>

                    {/* Coluna 6: Responsável do Setor */}
                    <div className="w-28 shrink-0 flex items-center justify-center text-center">
                      <span>Responsável</span>
                    </div>

                    {/* Coluna 7: Motivo do Recolhimento */}
                    <div className="w-60 shrink-0 flex items-center justify-center text-center">
                      <span>Motivo (Recolhimento)</span>
                    </div>

                    {/* Coluna 8: Quem Mandou */}
                    <div className="w-28 shrink-0 flex items-center justify-center text-center">
                      <span>Quem Mandou</span>
                    </div>

                    {/* Coluna 9: Data do Envio */}
                    <div className="w-24 shrink-0 flex items-center justify-center text-center">
                      <span>Data Envio</span>
                    </div>

                    {/* Coluna 10: Doc */}
                    <div className="w-14 shrink-0 flex items-center justify-center text-center">
                      <span>Doc</span>
                    </div>

                    {/* Coluna 11: Ações */}
                    <div className="w-10 shrink-0 flex items-center justify-center text-center">
                      <span>Ações</span>
                    </div>

                  </div>
                ) : (
                  <div className="pl-4 sm:pl-5 pr-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none border border-transparent">
                  
                  {/* Master Checkbox: Seleção em Lote */}
                  {(filterMode === 'ALL_SECTORS' ? filteredAssets.some(a => canUserManageAsset(a)) : canManageActiveSector) ? (
                    <button
                      type="button"
                      onClick={handleSelectAllVisible}
                      title={
                        filteredAssets.filter(a => canUserManageAsset(a)).length > 0 && 
                        filteredAssets.filter(a => canUserManageAsset(a)).every(a => selectedAssetIds.has(a.id))
                          ? "Desmarcar todos os itens visíveis sob sua responsabilidade"
                          : `Selecionar todos os itens visíveis sob sua responsabilidade`
                      }
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                        filteredAssets.filter(a => canUserManageAsset(a)).length > 0 && 
                        filteredAssets.filter(a => canUserManageAsset(a)).every(a => selectedAssetIds.has(a.id))
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-sm'
                          : selectedAssetIds.size > 0
                            ? 'bg-indigo-900/60 border-indigo-500 text-indigo-300'
                            : 'border-slate-600 bg-slate-800 hover:border-indigo-400 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                  ) : (
                    <div className="w-4 h-4 shrink-0" />
                  )}

                  {/* Coluna 1: Patrimônio */}
                  <button
                    onClick={() => handleSort('numeroPatrimonio')}
                    title="Clique para ordenar por patrimônio"
                    className={`w-20 shrink-0 flex items-center justify-start gap-1 transition-colors cursor-pointer group text-left border-r border-slate-800/80 pr-1.5 ${
                      sortField === 'numeroPatrimonio' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                    }`}
                  >
                    <span>Patrimônio</span>
                    <span className="shrink-0 ml-0.5">
                      {sortField === 'numeroPatrimonio' ? (
                        <span className="text-[10px] leading-none text-red-500 font-black drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] select-none">
                          {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                      )}
                    </span>
                  </button>

                  {/* Coluna 2: Quantidade */}
                  {visibleColumns.quantidade !== false && (
                    <div className="w-12 shrink-0 flex items-center justify-center border-r border-slate-800/80 pr-1">
                      <button
                        onClick={() => handleSort('quantidade')}
                        title="Clique para ordenar por quantidade"
                        className={`flex items-center justify-center gap-0.5 transition-colors cursor-pointer group ${
                          sortField === 'quantidade' ? 'text-cyan-300 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <span>Qtde</span>
                        <span className="shrink-0">
                          {sortField === 'quantidade' ? (
                            <span className="text-[10px] leading-none text-red-500 font-black drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] select-none">
                              {sortDirection === 'asc' ? '▲' : '▼'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Coluna 3: Item (Largura reduzida com flex-1 min-w-[165px]) */}
                  <button
                    onClick={() => handleSort('descricao')}
                    title="Clique para ordenar alfabeticamente pelo item"
                    className={`flex-1 min-w-[165px] shrink-0 flex items-center justify-start gap-1.5 transition-all cursor-pointer group border-r border-slate-800/80 pr-2 ${
                      sortField === 'descricao' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Item</span>
                    <span className="shrink-0 ml-0.5">
                      {sortField === 'descricao' ? (
                        <span className="text-[10px] leading-none text-red-500 font-black drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] select-none">
                          {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                      )}
                    </span>
                  </button>

                  {/* Coluna 4: Marca */}
                  {visibleColumns.marca !== false && (
                    <div className="w-24 shrink-0 flex items-center justify-center text-center border-r border-slate-800/80 pr-1.5">
                      <button
                        onClick={() => handleSort('marca')}
                        title="Clique para ordenar por marca"
                        className={`flex items-center justify-center gap-1 transition-colors cursor-pointer group truncate ${
                          sortField === 'marca' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <span>Marca</span>
                        <span className="shrink-0 ml-0.5">
                          {sortField === 'marca' ? (
                            <span className="text-[10px] leading-none text-red-500 font-black drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] select-none">
                              {sortDirection === 'asc' ? '▲' : '▼'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Coluna 5: Modelo */}
                  {visibleColumns.modelo !== false && (
                    <div className="w-24 shrink-0 flex items-center justify-center text-center border-r border-slate-800/80 pr-1.5">
                      <button
                        onClick={() => handleSort('modelo')}
                        title="Clique para ordenar por modelo"
                        className={`flex items-center justify-center gap-1 transition-colors cursor-pointer group truncate ${
                          sortField === 'modelo' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <span>Modelo</span>
                        <span className="shrink-0 ml-0.5">
                          {sortField === 'modelo' ? (
                            <span className="text-[10px] leading-none text-red-500 font-black drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] select-none">
                              {sortDirection === 'asc' ? '▲' : '▼'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Coluna 6: Setor */}
                  {visibleColumns.localizacao !== false && (
                    <div className="w-40 shrink-0 flex items-center justify-center text-center border-r border-slate-800/80 pr-1.5">
                      <button
                        onClick={() => handleSort('localizacao')}
                        title="Clique para ordenar por setor"
                        className={`flex items-center justify-center gap-1 transition-colors cursor-pointer group text-center ${
                          sortField === 'localizacao' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <span>Setor</span>
                        <span className="shrink-0 ml-0.5">
                          {sortField === 'localizacao' ? (
                            <span className="text-[10px] leading-none text-red-500 font-black drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] select-none">
                              {sortDirection === 'asc' ? '▲' : '▼'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Coluna 7: Com quem está (sem caixa alta) */}
                  <div className="w-[186px] shrink-0 flex items-center justify-center text-center border-r border-slate-800/80 pr-1.5 normal-case font-bold text-slate-300">
                    <span>Com quem está</span>
                  </div>

                  {/* Coluna 8: Responsável (Apenas na Aba Geral como Resp. Carga) */}
                  {filterMode === 'ALL_SECTORS' && visibleColumns.responsavel !== false && (
                    <div className="w-24 shrink-0 flex items-center justify-center text-center border-r border-slate-800/80 pr-1.5">
                      <button
                        onClick={() => handleSort('responsavel')}
                        title="Clique para ordenar por responsável da carga"
                        className={`flex items-center justify-center gap-1 transition-colors cursor-pointer group ${
                          sortField === 'responsavel' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <span>Resp. Carga</span>
                        <span className="shrink-0 ml-0.5">
                          {sortField === 'responsavel' ? (
                            <span className="text-[10px] leading-none text-red-500 font-black drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] select-none">
                              {sortDirection === 'asc' ? '▲' : '▼'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Coluna 9: Data Aquisição */}
                  {visibleColumns.dataAquisicao !== false && (
                    <div className="w-20 shrink-0 flex items-center justify-center text-center border-r border-slate-800/80 pr-1">
                      <button
                        onClick={() => handleSort('dataAquisicao')}
                        title="Clique para ordenar por data de aquisição"
                        className={`flex items-center justify-center gap-0.5 transition-colors cursor-pointer group ${
                          sortField === 'dataAquisicao' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <span>Aquisição</span>
                        <span className="shrink-0 ml-0.5">
                          {sortField === 'dataAquisicao' ? (
                            <span className="text-[10px] leading-none text-red-500 font-black drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] select-none">
                              {sortDirection === 'asc' ? '▲' : '▼'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Coluna 10: Valor Original */}
                  {visibleColumns.valorOriginal !== false && (
                    <div className="w-24 shrink-0 flex items-center justify-center border-r border-slate-800/80">
                      <button
                        onClick={() => handleSort('valorOriginal')}
                        title="Clique para ordenar por valor original"
                        className={`flex items-center justify-center gap-0.5 transition-colors cursor-pointer group ${
                          sortField === 'valorOriginal' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <span className="text-slate-400 font-medium whitespace-nowrap">
                          {displaySettings.showCurrencyPrefix ? '$ Original' : 'Original'}
                        </span>
                        <span className="shrink-0 ml-0.5">
                          {sortField === 'valorOriginal' ? (
                            <span className="text-[10px] leading-none text-red-500 font-black drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] select-none">
                              {sortDirection === 'asc' ? '▲' : '▼'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Coluna 11: Valor Atual */}
                  {visibleColumns.valorAtual !== false && (
                    <div className="w-24 shrink-0 flex items-center justify-center border-r border-slate-800/80">
                      <button
                        onClick={() => handleSort('valorAtual')}
                        title="Clique para ordenar por valor atual"
                        className={`flex items-center justify-center gap-0.5 transition-colors cursor-pointer group ${
                          sortField === 'valorAtual' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <span className="text-slate-400 font-medium whitespace-nowrap">
                          {displaySettings.showCurrencyPrefix ? '$ Atual' : 'Atual'}
                        </span>
                        <span className="shrink-0 ml-0.5">
                          {sortField === 'valorAtual' ? (
                            <span className="text-[10px] leading-none text-red-500 font-black drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] select-none">
                              {sortDirection === 'asc' ? '▲' : '▼'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Coluna 12: Depreciação com Alternador R$ / % */}
                  {visibleColumns.depreciacao !== false && (
                    <div className="w-24 shrink-0 flex items-center justify-center border-r border-slate-800/80">
                      <button
                        type="button"
                        onClick={toggleDepreciationMode}
                        title={depreciationMode === 'currency' ? "Modo R$ (Clique para ver % de depreciação)" : "Modo % (Clique para ver valor R$ da depreciação)"}
                        className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-0.5 select-none shadow-sm active:scale-95 ${
                          depreciationMode === 'percent'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
                        }`}
                      >
                        <span>Deprec.</span>
                        <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded ${
                          depreciationMode === 'percent'
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : 'bg-slate-700 text-amber-300'
                        }`}>
                          {depreciationMode === 'percent' ? '%' : 'R$'}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Coluna 13: Ações + Botão de Gerenciamento e Restauração de Colunas */}
                  <div className="w-28 shrink-0 flex items-center justify-center gap-1.5 relative" ref={columnDropdownRef}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsColumnDropdownOpen(!isColumnDropdownOpen);
                      }}
                      className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm ${
                        isColumnDropdownOpen
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50'
                          : hiddenColumnsCount > 0
                            ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 animate-pulse hover:animate-none'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                      }`}
                      title={hiddenColumnsCount > 0 ? `${hiddenColumnsCount} colunas ocultas (Clique para gerenciar/reexibir)` : "Gerenciar colunas visíveis"}
                    >
                      {hiddenColumnsCount > 0 ? (
                        <>
                          <EyeOff className="w-3 h-3 text-indigo-400" />
                          <span>{hiddenColumnsCount}</span>
                        </>
                      ) : (
                        <Columns3 className="w-3 h-3 text-slate-400" />
                      )}
                    </button>

                    {/* Menu Dropdown de Colunas - Abre com clique e permanece aberto para marcar/desmarcar */}
                    {isColumnDropdownOpen && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-2 z-50 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-2.5 min-w-[210px] text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-100 text-left"
                      >
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1.5 border-b border-slate-800 flex items-center justify-between">
                          <span>{filterMode === 'MY_SECTOR' ? 'Colunas do Setor' : 'Colunas Visão Geral'}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={resetToModeDefaultColumns}
                              className="text-amber-400 hover:text-amber-300 text-[9.5px] lowercase font-semibold underline cursor-pointer"
                              title="Restaurar padrão deste modo"
                            >
                              padrão
                            </button>
                            <button
                              type="button"
                              onClick={showAllColumns}
                              className="text-indigo-400 hover:text-indigo-300 text-[9.5px] lowercase font-semibold underline cursor-pointer"
                            >
                              todas
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 pt-0.5">
                          {[
                            { key: 'quantidade', label: 'Qtde (Quantidade)' },
                            { key: 'marca', label: 'Marca' },
                            { key: 'localizacao', label: 'Setor' },
                            ...(filterMode === 'ALL_SECTORS' ? [{ key: 'responsavel', label: 'Resp. Carga' }] : []),
                            { key: 'dataAquisicao', label: 'Aquisição' },
                            { key: 'valorOriginal', label: '$ Original' },
                            { key: 'valorAtual', label: '$ Atual' },
                            { key: 'depreciacao', label: 'Depreciação' }
                          ].map(col => {
                            const isVisible = visibleColumns[col.key] !== false;
                            return (
                              <button
                                key={col.key}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleColumn(col.key);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between text-[11px] cursor-pointer group/colitem ${
                                  isVisible 
                                    ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-200' 
                                    : 'bg-slate-950/50 hover:bg-slate-800/60 text-slate-400'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                                    isVisible 
                                      ? 'bg-blue-600 border-blue-500 text-white' 
                                      : 'border-slate-600 bg-slate-800 text-transparent'
                                  }`}>
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                  <span className={isVisible ? 'font-semibold text-slate-100' : 'text-slate-400'}>
                                    {col.label}
                                  </span>
                                </div>
                                
                                {isVisible ? (
                                  <Eye className="w-3.5 h-3.5 text-emerald-400 group-hover/colitem:scale-110 transition-transform" />
                                ) : (
                                  <EyeOff className="w-3.5 h-3.5 text-rose-400/80 group-hover/colitem:scale-110 transition-transform" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <span>Ações</span>
                  </div>

                  </div>
                )}
              </div>

              {/* BARRA DE AÇÕES EM LOTE: Desce suave de cima para baixo com efeito caindo (igual à cortina do TI) */}
              <div 
                className={`absolute inset-0 pointer-events-none z-30 flex items-center justify-center transition-all ${
                  canShowBulkActionBar ? 'overflow-visible' : 'overflow-hidden'
                }`}
              >
                <div 
                  className={`pointer-events-auto transform transition-all duration-1000 ease-in-out ${
                    canShowBulkActionBar
                      ? 'translate-y-0 opacity-100 pointer-events-auto scale-100'
                      : '-translate-y-[180%] opacity-0 pointer-events-none scale-95'
                  }`}
                >
                  <BulkActionBar
                    selectedCount={displaySelectedCount || selectedAssetIds.size}
                    onClearSelection={handleClearSelection}
                    onAssignSector={handleBulkAssignSector}
                    sectors={sectors}
                    servidores={servidores}
                    onAssignServidor={handleBulkAssignServidor}
                  />
                </div>
              </div>

              {/* CORTINA DE TI: Desce SUAVE SUAVE em 1 segundo (duration-1000) SOBRE os títulos */}
              <div className={`absolute inset-0 pointer-events-none z-40 rounded-none transition-all ${isTiModalOpen ? 'overflow-visible' : 'overflow-hidden'}`}>
                <div 
                  className={`w-full h-full px-3 sm:px-5 flex items-center justify-between gap-2.5 bg-gradient-to-r from-cyan-950/98 via-slate-900/98 to-indigo-950/95 border-b border-cyan-500/60 shadow-xl shadow-cyan-950/40 transform transition-all duration-1000 ease-in-out ${
                    isTiModalOpen
                      ? 'translate-y-0 opacity-100 pointer-events-auto'
                      : '-translate-y-full opacity-0 pointer-events-none'
                  }`}
                >
                  {/* Esquerda: Ícone + Título "Bens de Informática (TI)" + Selo que sobe para cima */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
                      <Laptop className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-xs sm:text-sm tracking-wide whitespace-nowrap">
                        Bens de Informática (TI)
                      </span>
                      {/* Selo 'possíveis xx itens' - empurrado para cima suavemente na seleção */}
                      <div className="overflow-hidden h-7 flex items-center">
                        <span 
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/30 text-cyan-300 font-black border border-cyan-400/40 whitespace-nowrap transform transition-all duration-700 ease-in-out ${
                            selectedAssetIds.size > 0 
                              ? '-translate-y-8 opacity-0 pointer-events-none' 
                              : 'translate-y-0 opacity-100'
                          }`}
                        >
                          possíveis {allTiAssets.length} {allTiAssets.length === 1 ? 'item' : 'itens'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Centro: Transição Vertical - Botão Inicial Sobe e o Dock de Ações Desce Suavemente */}
                  <div className="flex-1 flex items-center justify-center px-1 overflow-hidden h-full relative min-h-[50px]">
                    {/* Botão Inicial: Sobe para cima ao selecionar */}
                    <div 
                      className={`absolute inset-0 flex items-center justify-center transform transition-all duration-700 ease-in-out ${
                        selectedAssetIds.size > 0 
                          ? '-translate-y-full opacity-0 pointer-events-none' 
                          : 'translate-y-0 opacity-100 pointer-events-auto'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectTiItems(true)}
                        disabled={allTiAssets.length === 0}
                        className="px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-600 text-white font-black text-xs shadow-md shadow-cyan-500/30 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102 active:scale-95 border border-cyan-300/40 disabled:opacity-50 whitespace-nowrap"
                      >
                        <Check className="w-3.5 h-3.5 text-cyan-200 stroke-[3]" />
                        <span>Selecionar Todos os {allTiAssets.length} Itens de TI ⚡</span>
                      </button>
                    </div>

                    {/* DOCK DE AÇÕES (Print 2): Desce suavemente de cima para baixo */}
                    <div 
                      className={`absolute inset-0 flex items-center justify-center transform transition-all duration-700 ease-in-out ${
                        selectedAssetIds.size > 0 
                          ? 'translate-y-0 opacity-100 pointer-events-auto' 
                          : '-translate-y-full opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* Contador de Itens Selecionados */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/60 shadow-sm shrink-0">
                          <div className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-500/40">
                            <CheckCheck className="w-3.5 h-3.5 text-white stroke-[3]" />
                          </div>
                          <span className="text-xs font-black text-indigo-200 whitespace-nowrap">
                            {selectedAssetIds.size} {selectedAssetIds.size === 1 ? 'item selecionado' : 'itens selecionados'}
                          </span>
                        </div>

                        {/* Botão Desmarcar */}
                        <button
                          type="button"
                          onClick={handleClearSelection}
                          title="Desmarcar itens selecionados"
                          className="p-1 px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1 active:scale-95 shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Desmarcar</span>
                        </button>

                        <div className="w-px h-5 bg-cyan-500/30 mx-0.5 shrink-0" />

                        {/* Botão Atribuir TI */}
                        <button
                          type="button"
                          onClick={handleBulkAssignTi}
                          title="Transferir todos os itens selecionados para o setor de TI"
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer hover:scale-102 active:scale-95 border border-cyan-300/40 group whitespace-nowrap"
                        >
                          <Laptop className="w-3.5 h-3.5 text-cyan-200 group-hover:animate-pulse" />
                          <span>Atribuir TI ⚡</span>
                        </button>

                        {/* Dropdown Mudar Setor */}
                        <div className="relative" ref={curtainSectorDropdownRef}>
                          <button
                            type="button"
                            onClick={() => setIsCurtainSectorDropdownOpen(!isCurtainSectorDropdownOpen)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
                          >
                            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Mudar Setor</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCurtainSectorDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isCurtainSectorDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 z-50 w-64 max-h-72 overflow-y-auto bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 scrollbar-thin scrollbar-thumb-slate-700 text-left">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800">
                                Transferir para o Setor:
                              </div>
                              {sectors.map(sec => (
                                <button
                                  key={sec.id}
                                  type="button"
                                  onClick={() => {
                                    setIsCurtainSectorDropdownOpen(false);
                                    handleBulkAssignSector(sec.id);
                                  }}
                                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-indigo-600/30 hover:text-white text-slate-300 transition-colors cursor-pointer group"
                                >
                                  <span className="font-semibold truncate">{sec.name}</span>
                                  {sec.responsavel && (
                                    <span className="text-[10px] text-slate-500 group-hover:text-indigo-200">
                                      {sec.responsavel}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direita: Cards de Categorias (Permanecem intactos com legendas) + Botão X que fecha tudo */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="hidden lg:flex items-center gap-1.5">
                      <div className="px-2.5 py-1 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-1.5 text-xs">
                        <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[10px] text-slate-400">Monitores:</span>
                        <strong className="text-white font-mono text-[11px]">{tiCategoryCounts.monitors}</strong>
                      </div>

                      <div className="px-2.5 py-1 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-1.5 text-xs">
                        <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] text-slate-400">Notebooks:</span>
                        <strong className="text-white font-mono text-[11px]">{tiCategoryCounts.notebooks}</strong>
                      </div>

                      <div className="px-2.5 py-1 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-1.5 text-xs">
                        <Cpu className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[10px] text-slate-400">Desktops/CPUs:</span>
                        <strong className="text-white font-mono text-[11px]">{tiCategoryCounts.desktops}</strong>
                      </div>

                      <div className="px-2.5 py-1 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-1.5 text-xs">
                        <Server className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-slate-400">Outros / Rede:</span>
                        <strong className="text-white font-mono text-[11px]">{tiCategoryCounts.others}</strong>
                      </div>
                    </div>

                    {/* Botão X: some com tudo (fecha cortina e limpa seleções) */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsTiModalOpen(false);
                        setSelectedAssetIds(new Set());
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                      title="Fechar cortina e desmarcar tudo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* Banner Informativo Exclusivo do Modo Patrimônio Duplicado */}
            {filterMode === 'DUPLICATES' && (
              <div className="px-4 pt-3 animate-in fade-in duration-200">
                <div className="p-3.5 bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/50 border-2 border-amber-500/60 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 text-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <span>Análise Detalhada: Patrimônios Duplicados Detectados</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/30 text-amber-300 font-black border border-amber-400/50">
                          {duplicateCount} {duplicateCount === 1 ? 'bem em conflito' : 'bens em conflito'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-amber-300/85">
                        Os itens com o mesmo número de patrimônio estão ordenados <strong>um imediatamente abaixo do outro</strong> para fácil comparação entre setores. A decisão humana define o setor correto ou a exclusão.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {/* Asset Cards or Empty State (Linha começa debaixo da slidebar, sem puxar o conteúdo) */}
            {filteredAssets.length > 0 ? (
              <div className="w-full flex-1 pb-8 border-t border-slate-800/80">
                {(() => {
                  const firstConferidoIndex = sortedAssets.findIndex(a => 
                    a.status === 'CONFERIDO' && !a.baixado && a.status !== 'BAIXADO'
                  );
                  const firstBaixadoIndex = sortedAssets.findIndex(a => 
                    (a.baixado || a.status === 'BAIXADO')
                  );

                  const visibleAssets = sortedAssets.slice(0, visibleCount);

                  return (
                    <>
                      {visibleAssets.map((asset, index) => {
                    const isBaixado = asset.baixado || asset.status === 'BAIXADO';
                    const isConferido = asset.status === 'CONFERIDO' && !isBaixado;
                    const isFirstConferido = index === firstConferidoIndex;
                    const isFirstBaixado = index === firstBaixadoIndex;

                    return (
                      <React.Fragment key={asset.id}>
                        {/* Divisor Visual de Itens Conferidos com Ícone e Título Centralizados e Botões de Ordenação nas Extremidades */}
                        {isFirstConferido && statusFilter !== 'CONFERIDOS' && (
                          <div id="conferidos-divider-section" className="relative py-1.5 px-3 sm:px-4 my-2 mx-2 border-y border-dashed border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 rounded-lg shadow-sm flex items-center justify-between min-h-[38px] scroll-mt-20">
                          
                            {/* Botão de Ordenação Patrimônio à Esquerda de Conferidos */}
                            <div className="flex items-center z-10 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  if (conferidosSortField === 'numeroPatrimonio') {
                                    setConferidosSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                  } else {
                                    setConferidosSortField('numeroPatrimonio');
                                    setConferidosSortDirection('asc');
                                  }
                                }}
                                className={`px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                                  conferidosSortField === 'numeroPatrimonio'
                                    ? 'bg-blue-600/30 text-blue-200 shadow-sm ring-1 ring-blue-400/50'
                                    : 'bg-slate-900/80 text-slate-400 hover:text-blue-300 hover:bg-slate-800'
                                }`}
                                title={`Ordenar conferidos por Nº de Patrimônio (${conferidosSortDirection === 'asc' ? 'Crescente ▲' : 'Decrescente ▼'})`}
                              >
                                <Hash className={`w-3.5 h-3.5 ${conferidosSortField === 'numeroPatrimonio' ? 'text-blue-400' : 'text-slate-400'}`} />
                                <span className="text-[9px] leading-none select-none font-bold">
                                  {conferidosSortField === 'numeroPatrimonio' ? (
                                    conferidosSortDirection === 'asc' ? '▲' : '▼'
                                  ) : (
                                    <span className="opacity-40">▲</span>
                                  )}
                                </span>
                              </button>
                            </div>

                            {/* Centro: Ícone e CONFERIDOS perfeitamente centralizado */}
                            <div className="flex items-center justify-center gap-2 px-2 z-10 text-center">
                              <div className="p-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              </div>
                              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                                Conferidos ({sortedAssets.filter(a => a.status === 'CONFERIDO' && !a.baixado && a.status !== 'BAIXADO').length})
                              </span>
                              <span className="text-[10.5px] text-slate-400 font-medium hidden md:inline">
                                — Carga conferida do setor (no final da lista)
                              </span>
                            </div>

                            {/* Botão de Ordenação Item / Descrição no Canto Direito */}
                            <div className="flex items-center justify-end z-10 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  if (conferidosSortField === 'descricao') {
                                    setConferidosSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                  } else {
                                    setConferidosSortField('descricao');
                                    setConferidosSortDirection('asc');
                                  }
                                }}
                                className={`px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                                  conferidosSortField === 'descricao'
                                    ? 'bg-blue-600/30 text-blue-200 shadow-sm ring-1 ring-blue-400/50'
                                    : 'bg-slate-900/80 text-slate-400 hover:text-blue-300 hover:bg-slate-800'
                                }`}
                                title={`Ordenar conferidos por Item / Descrição (${conferidosSortDirection === 'asc' ? 'A-Z ▲' : 'Z-A ▼'})`}
                              >
                                <FileText className={`w-3.5 h-3.5 ${conferidosSortField === 'descricao' ? 'text-blue-400' : 'text-slate-400'}`} />
                                <span className="text-[9px] leading-none select-none font-bold">
                                  {conferidosSortField === 'descricao' ? (
                                    conferidosSortDirection === 'asc' ? '▲' : '▼'
                                  ) : (
                                    <span className="opacity-40">▲</span>
                                  )}
                                </span>
                              </button>
                            </div>

                          </div>
                        )}

                      {/* Divisor Visual de Bens Baixados (Altura reduzida em 25%) */}
                      {isFirstBaixado && statusFilter !== 'BAIXADOS' && (
                        <div className="py-1.5 px-4 my-2 mx-2 flex items-center justify-between border-y border-dashed border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-rose-900/20 to-rose-950/40 rounded-lg shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="p-0.5 rounded bg-rose-500/20 text-rose-400">
                              <Archive className="w-3.5 h-3.5 shrink-0" />
                            </div>
                            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                              Bens Baixados ({sortedAssets.filter(a => a.baixado || a.status === 'BAIXADO').length})
                            </span>
                            <span className="text-[10.5px] text-slate-400 font-medium hidden sm:inline">
                              — Itens desincorporados / baixados do setor (no final da lista)
                            </span>
                          </div>
                        </div>
                      )}
                      <AssetTableRowCard
                        index={index}
                        asset={asset}
                        activeSector={activeSector}
                        sectors={sectors}
                        servidores={servidores}
                        currentUserName={currentUser?.displayName || currentUser?.email}
                        isGeneralView={filterMode === 'ALL_SECTORS' || filterMode === 'DUPLICATES'}
                        isSelected={selectedAssetIds.has(asset.id)}
                        onToggleSelect={handleToggleSelectAsset}
                        duplicateInfo={duplicateMap.get(asset.id) || null}
                        onToggleConference={handleToggleConference}
                        onOpenEdit={(a) => {
                          setAssetToEdit(a);
                          setIsAssetModalOpen(true);
                        }}
                        onOpenCautela={handleOpenCautela}
                        onOpenBaixa={handleOpenBaixa}
                        onCancelBaixa={handleCancelBaixa}
                        onOpenDtin={handleOpenDtin}
                        onReturnDtin={handleReturnDtin}
                        onPrintSingleLabel={handlePrintSingleLabel}
                        onTransferSector={handleOpenTransferModal}
                        onDeleteAsset={handleDeleteAsset}
                        onUpdateLocation={handleUpdateAssetLocation}
                        onUpdateObservation={handleUpdateAssetObservation}
                        onUpdateCardColor={handleUpdateAssetColor}
                        userRole={effectiveUserRole}
                        userSectorId={effectiveUserSectorId}
                        userSectorIds={effectiveUserSectorIds}
                        onOpenSolicitacao={(a) => {
                          setAssetForSolicitacao(a);
                          setIsSolicitacaoModalOpen(true);
                        }}
                        hasPendingPedido={pendingPedidoAssetIds.has(asset.id)}
                        searchTerm={deferredSearchTerm}
                        statusFilter={statusFilter}
                        filterMode={filterMode}
                        visibleColumns={visibleColumns}
                        appSettings={displaySettings}
                        depreciationMode={depreciationMode}
                      />
                    </React.Fragment>
                  );
                })}

                {sortedAssets.length > visibleCount && (
                  <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center gap-2 border-t border-slate-800/60 my-2">
                    <div className="text-xs text-slate-400 font-medium">
                      Exibindo <span className="text-cyan-300 font-bold">{Math.min(visibleCount, sortedAssets.length)}</span> de <span className="text-white font-bold">{sortedAssets.length}</span> bens carregados
                    </div>
                    <button
                      type="button"
                      onClick={() => setVisibleCount(prev => prev + 100)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
                    >
                      Carregar mais bens (+100)
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
                  <PackageSearch className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-200">Nenhum patrimônio encontrado</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {searchTerm 
                      ? `Nenhum bem corresponde ao termo de busca "${searchTerm}".`
                      : statusFilter === 'ENVIADOS_DTIN'
                        ? 'Nenhum equipamento foi enviado para a DTIN neste setor ainda.'
                        : `Nenhum bem com o status selecionado neste setor.`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {statusFilter === 'ENVIADOS_DTIN' && canCreateNovoEnvioDtin && (
                    <button
                      type="button"
                      onClick={() => {
                        setAssetForDtin(null);
                        setIsDtinModalOpen(true);
                      }}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Registrar Envio para o DTIN</span>
                    </button>
                  )}
                  {(searchTerm || statusFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('ALL');
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      Ver todos os bens do setor
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>

      </div>

      {/* Modals */}
      <QrScannerModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => {
          setIsAssetModalOpen(false);
          setAssetToEdit(null);
        }}
        onSave={handleSaveAsset}
        assetToEdit={assetToEdit}
        defaultSectorId={activeSectorId}
        sectors={sectors}
        servidores={servidores}
        onOpenServidoresModal={() => setIsServidoresModalOpen(true)}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setAssetForTransfer(null);
        }}
        asset={assetForTransfer}
        sectors={sectors}
        onConfirmTransfer={handleConfirmTransfer}
      />

      <SectorsManagementModal
        isOpen={isManageSectorsOpen}
        onClose={() => setIsManageSectorsOpen(false)}
        sectors={sectors}
        assets={assets}
        users={authorizedUsers}
        servidores={servidores}
        onSaveSector={handleSaveSector}
        onDeleteSector={handleDeleteSector}
        onClearSectorAssets={handleClearSectorAssets}
      />

      <CautelaModal
        isOpen={isCautelaModalOpen}
        onClose={() => {
          setIsCautelaModalOpen(false);
          setAssetForCautela(null);
        }}
        asset={assetForCautela}
        sectors={sectors}
        onSaveCautela={handleSaveCautela}
      />

      <CautelaListModal
        isOpen={isCautelaListOpen}
        onClose={() => setIsCautelaListOpen(false)}
        cautelas={cautelas}
        assets={assets}
        onReturnCautela={handleReturnCautela}
      />

      <BaixaModal
        isOpen={isBaixaModalOpen}
        onClose={() => {
          setIsBaixaModalOpen(false);
          setAssetForBaixa(null);
        }}
        asset={assetForBaixa}
        onConfirmBaixa={handleConfirmBaixa}
      />

      <DtinModal
        isOpen={isDtinModalOpen}
        onClose={() => {
          setIsDtinModalOpen(false);
          setAssetForDtin(null);
        }}
        asset={assetForDtin}
        assets={assets}
        sectors={sectors}
        defaultSectorId={activeSectorId}
        onConfirmDtin={handleConfirmDtin}
        currentUserName={currentUser?.displayName || currentUser?.email}
      />

      <LabelPrinterModal
        isOpen={isLabelsModalOpen}
        onClose={() => setIsLabelsModalOpen(false)}
        assets={filterMode === 'MY_SECTOR' ? assets.filter(a => a.setorId === activeSectorId) : assets}
        activeSector={activeSector}
      />

      <SmartImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        sectors={sectors}
        activeSectorId={activeSectorId}
        assets={assets}
        onImportSuccess={handleImportSuccess}
        onOpenManageSectors={() => setIsManageSectorsOpen(true)}
      />

      <FirebaseSettingsModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        onConfigUpdated={(active) => setIsFirebaseActive(active)}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        assets={assets}
        sectors={sectors}
        cautelas={cautelas}
        isFirebaseActive={isFirebaseActive}
        onRestoreBackup={handleRestoreBackup}
        isAdmin={effectiveUserRole === 'admin'}
        userRole={effectiveUserRole}
        userSector={sectors.find(s => s.id === effectiveUserSectorId) || (activeSectorId ? sectors.find(s => s.id === activeSectorId) : null)}
        userSectorIds={effectiveUserSectorIds.length > 0 ? effectiveUserSectorIds : (effectiveUserSectorId ? [effectiveUserSectorId] : (activeSectorId ? [activeSectorId] : []))}
      />

      {/* Admin User Management Modal */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        users={authorizedUsers}
        currentUser={currentUser}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
      />

      {/* Modal de Solicitação / Pedido de Carga (Operador informa que bem pertence a outro setor) */}
      <SolicitacaoCargaModal
        isOpen={isSolicitacaoModalOpen}
        onClose={() => {
          setIsSolicitacaoModalOpen(false);
          setAssetForSolicitacao(null);
        }}
        asset={assetForSolicitacao}
        sectors={sectors}
        currentUser={currentUser}
        userSector={sectors.find(s => s.id === effectiveUserSectorId)}
        onSubmitPedido={handleCreatePedido}
      />

      {/* Modal Central de Pedidos de Carga (Visualização e Aprovação) */}
      <PedidosCargaModal
        isOpen={isPedidosModalOpen}
        onClose={() => setIsPedidosModalOpen(false)}
        pedidos={pedidosCarga}
        isAdmin={effectiveUserRole === 'admin'}
        onAprovarPedido={handleAprovarPedido}
        onRecusarPedido={handleRecusarPedido}
        onAprovarTodos={handleAprovarTodosPedidos}
        onExcluirHistorico={handleExcluirHistoricoPedido}
        onLimparHistorico={handleLimparHistoricoPedidos}
      />

      {/* Modal de Notificações e Autorizações de Envio ao DTIN pelo Detentor */}
      <PendenciasDtinModal
        isOpen={isPendenciasDtinOpen}
        onClose={() => setIsPendenciasDtinOpen(false)}
        pendencias={effectiveUserRole === 'admin' ? pendingDtinAssets : pendingDtinAssets.filter(a => {
          if (effectiveUserSectorIds && effectiveUserSectorIds.length > 0) {
            return effectiveUserSectorIds.includes(a.setorId);
          }
          if (effectiveUserSectorId && a.setorId === effectiveUserSectorId) return true;
          const currentName = (effectiveUser?.displayName || currentUser?.displayName || '').toLowerCase().trim();
          const aResp = (a.responsavel || '').toLowerCase().trim();
          return currentName && aResp && (aResp === currentName || currentName.includes(aResp));
        })}
        onAuthorizeDtin={handleAuthorizeDtin}
        onRejectDtin={handleRejectDtin}
        currentUser={effectiveUser}
        isAdmin={effectiveUserRole === 'admin'}
      />

      {/* Modal de Gestão de Servidores & Pessoas (Onde os itens estão alocados) */}
      <ServidoresModal
        isOpen={isServidoresModalOpen}
        onClose={() => setIsServidoresModalOpen(false)}
        servidores={servidores}
        assets={assets}
        sectors={sectors}
        isAdmin={effectiveUserRole === 'admin'}
        userRole={effectiveUserRole}
        onSaveServidor={handleSaveServidor}
        onSaveServidoresBatch={handleSaveServidoresBatch}
        onDeleteServidor={handleDeleteServidor}
        onSelectServidorToFilter={handleSelectServidorToFilter}
        onGoToAsset={handleGoToAsset}
        onUnlinkAssetFromServidor={handleUnlinkAssetFromServidor}
      />

      {/* Modal Central Moderno e Elegante de Confirmação para Limpeza de Bens do Setor */}
      {sectorToClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-750 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col space-y-4">
            
            {/* Ícone e Cabeçalho */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600/30 to-amber-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 shadow-lg shadow-rose-950/50">
                <AlertTriangle className="w-6 h-6 animate-pulse text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-base sm:text-lg">Limpar Bens do Setor</h3>
                <p className="text-xs text-slate-400 mt-0.5">Confirmação de exclusão dos itens</p>
              </div>
              <button
                type="button"
                onClick={() => setSectorToClear(null)}
                disabled={isClearingSector}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Card de Destaque do Setor */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950/90 to-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-white text-sm">{sectorToClear.name}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {sectorToClear.count} {sectorToClear.count === 1 ? 'bem' : 'bens'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Responsável: <strong className="text-slate-200">{sectorToClear.responsavel}</strong></span>
              </div>
            </div>

            {/* Mensagem Explicativa */}
            <p className="text-xs text-slate-300 leading-relaxed">
              Deseja realmente apagar todos os <strong>{sectorToClear.count} bens</strong> deste setor? 
              Esta ação excluirá os itens localmente e na nuvem. O setor continuará cadastrado normalmente.
            </p>

            {/* Botões de Ação */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSectorToClear(null)}
                disabled={isClearingSector}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteClearSector}
                disabled={isClearingSector}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 flex items-center gap-2 transition-all cursor-pointer hover:scale-102 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isClearingSector ? 'Excluindo...' : `Sim, Excluir ${sectorToClear.count} Bens`}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Seguro de Confirmação para Alteração de Status em Lote (Tornar Pendente / Conferido) */}
      {batchStatusModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-750 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col space-y-4">
            
            {/* Ícone e Cabeçalho */}
            <div className="flex items-start gap-3.5">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg ${
                batchStatusModalData.newStatus === 'CONFERIDO'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-emerald-950/50'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-amber-950/50'
              }`}>
                {batchStatusModalData.newStatus === 'CONFERIDO' ? (
                  <CheckCheck className="w-6 h-6 animate-pulse text-emerald-400" />
                ) : (
                  <RotateCcw className="w-6 h-6 animate-pulse text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-base sm:text-lg">
                  {batchStatusModalData.newStatus === 'CONFERIDO' 
                    ? 'Tornar TUDO conferido' 
                    : 'Tornar TUDO pendente'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirmação de alteração em lote com sincronização
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBatchStatusModalData(null)}
                disabled={isProcessingBatchStatus}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Card de Destaque do Alvo */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950/90 to-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate pr-2">
                  <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-bold text-white text-sm truncate">{batchStatusModalData.sectorName}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold shrink-0 border ${
                  batchStatusModalData.newStatus === 'CONFERIDO'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {batchStatusModalData.count} {batchStatusModalData.count === 1 ? 'bem' : 'bens'}
                </span>
              </div>
            </div>

            {/* Mensagem Explicativa */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {batchStatusModalData.newStatus === 'CONFERIDO' ? (
                <>
                  Deseja realmente marcar todos os <strong>{batchStatusModalData.count} bens</strong> como <strong>CONFERIDOS</strong>? 
                  Todos os itens pendentes serão validados e o progresso atingirá 100%.
                </>
              ) : (
                <>
                  Deseja realmente reverter todos os <strong>{batchStatusModalData.count} bens</strong> para <strong>PENDENTES</strong>? 
                  As conferências anteriores serão desmarcadas e o progresso será zerado para novos testes/conferência real.
                </>
              )}
            </p>

            {/* Botões de Ação */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setBatchStatusModalData(null)}
                disabled={isProcessingBatchStatus}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchStatusChange}
                disabled={isProcessingBatchStatus}
                className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-102 disabled:opacity-50 ${
                  batchStatusModalData.newStatus === 'CONFERIDO'
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-950/50'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-950/50'
                }`}
              >
                {batchStatusModalData.newStatus === 'CONFERIDO' ? (
                  <CheckCheck className="w-4 h-4" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                <span>
                  {isProcessingBatchStatus
                    ? 'Processando e Sincronizando...'
                    : batchStatusModalData.newStatus === 'CONFERIDO'
                      ? `Sim, Tornar ${batchStatusModalData.count} Bens Conferidos`
                      : `Sim, Tornar ${batchStatusModalData.count} Bens Pendentes`}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Seguro de Exclusão de Bem com Motivo Obrigatório */}
      <DeleteAssetModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAssetToDelete(null);
        }}
        asset={assetToDelete}
        onConfirmDelete={handleConfirmDeleteAsset}
      />

      {/* Modal de Configurações Visuais e de Exibição */}
      <DisplaySettingsModal
        isOpen={isDisplaySettingsOpen}
        onClose={() => setIsDisplaySettingsOpen(false)}
        settings={displaySettings}
        onSaveSettings={handleSaveDisplaySettings}
      />

      {/* Modalzinho de Escolha de Ordenação do Relatório (Patrimônio ou Item) */}
      <ExportReportModal
        isOpen={isExportReportModalOpen}
        onClose={() => {
          setIsExportReportModalOpen(false);
          setExportReportSector(null);
        }}
        onConfirmExport={handleConfirmExportReport}
        sectorName={exportReportSector ? exportReportSector.name : 'Todos os Setores'}
      />

      {/* Barra Flutuante de Ações em Lote Apenas para Mobile: Desce suave do topo */}
      <div 
        className={`md:hidden fixed top-3 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-1000 ease-in-out ${
          canShowBulkActionBar
            ? 'translate-y-0 opacity-100 pointer-events-auto scale-100'
            : '-translate-y-28 opacity-0 pointer-events-none scale-95'
        }`}
      >
        <BulkActionBar
          selectedCount={displaySelectedCount || selectedAssetIds.size}
          onClearSelection={handleClearSelection}
          onAssignTi={handleBulkAssignTi}
          onAssignSector={handleBulkAssignSector}
          sectors={sectors}
          servidores={servidores}
          onAssignServidor={handleBulkAssignServidor}
        />
      </div>

    </div>
  );
}

export default App;
