import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCheck, 
  Building2, 
  X, 
  ChevronDown
} from 'lucide-react';

export const BulkActionBar = ({
  selectedCount = 0,
  onClearSelection,
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
    <div className="flex items-center gap-2 sm:gap-3 p-1.5 px-3 bg-slate-900/98 backdrop-blur-2xl border-2 border-indigo-500/85 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.9)] text-white">
      
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

      {/* Ação: Mudar Setor do Item */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 border border-indigo-400/40 transition-all cursor-pointer shadow-lg shadow-indigo-600/30 active:scale-95 whitespace-nowrap"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-200" />
            <span>Mudar Setor do Item</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSectorDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu Suspenso de Setores (Limite de 12 itens visíveis antes do scroll) */}
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

    </div>
  );
};
