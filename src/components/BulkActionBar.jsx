import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  CheckCheck, 
  Building2, 
  Users,
  User,
  X, 
  ChevronDown,
  Search,
  Sparkles,
  Handshake,
  Phone
} from 'lucide-react';

// Helper para extrair o nome do servidor vinculado ao item (por servidorNome, servidorId, observação "Com quem está", localização ou cautela)
const extractServidorFromAsset = (asset, servidoresList = []) => {
  if (!asset) return null;

  // 1. servidorNome explícito
  if (asset.servidorNome && typeof asset.servidorNome === 'string' && asset.servidorNome.trim()) {
    return asset.servidorNome.trim();
  }

  // 2. servidorId vinculado a servidores cadastrados
  if (asset.servidorId && Array.isArray(servidoresList) && servidoresList.length > 0) {
    const found = servidoresList.find(s => String(s.id) === String(asset.servidorId));
    if (found && found.nome) return found.nome.trim();
  }

  // 3. Objeto ou string em asset.servidor
  if (asset.servidor) {
    if (typeof asset.servidor === 'string' && asset.servidor.trim()) {
      return asset.servidor.trim();
    }
    if (typeof asset.servidor === 'object' && asset.servidor?.nome) {
      return asset.servidor.nome.trim();
    }
  }

  // 4. Observação (Coluna "Com quem está?")
  if (asset.observacao && typeof asset.observacao === 'string') {
    const rawObs = asset.observacao.trim();
    const cleanObs = rawObs.replace(/^@/, '').trim();
    
    // Procura na lista de servidores cadastrados
    if (Array.isArray(servidoresList) && servidoresList.length > 0) {
      const matchServ = servidoresList.find(s => {
        const sNome = (s.nome || '').toLowerCase().trim();
        const obsLow = cleanObs.toLowerCase();
        return sNome && (obsLow === sNome || obsLow.startsWith(sNome) || obsLow.includes(sNome));
      });
      if (matchServ && matchServ.nome) return matchServ.nome.trim();
    }

    // Se for texto livre de pessoa (ex: "Alex", "Jean pegou", etc.)
    if (cleanObs && cleanObs.length <= 40 && !cleanObs.includes('\n')) {
      const pessoaMatch = cleanObs.match(/\b([A-ZÀ-ÿ][a-zà-ÿ]+)\s+(pegou|levou|recebeu|ficou|guardou)\b/i)
        || cleanObs.match(/\b(com|para|entregue a)\s+([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+)*)\b/i);
      if (pessoaMatch) {
        const pName = pessoaMatch[1] && !['com', 'para', 'entregue a'].includes(pessoaMatch[1].toLowerCase()) ? pessoaMatch[1] : pessoaMatch[2];
        if (pName) return pName.trim();
      }
      return cleanObs;
    }
  }

  // 5. Localização (ex: "Mesa do Alex")
  if (asset.localizacao && typeof asset.localizacao === 'string') {
    const loc = asset.localizacao.trim();
    const mesaMatch = loc.match(/Mesa\s+(?:d[aeo]\s+)?([A-ZÀ-ÿa-zà-ÿ]+(?:\s+[A-ZÀ-ÿa-zà-ÿ]+)?)/i);
    if (mesaMatch && mesaMatch[1]) {
      return mesaMatch[1].trim();
    }
    if (Array.isArray(servidoresList) && servidoresList.length > 0) {
      const matchServ = servidoresList.find(s => {
        const sNome = (s.nome || '').toLowerCase().trim();
        return sNome && loc.toLowerCase().includes(sNome);
      });
      if (matchServ && matchServ.nome) return matchServ.nome.trim();
    }
  }

  // 6. Cautela atual
  if (asset.cautelaAtual) {
    const resp = asset.cautelaAtual.responsavelRetirada || asset.cautelaAtual.responsavel;
    if (resp && typeof resp === 'string' && resp.trim()) {
      return resp.trim();
    }
  }

  // 7. Responsável
  if (asset.responsavel && typeof asset.responsavel === 'string') {
    const resp = asset.responsavel.trim();
    if (Array.isArray(servidoresList) && servidoresList.length > 0) {
      const matchServ = servidoresList.find(s => (s.nome || '').toLowerCase().trim() === resp.toLowerCase());
      if (matchServ && matchServ.nome) return matchServ.nome.trim();
    }
  }

  return null;
};

export const BulkActionBar = ({
  selectedCount = 0,
  selectedAssets = [],
  onClearSelection,
  onAssignSector,
  sectors = [],
  servidores = [],
  onAssignServidor,
  onCautelarItem
}) => {
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const [isServidorDropdownOpen, setIsServidorDropdownOpen] = useState(false);
  const [servidorSearch, setServidorSearch] = useState('');
  const sectorDropdownRef = useRef(null);
  const servidorDropdownRef = useRef(null);
  const servidorSearchInputRef = useRef(null);
  const barRef = useRef(null);

  // Estado do popup "Cautelar item"
  const [isCautelaOpen, setIsCautelaOpen] = useState(false);
  const [isCautelaListOpen, setIsCautelaListOpen] = useState(false);
  const [cautelaNome, setCautelaNome] = useState('');
  const [cautelaContato, setCautelaContato] = useState('');
  const cautelaRef = useRef(null);
  const cautelaNomeRef = useRef(null);

  const effectiveCount = selectedCount || 0;

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(event.target)) {
        setIsSectorDropdownOpen(false);
      }
      if (servidorDropdownRef.current && !servidorDropdownRef.current.contains(event.target)) {
        setIsServidorDropdownOpen(false);
      }
      if (cautelaRef.current && !cautelaRef.current.contains(event.target)) {
        setIsCautelaOpen(false);
        setIsCautelaListOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ao clicar fora da barra de ações em lote, desmarca e recolhe a cortina
  useEffect(() => {
    if (effectiveCount === 0) return;

    const handleOutsideBarClick = (event) => {
      // Se clicou dentro da barra flutuante
      if (barRef.current && barRef.current.contains(event.target)) {
        return;
      }

      // Se clicou em um checkbox de seleção da tabela ou no botão "selecionar todos", deixa o clique de seleção agir
      if (
        event.target.closest('input[type="checkbox"]') ||
        event.target.closest('[data-selection-checkbox]') ||
        event.target.closest('.selection-checkbox') ||
        event.target.closest('button[title*="marcar"]') ||
        event.target.closest('button[title*="Marcar"]')
      ) {
        return;
      }

      // Se clicou em um modal/diálogo aberto
      if (event.target.closest('[role="dialog"]') || event.target.closest('.modal-content')) {
        return;
      }

      // Clicou fora -> desmarca todos os itens para recolher a cortina
      if (onClearSelection) {
        onClearSelection();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideBarClick);
    }, 150);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideBarClick);
    };
  }, [effectiveCount, onClearSelection]);

  // Tecla ESC recolhe a cortina
  useEffect(() => {
    if (effectiveCount === 0) return;
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClearSelection && onClearSelection();
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [effectiveCount, onClearSelection]);

  // Ao abrir o popup de cautela: limpa campos e foca no nome
  useEffect(() => {
    if (isCautelaOpen) {
      setCautelaNome('');
      setCautelaContato('');
      setIsCautelaListOpen(false);
      const t = setTimeout(() => cautelaNomeRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [isCautelaOpen]);

  // Reseta busca e foca automaticamente no input ao abrir a lista
  useEffect(() => {
    if (isServidorDropdownOpen) {
      setServidorSearch('');
      const t = setTimeout(() => {
        servidorSearchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(t);
    }
  }, [isServidorDropdownOpen]);

  // Ao digitar com a lista aberta, redireciona o foco para a busca
  useEffect(() => {
    if (!isServidorDropdownOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsServidorDropdownOpen(false);
        return;
      }
      // Se pressionou uma tecla de caractere alfanumérico e não está com foco no input
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (document.activeElement !== servidorSearchInputRef.current) {
          servidorSearchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isServidorDropdownOpen]);

  // Normalizador de texto para busca sem acentos e minúscula
  const normalizeText = (text) => 
    (text || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  // Filtro ativo e inteligente dos servidores
  const filteredServidores = useMemo(() => {
    const q = normalizeText(servidorSearch);
    if (!q) return servidores;

    return servidores.filter(s => {
      const nome = normalizeText(s.nome);
      const mesa = normalizeText(s.mesa);
      const tel = (s.telefone || '').replace(/\D/g, '');
      const qDigits = q.replace(/\D/g, '');
      return nome.includes(q) || mesa.includes(q) || (qDigits.length >= 2 && tel.includes(qDigits));
    });
  }, [servidores, servidorSearch]);

  // Nomes dos servidores atualmente vinculados aos itens selecionados
  const currentServidoresNames = useMemo(() => {
    if (!selectedAssets || selectedAssets.length === 0) return [];
    const names = new Set();
    selectedAssets.forEach(a => {
      const nome = extractServidorFromAsset(a, servidores);
      if (nome && nome.trim()) {
        names.add(nome.trim());
      }
    });
    return Array.from(names);
  }, [selectedAssets, servidores]);

  const servidorLabel = useMemo(() => {
    if (currentServidoresNames.length === 0) return null;
    if (currentServidoresNames.length <= 2) return currentServidoresNames.join(', ');
    return `${currentServidoresNames.slice(0, 2).join(', ')} +${currentServidoresNames.length - 2}`;
  }, [currentServidoresNames]);

  // Lista filtrada de servidores para o campo de cautela
  const cautelaFiltered = useMemo(() => {
    const q = normalizeText(cautelaNome);
    if (!q) return servidores;
    return servidores.filter(s => normalizeText(s.nome).includes(q));
  }, [servidores, cautelaNome]);

  const handleConfirmCautela = () => {
    const nome = cautelaNome.trim();
    if (!nome || !onCautelarItem) return;
    setIsCautelaOpen(false);
    setIsCautelaListOpen(false);
    onCautelarItem(nome, cautelaContato.trim());
  };

  return (
    <div ref={barRef} className="flex items-center gap-2 sm:gap-3 p-1.5 px-3 bg-slate-900/98 backdrop-blur-2xl border-2 border-indigo-500/85 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.9)] text-white">
      
      {/* Contador de Itens Selecionados */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-500/40">
          <CheckCheck className="w-3.5 h-3.5 text-white stroke-[3]" />
        </div>
        <span className="text-xs font-black text-indigo-200 whitespace-nowrap">
          {effectiveCount} {effectiveCount === 1 ? 'item selecionado' : 'itens selecionados'}
        </span>
      </div>

      {/* Botão Desmarcar */}
      <button
        type="button"
        onClick={onClearSelection}
        title="Desmarcar todos os itens"
        className="p-1 px-2 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer text-[11px] flex items-center gap-1 active:scale-95 shrink-0"
      >
        <X className="w-3 h-3" />
        <span>Desmarcar</span>
      </button>

      <div className="w-px h-5 bg-slate-700 mx-0.5 shrink-0 hidden sm:block" />

      {/* Ação 1: Mudar Setor do Item */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative" ref={sectorDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsSectorDropdownOpen(!isSectorDropdownOpen);
              setIsServidorDropdownOpen(false);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 border border-indigo-400/40 transition-all cursor-pointer shadow-lg shadow-indigo-600/30 active:scale-95 whitespace-nowrap"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-200" />
            <span>Mudar Setor</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSectorDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu Suspenso de Setores */}
          {isSectorDropdownOpen && (
            <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 z-50 w-72 max-h-[384px] overflow-y-auto bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150 custom-scroll-auto-hide">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1 border-b border-slate-800 flex items-center justify-between">
                <span>Transferir para o Setor:</span>
                <span className="text-[9px] font-mono text-slate-500">{sectors.length} setores</span>
              </div>
              <div className="space-y-0.5 pt-1">
                {sectors.map(sec => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      setIsSectorDropdownOpen(false);
                      onAssignSector(sec.id);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-indigo-600/30 hover:text-white text-slate-300 transition-colors cursor-pointer group"
                  >
                    <span className="font-semibold truncate">{sec.name}</span>
                    {sec.responsavel && (
                      <span className="text-[10px] text-slate-400 group-hover:text-indigo-200 truncate ml-2">
                        {sec.responsavel}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ação 2: Atribuir a Servidor */}
      {onAssignServidor && servidores && servidores.length > 0 && (
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={servidorDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsServidorDropdownOpen(!isServidorDropdownOpen);
                setIsSectorDropdownOpen(false);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#FA8072] hover:bg-[#ff8f82] text-black font-extrabold text-xs flex items-center gap-1.5 border border-rose-300/80 transition-all cursor-pointer shadow-lg shadow-rose-500/25 active:scale-95 whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span className="text-black font-extrabold">Quem está com o item?</span>
              <ChevronDown className={`w-3.5 h-3.5 text-black stroke-[2.5] transition-transform duration-200 ${isServidorDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menu Suspenso de Servidores com Busca Ativa e Inteligente */}
            {isServidorDropdownOpen && (
              <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 z-50 w-72 max-h-[420px] overflow-hidden flex flex-col bg-slate-900/98 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Cabeçalho */}
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between border-b border-slate-800 shrink-0">
                  <span>Alocar com Servidor:</span>
                  <span className="text-[9px] font-mono text-cyan-400">
                    {servidorSearch ? `${filteredServidores.length} de ${servidores.length}` : `${servidores.length} pessoas`}
                  </span>
                </div>

                {/* Campo de Busca Ativo e Inteligente */}
                <div className="pt-2 pb-1 shrink-0">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 pointer-events-none" />
                    <input
                      ref={servidorSearchInputRef}
                      type="text"
                      value={servidorSearch}
                      onChange={(e) => setServidorSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          setIsServidorDropdownOpen(false);
                          if (filteredServidores.length === 1) {
                            onAssignServidor(filteredServidores[0]);
                          } else if (servidorSearch.trim()) {
                            onAssignServidor({ id: null, nome: servidorSearch.trim() });
                          }
                        }
                      }}
                      placeholder="Digite qualquer nome ou escolha..."
                      className="w-full pl-8 pr-7 py-1.5 bg-slate-950/80 border border-slate-700/70 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                      autoFocus
                    />
                    {servidorSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setServidorSearch('');
                          servidorSearchInputRef.current?.focus();
                        }}
                        className="absolute right-2 p-0.5 text-slate-400 hover:text-white rounded-md cursor-pointer transition-colors"
                        title="Limpar busca"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de Servidores Filtrados */}
                <div className="overflow-y-auto max-h-[300px] space-y-0.5 pt-1 custom-scroll-auto-hide">
                  {/* Atalho para usar qualquer nome digitado */}
                  {servidorSearch.trim() && !servidores?.some(s => s.nome.toLowerCase() === servidorSearch.trim().toLowerCase()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsServidorDropdownOpen(false);
                        onAssignServidor({ id: null, nome: servidorSearch.trim() });
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 transition-colors cursor-pointer group mb-1.5"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">Usar nome digitado: <strong>"{servidorSearch.trim()}"</strong></span>
                      </div>
                      <span className="text-[9.5px] text-cyan-300 bg-cyan-500/25 px-1 py-0.5 rounded font-mono shrink-0 ml-1">
                        Enter ↵
                      </span>
                    </button>
                  )}

                  {/* Opção para desvincular (Exibida APENAS se houver servidor vinculado aos itens selecionados) */}
                  {servidorLabel && (!servidorSearch || 
                    normalizeText('desvincular').includes(normalizeText(servidorSearch)) ||
                    normalizeText(servidorLabel).includes(normalizeText(servidorSearch)) ||
                    currentServidoresNames.some(n => normalizeText(n).includes(normalizeText(servidorSearch)))
                  ) && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsServidorDropdownOpen(false);
                        onAssignServidor(null);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer group mb-1"
                    >
                      <span className="font-semibold italic flex items-center gap-1.5 flex-wrap">
                        <span>Desvincular servidor</span>
                        <span className="text-emerald-400 font-bold not-italic drop-shadow-[0_0_8px_rgba(52,211,153,0.4)] group-hover:text-emerald-300 transition-colors">
                          [{servidorLabel}]
                        </span>
                      </span>
                    </button>
                  )}

                  {filteredServidores.length > 0 ? (
                    filteredServidores.map(serv => (
                      <button
                        key={serv.id}
                        type="button"
                        onClick={() => {
                          setIsServidorDropdownOpen(false);
                          onAssignServidor(serv);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-cyan-600/30 hover:text-white text-slate-300 transition-colors cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="font-semibold truncate block group-hover:text-cyan-200">
                            {serv.nome}
                          </span>
                          {serv.mesa && (
                            <span className="text-[10px] text-cyan-400/90 truncate block">
                              {serv.mesa}
                            </span>
                          )}
                        </div>
                        {serv.telefone && (
                          <span className="text-[10px] text-slate-400 group-hover:text-cyan-200 truncate ml-2 font-mono shrink-0">
                            {serv.telefone}
                          </span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400 space-y-1">
                      <p>Nenhum servidor encontrado para "{servidorSearch}".</p>
                      <button
                        type="button"
                        onClick={() => {
                          setServidorSearch('');
                          servidorSearchInputRef.current?.focus();
                        }}
                        className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                      >
                        Limpar busca
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ação 3: Cautelar item (servidor da lista ou nome livre + contato, tudo na mesma linha) */}
      {onCautelarItem && (
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={cautelaRef}>
            <button
              type="button"
              onClick={() => {
                setIsCautelaOpen(!isCautelaOpen);
                setIsSectorDropdownOpen(false);
                setIsServidorDropdownOpen(false);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs flex items-center gap-1.5 border border-purple-300/40 transition-all cursor-pointer shadow-lg shadow-purple-600/30 active:scale-95 whitespace-nowrap"
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Cautelar item</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCautelaOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCautelaOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-[620px] max-w-[92vw] bg-slate-900/98 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1.5 mb-2 border-b border-slate-800 flex items-center justify-between">
                  <span>Cautelar com:</span>
                  <span className="text-[9px] font-mono text-purple-300">
                    {effectiveCount} {effectiveCount === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Servidor: escolhe da lista ou digita qualquer nome */}
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-3.5 h-3.5 text-purple-300 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={cautelaNomeRef}
                      type="text"
                      value={cautelaNome}
                      onChange={(e) => { setCautelaNome(e.target.value); setIsCautelaListOpen(true); }}
                      onFocus={() => setIsCautelaListOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); handleConfirmCautela(); }
                      }}
                      placeholder="Servidor: escolha ou digite qualquer nome..."
                      className="w-full pl-8 pr-2 py-1.5 bg-slate-950/80 border border-slate-700/70 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                    />
                    {isCautelaListOpen && cautelaFiltered.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 space-y-0.5 custom-scroll-auto-hide">
                        {cautelaFiltered.map(serv => (
                          <button
                            key={serv.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setCautelaNome(serv.nome);
                              setCautelaContato(serv.telefone || '');
                              setIsCautelaListOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-purple-600/30 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <span className="font-semibold truncate">{serv.nome}</span>
                            {serv.telefone && (
                              <span className="text-[10px] font-mono text-slate-400 ml-2 shrink-0">{serv.telefone}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Local / telefone para contato */}
                  <div className="relative w-52 shrink-0">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={cautelaContato}
                      onChange={(e) => setCautelaContato(e.target.value)}
                      onFocus={() => setIsCautelaListOpen(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); handleConfirmCautela(); }
                      }}
                      placeholder="Local / telefone p/ contato"
                      className="w-full pl-8 pr-2 py-1.5 bg-slate-950/80 border border-slate-700/70 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmCautela}
                    disabled={!cautelaNome.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    Cautelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
