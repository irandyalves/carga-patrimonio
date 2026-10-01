import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Navbar 
} from './components/Navbar';
import { 
  SectorTabs 
} from './components/SectorTabs';
import { 
  ConferenceStats 
} from './components/ConferenceStats';
import { 
  AssetCard 
} from './components/AssetCard';
import { 
  AssetTableRowCard 
} from './components/AssetTableRowCard';
import { 
  VoiceSearchModal 
} from './components/VoiceSearchModal';
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
  LabelPrinterModal 
} from './components/LabelPrinterModal';
import { 
  ExcelImportExportModal 
} from './components/ExcelImportExportModal';
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
import LoginScreen from './components/LoginScreen';

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
  Search, 
  Filter, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle, 
  RotateCcw, 
  SlidersHorizontal, 
  PackageSearch, 
  ShieldCheck, 
  Loader2,
  List,
  LayoutGrid,
  Hash,
  RefreshCw
} from 'lucide-react';

export function App() {
  // Authentication and Authorization States
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'operador'
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
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
  const [displayMode, setDisplayMode] = useState('TABLE_ROWS'); // 'TABLE_ROWS' (padrão) | 'GRID'

  // Modal States
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState(null);
  
  const [isCautelaModalOpen, setIsCautelaModalOpen] = useState(false);
  const [assetForCautela, setAssetForCautela] = useState(null);
  const [isCautelaListOpen, setIsCautelaListOpen] = useState(false);
  
  const [isBaixaModalOpen, setIsBaixaModalOpen] = useState(false);
  const [assetForBaixa, setAssetForBaixa] = useState(null);
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [assetForTransfer, setAssetForTransfer] = useState(null);

  const [isManageSectorsOpen, setIsManageSectorsOpen] = useState(false);
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Load & Auth Listener
  useEffect(() => {
    const { isConfigured } = initFirebase();
    setIsFirebaseActive(isConfigured);

    const { assets: initialAssets, cautelas: initialCautelas, sectors: initialSectors } = loadLocalData();
    setSectors(initialSectors);
    setAssets(initialAssets);
    setCautelas(initialCautelas);

    if (initialSectors.length > 0) {
      setActiveSectorId(initialSectors[0].id);
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
            await logoutUser();
            setCurrentUser(null);
            setUserRole(null);
            setIsAuthorized(false);
            setAuthError(`O e-mail ${user.email} não possui autorização de acesso. Solicite inclusão ao Administrador.`);
          }
        } else {
          setCurrentUser(null);
          setUserRole(null);
          setIsAuthorized(false);
        }
        setAuthLoading(false);
      });
    }).catch(err => {
      console.error('Erro ao inicializar autenticação:', err);
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

  // Auth Handlers
  const handleLoginSuccess = (user) => {
    const authCheck = checkUserAuthorization(user.email, authorizedUsers);
    if (authCheck && authCheck.authorized) {
      setCurrentUser(user);
      setUserRole(authCheck.role);
      setIsAuthorized(true);
      setAuthError(null);
      showToast(`Bem-vindo, ${user.displayName || user.email}!`);
    } else {
      logoutUser();
      setCurrentUser(null);
      setIsAuthorized(false);
      setAuthError(`O e-mail ${user.email} não está na lista de usuários autorizados.`);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setUserRole(null);
    setIsAuthorized(false);
    showToast('Sessão encerrada com sucesso.');
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
      // Sector filter
      if (filterMode === 'MY_SECTOR' && !searchTerm) {
        if (item.setorId !== activeSectorId) return false;
      }

      // Status filter
      if (statusFilter === 'PENDENTES' && (item.status === 'CONFERIDO' || item.status === 'BAIXADO')) return false;
      if (statusFilter === 'CONFERIDOS' && item.status !== 'CONFERIDO') return false;
      if (statusFilter === 'CAUTELAS' && item.status !== 'EM_CAUTELA') return false;
      if (statusFilter === 'BAIXADOS' && item.status !== 'BAIXADO' && !item.baixado) return false;

      // Text search filter
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const numStr = String(item.numeroPatrimonio || '').toLowerCase();
        const last5 = numStr.length >= 5 ? numStr.slice(-5) : numStr;
        const matchesNumber = numStr.includes(q) || last5.includes(q);
        const matchesDesc = item.descricao.toLowerCase().includes(q);
        const matchesSerial = item.numeroSerie && item.numeroSerie.toLowerCase().includes(q);
        const matchesSector = item.setorNome && item.setorNome.toLowerCase().includes(q);
        const matchesResp = item.responsavel && item.responsavel.toLowerCase().includes(q);
        
        return matchesNumber || matchesDesc || matchesSerial || matchesSector || matchesResp;
      }

      return true;
    });
  }, [assets, activeSectorId, filterMode, statusFilter, searchTerm]);

  // Recarregar os dados padrões das áreas e bens fornecidos
  const handleResetOfficialData = () => {
    if (confirm('Deseja recarregar a lista oficial de setores e patrimônios das áreas (Studio, Foyer, SACADI, TI, etc.)?')) {
      const { assets: newAssets, cautelas: newCautelas, sectors: newSectors } = resetToDefaultData();
      setSectors(newSectors);
      setAssets(newAssets);
      setCautelas(newCautelas);
      if (newSectors.length > 0) setActiveSectorId(newSectors[0].id);
      showToast('Setores e patrimônios das áreas atualizados com sucesso!');
    }
  };

  // Toggle Conference Status
  const handleToggleConference = (assetId) => {
    const updated = assets.map(item => {
      if (item.id === assetId) {
        const isNowConferido = item.status !== 'CONFERIDO';
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
    
    // Check if whole sector reached 100%
    const itemChecked = updated.find(a => a.id === assetId);
    if (itemChecked.status === 'CONFERIDO') {
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
    } else {
      showToast('Conferência do bem desmarcada.', 'info');
    }
  };

  // Handle QR Code / Barcode Scan Result
  const handleScanSuccess = (code) => {
    const rawClean = String(code || '').trim();
    // Extrai os dígitos para verificar os últimos 5 dígitos de patrimônio
    const digitsOnly = rawClean.replace(/\D/g, '');
    const last5 = digitsOnly.length >= 5 ? digitsOnly.slice(-5) : rawClean;

    setSearchTerm(last5 || rawClean);
    const found = assets.find(a => {
      const aNum = String(a.numeroPatrimonio || '').toLowerCase();
      const aLast5 = aNum.length >= 5 ? aNum.slice(-5) : aNum;
      return aNum === rawClean.toLowerCase() || (last5 && aLast5 === last5);
    });

    if (found) {
      if (found.setorId === activeSectorId) {
        showToast(`Item ${found.numeroPatrimonio} (${found.descricao}) localizado!`);
      } else {
        showToast(`⚠️ Atenção: Item ${found.numeroPatrimonio} pertence ao setor ${found.setorNome} (${found.responsavel})!`, 'warning');
      }
    } else {
      showToast(`Código ${rawClean} lido. Não encontrado na base atual.`, 'info');
    }
  };

  // Open Transfer Modal for an asset
  const handleOpenTransferModal = (asset) => {
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
    if (sectorData.id) {
      setSectors(sectors.map(s => s.id === sectorData.id ? sectorData : s));
      showToast('Setor atualizado com sucesso!');
    } else {
      const newSector = {
        ...sectorData,
        id: `sec-${Date.now()}`
      };
      setSectors([...sectors, newSector]);
      showToast('Novo setor cadastrado!');
    }
  };

  // Delete Sector
  const handleDeleteSector = (sectorId) => {
    const count = assets.filter(a => a.setorId === sectorId).length;
    if (count > 0) {
      alert(`Não é possível excluir este setor porque existem ${count} bens vinculados a ele.`);
      return;
    }
    setSectors(sectors.filter(s => s.id !== sectorId));
    if (activeSectorId === sectorId) {
      const remaining = sectors.filter(s => s.id !== sectorId);
      if (remaining.length > 0) setActiveSectorId(remaining[0].id);
    }
    showToast('Setor removido com sucesso.', 'info');
  };

  // Open Cautela creation for an asset
  const handleOpenCautela = (asset) => {
    setAssetForCautela(asset);
    setIsCautelaModalOpen(true);
  };

  // Save Cautela
  const handleSaveCautela = (cautelaData) => {
    const newCautela = {
      ...cautelaData,
      id: `caut-${Date.now()}`,
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
            responsavel: cautelaData.nomeResponsavel,
            matricula: cautelaData.matricula,
            dataPrevisaoDevolucao: cautelaData.dataPrevisaoDevolucao
          },
          historico: [
            ...(a.historico || []),
            { 
              data: new Date().toLocaleString('pt-BR'), 
              acao: `Empréstimo (Cautela) emitido para ${cautelaData.nomeResponsavel} (${cautelaData.matricula})`, 
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
    showToast(`Cautela para ${cautelaData.nomeResponsavel} gerada com sucesso!`);
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

  // Mass Import Success
  const handleImportSuccess = (importedAssets) => {
    setAssets(prev => [...importedAssets, ...prev]);
    showToast(`${importedAssets.length} itens importados com sucesso!`);
    setIsExcelModalOpen(false);
  };

  // Restore Backup Payload
  const handleRestoreBackup = (backupPayload) => {
    if (backupPayload.assets) setAssets(backupPayload.assets);
    if (backupPayload.sectors) setSectors(backupPayload.sectors);
    if (backupPayload.cautelas) setCautelas(backupPayload.cautelas);
    showToast('Base de dados restaurada com sucesso!');
  };

  // If initial auth check is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          <span className="text-sm font-medium text-slate-300">Autenticando sessão com o Google...</span>
        </div>
      </div>
    );
  }

  // If not logged in or unauthorized, show Login Screen
  if (!currentUser || !isAuthorized) {
    return (
      <LoginScreen 
        onLoginSuccess={handleLoginSuccess}
        authError={authError}
        isConfigured={isFirebaseActive}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
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
        onOpenVoiceSearch={() => setIsVoiceOpen(true)}
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        
        {/* Sector Tabs Dashboard (Abas por Setor: Nome do Setor - Responsável) */}
        <SectorTabs
          sectors={sectors}
          activeSectorId={activeSectorId}
          onSelectSector={setActiveSectorId}
          filterMode={filterMode}
          onSelectFilterMode={setFilterMode}
          assets={assets}
          onOpenManageSectors={() => setIsManageSectorsOpen(true)}
        />

        {/* Real-time Conference Stats Bar */}
        <ConferenceStats
          stats={stats}
          activeSector={activeSector}
          onExportReportPDF={handleExportReportPDF}
        />

        {/* Filter and View Controls Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'Todos os Bens', count: assets.filter(a => filterMode === 'ALL_SECTORS' || a.setorId === activeSectorId).length },
              { id: 'PENDENTES', label: 'Pendentes', count: stats.pendentes, color: 'text-amber-400' },
              { id: 'CONFERIDOS', label: 'Conferidos', count: stats.conferidos, color: 'text-emerald-400' },
              { id: 'CAUTELAS', label: 'Em Cautela', count: stats.cautelas, color: 'text-blue-400' },
              { id: 'BAIXADOS', label: 'Baixados', count: stats.baixados, color: 'text-rose-400' },
            ].map(tab => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive 
                      ? 'bg-indigo-700/80 text-white' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher & Quick Actions */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 text-xs text-slate-400">
            
            {/* View Mode Toggle: Linhas (Cards de Tabela) vs Grade */}
            <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              <button
                onClick={() => setDisplayMode('TABLE_ROWS')}
                title="Visualização em Cards tipo Linha de Tabela (Recomendado)"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  displayMode === 'TABLE_ROWS'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Linhas de Tabela</span>
              </button>

              <button
                onClick={() => setDisplayMode('GRID')}
                title="Visualização em Grade de Cards"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  displayMode === 'GRID'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grade</span>
              </button>
            </div>

            {/* Itens Count */}
            <span className="hidden sm:inline">
              <strong className="text-white">{filteredAssets.length}</strong> {filteredAssets.length === 1 ? 'item' : 'itens'}
            </span>

            {/* Reset Official Data Button */}
            <button
              onClick={handleResetOfficialData}
              title="Restaurar setores e patrimônios das áreas oficiais"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-950/50 hover:text-indigo-300 border border-slate-700/60 text-slate-300 transition-colors text-xs cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-indigo-400" />
              <span>Restaurar Áreas</span>
            </button>

            {/* Clear Filters */}
            {(statusFilter !== 'ALL' || searchTerm || filterMode !== 'MY_SECTOR') && (
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setSearchTerm('');
                  setFilterMode('MY_SECTOR');
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Limpar
              </button>
            )}
          </div>

        </div>

        {/* Asset Cards or Empty State */}
        {filteredAssets.length > 0 ? (
          displayMode === 'TABLE_ROWS' ? (
            /* ================= VISUALIZAÇÃO EM CARDS TIPO LINHA DE TABELA ================= */
            <div className="space-y-2">
              
              {/* Table Header Bar */}
              <div className="hidden lg:flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <div className="w-44 shrink-0 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Patrimônio</span>
                </div>
                <div className="w-20 shrink-0 text-center">
                  <span>Qtde</span>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <span>Descrição do Bem</span>
                </div>
                <div className="w-44 shrink-0">
                  <span>Responsável</span>
                </div>
                <div className="w-32 shrink-0">
                  <span>Data Aquisição</span>
                </div>
                <div className="w-32 shrink-0">
                  <span>Valor Original</span>
                </div>
                <div className="w-32 shrink-0">
                  <span>Valor Atual</span>
                </div>
                <div className="w-56 shrink-0 text-right pr-2">
                  <span>Ações & Conferência</span>
                </div>
              </div>

              {/* Rows List */}
              <div className="space-y-2">
                {filteredAssets.map(asset => (
                  <AssetTableRowCard
                    key={asset.id}
                    asset={asset}
                    activeSector={activeSector}
                    currentUserName={currentUser?.displayName || currentUser?.email}
                    onToggleConference={handleToggleConference}
                    onOpenEdit={(a) => {
                      setAssetToEdit(a);
                      setIsAssetModalOpen(true);
                    }}
                    onOpenCautela={handleOpenCautela}
                    onOpenBaixa={handleOpenBaixa}
                    onPrintSingleLabel={handlePrintSingleLabel}
                    onTransferSector={handleOpenTransferModal}
                    onDeleteAsset={handleDeleteAsset}
                  />
                ))}
              </div>

            </div>
          ) : (
            /* ================= VISUALIZAÇÃO EM GRADE DE CARDS ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map(asset => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  activeSector={activeSector}
                  currentUserName={currentUser?.displayName || currentUser?.email}
                  onToggleConference={handleToggleConference}
                  onOpenEdit={(a) => {
                    setAssetToEdit(a);
                    setIsAssetModalOpen(true);
                  }}
                  onOpenCautela={handleOpenCautela}
                  onOpenBaixa={handleOpenBaixa}
                  onPrintSingleLabel={handlePrintSingleLabel}
                  onTransferSector={handleOpenTransferModal}
                  onDeleteAsset={handleDeleteAsset}
                />
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-900/40 border border-slate-800/80 rounded-3xl text-center space-y-4">
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

      </main>

      {/* Modals */}
      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onResult={(spokenText) => setSearchTerm(spokenText)}
      />

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
        onSaveSector={handleSaveSector}
        onDeleteSector={handleDeleteSector}
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

      <LabelPrinterModal
        isOpen={isLabelsModalOpen}
        onClose={() => setIsLabelsModalOpen(false)}
        assets={filterMode === 'MY_SECTOR' ? assets.filter(a => a.setorId === activeSectorId) : assets}
        activeSector={activeSector}
      />

      <ExcelImportExportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        assets={assets}
        onImportSuccess={handleImportSuccess}
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

    </div>
  );
}

export default App;
