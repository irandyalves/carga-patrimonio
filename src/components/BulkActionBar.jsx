import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCheck, 
  Building2, 
  X, 
  ChevronDown, 
  Laptop
} from 'lucide-react';

export const BulkActionBar = ({
  selectedCount = 0,
  onClearSelection,
  onAssignTi,
  onAssignSector,
  sectors = []
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
    <div className="flex items-center gap-2 sm:gap-3 p-1.5 px-3 bg-slate-900/98 backdrop-blur-2xl border-2 border-indigo-500/85 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.9)] text-white animate-in zoom-in-95 duration-300">
      
      {/* Contador de Itens Selecionados */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-500/40">
          <CheckCheck className="w-3.5 h-3.5 text-white stroke-[3]" />
        </div>
        <span className="text-xs font-black text-indigo-200 whitespace-nowrap">
          {selectedCount} {selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}
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

      {/* Ações: Atribuir TI e Mudar Setor */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* BOTÃO PRINCIPAL: ATRIBUIR TI EM 1 CLIQUE */}
        <button
          type="button"
          onClick={onAssignTi}
          title="Mudar setor de todos os itens selecionados para TI com 1 clique"
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer hover:scale-102 active:scale-95 border border-cyan-300/40 group whitespace-nowrap"
        >
          <Laptop className="w-3.5 h-3.5 text-cyan-200 group-hover:animate-pulse" />
          <span>Atribuir TI ⚡</span>
        </button>

        {/* DROPDOWN: ATRIBUIR A OUTRO SETOR */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Mudar Setor</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSectorDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu Suspenso de Setores */}
          {isSectorDropdownOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-64 max-h-72 overflow-y-auto bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 scrollbar-thin scrollbar-thumb-slate-700">
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

      </div>

    </div>
  );
};
