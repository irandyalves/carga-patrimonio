import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCheck, 
  Server, 
  Building2, 
  Trash2, 
  X, 
  ChevronDown, 
  CheckCircle2,
  Laptop
} from 'lucide-react';

export const BulkActionBar = ({
  selectedCount = 0,
  onClearSelection,
  onAssignTi,
  onAssignSector,
  onMarkConferidos,
  onMarkPendentes,
  onDeleteSelected,
  sectors = [],
  tiSectorName = 'TI'
}) => {
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSectorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-40 w-[92vw] max-w-sm sm:max-w-md animate-in slide-in-from-right duration-300">
      <div className="bg-slate-900/98 backdrop-blur-2xl border-2 border-indigo-500/80 shadow-[0_12px_45px_rgba(0,0,0,0.85)] rounded-3xl p-3 sm:p-3.5 flex flex-col gap-2.5 text-white">
        
        {/* Cabeçalho: Contador de Itens Selecionados + Botão Desmarcar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-500/40">
              <CheckCheck className="w-4 h-4 text-white stroke-[3]" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-black text-indigo-200">
                {selectedCount} {selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClearSelection}
            title="Desmarcar todos os itens"
            className="p-1 px-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1 active:scale-95"
          >
            <X className="w-3.5 h-3.5" />
            <span>Desmarcar</span>
          </button>
        </div>

        {/* Linha de Ações Principais */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* BOTÃO PRINCIPAL: ATRIBUIR TI EM 1 CLIQUE */}
          <button
            type="button"
            onClick={onAssignTi}
            title="Mudar setor de todos os itens selecionados para TI com 1 clique"
            className="flex-1 min-w-[130px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer hover:scale-102 active:scale-95 border border-cyan-300/40 group"
          >
            <Laptop className="w-4 h-4 text-cyan-200 group-hover:animate-pulse" />
            <span>Atribuir TI ⚡</span>
          </button>

          {/* DROPDOWN: ATRIBUIR A OUTRO SETOR */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mudar Setor</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSectorDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menu Suspenso de Setores (Abre para cima do painel) */}
            {isSectorDropdownOpen && (
              <div className="absolute right-0 bottom-full mb-2 z-50 w-64 max-h-72 overflow-y-auto bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 scrollbar-thin scrollbar-thumb-slate-700">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800">
                  Transferir para o Setor:
                </div>
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
                      <span className="text-[10px] text-slate-500 group-hover:text-indigo-200">
                        {sec.responsavel}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* BOTÃO: CONFERIR TODOS SELECIONADOS */}
          {onMarkConferidos && (
            <button
              type="button"
              onClick={onMarkConferidos}
              title="Marcar todos os itens selecionados como CONFERIDOS"
              className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/40 transition-all cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Conferir</span>
            </button>
          )}

          {/* BOTÃO: EXCLUIR SELECIONADOS */}
          {onDeleteSelected && (
            <button
              type="button"
              onClick={onDeleteSelected}
              title="Excluir todos os itens selecionados"
              className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/35 text-rose-300 font-bold text-xs flex items-center gap-1.5 border border-rose-500/40 transition-all cursor-pointer active:scale-95"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
