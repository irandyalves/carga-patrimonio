import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  CheckCheck, 
  Building2, 
  Users,
  User,
  X, 
  ChevronDown,
  Search
} from 'lucide-react';

export const BulkActionBar = ({
  selectedCount = 0,
  onClearSelection,
  onAssignSector,
  sectors = [],
  servidores = [],
  onAssignServidor
}) => {
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const [isServidorDropdownOpen, setIsServidorDropdownOpen] = useState(false);
  const [servidorSearch, setServidorSearch] = useState('');
  const sectorDropdownRef = useRef(null);
  const servidorDropdownRef = useRef(null);
  const servidorSearchInputRef = useRef(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(event.target)) {
        setIsSectorDropdownOpen(false);
      }
      if (servidorDropdownRef.current && !servidorDropdownRef.current.contains(event.target)) {
        setIsServidorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const effectiveCount = selectedCount || 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3 p-1.5 px-3 bg-slate-900/98 backdrop-blur-2xl border-2 border-indigo-500/85 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.9)] text-white">
      
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
                        if (e.key === 'Enter' && filteredServidores.length === 1) {
                          e.preventDefault();
                          setIsServidorDropdownOpen(false);
                          onAssignServidor(filteredServidores[0]);
                        }
                      }}
                      placeholder="Digite o nome do servidor..."
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
                  {/* Opção para desvincular */}
                  {(!servidorSearch || normalizeText('desvincular uso geral').includes(normalizeText(servidorSearch))) && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsServidorDropdownOpen(false);
                        onAssignServidor(null);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer group"
                    >
                      <span className="font-semibold italic">Desvincular servidor (Uso Geral)</span>
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

    </div>
  );
};
