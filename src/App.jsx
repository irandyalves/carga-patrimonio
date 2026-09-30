import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Navbar 
} from './components/Navbar';
import { 
  SectorSelector 
} from './components/SectorSelector';
import { 
  ConferenceStats 
} from './components/ConferenceStats';
import { 
  AssetCard 
} from './components/AssetCard';
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
  loadLocalData, 
  saveLocalAssets, 
  saveLocalCautelas, 
  saveLocalSectors,
  initFirebase 
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
  PackageSearch
} from 'lucide-react';

export function App() {
  // Main Data States
  const [sectors, setSectors] = useState([]);
  const [assets, setAssets] = useState([]);
  const [cautelas, setCautelas] = useState([]);
  const [isFirebaseActive, setIsFirebaseActive] = useState(false);

  // Sector and View Filters
  const [activeSectorId, setActiveSectorId] = useState('sec-ti');
  const [filterMode, setFilterMode] = useState('MY_SECTOR'); // 'MY_SECTOR' | 'ALL_SECTORS'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDENTES' | 'CONFERIDOS' | 'CAUTELAS' | 'BAIXADOS'
  const [searchTerm, setSearchTerm] = useState('');

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

  // 1. Initial Load
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
        const matchesNumber = item.numeroPatrimonio.toLowerCase().includes(q);
        const matchesDesc = item.descricao.toLowerCase().includes(q);
        const matchesCat = (item.categoria || '').toLowerCase().includes(q);
        const matchesLoc = (item.localizacao || '').toLowerCase().includes(q);
        const matchesResp = (item.responsavel || '').toLowerCase().includes(q);
        const matchesSetor = (item.setorNome || '').toLowerCase().includes(q);

        return matchesNumber || matchesDesc || matchesCat || matchesLoc || matchesResp || matchesSetor;
      }

      return true;
    });
  }, [assets, activeSectorId, filterMode, statusFilter, searchTerm]);

  // Handle Conference Toggle with safety
  const handleToggleConference = (assetId, shouldConfer) => {
    const updated = assets.map(item => {
      if (item.id === assetId) {
        if (shouldConfer) {
          const nowStr = new Date().toLocaleString('pt-BR');
          return {
            ...item,
            status: 'CONFERIDO',
            conferidoEm: nowStr,
            conferidoPor: `${activeSector.responsavel} (${activeSector.name.split(' ')[0]})`,
            historico: [
              ...(item.historico || []),
              { data: nowStr, acao: 'Conferido durante auditoria', usuario: activeSector.responsavel }
            ]
          };
        } else {
          return {
            ...item,
            status: 'ATIVO',
            conferidoEm: null,
            conferidoPor: null
          };
        }
      }
      return item;
    });

    setAssets(updated);

    if (shouldConfer) {
      showToast('Patrimônio conferido e auditado com sucesso!');

      // Check if this completed 100% of current sector
      const currentSecItems = updated.filter(a => a.setorId === activeSectorId && !a.baixado);
      const allConferred = currentSecItems.every(a => a.status === 'CONFERIDO');
      if (allConferred && currentSecItems.length > 0) {
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
    setSearchTerm(code);
    const found = assets.find(a => a.numeroPatrimonio.toLowerCase() === code.toLowerCase());

    if (found) {
      if (found.setorId === activeSectorId) {
        showToast(`Item ${found.numeroPatrimonio} localizado no seu setor!`);
      } else {
        showToast(`⚠️ Atenção: Item pertence a outro setor (${found.setorNome})!`, 'warning');
      }
    } else {
      showToast(`Código ${code} lido. Não encontrado na base atual.`, 'info');
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
              usuario: activeSector.responsavel 
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
        id: `pat-${Date.now()}`,
        status: 'ATIVO',
        baixado: false,
        conferidoEm: null,
        conferidoPor: null,
        cautelaAtual: null,
        historico: [
          { data: new Date().toLocaleString('pt-BR'), acao: 'Cadastro Inicial', usuario: activeSector.responsavel }
        ]
      };
      setAssets([newAsset, ...assets]);
      showToast('Novo patrimônio cadastrado com sucesso!');
    }
    setAssetToEdit(null);
  };

  // Delete Asset
  const handleDeleteAsset = (assetId) => {
    const target = assets.find(a => a.id === assetId);
    setAssets(prev => prev.filter(a => a.id !== assetId));
    setCautelas(prev => prev.filter(c => c.assetId !== assetId));
    showToast(`Patrimônio ${target ? target.numeroPatrimonio : ''} excluído permanentemente.`, 'info');
  };

  // Sectors CRUD: Save (Create or Update)
  const handleSaveSector = (sectorData) => {
    const exists = sectors.some(s => s.id === sectorData.id);
    let updatedSectors = [];

    if (exists) {
      updatedSectors = sectors.map(s => s.id === sectorData.id ? { ...s, ...sectorData } : s);
      // Update any asset referencing this sector name/responsible
      setAssets(prev => prev.map(a => {
        if (a.setorId === sectorData.id) {
          return {
            ...a,
            setorNome: sectorData.name,
            responsavel: sectorData.responsavel
          };
        }
        return a;
      }));
      showToast(`Setor "${sectorData.name}" atualizado com sucesso!`);
    } else {
      updatedSectors = [...sectors, sectorData];
      showToast(`Setor "${sectorData.name}" cadastrado com sucesso!`);
    }

    setSectors(updatedSectors);
  };

  // Sectors CRUD: Delete Sector
  const handleDeleteSector = (sectorIdToDelete, reassignSectorId) => {
    const targetSector = sectors.find(s => s.id === sectorIdToDelete);
    const newTarget = sectors.find(s => s.id === reassignSectorId);

    // Reassign assets if any
    if (newTarget) {
      setAssets(prev => prev.map(a => {
        if (a.setorId === sectorIdToDelete) {
          return {
            ...a,
            setorId: newTarget.id,
            setorNome: newTarget.name,
            responsavel: newTarget.responsavel,
            localizacao: newTarget.sala || a.localizacao
          };
        }
        return a;
      }));
    }

    const updatedSectors = sectors.filter(s => s.id !== sectorIdToDelete);
    setSectors(updatedSectors);

    if (activeSectorId === sectorIdToDelete && updatedSectors.length > 0) {
      setActiveSectorId(updatedSectors[0].id);
    }

    showToast(`Setor "${targetSector?.name}" excluído. Bens reatribuídos para "${newTarget?.name}".`, 'info');
  };

  // Save Loan / Cautela
  const handleSaveCautela = (newCautela, targetAsset) => {
    setCautelas([newCautela, ...cautelas]);
    const updated = assets.map(a => {
      if (a.id === targetAsset.id) {
        return {
          ...a,
          status: 'EM_CAUTELA',
          cautelaAtual: newCautela
        };
      }
      return a;
    });
    setAssets(updated);
    showToast(`Cautela emitida para ${newCautela.responsavelRetirada}. Termo PDF gerado!`);
  };

  // Return Loan / Cautela
  const handleReturnCautela = (cautelaId, assetId) => {
    const nowStr = new Date().toLocaleString('pt-BR');
    const updatedCautelas = cautelas.map(c => {
      if (c.id === cautelaId) {
        return {
          ...c,
          status: 'DEVOLVIDO',
          dataDevolucao: nowStr
        };
      }
      return c;
    });
    setCautelas(updatedCautelas);

    const updatedAssets = assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: 'ATIVO',
          cautelaAtual: null
        };
      }
      return a;
    });
    setAssets(updatedAssets);
    showToast('Devolução do bem registrada com sucesso!');
  };

  // Confirm Asset Baixa
  const handleConfirmBaixa = (assetId, dadosBaixa) => {
    const updated = assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: 'BAIXADO',
          baixado: true,
          dadosBaixa,
          historico: [
            ...(a.historico || []),
            { data: dadosBaixa.data, acao: `Baixa Patrimonial: ${dadosBaixa.motivo}`, usuario: activeSector.responsavel }
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
        onOpenFirebaseConfig={() => setIsFirebaseModalOpen(true)}
        isFirebaseActive={isFirebaseActive}
        cautelasCount={cautelas.filter(c => c.status === 'EM_ANDAMENTO').length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        
        {/* Sector Selection Header */}
        <SectorSelector
          sectors={sectors}
          activeSectorId={activeSectorId}
          onSelectSector={setActiveSectorId}
          filterMode={filterMode}
          onToggleFilterMode={setFilterMode}
          onOpenManageSectors={() => setIsManageSectorsOpen(true)}
        />

        {/* Real-time Conference Stats Bar */}
        <ConferenceStats
          stats={stats}
          activeSector={activeSector}
          onExportReportPDF={handleExportReportPDF}
        />

        {/* Filter Pills & View Counters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({filteredAssets.length})
            </button>
            <button
              onClick={() => setStatusFilter('PENDENTES')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'PENDENTES'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              Pendentes ({filteredAssets.filter(a => a.status !== 'CONFERIDO' && !a.baixado).length})
            </button>
            <button
              onClick={() => setStatusFilter('CONFERIDOS')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'CONFERIDOS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              Conferidos ({filteredAssets.filter(a => a.status === 'CONFERIDO').length})
            </button>
            <button
              onClick={() => setStatusFilter('CAUTELAS')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'CAUTELAS'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              Em Cautela ({filteredAssets.filter(a => a.status === 'EM_CAUTELA').length})
            </button>
            <button
              onClick={() => setStatusFilter('BAIXADOS')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'BAIXADOS'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              Baixados ({filteredAssets.filter(a => a.status === 'BAIXADO' || a.baixado).length})
            </button>
          </div>

          {/* Quick Context Summary */}
          <div className="text-xs text-slate-400 flex items-center gap-2">
            {searchTerm && (
              <span className="bg-indigo-950/60 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-800/50 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                Busca: <strong>"{searchTerm}"</strong>
              </span>
            )}
            <span>Exibindo <strong>{filteredAssets.length}</strong> itens</span>
          </div>

        </div>

        {/* Asset Cards Grid */}
        {filteredAssets.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mb-3">
              <PackageSearch className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Nenhum patrimônio encontrado</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Não encontramos nenhum item com os filtros ou termo de busca informados.
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar Busca</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                activeSector={activeSector}
                currentUserName={activeSector.responsavel}
                onToggleConference={handleToggleConference}
                onOpenEdit={(item) => {
                  setAssetToEdit(item);
                  setIsAssetModalOpen(true);
                }}
                onOpenCautela={(item) => {
                  setAssetForCautela(item);
                  setIsCautelaModalOpen(true);
                }}
                onOpenBaixa={(item) => {
                  setAssetForBaixa(item);
                  setIsBaixaModalOpen(true);
                }}
                onPrintSingleLabel={handlePrintSingleLabel}
                onTransferSector={handleOpenTransferModal}
                onDeleteAsset={handleDeleteAsset}
              />
            ))}
          </div>
        )}

      </main>

      {/* Modals Container */}
      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSearch={(text) => setSearchTerm(text)}
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

    </div>
  );
}

export default App;
