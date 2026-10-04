import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, 
  Users, 
  UserPlus, 
  User, 
  Phone, 
  Building2, 
  MapPin, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  MessageSquare, 
  Package, 
  ArrowRight,
  Eye,
  Sparkles,
  Smartphone,
  Upload,
  FileSpreadsheet,
  Plus,
  AlertCircle,
  FileText
} from 'lucide-react';
import { formatLast5Patrimonio } from '../utils/formatters';

// Formatador de telefone flexível que aceita ramal (ex: 2450) ou telefone completo com DDD
export const formatPhoneWithRamal = (val) => {
  if (!val) return '';
  // Remove espaços extras
  const clean = String(val).trim();
  const digits = clean.replace(/\D/g, '');
  
  // Se for ramal interno curto (até 4 dígitos)
  if (digits.length <= 4) {
    return digits;
  }
  // Telefone fixo (8 ou 9 dígitos com DDD: 10 dígitos no total)
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  }
  // Celular com 9 dígitos (11 dígitos no total)
  return digits.slice(0, 11).replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
};

export const ServidoresModal = ({
  isOpen,
  onClose,
  servidores = [],
  assets = [],
  sectors = [],
  onSaveServidor,
  onSaveServidoresBatch,
  onDeleteServidor,
  onSelectServidorToFilter,
  onGoToAsset,
  onUnlinkAssetFromServidor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingServidor, setEditingServidor] = useState(null);
  const [expandedServidorId, setExpandedServidorId] = useState(null);

  // Setor padrão: ADMINISTRATIVO
  const defaultAdminSector = useMemo(() => {
    return sectors.find(s => (s.name || '').toUpperCase().trim() === 'ADMINISTRATIVO') 
      || sectors.find(s => (s.name || '').toLowerCase().includes('admin')) 
      || sectors[0] 
      || null;
  }, [sectors]);

  // Estados do Cadastro e Edição na Barra Superior (Nome -> Telefone -> Setor)
  const [quickNome, setQuickNome] = useState('');
  const [quickTelefone, setQuickTelefone] = useState('');
  const [quickSetorId, setQuickSetorId] = useState('');
  const [quickFeedback, setQuickFeedback] = useState(null);

  // Estados de Importação em Lote
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importPreviewList, setImportPreviewList] = useState([]);

  // Estados para Edição Direta Inline na Linha (Setor e Telefone)
  const [openSetorDropdownId, setOpenSetorDropdownId] = useState(null);
  const [editingPhoneServidorId, setEditingPhoneServidorId] = useState(null);
  const [tempPhoneValue, setTempPhoneValue] = useState('');

  // Refs
  const directPhoneInputRef = useRef(null);
  const quickNameInputRef = useRef(null);
  const quickPhoneInputRef = useRef(null);
  const quickSectorSelectRef = useRef(null);
  const fileInputRef = useRef(null);

  // Abrir edição diretamente na barra superior
  const handleOpenEdit = (servidor) => {
    setEditingServidor(servidor);
    setQuickNome(servidor.nome || '');
    setQuickTelefone(servidor.telefone || '');
    setQuickSetorId(servidor.setorId || defaultAdminSector?.id || '');
    setTimeout(() => {
      quickNameInputRef.current?.focus();
      quickNameInputRef.current?.select();
    }, 50);
  };

  const handleCancelEdit = () => {
    setEditingServidor(null);
    setQuickNome('');
    setQuickTelefone('');
    setQuickSetorId(defaultAdminSector?.id || '');
  };

  // Alterar setor diretamente na linha
  const handleDirectSetorChange = (serv, sec) => {
    const updated = {
      ...serv,
      setorId: sec.id,
      setorNome: sec.name,
      dataAtualizacao: new Date().toISOString()
    };
    onSaveServidor(updated);
    setOpenSetorDropdownId(null);
  };

  // Salvar telefone diretamente na linha
  const handleSaveDirectPhone = (serv) => {
    setEditingPhoneServidorId(null);
    const cleaned = (tempPhoneValue || '').trim();
    if (cleaned === (serv.telefone || '').trim()) return;
    const updated = {
      ...serv,
      telefone: cleaned,
      dataAtualizacao: new Date().toISOString()
    };
    onSaveServidor(updated);
  };

  // Foco no input de telefone direto ao editar
  useEffect(() => {
    if (editingPhoneServidorId && directPhoneInputRef.current) {
      directPhoneInputRef.current.focus();
      directPhoneInputRef.current.select();
    }
  }, [editingPhoneServidorId]);

  // Inicializa o setor padrão para ADMINISTRATIVO quando setores carregarem
  useEffect(() => {
    if (defaultAdminSector && !quickSetorId && !editingServidor) {
      setQuickSetorId(defaultAdminSector.id);
    }
  }, [defaultAdminSector, quickSetorId, editingServidor]);

  // Tecla Escape para recolher gaveta de bens, cancelar edição ou fechar modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (expandedServidorId) {
          e.stopPropagation();
          setExpandedServidorId(null);
        } else if (openSetorDropdownId) {
          e.stopPropagation();
          setOpenSetorDropdownId(null);
        } else if (isImportOpen) {
          e.stopPropagation();
          setIsImportOpen(false);
        } else if (editingServidor) {
          e.stopPropagation();
          handleCancelEdit();
        } else if (onClose) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, expandedServidorId, openSetorDropdownId, isImportOpen, editingServidor, onClose]);

  // Cadastro e Edição Rápida no Topo (Nome -> TAB -> Telefone com máscara -> Setor -> Enter -> Salva e limpa)
  const handleQuickSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanNome = quickNome.trim();
    if (!cleanNome) {
      quickNameInputRef.current?.focus();
      return;
    }

    const selectedSector = sectors.find(s => s.id === quickSetorId) || defaultAdminSector;

    if (editingServidor) {
      const updatedServ = {
        ...editingServidor,
        nome: cleanNome,
        telefone: quickTelefone.trim(),
        setorId: selectedSector?.id || null,
        setorNome: selectedSector?.name || '',
        dataAtualizacao: new Date().toISOString()
      };
      onSaveServidor(updatedServ);
      setEditingServidor(null);
      setQuickFeedback(`"${cleanNome}" atualizado com sucesso!`);
    } else {
      const newServ = {
        id: `serv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        nome: cleanNome,
        telefone: quickTelefone.trim(),
        setorId: selectedSector?.id || null,
        setorNome: selectedSector?.name || '',
        mesa: '',
        email: '',
        observacoes: '',
        dataAtualizacao: new Date().toISOString()
      };
      onSaveServidor(newServ);
      setQuickFeedback(`"${cleanNome}" cadastrado no setor ${selectedSector?.name || 'Administrativo'}!`);
    }

    // Limpa os campos para nova inserção imediata, mantendo setor padrão selecionado
    setQuickNome('');
    setQuickTelefone('');
    setTimeout(() => setQuickFeedback(null), 2500);

    // Mantém o foco no campo Nome para digitar o próximo servidor sem interrupção
    setTimeout(() => {
      quickNameInputRef.current?.focus();
    }, 50);
  };

  // Processamento de Importação de Texto Colado (Nome, Telefone em cada linha)
  const parseTextForImport = (rawText) => {
    if (!rawText || !rawText.trim()) return [];
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const parsed = [];

    for (const line of lines) {
      let parts = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(';')) {
        parts = line.split(';');
      } else if (line.includes(',')) {
        parts = line.split(',');
      } else if (line.includes(' - ')) {
        parts = line.split(' - ');
      } else {
        parts = [line];
      }

      const rawNome = parts[0]?.trim();
      const rawTel = parts[1] ? formatPhoneWithRamal(parts[1].trim()) : '';
      const rawSetor = parts[2]?.trim() || '';
      const rawMesa = parts[3]?.trim() || '';

      if (rawNome && rawNome.length >= 2 && !rawNome.toLowerCase().includes('nome')) {
        const matchedSector = sectors.find(s => s.name.toLowerCase() === rawSetor.toLowerCase());
        parsed.push({
          id: `serv-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          nome: rawNome,
          telefone: rawTel,
          setorId: matchedSector ? matchedSector.id : (defaultAdminSector?.id || sectors[0]?.id || null),
          setorNome: matchedSector ? matchedSector.name : (defaultAdminSector?.name || sectors[0]?.name || ''),
          mesa: rawMesa,
          email: '',
          observacoes: '',
          dataAtualizacao: new Date().toISOString()
        });
      }
    }
    return parsed;
  };

  // Upload de arquivo Excel (.xlsx, .xls) ou CSV/TXT
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const reader = new FileReader();

    if (isExcel) {
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

          const parsed = [];
          for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;
            const firstCell = String(row[0] || '').trim();
            if (!firstCell || firstCell.toLowerCase() === 'nome' || firstCell.toLowerCase() === 'servidor') continue;

            const servNome = firstCell;
            const servTel = row[1] ? formatPhoneWithRamal(String(row[1]).trim()) : '';
            const servSetor = row[2] ? String(row[2]).trim() : '';
            const servMesa = row[3] ? String(row[3]).trim() : '';

            if (servNome.length >= 2) {
              const matchedSector = sectors.find(s => s.name.toLowerCase() === servSetor.toLowerCase());
              parsed.push({
                id: `serv-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                nome: servNome,
                telefone: servTel,
                setorId: matchedSector ? matchedSector.id : (sectors[0]?.id || null),
                setorNome: matchedSector ? matchedSector.name : (sectors[0]?.name || ''),
                mesa: servMesa,
                email: '',
                observacoes: '',
                dataAtualizacao: new Date().toISOString()
              });
            }
          }
          setImportPreviewList(parsed);
          setImportText('');
        } catch (err) {
          alert('Erro ao ler planilha: ' + err.message);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      reader.onload = (evt) => {
        const text = evt.target.result;
        const parsed = parseTextForImport(text);
        setImportPreviewList(parsed);
      };
      reader.readAsText(file);
    }
  };

  // Confirmar Importação em Lote
  const handleConfirmImport = () => {
    if (importPreviewList.length === 0) return;
    if (onSaveServidoresBatch) {
      onSaveServidoresBatch(importPreviewList);
    } else {
      importPreviewList.forEach(s => onSaveServidor(s));
    }
    setIsImportOpen(false);
    setImportPreviewList([]);
    setImportText('');
  };

  // Exclusão com confirmação
  const handleDelete = (servidor) => {
    const linked = getAssetsForServidor(servidor);
    const msg = linked.length > 0 
      ? `Atenção: Existem ${linked.length} patrimônio(s) associado(s) a ${servidor.nome}. Deseja realmente excluir este servidor?`
      : `Deseja realmente remover o servidor "${servidor.nome}"?`;

    if (window.confirm(msg)) {
      onDeleteServidor(servidor.id);
    }
  };

  // Mapear quais patrimônios pertencem a cada servidor
  const getAssetsForServidor = (servidor) => {
    if (!servidor || !assets) return [];
    const servNomeNorm = (servidor.nome || '').toLowerCase().trim();
    return assets.filter(a => {
      if (a.servidorId && a.servidorId === servidor.id) return true;
      if (a.servidorNome && a.servidorNome.toLowerCase().trim() === servNomeNorm) return true;
      if (a.observacao && a.observacao.toLowerCase().trim() === servNomeNorm) return true;
      if (a.localizacao && a.localizacao.toLowerCase().includes(servNomeNorm)) return true;
      return false;
    });
  };

  // Filtragem e Ordenação Alfabética dos servidores (A-Z)
  const filteredServidores = useMemo(() => {
    let list = servidores;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = servidores.filter(s => {
        const matchNome = (s.nome || '').toLowerCase().includes(term);
        const matchTel = (s.telefone || '').replace(/\D/g, '').includes(term.replace(/\D/g, '')) || (s.telefone || '').toLowerCase().includes(term);
        const matchSetor = (s.setorNome || '').toLowerCase().includes(term);
        const matchMesa = (s.mesa || '').toLowerCase().includes(term);
        return matchNome || matchTel || matchSetor || matchMesa;
      });
    }
    // Sempre ordenar em ordem alfabética por nome (A-Z)
    return [...list].sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' }));
  }, [servidores, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl p-4 sm:p-5 shadow-2xl relative flex flex-col max-h-[92vh]">
        
        {/* Header com Título Servidores e Botão de Importação */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg">Servidores</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 font-mono">
                  {servidores.length} {servidores.length === 1 ? 'pessoa' : 'pessoas'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Botão de Importar Lista */}
            <button
              type="button"
              onClick={() => {
                setIsImportOpen(!isImportOpen);
              }}
              title="Importar lista de servidores (Excel, CSV ou Colar Texto)"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isImportOpen 
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' 
                  : 'bg-slate-800 hover:bg-slate-750 text-cyan-300'
              }`}
            >
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Importar</span>
            </button>

            {/* Fechar Modal */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              title="Fechar janela (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BARRA DE CADASTRO/EDIÇÃO NO TOPO (Nome -> Telefone -> Setor de Lotação (Padrão ADMINISTRATIVO) -> Cadastrar) */}
        <div className="mt-3 shrink-0">
          <form 
            onSubmit={handleQuickSubmit} 
            className="flex flex-col md:flex-row items-center gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800/80"
          >
            {/* Campo 1: Nome do Servidor */}
            <div className="relative flex-1 w-full">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                ref={quickNameInputRef}
                type="text"
                tabIndex={1}
                value={quickNome}
                onChange={(e) => setQuickNome(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!quickTelefone && quickPhoneInputRef.current) {
                      quickPhoneInputRef.current.focus();
                    } else {
                      handleQuickSubmit(e);
                    }
                  }
                }}
                placeholder="Nome do servidor (ex: Tais, Ronald, Aline)..."
                className="w-full bg-slate-900 border border-slate-750 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-medium transition-colors"
                autoFocus
              />
            </div>

            {/* Campo 2: Telefone com máscara (aceita ramal) */}
            <div className="relative w-full md:w-52">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                ref={quickPhoneInputRef}
                type="text"
                tabIndex={2}
                value={quickTelefone}
                onChange={(e) => setQuickTelefone(formatPhoneWithRamal(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleQuickSubmit(e);
                  }
                }}
                placeholder="Telefone ou Ramal (ex: 2450)"
                className="w-full bg-slate-900 border border-slate-750 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none transition-colors"
              />
            </div>

            {/* Campo 3: Setor de Lotação (Padrão ADMINISTRATIVO) */}
            <div className="relative w-full md:w-60">
              <Building2 className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-2.5 pointer-events-none" />
              <select
                ref={quickSectorSelectRef}
                tabIndex={3}
                value={quickSetorId}
                onChange={(e) => setQuickSetorId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleQuickSubmit(e);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-750 focus:border-cyan-400 rounded-lg pl-9 pr-8 py-1.5 text-xs text-white font-medium focus:outline-none transition-colors cursor-pointer appearance-none truncate"
                title="Setor de Lotação (Padrão: ADMINISTRATIVO)"
              >
                {sectors.map(sec => (
                  <option key={sec.id} value={sec.id} className="bg-slate-900 text-white">
                    {sec.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {/* Botão de Ação */}
            <div className="flex items-center gap-1.5 w-full md:w-auto shrink-0">
              <button
                type="submit"
                tabIndex={4}
                className="flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-950/40 flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                title={editingServidor ? "Salvar alterações do servidor" : "Pressione Enter para cadastrar e continuar na tela"}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{editingServidor ? 'Salvar' : 'Cadastrar'}</span>
                {!editingServidor && (
                  <span className="text-[9px] bg-slate-950/20 text-slate-900 px-1 py-0.5 rounded font-mono font-bold">↵</span>
                )}
              </button>

              {editingServidor && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition cursor-pointer"
                  title="Cancelar edição"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* Feedback temporário de cadastro */}
          {quickFeedback && (
            <div className="mt-1.5 text-[11px] text-cyan-300 font-semibold px-2 flex items-center gap-1.5 animate-in fade-in duration-150">
              <Check className="w-3 h-3 text-cyan-400 stroke-[3]" />
              <span>{quickFeedback} Pronto para o próximo (digite o nome).</span>
            </div>
          )}
        </div>

        {/* PAINEL DE IMPORTAÇÃO DE LISTA (Planilha ou Texto) */}
        {isImportOpen && (
          <div className="p-3.5 my-2.5 bg-slate-950/90 border border-cyan-500/40 rounded-2xl shrink-0 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Importar Lista de Servidores
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsImportOpen(false);
                  setImportPreviewList([]);
                  setImportText('');
                }}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Fechar Importação
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opção 1: Upload de Arquivo */}
              <div className="p-3 bg-slate-900/90 border border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl flex flex-col items-center justify-center text-center">
                <Upload className="w-6 h-6 text-cyan-400 mb-1.5 opacity-80" />
                <p className="text-xs font-bold text-white">Carregar Arquivo</p>
                <p className="text-[10px] text-slate-400 mb-2">Excel (.xlsx, .xls) ou CSV / TXT</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 cursor-pointer"
                >
                  Selecionar Planilha...
                </button>
              </div>

              {/* Opção 2: Colar Lista de Nomes */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Ou Cole uma Lista (um por linha):
                </label>
                <textarea
                  rows={3}
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    const parsed = parseTextForImport(e.target.value);
                    setImportPreviewList(parsed);
                  }}
                  placeholder="Exemplo:&#10;Carlos Silva, 2450&#10;Tais Souza, (81) 98765-4321&#10;Ronald"
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono resize-none scrollbar-thin"
                />
              </div>
            </div>

            {/* Pré-visualização da Importação */}
            {importPreviewList.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-cyan-300 font-bold">
                    ✓ {importPreviewList.length} servidor(es) detectado(s) para importar:
                  </span>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Confirmar e Importar Todos</span>
                  </button>
                </div>

                <div className="max-h-36 overflow-y-auto scrollbar-thin space-y-1 pr-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  {importPreviewList.slice(0, 30).map((item, idx) => (
                    <div key={`preview-${idx}`} className="flex items-center justify-between text-xs py-0.5 px-1.5 rounded hover:bg-slate-800">
                      <span className="text-white font-medium truncate">{item.nome}</span>
                      <span className="text-emerald-400 font-mono text-[11px]">{item.telefone || '(sem fone)'}</span>
                    </div>
                  ))}
                  {importPreviewList.length > 30 && (
                    <p className="text-[10px] text-slate-500 text-center italic">
                      + {importPreviewList.length - 30} outros servidores na lista...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}



        {/* TABELA DE SERVIDORES - COLUNAS ALINHADAS COM LINHAS VERTICAIS DISCRETAS */}
        <div className="flex-1 flex flex-col min-h-0 border border-slate-800/80 rounded-xl overflow-hidden mt-1">
          {/* Cabeçalho das Colunas com Linhas Verticais Discretas */}
          <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800/80 shrink-0 select-none">
            <div className="w-48 sm:w-56 px-3.5 py-2 border-r border-slate-800/80 shrink-0">
              Servidor
            </div>
            <div className="w-48 sm:w-56 px-3.5 py-2 border-r border-slate-800/80 shrink-0">
              Setor de Lotação
            </div>
            <div className="flex-1 min-w-[170px] px-3.5 py-2 border-r border-slate-800/80">
              Telefone
            </div>
            <div className="w-20 px-2 py-2 border-r border-slate-800/80 text-center shrink-0">
              Bens
            </div>
            <div className="w-24 px-2 py-2 text-center shrink-0">
              Ações
            </div>
          </div>

          {/* Linhas da Tabela */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 scrollbar-thin">
            {filteredServidores.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-600 stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-300">
                  {servidores.length === 0 
                    ? 'Nenhum servidor cadastrado ainda.' 
                    : `Nenhum servidor corresponde à busca "${searchTerm}".`}
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  {servidores.length === 0 
                    ? 'Digite o nome e telefone acima e pressione Enter para cadastrar instantaneamente.' 
                    : 'Tente buscar com outro termo ou limpe a busca.'}
                </p>
              </div>
            ) : (
              filteredServidores.map((serv, idx) => {
                const linkedAssets = getAssetsForServidor(serv);
                const isExpanded = expandedServidorId === serv.id;
                const phoneDigits = (serv.telefone || '').replace(/\D/g, '');
                const isMobile = phoneDigits.length >= 10;
                const isEditingPhone = editingPhoneServidorId === serv.id;
                const isSetorOpen = openSetorDropdownId === serv.id;
                const openUpward = idx > filteredServidores.length - 4 && filteredServidores.length > 4;

                return (
                  <div key={serv.id} className="hover:bg-slate-800/25 transition-colors group">
                    {/* Linha com Colunas Separadas por Linhas Verticais Discretas */}
                    <div className="flex items-center min-h-[38px] w-full">
                      
                      {/* Coluna 1: Servidor (Avatar + Nome) */}
                      <div className="w-48 sm:w-56 px-3.5 py-1.5 border-r border-slate-800/60 flex items-center gap-2.5 shrink-0 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {(serv.nome || 'S')[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-white text-xs truncate" title={serv.nome}>
                          {serv.nome}
                        </span>
                      </div>

                      {/* Coluna 2: Setor de Lotação (Listbox ao clicar) */}
                      <div className="w-48 sm:w-56 px-3 py-1.5 border-r border-slate-800/60 shrink-0 relative">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenSetorDropdownId(isSetorOpen ? null : serv.id);
                            setEditingPhoneServidorId(null);
                          }}
                          className={`w-full px-2 py-1 rounded text-[11px] font-medium flex items-center justify-between gap-1 transition-colors cursor-pointer ${
                            isSetorOpen
                              ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                              : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                          title="Clique para trocar o setor"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Building2 className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span className="truncate">{serv.setorNome || 'Definir setor'}</span>
                          </div>
                          <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        </button>

                        {/* Dropdown listbox de Setores */}
                        {isSetorOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-40 bg-transparent" 
                              onClick={() => setOpenSetorDropdownId(null)} 
                            />
                            <div className={`absolute left-2 ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'} w-52 max-h-[360px] overflow-y-auto bg-slate-900 border border-slate-750 rounded-xl shadow-2xl z-50 py-1 scrollbar-thin animate-in fade-in duration-100`}>
                              {sectors.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-slate-500 italic">Nenhum setor cadastrado</div>
                              ) : (
                                sectors.map(sec => {
                                  const isSelected = serv.setorId === sec.id || serv.setorNome === sec.name;
                                  return (
                                    <button
                                      key={sec.id}
                                      type="button"
                                      onClick={() => handleDirectSetorChange(serv, sec)}
                                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                        isSelected 
                                          ? 'bg-cyan-500/15 text-cyan-300 font-bold' 
                                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        <Building2 className="w-3 h-3 text-cyan-400 shrink-0" />
                                        <span className="truncate">{sec.name}</span>
                                      </div>
                                      {isSelected && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Coluna 3: Telefone (Edição Direta + WhatsApp) */}
                      <div className="flex-1 min-w-[170px] px-3.5 py-1.5 border-r border-slate-800/60 flex items-center gap-2 min-w-0">
                        {isEditingPhone ? (
                          <div className="flex items-center gap-1 bg-slate-950/90 rounded px-2 py-0.5 border border-cyan-500/50 shadow-sm w-full max-w-[220px]">
                            <Phone className="w-3 h-3 text-cyan-400 shrink-0" />
                            <input
                              ref={directPhoneInputRef}
                              type="text"
                              value={tempPhoneValue}
                              onChange={(e) => setTempPhoneValue(formatPhoneWithRamal(e.target.value))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveDirectPhone(serv);
                                } else if (e.key === 'Escape') {
                                  setEditingPhoneServidorId(null);
                                }
                              }}
                              onBlur={() => handleSaveDirectPhone(serv)}
                              placeholder="Telefone ou ramal..."
                              className="w-full bg-transparent text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSaveDirectPhone(serv);
                              }}
                              className="p-0.5 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                              title="Salvar telefone (Enter)"
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </button>
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setEditingPhoneServidorId(null);
                              }}
                              className="p-0.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                              title="Cancelar (Esc)"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPhoneServidorId(serv.id);
                              setTempPhoneValue(serv.telefone || '');
                              setOpenSetorDropdownId(null);
                            }}
                            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded hover:bg-slate-800/60 transition-colors cursor-pointer group/phone text-left"
                            title="Clique para alterar ou incluir telefone diretamente"
                          >
                            <Phone className={`w-3.5 h-3.5 shrink-0 ${serv.telefone ? 'text-emerald-400' : 'text-slate-500 group-hover/phone:text-cyan-400'}`} />
                            {serv.telefone ? (
                              <span className="font-mono text-emerald-300 font-bold text-xs">
                                {serv.telefone}
                              </span>
                            ) : (
                              <span className="text-slate-500 group-hover/phone:text-slate-300 italic text-[11px]">
                                Sem fone
                              </span>
                            )}
                            <Edit3 className="w-2.5 h-2.5 text-slate-600 group-hover/phone:text-cyan-400 opacity-0 group-hover/phone:opacity-100 transition-opacity ml-1 shrink-0" />
                          </button>
                        )}

                        {/* WhatsApp se celular */}
                        {isMobile && !isEditingPhone && (
                          <a
                            href={`https://wa.me/55${phoneDigits}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[9.5px] font-bold inline-flex items-center gap-0.5 transition shrink-0"
                            title="Conversar no WhatsApp"
                          >
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>Whats</span>
                          </a>
                        )}

                        {/* Mesa */}
                        {serv.mesa && (
                          <span className="hidden xl:inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-950/30 text-cyan-400 items-center gap-1 shrink-0 ml-auto">
                            <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                            <span className="truncate max-w-[80px]">{serv.mesa}</span>
                          </span>
                        )}
                      </div>

                      {/* Coluna 4: Bens Vinculados */}
                      <div className="w-20 px-2 py-1.5 border-r border-slate-800/60 flex items-center justify-center shrink-0">
                        <button
                          type="button"
                          onClick={() => setExpandedServidorId(isExpanded ? null : serv.id)}
                          className={`px-2 py-0.5 rounded text-[10.5px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            isExpanded
                              ? 'bg-amber-500/25 text-amber-200 ring-1 ring-amber-400/60 shadow-sm font-bold'
                              : linkedAssets.length > 0
                                ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          }`}
                          title={isExpanded ? "Clique para fechar/recolher esta lista" : "Ver bens com este servidor"}
                        >
                          <Package className="w-3 h-3" />
                          <span>{linkedAssets.length}</span>
                          {isExpanded ? <ChevronUp className="w-2.5 h-2.5 text-amber-300 stroke-[3]" /> : <ChevronDown className="w-2.5 h-2.5" />}
                        </button>
                      </div>

                      {/* Coluna 5: Ações */}
                      <div className="w-24 px-2 py-1.5 flex items-center justify-center gap-1 shrink-0">
                        {onSelectServidorToFilter && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectServidorToFilter(serv.nome);
                              onClose();
                            }}
                            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
                            title={`Buscar patrimônios de ${serv.nome} no painel`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(serv)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                          title="Editar servidor"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(serv)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Excluir servidor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  {/* Seção Expandida: Lista dos Bens com este Servidor */}
                  {isExpanded && (
                    <div className="p-3 pt-2.5 border-t border-slate-800 animate-in fade-in duration-150 space-y-2.5 bg-slate-950/60">
                      {/* Barra Superior do Painel Expandido com Título Clicável e Botões */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                        {/* Título Clicável para Recolher */}
                        <button
                          type="button"
                          onClick={() => setExpandedServidorId(null)}
                          className="text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer text-left group/head"
                          title="Clique para fechar"
                        >
                          <Package className="w-3.5 h-3.5 text-amber-400" />
                          <span>Patrimônios com {serv.nome} ({linkedAssets.length}):</span>
                        </button>

                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                          {/* BOTÃO CLARO E EVIDENTE PARA FECHAR / RECOLHER */}
                          <button
                            type="button"
                            onClick={() => setExpandedServidorId(null)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95 shrink-0"
                            title="Recolher e fechar este painel de bens (ou pressione Esc)"
                          >
                            <X className="w-3.5 h-3.5 text-rose-400" />
                            <span>Fechar</span>
                            <ChevronUp className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                      </div>

                      {linkedAssets.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic py-2 text-center bg-slate-900/60 rounded-xl border border-slate-800">
                          Nenhum bem patrimonial vinculado a este servidor no momento.
                        </p>
                      ) : (
                        <div className="flex flex-col space-y-1.5">
                          {linkedAssets.map(item => (
                            <div 
                              key={item.id}
                              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/70 hover:bg-slate-900 transition-colors flex items-center justify-between gap-3 text-xs w-full"
                            >
                              {/* Lado Esquerdo: Descrição Ampla com Número de Patrimônio */}
                              <div className="min-w-0 flex-1 pr-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-amber-300 text-xs shrink-0 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    {formatLast5Patrimonio(item.numeroPatrimonio)}
                                  </span>
                                  <span className="text-white font-medium truncate block text-xs" title={item.descricao}>
                                    {item.descricao}
                                  </span>
                                </div>
                                <div className="text-[10.5px] text-slate-400 truncate mt-0.5 ml-0.5">
                                  Setor: <strong className="text-slate-300">{item.setorNome || 'Setor'}</strong>
                                  {item.localizacao && ` • ${item.localizacao}`}
                                </div>
                              </div>

                              {/* Lado Direito: Todos os Botões Alinhados na Direita */}
                              <div className="flex items-center gap-2 shrink-0 ml-auto">
                                <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider ${
                                  item.status === 'CONFERIDO' 
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                }`}>
                                  {item.status}
                                </span>

                                {/* Botão Ir para o local */}
                                {onGoToAsset && (
                                  <button
                                    type="button"
                                    onClick={() => onGoToAsset(item)}
                                    className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                                    title={`Ir para o setor "${item.setorNome || 'Setor'}" e visualizar este bem no painel`}
                                  >
                                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Ir ao local</span>
                                  </button>
                                )}

                                {/* Botão Excluir/Desvincular deste servidor */}
                                {onUnlinkAssetFromServidor && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Deseja desvincular o patrimônio ${formatLast5Patrimonio(item.numeroPatrimonio)} do servidor "${serv.nome}"?`)) {
                                        onUnlinkAssetFromServidor(item.id, serv);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer"
                                    title={`Excluir / Desvincular patrimônio deste servidor`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  </div>
);
};
