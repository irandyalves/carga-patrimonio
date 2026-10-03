import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  FileText, 
  FileCode, 
  File, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Layers, 
  Trash2, 
  RefreshCw, 
  Download, 
  Sparkles,
  ChevronDown,
  HelpCircle,
  FolderPlus,
  Clock
} from 'lucide-react';
import { 
  DB_FIELDS, 
  autoMatchColumns, 
  parseAnyDocumentFile, 
  buildFinalAssetsFromImport 
} from '../services/importService';
import { exportAssetsToExcel } from '../services/excelService';

const FORMAT_OPTIONS = [
  { id: 'excel', title: 'Excel', label: 'Excel (.xlsx, .xls)', desc: '.xlsx, .xls', ext: '.xlsx,.xls', icon: FileSpreadsheet, activeColor: 'border-emerald-500/70 bg-emerald-500/15 text-emerald-300 ring-2 ring-emerald-500/30' },
  { id: 'word', title: 'Word', label: 'Word (.docx)', desc: '.docx', ext: '.docx', icon: FileText, activeColor: 'border-blue-500/70 bg-blue-500/15 text-blue-300 ring-2 ring-blue-500/30' },
  { id: 'csv', title: 'CSV', label: 'CSV (.csv)', desc: '.csv', ext: '.csv', icon: FileCode, activeColor: 'border-amber-500/70 bg-amber-500/15 text-amber-300 ring-2 ring-amber-500/30' },
  { id: 'txt', title: 'TXT', label: 'TXT (.txt / Tabular)', desc: '.txt / tabular', ext: '.txt', icon: File, activeColor: 'border-purple-500/70 bg-purple-500/15 text-purple-300 ring-2 ring-purple-500/30' }
];

export const SmartImportModal = ({
  isOpen,
  onClose,
  sectors = [],
  activeSectorId,
  assets = [],
  onImportSuccess,
  onOpenManageSectors
}) => {
  // Passos: 'SETUP_AND_UPLOAD' | 'COLUMN_PREVIEW' | 'SUCCESS'
  const [step, setStep] = useState('SETUP_AND_UPLOAD');
  
  // Setor de Destino
  const [targetSectorMode, setTargetSectorMode] = useState('SPECIFIC'); // 'SPECIFIC' | 'AUTO_DETECT'
  const [selectedSectorId, setSelectedSectorId] = useState(() => activeSectorId || (sectors[0]?.id || ''));

  useEffect(() => {
    if (isOpen) {
      setStep('SETUP_AND_UPLOAD');
      setSelectedFile(null);
      setParsedHeaders([]);
      setParsedRows([]);
      setColumnMapping({});
      setErrorMessage('');
      setIsLoading(false);
      if (activeSectorId) {
        setSelectedSectorId(activeSectorId);
        setTargetSectorMode('SPECIFIC');
      } else if (sectors.length > 0) {
        setSelectedSectorId(sectors[0]?.id || '');
      }
    }
  }, [isOpen, activeSectorId, sectors]);

  // Formato selecionado no listbox
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [isFormatListOpen, setIsFormatListOpen] = useState(false);

  // Arquivo e Dados Parseados
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [parsedHeaders, setParsedHeaders] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [columnMapping, setColumnMapping] = useState({}); // { [sourceHeader]: { targetField, isAccepted, confidence } }

  // Histórico de Arquivos Importados (persistente no localStorage)
  const [importHistory, setImportHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('CARGA_PATRIMONIO_IMPORT_HISTORY');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [historyFilterMode, setHistoryFilterMode] = useState('ALL'); // 'ALL' | 'SECTOR'

  const handleClearHistory = (e) => {
    e?.stopPropagation?.();
    setImportHistory([]);
    try {
      localStorage.removeItem('CARGA_PATRIMONIO_IMPORT_HISTORY');
    } catch (e) {}
  };

  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Setores ordenados
  const sortedSectors = useMemo(() => {
    return [...sectors].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
  }, [sectors]);

  const currentTargetSector = useMemo(() => {
    return sectors.find(s => s.id === selectedSectorId) || sectors[0] || null;
  }, [sectors, selectedSectorId]);

  // Histórico por setor atual vs todos
  const sectorHistoryCount = useMemo(() => {
    if (!currentTargetSector) return 0;
    return importHistory.filter(h => 
      h.sectorId === currentTargetSector.id ||
      (h.sectorName && h.sectorName.toLowerCase() === currentTargetSector.name.toLowerCase())
    ).length;
  }, [importHistory, currentTargetSector]);

  const displayedHistory = useMemo(() => {
    if (historyFilterMode === 'SECTOR' && currentTargetSector) {
      return importHistory.filter(h => 
        h.sectorId === currentTargetSector.id ||
        (h.sectorName && h.sectorName.toLowerCase() === currentTargetSector.name.toLowerCase())
      );
    }
    return importHistory;
  }, [importHistory, historyFilterMode, currentTargetSector]);

  if (!isOpen) return null;

  // Reseta ao fechar
  const handleClose = () => {
    setStep('SETUP_AND_UPLOAD');
    setSelectedFile(null);
    setParsedHeaders([]);
    setParsedRows([]);
    setColumnMapping({});
    setErrorMessage('');
    onClose();
  };

  // Processa o arquivo selecionado
  const handleProcessFile = async (file) => {
    if (!file) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await parseAnyDocumentFile(file);
      if (!result.headers || result.headers.length === 0 || !result.rows || result.rows.length === 0) {
        throw new Error('Nenhuma linha de patrimônio válida encontrada no arquivo.');
      }

      // Mapeia colunas de forma inteligente
      const mapping = autoMatchColumns(result.headers);

      setSelectedFile(file);
      setParsedHeaders(result.headers);
      setParsedRows(result.rows);
      setColumnMapping(mapping);
      setStep('COLUMN_PREVIEW');
    } catch (err) {
      console.error('Falha ao processar arquivo:', err);
      setErrorMessage(err.message || 'Erro ao ler arquivo. Verifique o formato e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Alterna aceitar / rejeitar coluna
  const toggleColumnAccepted = (sourceHeader) => {
    setColumnMapping(prev => ({
      ...prev,
      [sourceHeader]: {
        ...prev[sourceHeader],
        isAccepted: !prev[sourceHeader]?.isAccepted
      }
    }));
  };

  // Altera campo de destino da coluna
  const changeColumnTarget = (sourceHeader, newTargetKey) => {
    setColumnMapping(prev => ({
      ...prev,
      [sourceHeader]: {
        ...prev[sourceHeader],
        targetField: newTargetKey,
        isAccepted: true
      }
    }));
  };

  // Aceitar todas as colunas mapeadas
  const handleAcceptAll = () => {
    setColumnMapping(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (next[k].targetField) next[k].isAccepted = true;
      });
      return next;
    });
  };

  // Rejeitar colunas não essenciais
  const handleRejectUnmapped = () => {
    setColumnMapping(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (!next[k].targetField) next[k].isAccepted = false;
      });
      return next;
    });
  };

  // Concluir Importação
  const handleConfirmImport = () => {
    try {
      const sectorObj = targetSectorMode === 'SPECIFIC' ? currentTargetSector : null;
      const finalAssets = buildFinalAssetsFromImport({
        rawRows: parsedRows,
        columnMapping,
        targetSector: sectorObj,
        allSectors: sectors
      });

      if (finalAssets.length === 0) {
        setErrorMessage('Nenhum item foi configurado para importação.');
        return;
      }

      onImportSuccess(finalAssets);

      // Registra no histórico de arquivos importados
      const historyEntry = {
        id: `imp_${Date.now()}`,
        fileName: selectedFile?.name || 'Arquivo_Importado',
        fileSize: selectedFile?.size ? (selectedFile.size > 1024 * 1024 ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(selectedFile.size / 1024)} KB`) : '',
        format: selectedFormat?.toUpperCase() || 'EXCEL',
        sectorId: targetSectorMode === 'SPECIFIC' ? (currentTargetSector?.id || selectedSectorId) : 'AUTO',
        sectorName: targetSectorMode === 'SPECIFIC' ? (currentTargetSector?.name || 'Setor Específico') : 'Detectado por Coluna',
        importedCount: finalAssets.length,
        date: new Date().toISOString()
      };

      setImportHistory(prev => {
        const updated = [historyEntry, ...prev.filter(h => h.id !== historyEntry.id)].slice(0, 30);
        try {
          localStorage.setItem('CARGA_PATRIMONIO_IMPORT_HISTORY', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      setStep('SUCCESS');
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro ao gerar dados finais para importação.');
    }
  };

  const acceptedCount = Object.values(columnMapping).filter(c => c.isAccepted && c.targetField).length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl lg:max-w-3xl rounded-3xl p-5 sm:p-6 shadow-2xl relative min-h-[500px] max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg">Importador Inteligente</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Excel • Word • CSV • TXT
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-1 py-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* PASSO 1: CONFIGURAÇÃO DE SETOR E UPLOAD */}
          {step === 'SETUP_AND_UPLOAD' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* 1. SETOR DE DESTINO DA CARGA (COMPACTO, 35% MENOR, TUDO EM UMA LINHA) */}
              <div className="p-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/30 border border-indigo-500/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                
                {/* Título e Modo: Setor Específico vs Detectar Setor */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
                      1. Setor:
                    </span>
                  </div>

                  <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-700/70 shrink-0">
                    <button
                      type="button"
                      onClick={() => setTargetSectorMode('SPECIFIC')}
                      className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        targetSectorMode === 'SPECIFIC'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${targetSectorMode === 'SPECIFIC' ? 'bg-white' : 'bg-slate-500'}`} />
                      <span>SETOR ESPECÍFICO</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setTargetSectorMode('AUTO_DETECT')}
                      className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        targetSectorMode === 'AUTO_DETECT'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${targetSectorMode === 'AUTO_DETECT' ? 'bg-white' : 'bg-slate-500'}`} />
                      <span>DETECTAR SETOR</span>
                    </button>
                  </div>
                </div>

                {/* Seleção de Setor e Botão Novo Setor na mesma linha */}
                <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
                  {targetSectorMode === 'SPECIFIC' ? (
                    <>
                      <select
                        value={selectedSectorId}
                        onChange={(e) => setSelectedSectorId(e.target.value)}
                        className="flex-1 max-w-[280px] bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-medium truncate"
                      >
                        {sortedSectors.map(s => (
                          <option key={s.id} value={s.id}>
                            🏢 {s.name} {s.responsavel ? `• ${s.responsavel}` : ''}
                          </option>
                        ))}
                      </select>

                      {onOpenManageSectors && (
                        <button
                          type="button"
                          onClick={onOpenManageSectors}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 border border-indigo-500/30 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                          title="Cadastrar Novo Setor"
                        >
                          <FolderPlus className="w-3.5 h-3.5" />
                          <span>Novo Setor</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 truncate">
                      Usa a coluna "Setor" da planilha
                    </span>
                  )}
                </div>
              </div>

              {/* SEÇÃO LADO A LADO: FORMATOS & ENVIO (ESQUERDA REDUZIDA) + HISTÓRICO (DIREITA EXPANDIDO) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                
                {/* LADO ESQUERDO: Botões de Formato (compactos) + Dropzone Esmagada */}
                <div className="md:col-span-4 flex flex-col gap-2">
                  {/* 2. Tipo de Arquivo */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      2. Tipo de Arquivo
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {FORMAT_OPTIONS.map(fmt => {
                        const Icon = fmt.icon;
                        const isSelected = selectedFormat === fmt.id;
                        return (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => setSelectedFormat(fmt.id)}
                            className={`py-1 px-2 rounded-md border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? `${fmt.activeColor} font-bold shadow-xs`
                                : 'bg-slate-850/80 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[11px] font-semibold">{fmt.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Selecionar Arquivo (Esmagado / Reduzido pela metade) */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      3. Enviar Arquivo
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed ${
                        isDragging ? 'border-indigo-400 bg-indigo-500/15' : 'border-slate-700 hover:border-indigo-500/80 bg-slate-850/50 hover:bg-slate-850'
                      } rounded-lg p-2 px-2.5 flex items-center gap-2 cursor-pointer transition-all group min-h-[64px]`}
                    >
                      <div className="w-7 h-7 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-500/20 transition-all shrink-0">
                        <UploadCloud className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <span className="text-[10.5px] font-bold text-slate-200 group-hover:text-white block leading-tight truncate">
                          {isLoading ? 'Lendo...' : 'Clique ou arraste aqui'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block truncate">
                          .xlsx, .docx, .csv, .txt
                        </span>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.docx,.csv,.txt"
                        onChange={handleFileInputChange}
                        disabled={isLoading}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* LADO DIREITO: Histórico de Arquivos expandido (+15% altura) */}
                <div className="md:col-span-8 flex flex-col gap-1">
                  {/* Cabeçalho FORA e EM CIMA do Card */}
                  <div className="flex items-center justify-between px-0.5 shrink-0 gap-2 min-h-[18px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 shrink-0">
                        Histórico
                      </span>

                      {/* Filtro Todos vs Deste Setor */}
                      {importHistory.length > 0 && (
                        <div className="flex items-center gap-1 ml-1.5">
                          <button
                            type="button"
                            onClick={() => setHistoryFilterMode('ALL')}
                            className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-semibold transition-all cursor-pointer ${
                              historyFilterMode === 'ALL'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Todos ({importHistory.length})
                          </button>
                          {currentTargetSector && (
                            <button
                              type="button"
                              onClick={() => setHistoryFilterMode('SECTOR')}
                              className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-semibold transition-all cursor-pointer truncate max-w-[130px] ${
                                historyFilterMode === 'SECTOR'
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                              title={`Filtrar apenas arquivos do setor ${currentTargetSector.name}`}
                            >
                              {currentTargetSector.name.split(' ')[0]} ({sectorHistoryCount})
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {importHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearHistory}
                        className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        title="Limpar histórico"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Card do Histórico com +15% de Altura e Setor Reduzido em 30% */}
                  <div className="rounded-xl bg-slate-850/60 border border-slate-800 p-2 flex-1 flex flex-col min-h-[175px]">
                    <div className="flex-1 overflow-y-auto scrollbar-thin max-h-[195px] pr-0.5">
                      {displayedHistory.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-[11px] py-6 gap-1">
                          <span>
                            {historyFilterMode === 'SECTOR'
                              ? `Nenhum arquivo importado para "${currentTargetSector?.name || 'este setor'}"`
                              : 'Nenhum arquivo importado recentemente'}
                          </span>
                          {historyFilterMode === 'SECTOR' && importHistory.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setHistoryFilterMode('ALL')}
                              className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                            >
                              Ver todos os {importHistory.length} arquivos
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {displayedHistory.map(item => {
                            const ext = item.fileName?.split('.').pop()?.toLowerCase();
                            const HistoryIcon = ext === 'docx' ? FileText : (ext === 'csv' ? FileCode : (ext === 'txt' ? File : FileSpreadsheet));

                            return (
                              <div
                                key={item.id}
                                className="p-1.5 px-2 rounded-md bg-slate-900/90 hover:bg-slate-900 border border-slate-800/80 flex flex-col justify-between gap-1 transition-all min-w-0 overflow-hidden"
                              >
                                {/* Linha Superior: Nome do Arquivo (com reticências ...) + Data/Hora */}
                                <div className="flex items-center justify-between gap-1.5 min-w-0 w-full overflow-hidden">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                                    <HistoryIcon className="w-3 h-3 text-indigo-400 shrink-0" />
                                    <span 
                                      className="text-slate-200 font-semibold text-[10.5px] truncate block min-w-0 flex-1" 
                                      title={item.fileName}
                                    >
                                      {item.fileName}
                                    </span>
                                  </div>
                                  <span className="font-mono text-[9px] text-slate-400 whitespace-nowrap shrink-0 ml-1">
                                    {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}{' '}
                                    {new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>

                                {/* Linha Inferior: Setor de Destino Reduzido em 30% e Quantidade */}
                                <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-slate-800/50 text-[9px]">
                                  <span 
                                    className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium text-[8px] uppercase tracking-wider truncate max-w-[125px]" 
                                    title={`Destino da Carga: ${item.sectorName || 'Setor Geral'}`}
                                  >
                                    <Building2 className="w-2 h-2 shrink-0 text-indigo-400" />
                                    <span className="truncate">{item.sectorName || 'Setor Geral'}</span>
                                  </span>
                                  {item.importedCount ? (
                                    <span className="text-slate-400 font-mono text-[8.5px] shrink-0">
                                      {item.importedCount} {item.importedCount === 1 ? 'bem' : 'bens'}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Erro se houver */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Exportar Base Existente */}
              {assets.length > 0 && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Deseja apenas baixar os dados atuais?</span>
                  <button
                    type="button"
                    onClick={() => exportAssetsToExcel(assets, `Inventario_Patrimonio_${new Date().toISOString().slice(0, 10)}.xlsx`)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Exportar {assets.length} Itens (Excel)</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* PASSO 2: PREVIEW E MAPEAR COLUNAS (COMO SOLICITADO PELO USUÁRIO) */}
          {step === 'COLUMN_PREVIEW' && (
            <div className="space-y-3 animate-in fade-in duration-150 flex flex-col flex-1 min-h-0">
              
              {/* Linha Compacta de Informações do Arquivo e Destino (Sem Borda) */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 pb-0.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    Arquivo: <strong className="text-white font-mono">{selectedFile?.name}</strong> <span className="text-slate-400">({parsedRows.length} linhas detectadas)</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Setor de Destino:</span>
                  <span className="px-2.5 py-0.5 rounded-lg font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {targetSectorMode === 'SPECIFIC' ? currentTargetSector?.name : 'Detectado por linha'}
                  </span>
                </div>
              </div>

              {/* Cabeçalho da Lista de Mapeamento com Ações Rápidas */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Colunas a Importar ({acceptedCount} de {parsedHeaders.length} selecionadas)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Revise o mapeamento inteligente abaixo. Clique no <Check className="w-3 h-3 inline text-emerald-400 stroke-[3]" /> para aceitar ou <X className="w-3 h-3 inline text-rose-400 stroke-[3]" /> para rejeitar.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10.5px] font-semibold transition-colors cursor-pointer border border-slate-700 hover:border-emerald-500/30"
                  >
                    Aceitar Todas
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectUnmapped}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10.5px] font-semibold transition-colors cursor-pointer border border-slate-700"
                  >
                    Rejeitar Não Mapeadas
                  </button>
                </div>
              </div>

              {/* LISTA DAS COLUNAS COM OK OU REJEITAR (Espaço ampliado para conferência completa) */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 divide-y divide-slate-800/80 max-h-[460px] overflow-y-auto scrollbar-thin">
                {parsedHeaders.map((header) => {
                  const mapInfo = columnMapping[header] || { targetField: null, isAccepted: false, confidence: 0 };
                  const isOk = mapInfo.isAccepted && mapInfo.targetField;
                  const targetFieldObj = DB_FIELDS.find(f => f.key === mapInfo.targetField);

                  return (
                    <div 
                      key={`col-${header}`}
                      className={`px-3 py-2 flex items-center justify-between gap-3 text-xs transition-colors ${
                        isOk ? 'bg-slate-900/40' : 'bg-slate-950/80 opacity-60'
                      }`}
                    >
                      {/* Nome no Arquivo */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-mono font-bold text-slate-200 truncate bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                          {header}
                        </span>
                        
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />

                        {/* Seletor do Campo no Banco de Dados */}
                        <select
                          value={mapInfo.targetField || ''}
                          onChange={(e) => changeColumnTarget(header, e.target.value || null)}
                          className={`bg-slate-800 border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                            isOk ? 'border-emerald-500/50 text-emerald-300 font-semibold' : 'border-slate-700 text-slate-400'
                          }`}
                        >
                          <option value="">-- Ignorar / Rejeitar Coluna --</option>
                          {DB_FIELDS.map(f => (
                            <option key={f.key} value={f.key}>
                              {f.label} {f.required ? '*' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Botão de OK ou REJEITAR */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleColumnAccepted(header)}
                          title={isOk ? "Coluna aceita para importação (Clique para rejeitar)" : "Coluna rejeitada (Clique para aceitar)"}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm ${
                            isOk
                              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:scale-105'
                              : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isOk ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>OK</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Rejeitar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Erro de Validação */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Botões de Ação do Passo 2 */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('SETUP_AND_UPLOAD')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar e Importar {parsedRows.length} Itens</span>
                </button>
              </div>

            </div>
          )}

          {/* PASSO 3: SUCESSO */}
          {step === 'SUCCESS' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-[0_0_24px_rgba(52,211,153,0.5)]">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">Importação Concluída com Sucesso!</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                  Os {parsedRows.length} itens foram cadastrados na base de dados com as colunas mapeadas e já estão visíveis na tabela.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                Concluir e Ver Bens
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
