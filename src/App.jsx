import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  SolicitacaoCargaModal 
} from './components/SolicitacaoCargaModal';
import { 
  PedidosCargaModal 
} from './components/PedidosCargaModal';

import { 
  loadLocalData, 
  resetToDefaultData,
  saveLocalAssets, 
  saveLocalCautelas, 
  saveLocalSectors,
  initFirebase,
  subscribeToAuth,
  logoutUser,
  loadAuthorizedUsers,
  saveAuthorizedUserToCloud,
  deleteAuthorizedUserFromCloud,
  checkUserAuthorization
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
  Eraser
} from 'lucide-react';

export function App() {
  // Authentication and Authorization States (Sessão inicial Super Admin: irandyalves@gmail.com)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('carga_patrimonio_current_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email && !parsed.email.includes('patrimonio.gov.br')) {
          return parsed;
        }
      }
    } catch (e) {}
    const defaultAdmin = { 
      displayName: 'Irandy Alves', 
      email: 'irandyalves@gmail.com',
      role: 'admin'
    };
    try {
      localStorage.setItem('carga_patrimonio_current_user', JSON.stringify(defaultAdmin));
    } catch (e) {}
    return defaultAdmin;
  });
  const [userRole, setUserRole] = useState('admin'); // 'admin' | 'operador'
  const [isAuthorized, setIsAuthorized] = useState(true);
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
  const [filterMode, setFilterMode] = useState('MY_SECTOR'); // 'MY_SECTOR' | 'ALL_SECTORS'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDENTES' | 'CONFERIDOS' | 'CAUTELAS' | 'BAIXADOS'
  const [searchTerm, setSearchTerm] = useState('');
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

  // Visibilidade das Colunas [Quantidade, Marca, Modelo, Responsável, Aquisição, $ Original, $ Atual, Depreciação]
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const stored = localStorage.getItem('carga_patrimonio_visible_columns');
      if (stored) {
        return {
          quantidade: true,
          marca: true,
          modelo: true,
          responsavel: true,
          dataAquisicao: true,
          valorOriginal: true,
          valorAtual: true,
          depreciacao: true,
          ...JSON.parse(stored)
        };
      }
    } catch (e) {}
    return {
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
  });

  useEffect(() => {
    try {
      localStorage.setItem('carga_patrimonio_visible_columns', JSON.stringify(visibleColumns));
    } catch (e) {}
  }, [visibleColumns]);

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const showAllColumns = () => {
    setVisibleColumns({
      quantidade: true,
      marca: true,
      modelo: true,
      localizacao: true,
      responsavel: true,
      dataAquisicao: true,
      valorOriginal: true,
      valorAtual: true,
      depreciacao: true
    });
  };

  const hiddenColumnsCount = useMemo(() => {
    let count = 0;
    if (visibleColumns.quantidade === false) count++;
    if (visibleColumns.marca === false) count++;
    if (visibleColumns.modelo === false) count++;
    if (visibleColumns.localizacao === false) count++;
    if (visibleColumns.responsavel === false) count++;
    if (visibleColumns.dataAquisicao === false) count++;
    if (visibleColumns.valorOriginal === false) count++;
    if (visibleColumns.valorAtual === false) count++;
    if (visibleColumns.depreciacao === false) count++;
    return count;
  }, [visibleColumns]);

  const tableMinWidth = useMemo(() => {
    let base = 600;
    if (visibleColumns.quantidade !== false) base += 48;
    if (visibleColumns.marca !== false) base += 112;
    if (visibleColumns.modelo !== false) base += 112;
    if (visibleColumns.localizacao !== false) base += 192;
    if (visibleColumns.responsavel !== false) base += 112;
    if (visibleColumns.dataAquisicao !== false) base += 96;
    if (visibleColumns.valorOriginal !== false) base += 112;
    if (visibleColumns.valorAtual !== false) base += 112;
    if (visibleColumns.depreciacao !== false) base += 112;
    return `${base}px`;
  }, [visibleColumns]);

  // Dropdown de Gerenciamento de Colunas
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const columnDropdownRef = useRef(null);

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

  // Persona Simulada para Teste de Operadores e Departamentos
  const [simulatedPersonaId, setSimulatedPersonaId] = useState('admin');

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

    // Load authorized users and subscribe to Firebase Auth
    let unsubscribe = () => {};
    loadAuthorizedUsers().then(usersList => {
      setAuthorizedUsers(usersList);

      unsubscribe = subscribeToAuth(async (user) => {
        if (user && user.email) {
          const authCheck = checkUserAuthorization(user.email, usersList);
          if (authCheck && authCheck.authorized) {
            setCurrentUser(user);
            setUserRole(authCheck.role);
            setIsAuthorized(true);
            setAuthError(null);
          } else {
            showToast(`Usuário Google ${user.email} conectado (perfil padrão).`, 'info');
          }
        }
        setAuthLoading(false);
      });
    }).catch(err => {
      console.warn('Firebase em modo local:', err);
      setAuthLoading(false);
    });

    return () => unsubscribe();
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

  // Persona e Permissões Efetivas para Teste de Operadores e Departamentos
  const simulatedPersona = useMemo(() => {
    if (simulatedPersonaId === 'admin') {
      return { id: 'admin', role: 'admin', sectorId: null, sectorName: 'Administrador' };
    }
    const sec = sectors.find(s => s.id === simulatedPersonaId);
    return {
      id: sec ? sec.id : 'operador',
      role: 'operador',
      sectorId: sec ? sec.id : null,
      sectorName: sec ? `${sec.name} (${sec.responsavel})` : 'Operador'
    };
  }, [simulatedPersonaId, sectors]);

  // Setor vinculado ao responsável logado (reconhece por e-mail ou nome cadastrado)
  const userLinkedSector = useMemo(() => {
    if (!currentUser) return null;
    const userEmail = (currentUser.email || '').toLowerCase().trim();
    const userName = (currentUser.displayName || currentUser.name || '').toLowerCase().trim();

    if (userEmail) {
      const matchByEmail = sectors.find(s => s.email && s.email.toLowerCase().trim() === userEmail);
      if (matchByEmail) return matchByEmail;
    }

    if (userName) {
      const matchByName = sectors.find(s => s.responsavel && (
        s.responsavel.toLowerCase().trim() === userName ||
        userName.includes(s.responsavel.toLowerCase().trim()) ||
        s.responsavel.toLowerCase().trim().includes(userName)
      ));
      if (matchByName) return matchByName;
    }

    return null;
  }, [currentUser, sectors]);

  const effectiveUserRole = simulatedPersonaId !== 'admin' ? simulatedPersona?.role : (userRole || 'admin');
  const effectiveUserSectorId = simulatedPersonaId !== 'admin' 
    ? simulatedPersona?.sectorId 
    : (userRole === 'operador' ? (userLinkedSector?.id || null) : null);

  const handleSelectPersona = (personaId) => {
    setSimulatedPersonaId(personaId);
    if (personaId !== 'admin') {
      setActiveSectorId(personaId);
      setFilterMode('MY_SECTOR');
      const sec = sectors.find(s => s.id === personaId);
      showToast(`Visão de Operador ativada: ${sec?.responsavel} (${sec?.name}) - Limitado ao seu departamento`, 'info');
    } else {
      showToast('Visão de Administrador ativada (Acesso e alteração liberados em todos os departamentos)', 'success');
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (user) => {
    if (!user) return;
    const authCheck = checkUserAuthorization(user.email, authorizedUsers);
    if (authCheck && authCheck.authorized) {
      setCurrentUser(user);
      setUserRole(authCheck.role);
      setIsAuthorized(true);
      setAuthError(null);

      // Se for operador e tiver setor vinculado, ativa automaticamente seu setor
      if (authCheck.role === 'operador') {
        const uEmail = user.email.toLowerCase().trim();
        const uName = (user.displayName || '').toLowerCase().trim();
        const linked = sectors.find(s => 
          (s.email && s.email.toLowerCase().trim() === uEmail) ||
          (uName && s.responsavel && s.responsavel.toLowerCase().trim().includes(uName))
        );
        if (linked) {
          setActiveSectorId(linked.id);
          setFilterMode('MY_SECTOR');
          showToast(`Bem-vindo, ${linked.responsavel}! Setor ${linked.name} carregado.`);
          return;
        }
      }
      showToast(`Bem-vindo, ${user.displayName || user.email}!`);
    } else {
      setCurrentUser(user);
      setUserRole('admin');
      setIsAuthorized(true);
      showToast(`Conectado como ${user.displayName || user.email}.`);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    const superAdmin = { displayName: 'Irandy Alves', email: 'irandyalves@gmail.com', role: 'admin' };
    setCurrentUser(superAdmin);
    try {
      localStorage.setItem('carga_patrimonio_current_user', JSON.stringify(superAdmin));
    } catch (e) {}
    setUserRole('admin');
    setIsAuthorized(true);
    setSimulatedPersonaId('admin');
    showToast('Sessão restaurada para Super Admin (irandyalves@gmail.com).');
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

  // Conference Statistics Calculation
  const stats = useMemo(() => {
    const sectorAssets = assets.filter(a => a.setorId === activeSectorId);
    const total = sectorAssets.length;
    const conferidos = sectorAssets.filter(a => a.status === 'CONFERIDO').length;
    const cautelasCount = sectorAssets.filter(a => a.status === 'EM_CAUTELA').length;
    const baixados = sectorAssets.filter(a => a.status === 'BAIXADO' || a.baixado).length;
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
  }, [assets, activeSectorId]);

  // Filtered Assets for Display
  const filteredAssets = useMemo(() => {
    return assets.filter(item => {
      // Sector filter: quando estiver no modo setor, filtra sempre pelo setor selecionado
      if (filterMode === 'MY_SECTOR') {
        if (item.setorId !== activeSectorId) return false;
      }

      // Status filter
      if (statusFilter === 'PENDENTES' && (item.status === 'CONFERIDO' || item.status === 'BAIXADO')) return false;
      if (statusFilter === 'CONFERIDOS' && item.status !== 'CONFERIDO') return false;
      if (statusFilter === 'CAUTELAS' && item.status !== 'EM_CAUTELA') return false;
      if (statusFilter === 'BAIXADOS' && item.status !== 'BAIXADO' && !item.baixado) return false;
      if (statusFilter === 'ENVIADOS_DTIN' && item.status !== 'ENVIADO_DTIN' && !item.enviadoDtin) return false;

      // Text search filter (busca flexível, não exata, multi-termos, com e sem ponto, sem acentos)
      if (searchTerm) {
        if (!matchesAsset(item, searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [assets, activeSectorId, filterMode, statusFilter, searchTerm]);

  // IDs de itens que foram desmarcados da conferência enquanto estavam na seção de conferidos
  // Permite que o item continue visível no mesmo local (sem pular para o topo) até que o usuário mude de setor/filtro
  const [stayInConferidosIds, setStayInConferidosIds] = useState(() => new Set());

  // Limpa os itens mantidos temporariamente quando mudar de setor ou status
  useEffect(() => {
    setStayInConferidosIds(new Set());
  }, [activeSectorId, filterMode, statusFilter]);

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
      } else if (item.status === 'CONFERIDO' || stayInConferidosIds.has(item.id)) {
        conferidos.push(item);
      } else {
        pendentes.push(item);
      }
    });

    pendentes.sort(sortFn);
    conferidos.sort(conferidosSortFn);
    baixados.sort(sortFn);

    return [...pendentes, ...conferidos, ...baixados];
  }, [filteredAssets, sortField, sortDirection, conferidosSortField, conferidosSortDirection, stayInConferidosIds]);

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
    if (effectiveUserRole !== 'admin' && effectiveUserSectorId && itemToCheck && itemToCheck.setorId !== effectiveUserSectorId) {
      showToast('Você só pode conferir bens do seu departamento. Use "Fazer Pedido" para este item.', 'warning');
      return;
    }

    // Salva a posição de rolagem para manter exatamente onde o usuário está
    const currentScrollTop = mainScrollRef.current ? mainScrollRef.current.scrollTop : null;

    const isCurrentlyConferido = itemToCheck?.status === 'CONFERIDO';
    const isNowConferido = !isCurrentlyConferido;

    if (isCurrentlyConferido) {
      // Se estava conferido e foi desmarcado: mantém o item exatamente onde está no final da lista
      setStayInConferidosIds(prev => {
        const next = new Set(prev);
        next.add(assetId);
        return next;
      });
    } else {
      // Se foi marcado como conferido: remove dos mantidos temporariamente
      setStayInConferidosIds(prev => {
        if (prev.has(assetId)) {
          const next = new Set(prev);
          next.delete(assetId);
          return next;
        }
        return prev;
      });
    }

    const updated = assets.map(item => {
      if (item.id === assetId) {
        const nowStr = new Date().toLocaleString('pt-BR');
        
        return {
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
      }
      return item;
    });

    setAssets(updated);

    // Restaura scroll sem salto
    if (currentScrollTop !== null) {
      requestAnimationFrame(() => {
        if (mainScrollRef.current) {
          mainScrollRef.current.scrollTop = currentScrollTop;
        }
      });
    }
    
    // Check if whole sector reached 100%
    const itemChecked = updated.find(a => a.id === assetId);
    if (itemChecked && itemChecked.status === 'CONFERIDO') {
      showToast(`Bem ${itemChecked.numeroPatrimonio} conferido com sucesso!`);
      const sectorRemaining = updated.filter(a => a.setorId === activeSectorId && a.status !== 'CONFERIDO' && a.status !== 'BAIXADO');
      if (sectorRemaining.length === 0) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        showToast('Parabéns! 100% da carga do setor foi conferida com sucesso!', 'success');
      }
    } else if (itemChecked) {
      showToast(`Conferência do bem ${itemChecked.numeroPatrimonio} desmarcada.`, 'info');
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

  // Direct Voice Search Handler (Sem modal, busca instantânea sem precisar de confirmação)
  const handleVoiceDirectSearch = (spokenText) => {
    if (!spokenText || !spokenText.trim()) return;

    const rawClean = spokenText.trim();
    // Extrai números para buscar por patrimônio (ex: 42542 ou últimos 5 dígitos)
    const digitsOnly = rawClean.replace(/\D/g, '');
    const last5 = digitsOnly.length >= 5 ? digitsOnly.slice(-5) : (digitsOnly.length > 0 ? digitsOnly : null);

    let found = null;
    if (last5 || digitsOnly) {
      found = assets.find(a => {
        const aNum = String(a.numeroPatrimonio || '').trim();
        const aDigits = aNum.replace(/\D/g, '');
        const aLast5 = aDigits.length >= 5 ? aDigits.slice(-5) : aDigits;
        return aNum === rawClean || (last5 && aLast5 === last5) || (digitsOnly && aDigits.endsWith(digitsOnly));
      });
    }

    // Se não localizou por número, busca por descrição
    if (!found && rawClean.length >= 2) {
      const q = rawClean.toLowerCase();
      found = assets.find(a => 
        a.descricao?.toLowerCase().includes(q) || 
        a.numeroPatrimonio?.toLowerCase().includes(q)
      );
    }

    if (found) {
      // Se estiver em outro setor, comuta automaticamente para a aba do setor correspondente
      if (found.setorId !== activeSectorId) {
        setActiveSectorId(found.setorId);
        showToast(`🎯 Encontrado no setor "${found.setorNome}" (${found.responsavel}): ${formatLast5Patrimonio(found.numeroPatrimonio)} - ${found.descricao}`, 'success');
      } else {
        showToast(`🎯 Encontrado: ${formatLast5Patrimonio(found.numeroPatrimonio)} - ${found.descricao}`, 'success');
      }
      // Filtra diretamente pelo patrimônio formatado no formato XX.XXX
      setSearchTerm(formatLast5Patrimonio(found.numeroPatrimonio));
    } else {
      setSearchTerm(rawClean);
      showToast(`🎙️ Pesquisando por: "${rawClean}"`, 'info');
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
        return {
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
      }
      return item;
    });

    setAssets(updated);
    showToast(`Bem transferido com sucesso para ${transferDetails.setorNome}!`);
  };

  // Atualizar localização rápida do bem (por digitação, escolha ou microfone)
  const handleUpdateAssetLocation = (assetId, newLocation) => {
    const updated = assets.map(item => {
      if (item.id === assetId) {
        return {
          ...item,
          localizacao: newLocation
        };
      }
      return item;
    });
    setAssets(updated);
    showToast(`Localização atualizada: "${newLocation}"`);
  };

  // Atualizar observação rápida do bem (inline, por digitação ou voz inteligente com detecção de setor)
  const handleUpdateAssetObservation = (assetId, newObservation) => {
    const updated = assets.map(item => {
      if (item.id === assetId) {
        return {
          ...item,
          observacao: newObservation
        };
      }
      return item;
    });
    setAssets(updated);
    showToast(newObservation ? `Observação salva: "${newObservation}"` : 'Observação limpa');
  };

  // Alterar cor de destaque da linha/card do bem
  const handleUpdateAssetColor = (assetId, color) => {
    const updated = assets.map(item => {
      if (item.id === assetId) {
        return {
          ...item,
          cardColor: color === 'default' ? null : color
        };
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
        return {
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
      }
      return a;
    });

    setAssets(updatedAssets);
    setPedidosCarga(prev => [newPedido, ...prev]);
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

    setPedidosCarga(prev => prev.map(p => p.id === pedido.id ? { ...p, status: 'APROVADO' } : p));
    showToast(`Pedido aprovado com sucesso! Bem ${formatLast5Patrimonio(pedido.numeroPatrimonio)} transferido para ${pedido.setorDestinoNome}.`, 'success');
  };

  // Recusar Pedido de Carga
  const handleRecusarPedido = (pedidoId) => {
    setPedidosCarga(prev => prev.map(p => p.id === pedidoId ? { ...p, status: 'RECUSADO' } : p));
    showToast('Pedido arquivado como recusado.', 'info');
  };

  // Save New or Edited Asset
  const handleSaveAsset = (assetData) => {
    if (assetToEdit) {
      const updated = assets.map(a => a.id === assetToEdit.id ? { ...a, ...assetData } : a);
      setAssets(updated);
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
            usuario: currentUser?.displayName || currentUser?.email || activeSector.responsavel
          }
        ]
      };
      setAssets([newAsset, ...assets]);
      showToast('Novo bem cadastrado com sucesso!');
    }
    setIsAssetModalOpen(false);
    setAssetToEdit(null);
  };

  // Delete Asset
  const handleDeleteAsset = (assetId) => {
    if (confirm('Tem certeza que deseja excluir este patrimônio do sistema?')) {
      setAssets(assets.filter(a => a.id !== assetId));
      showToast('Patrimônio excluído com sucesso.', 'info');
    }
  };

  // Save Sector
  const handleSaveSector = (sectorData) => {
    const isExisting = sectors.some(s => s.id === sectorData.id);
    let updated;
    if (isExisting) {
      updated = sectors.map(s => s.id === sectorData.id ? sectorData : s);
      showToast(`Setor "${sectorData.name}" atualizado com sucesso!`);
    } else {
      const newSector = {
        ...sectorData,
        id: sectorData.id || `sec-${Date.now()}`
      };
      updated = [...sectors, newSector];
      setActiveSectorId(newSector.id);
      setFilterMode('MY_SECTOR');
      showToast(`Novo setor "${newSector.name}" cadastrado com sucesso!`);
    }
    updated.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
    setSectors(updated);
    saveLocalSectors(updated);
  };

  // Delete Sector
  const handleDeleteSector = (sectorId, reassignToSectorId) => {
    if (reassignToSectorId) {
      const targetSec = sectors.find(s => s.id === reassignToSectorId);
      const reassignedAssets = assets.map(a => {
        if (a.setorId === sectorId) {
          return {
            ...a,
            setorId: reassignToSectorId,
            setorNome: targetSec?.name || a.setorNome,
            responsavel: targetSec?.responsavel || a.responsavel
          };
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

    // Update asset status
    const updated = assets.map(a => {
      if (a.id === cautelaData.assetId) {
        return {
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

    // Update cautela
    setCautelas(cautelas.map(c => {
      if (c.id === cautelaId) {
        return {
          ...c,
          status: 'DEVOLVIDO',
          dataDevolucaoReal: nowStr,
          observacoesDevolucao
        };
      }
      return c;
    }));

    // Update asset
    setAssets(assets.map(a => {
      if (a.id === cautela.assetId) {
        return {
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
        return {
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
        return {
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
  const handleConfirmDtin = (assetId, dadosDtin) => {
    const updated = assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: 'ENVIADO_DTIN',
          enviadoDtin: true,
          dadosDtin: {
            ...dadosDtin,
            dataHoraRegistro: new Date().toISOString()
          },
          historico: [
            ...(a.historico || []),
            { 
              data: dadosDtin.data, 
              acao: `Envio ao DTIN: ${dadosDtin.motivo}${dadosDtin.chamado ? ` (Chamado/OS: ${dadosDtin.chamado})` : ''}`, 
              usuario: currentUser?.displayName || currentUser?.email || activeSector.responsavel 
            }
          ]
        };
      }
      return a;
    });
    setAssets(updated);
    showToast('Equipamento enviado ao DTIN com sucesso!');
  };

  // Retorno / Reintegração do DTIN
  const handleReturnDtin = (assetId) => {
    const nowStr = new Date().toLocaleString('pt-BR');
    const updated = assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: 'PENDENTE',
          enviadoDtin: false,
          dadosDtin: null,
          historico: [
            ...(a.historico || []),
            { 
              data: nowStr, 
              acao: 'Retorno do DTIN: Equipamento reintegrado ao setor', 
              usuario: currentUser?.displayName || currentUser?.email || activeSector.responsavel 
            }
          ]
        };
      }
      return a;
    });
    setAssets(updated);
    showToast('Retorno do DTIN confirmado e equipamento reintegrado!');
  };

  // Single label print
  const handlePrintSingleLabel = async (asset) => {
    await generateLabelsPDF([asset]);
  };

  // Export inventory report
  const handleExportReportPDF = () => {
    const sectorAssets = filterMode === 'MY_SECTOR' 
      ? assets.filter(a => a.setorId === activeSectorId) 
      : assets;
    generateInventoryReportPDF(filterMode === 'MY_SECTOR' ? activeSector : null, sectorAssets, stats);
  };

  // Mass Import Success (Excel, Word, CSV, TXT)
  const handleImportSuccess = (importedAssets, targetSectorId) => {
    setAssets(prev => {
      const merged = [...importedAssets, ...prev];
      saveLocalAssets(merged);
      return merged;
    });
    if (targetSectorId && targetSectorId !== 'auto') {
      setActiveSectorId(targetSectorId);
      setFilterMode('MY_SECTOR');
    }
    showToast(`🎉 ${importedAssets.length} itens importados com sucesso!`);
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    setIsExcelModalOpen(false);
  };

  // Restore Backup Payload
  const handleRestoreBackup = (backupPayload) => {
    if (backupPayload.assets) setAssets(backupPayload.assets);
    if (backupPayload.sectors) setSectors(backupPayload.sectors);
    if (backupPayload.cautelas) setCautelas(backupPayload.cautelas);
    showToast('Base de dados restaurada com sucesso!');
  };



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
        currentUser={currentUser}
        userRole={userRole}
        onLogout={handleLogout}
        isFirebaseActive={isFirebaseActive}
        cautelasCount={cautelas.filter(c => c.status === 'EM_ANDAMENTO').length}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenPedidos={() => setIsPedidosModalOpen(true)}
        pedidosCount={pedidosCarga.filter(p => p.status === 'PENDENTE').length}
        currentPersona={simulatedPersona}
        onSelectPersona={handleSelectPersona}
        sectors={sectors}
        activeSectorName={activeSector?.name}
        filterMode={filterMode}
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
          onOpenManageSectors={() => setIsManageSectorsOpen(true)}
          userRole={effectiveUserRole}
          userSectorId={effectiveUserSectorId}
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
        />

        {/* Área Principal de Conteúdo */}
        <main 
          ref={mainScrollRef} 
          onScroll={handleMainScroll}
          className={`flex-1 min-w-0 h-full w-full overflow-y-auto overflow-x-auto custom-scroll-auto-hide ${isScrolling ? 'is-scrolling' : ''} bg-slate-950 flex flex-col relative`}
        >
          <div style={{ minWidth: isMobile ? '100%' : tableMinWidth }} className="w-full flex flex-col min-h-full transition-all duration-200">

            {/* Cabeçalho Fixo da Tabela Desktop */}
            <div className="hidden md:flex sticky top-0 z-20 shrink-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-[0_18px_42px_-4px_rgba(0,0,0,0.95),0_8px_20px_-2px_rgba(0,0,0,0.8)] w-full h-[58px] items-center">
              <div className="w-full">
                <div className="pl-6 pr-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none border border-transparent">
                  
                  {/* Coluna 1: Patrimônio */}
                  <button
                    onClick={() => handleSort('numeroPatrimonio')}
                    title="Clique para ordenar por patrimônio"
                    className={`w-28 shrink-0 flex items-center justify-start gap-1 transition-colors cursor-pointer group text-left ${
                      sortField === 'numeroPatrimonio' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                    }`}
                  >
                    <span>Patrimônio</span>
                    <span className="shrink-0 ml-0.5">
                      {sortField === 'numeroPatrimonio' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-400" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                      )}
                    </span>
                  </button>

                  {/* Coluna 2: Quantidade com Olhinho para Ocultar */}
                  {visibleColumns.quantidade !== false && (
                    <div className="w-12 shrink-0 flex items-center justify-center gap-0.5 group/col animate-in fade-in duration-150">
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
                            sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-cyan-400" /> : <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleColumn('quantidade');
                        }}
                        title="Ocultar coluna Quantidade"
                        className="p-0.5 text-slate-400 hover:text-rose-400 opacity-60 group-hover/col:opacity-100 hover:bg-slate-800 rounded transition-all cursor-pointer"
                      >
                        <Eye className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}

                  {/* Coluna 3: Item (Expande dinamicamente para ocupar todo o espaço liberado pelas colunas ocultadas) */}
                  <button
                    onClick={() => handleSort('descricao')}
                    title="Clique para ordenar alfabeticamente pelo item"
                    className={`flex-1 min-w-0 shrink flex items-center justify-start gap-1.5 transition-all cursor-pointer group ${
                      sortField === 'descricao' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Item</span>
                    <span className="shrink-0 ml-0.5">
                      {sortField === 'descricao' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-400" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                      )}
                    </span>
                  </button>

                  {/* Coluna 4: Marca */}
                  {visibleColumns.marca && (
                    <div className="w-28 shrink-0 flex items-center justify-start gap-1 group/col animate-in fade-in duration-150">
                      <button
                        onClick={() => handleSort('marca')}
                        title="Clique para ordenar por marca"
                        className={`flex items-center justify-start gap-1 transition-colors cursor-pointer group truncate ${
                          sortField === 'marca' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <span>Marca</span>
                        <span className="shrink-0 ml-0.5">
                          {sortField === 'marca' ? (
                            sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-400" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleColumn('marca');
                        }}
                        title="Ocultar coluna Marca"
                        className="p-1 text-slate-400 hover:text-rose-400 opacity-60 group-hover/col:opacity-100 hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Coluna 5: Modelo */}
                  {visibleColumns.modelo && (
                    <div className="w-28 shrink-0 flex items-center justify-start gap-1 group/col animate-in fade-in duration-150">
                      <button
                        onClick={() => handleSort('modelo')}
                        title="Clique para ordenar por modelo"
                        className={`flex items-center justify-start gap-1 transition-colors cursor-pointer group truncate ${
                          sortField === 'modelo' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <span>Modelo</span>
                        <span className="shrink-0 ml-0.5">
                          {sortField === 'modelo' ? (
                            sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-400" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleColumn('modelo');
                        }}
                        title="Ocultar coluna Modelo"
                        className="p-1 text-slate-400 hover:text-rose-400 opacity-60 group-hover/col:opacity-100 hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Coluna 6: Localização com Olhinho para Ocultar */}
                  {visibleColumns.localizacao !== false && (
                    <div className="w-48 shrink-0 flex items-center justify-start gap-1 group/col animate-in fade-in duration-150">
                      <button
                        onClick={() => handleSort('localizacao')}
                        title="Clique para ordenar por localização"
                        className={`flex items-center justify-start gap-1 transition-colors cursor-pointer group text-left ${
                          sortField === 'localizacao' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <span>Localização</span>
                        <span className="shrink-0 ml-0.5">
                          {sortField === 'localizacao' ? (
                            sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-400" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleColumn('localizacao');
                        }}
                        title="Ocultar coluna Localização"
                        className="p-1 text-slate-400 hover:text-rose-400 opacity-60 group-hover/col:opacity-100 hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Coluna 7: Observação */}
                  <div className="w-52 shrink-0 flex items-center justify-start text-left">
                    <span>Observação</span>
                  </div>

                  {/* Coluna 6: Responsável com Olhinho para Ocultar */}
                  {visibleColumns.responsavel && (
                    <div className="w-28 shrink-0 flex items-center justify-center gap-1 group/col animate-in fade-in duration-150">
                      <button
                        onClick={() => handleSort('responsavel')}
                        title="Clique para ordenar por responsável"
                        className={`flex items-center justify-center gap-1 transition-colors cursor-pointer group ${
                          sortField === 'responsavel' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <span>Responsável</span>
                        <span className="shrink-0 ml-0.5">
                          {sortField === 'responsavel' ? (
                            sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-400" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleColumn('responsavel');
                        }}
                        title="Ocultar coluna Responsável"
                        className="p-1 text-slate-400 hover:text-rose-400 opacity-60 group-hover/col:opacity-100 hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Coluna 7: Data Aquisição com Olhinho para Ocultar */}
                  {visibleColumns.dataAquisicao && (
                    <div className="w-24 shrink-0 flex items-center justify-center gap-0.5 group/col animate-in fade-in duration-150">
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
                            sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-400" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleColumn('dataAquisicao');
                        }}
                        title="Ocultar coluna Aquisição"
                        className="p-1 text-slate-400 hover:text-rose-400 opacity-60 group-hover/col:opacity-100 hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Coluna 8: Valor Original com Olhinho para Ocultar */}
                  {visibleColumns.valorOriginal && (
                    <div className="w-28 shrink-0 flex items-center justify-end gap-0.5 group/col animate-in fade-in duration-150 pr-2">
                      <button
                        onClick={() => handleSort('valorOriginal')}
                        title="Clique para ordenar por valor original"
                        className={`flex items-center justify-end gap-0.5 transition-colors cursor-pointer group whitespace-nowrap ${
                          sortField === 'valorOriginal' ? 'text-indigo-300 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <span>$ Original</span>
                        <span className="shrink-0 ml-0.5">
                          {sortField === 'valorOriginal' ? (
                            sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-400" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleColumn('valorOriginal');
                        }}
                        title="Ocultar coluna $ Original"
                        className="p-1 text-slate-400 hover:text-rose-400 opacity-60 group-hover/col:opacity-100 hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Coluna 11: Valor Atual com Olhinho para Ocultar */}
                  {visibleColumns.valorAtual && (
                    <div className="w-28 shrink-0 flex items-center justify-end gap-0.5 group/col animate-in fade-in duration-150 pr-2">
                      <button
                        onClick={() => handleSort('valorAtual')}
                        title="Clique para ordenar por valor atual"
                        className={`flex items-center justify-end gap-0.5 transition-colors cursor-pointer group whitespace-nowrap ${
                          sortField === 'valorAtual' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <span>$ Atual</span>
                        <span className="shrink-0 ml-0.5">
                          {sortField === 'valorAtual' ? (
                            sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleColumn('valorAtual');
                        }}
                        title="Ocultar coluna $ Atual"
                        className="p-1 text-slate-400 hover:text-rose-400 opacity-60 group-hover/col:opacity-100 hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Coluna 12: Depreciação com Olhinho para Ocultar */}
                  {visibleColumns.depreciacao && (
                    <div className="w-28 shrink-0 flex items-center justify-end gap-0.5 group/col animate-in fade-in duration-150 pr-2">
                      <button
                        onClick={() => handleSort('depreciacao')}
                        title="Clique para ordenar por depreciação"
                        className={`flex items-center justify-end gap-0.5 transition-colors cursor-pointer group whitespace-nowrap ${
                          sortField === 'depreciacao' ? 'text-amber-400 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <span>Depreciação</span>
                        <span className="shrink-0 ml-0.5">
                          {sortField === 'depreciacao' ? (
                            sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-400" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleColumn('depreciacao');
                        }}
                        title="Ocultar coluna Depreciação"
                        className="p-1 text-slate-400 hover:text-rose-400 opacity-60 group-hover/col:opacity-100 hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Coluna 13: Ações + Botão de Gerenciamento e Restauração de Colunas */}
                  <div className="w-28 shrink-0 flex items-center justify-end gap-1.5 pr-0.5 relative" ref={columnDropdownRef}>
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
                          <span>Exibir Colunas</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={showAllColumns}
                              className="text-indigo-400 hover:text-indigo-300 text-[9.5px] lowercase font-semibold underline cursor-pointer"
                            >
                              exibir todas
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 pt-0.5">
                          {[
                            { key: 'quantidade', label: 'Qtde (Quantidade)' },
                            { key: 'marca', label: 'Marca' },
                            { key: 'modelo', label: 'Modelo' },
                            { key: 'localizacao', label: 'Localização' },
                            { key: 'responsavel', label: 'Responsável' },
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
              </div>
            </div>

            {/* Barra Informativa Compacta (quando há busca ou filtro ativo) */}
            {(searchTerm || statusFilter !== 'ALL') && (
              <div className="px-4 pt-3">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-900/70 border border-slate-800 rounded-xl text-xs text-slate-300 animate-in fade-in">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-400">Filtrando:</span>
                    {statusFilter !== 'ALL' && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                        {statusFilter === 'PENDENTES' ? 'Pendentes' : statusFilter === 'CONFERIDOS' ? 'Conferidos' : statusFilter === 'CAUTELAS' ? 'Em Cautela' : statusFilter === 'ENVIADOS_DTIN' ? 'Enviados para a DTIN' : 'Baixados'}
                      </span>
                    )}
                    {searchTerm && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                        Termo: "{searchTerm}"
                      </span>
                    )}
                    <span className="text-slate-400 font-medium">({filteredAssets.length} {filteredAssets.length === 1 ? 'item' : 'itens'})</span>

                    {/* Controles de ordenação rápida quando filtrado por conferidos */}
                    {statusFilter === 'CONFERIDOS' && (
                      <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-700">
                        <span className="text-[10.5px] text-slate-400 font-medium">Ordenar:</span>
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
                          className={`px-2 py-1 rounded-md text-[10.5px] font-bold flex items-center gap-1 border cursor-pointer transition-colors ${
                            conferidosSortField === 'numeroPatrimonio'
                              ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-sm ring-1 ring-emerald-400/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                          title={`Ordenar conferidos por Patrimônio (${conferidosSortDirection === 'asc' ? 'Crescente ▲' : 'Decrescente ▼'})`}
                        >
                          <Hash className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[9px] leading-none select-none">
                            {conferidosSortField === 'numeroPatrimonio' ? (
                              conferidosSortDirection === 'asc' ? '▲' : '▼'
                            ) : (
                              <span className="opacity-40">▲</span>
                            )}
                          </span>
                        </button>
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
                          className={`px-2 py-1 rounded-md text-[10.5px] font-bold flex items-center gap-1 border cursor-pointer transition-colors ${
                            conferidosSortField === 'descricao'
                              ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-sm ring-1 ring-emerald-400/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                          title={`Ordenar conferidos por Item / Descrição (${conferidosSortDirection === 'asc' ? 'A-Z ▲' : 'Z-A ▼'})`}
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[9px] leading-none select-none">
                            {conferidosSortField === 'descricao' ? (
                              conferidosSortDirection === 'asc' ? '▲' : '▼'
                            ) : (
                              <span className="opacity-40">▲</span>
                            )}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setStatusFilter('ALL');
                      setSearchTerm('');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline underline-offset-2"
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>
            )}

            {/* Asset Cards or Empty State (Linha começa debaixo da slidebar, sem puxar o conteúdo) */}
            {filteredAssets.length > 0 ? (
              <div className="w-full flex-1 pb-8 border-t border-slate-800/80">
                {sortedAssets.map((asset, index) => {
                  const isBaixado = asset.baixado || asset.status === 'BAIXADO';
                  const isConferido = asset.status === 'CONFERIDO' && !isBaixado;
                  const prevAsset = index > 0 ? sortedAssets[index - 1] : null;
                  const isFirstConferido = isConferido && (!prevAsset || (prevAsset.status !== 'CONFERIDO' && !prevAsset.baixado && prevAsset.status !== 'BAIXADO'));
                  const isFirstBaixado = isBaixado && (!prevAsset || (!prevAsset.baixado && prevAsset.status !== 'BAIXADO'));

                  return (
                    <React.Fragment key={asset.id}>
                      {/* Divisor Visual de Itens Conferidos com Ícone e Título Centralizados e Botões de Ordenação sobre as colunas */}
                      {isFirstConferido && statusFilter !== 'CONFERIDOS' && (
                        <div className="relative py-1.5 px-3 sm:px-4 my-2 mx-2 border-y border-dashed border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 rounded-lg shadow-sm flex items-center justify-between min-h-[38px]">
                          
                          {/* Botões de Ordenação posicionados à esquerda acima das colunas Patrimônio e Item */}
                          <div className="flex items-center gap-2 z-10">
                            {/* Ordenar Patrimônio */}
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
                              className={`px-2 py-1 rounded-md text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                                conferidosSortField === 'numeroPatrimonio'
                                  ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-sm ring-1 ring-emerald-400/40'
                                  : 'bg-slate-900/80 border-slate-700/80 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/40'
                              }`}
                              title={`Ordenar conferidos por Nº de Patrimônio (${conferidosSortDirection === 'asc' ? 'Crescente ▲' : 'Decrescente ▼'})`}
                            >
                              <Hash className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[9px] leading-none select-none">
                                {conferidosSortField === 'numeroPatrimonio' ? (
                                  conferidosSortDirection === 'asc' ? '▲' : '▼'
                                ) : (
                                  <span className="opacity-40">▲</span>
                                )}
                              </span>
                            </button>

                            {/* Ordenar Item */}
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
                              className={`px-2 py-1 rounded-md text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                                conferidosSortField === 'descricao'
                                  ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-sm ring-1 ring-emerald-400/40'
                                  : 'bg-slate-900/80 border-slate-700/80 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/40'
                              }`}
                              title={`Ordenar conferidos por Item / Descrição (${conferidosSortDirection === 'asc' ? 'A-Z ▲' : 'Z-A ▼'})`}
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[9px] leading-none select-none">
                                {conferidosSortField === 'descricao' ? (
                                  conferidosSortDirection === 'asc' ? '▲' : '▼'
                                ) : (
                                  <span className="opacity-40">▲</span>
                                )}
                              </span>
                            </button>
                          </div>

                          {/* Centro: Ícone e CONFERIDOS perfeitamente centralizado horizontalmente */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
                            <div className="flex items-center gap-2 pointer-events-auto">
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
                          </div>

                          {/* Espaçador à direita para equilíbrio visual */}
                          <div className="w-20 hidden sm:block shrink-0 pointer-events-none" />

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
                        currentUserName={currentUser?.displayName || currentUser?.email}
                        isGeneralView={filterMode === 'ALL_SECTORS'}
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
                        onOpenSolicitacao={(a) => {
                          setAssetForSolicitacao(a);
                          setIsSolicitacaoModalOpen(true);
                        }}
                        hasPendingPedido={pedidosCarga.some(p => p.assetId === asset.id && p.status === 'PENDENTE')}
                        searchTerm={searchTerm}
                        visibleColumns={visibleColumns}
                      />
                    </React.Fragment>
                  );
                })}
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
                      : `Nenhum bem com o status selecionado neste setor.`}
                  </p>
                </div>
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

    </div>
  );
}

export default App;
