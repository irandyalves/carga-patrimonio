import React, { useRef } from 'react';
import { 
  Building2, 
  UserCheck, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  CheckCircle2, 
  Layers,
  Sparkles
} from 'lucide-react';

export const SectorTabs = ({
  sectors = [],
  activeSectorId,
  onSelectSector,
  filterMode, // 'MY_SECTOR' | 'ALL_SECTORS'
  onSelectFilterMode,
  assets = [],
  onOpenManageSectors
}) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Helper para obter estatísticas rápidas por setor
  const getSectorStats = (sectorId) => {
    const sectorAssets = assets.filter(a => a.setorId === sectorId);
    const total = sectorAssets.length;
    const conferidos = sectorAssets.filter(a => a.status === 'CONFERIDO').length;
    const isCompleted = total > 0 && conferidos === total;
    return { total, conferidos, isCompleted };
  };

  const currentSector = sectors.find(s => s.id === activeSectorId) || sectors[0] || {
    name: 'Setor Geral',
    responsavel: 'Responsável',
    sala: 'Sala 01'
  };

  const totalAssetsCount = assets.length;
  const totalConferidos = assets.filter(a => a.status === 'CONFERIDO').length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl backdrop-blur-md space-y-3">
      
      {/* Top Bar: Título e Botão de Gerenciar Setores */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Áreas & Cargas Patrimoniais
            </span>
            <span className="text-[11px] text-slate-500 ml-2">
              Selecione uma aba para conferência
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Scroll Navigation Buttons */}
          <button
            onClick={() => scroll('left')}
            title="Rolar abas para esquerda"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            title="Rolar abas para direita"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Gerenciar Setores */}
          <button
            onClick={onOpenManageSectors}
            title="Gerenciar Setores e Responsáveis"
            className="ml-1 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Container (Scroll Horizontal) */}
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
      >
        {/* Aba: Todas as Áreas (Consolidado) */}
        <button
          onClick={() => onSelectFilterMode('ALL_SECTORS')}
          className={`shrink-0 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer border ${
            filterMode === 'ALL_SECTORS'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/50 shadow-md shadow-blue-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-700/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span>Todas as Áreas</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
            filterMode === 'ALL_SECTORS' ? 'bg-white/20 text-white font-bold' : 'bg-slate-900 text-slate-400'
          }`}>
            {totalAssetsCount}
          </span>
        </button>

        {/* Abas Individuais dos Setores no formato: "Nome do Setor - Responsável" */}
        {sectors.map((sec) => {
          const stats = getSectorStats(sec.id);
          const isSelected = filterMode === 'MY_SECTOR' && activeSectorId === sec.id;

          return (
            <button
              key={sec.id}
              onClick={() => {
                onSelectFilterMode('MY_SECTOR');
                onSelectSector(sec.id);
              }}
              className={`shrink-0 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer border ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white border-indigo-400/50 shadow-lg shadow-indigo-600/30 font-semibold'
                  : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60 hover:border-slate-600'
              }`}
            >
              {stats.isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              ) : (
                <Building2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`} />
              )}

              {/* Rótulo da Aba: Setor - Responsável */}
              <span className="whitespace-nowrap">
                <strong>{sec.name}</strong>
                <span className={isSelected ? 'text-indigo-100 font-normal ml-1' : 'text-slate-400 font-normal ml-1'}>
                  - {sec.responsavel}
                </span>
              </span>

              {/* Badge de Itens da Aba */}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                isSelected 
                  ? 'bg-white/20 text-white font-bold' 
                  : stats.isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                    : 'bg-slate-900 text-slate-400'
              }`}>
                {stats.conferidos}/{stats.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Details Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-200">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            Aba Ativa: <strong className="text-white">{filterMode === 'ALL_SECTORS' ? 'Todas as Áreas Consolidadas' : currentSector.name}</strong>
          </span>
          {filterMode === 'MY_SECTOR' && (
            <span className="flex items-center gap-1 text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              Carga: <strong className="text-cyan-200">{currentSector.responsavel}</strong>
            </span>
          )}
          {filterMode === 'MY_SECTOR' && currentSector.sala && (
            <span className="hidden sm:flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {currentSector.sala}
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-400">
          Mostrando <strong className="text-white">{filterMode === 'ALL_SECTORS' ? totalAssetsCount : assets.filter(a => a.setorId === activeSectorId).length}</strong> itens desta aba
        </div>
      </div>

    </div>
  );
};
