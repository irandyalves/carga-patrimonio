import React from 'react';
import { 
  Building2, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Layers,
  Sparkles,
  Coffee,
  Tv,
  Users,
  Server,
  Monitor,
  Flame,
  BookOpen,
  Volume2,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck
} from 'lucide-react';

export const SectorSidebar = ({
  isOpen = true,
  onToggle,
  sectors = [],
  activeSectorId,
  onSelectSector,
  filterMode, // 'MY_SECTOR' | 'ALL_SECTORS'
  onSelectFilterMode,
  assets = [],
  onOpenManageSectors
}) => {
  // Ícones representativos para as abas ativas dos setores
  const getSectorIcon = (secId) => {
    switch (secId) {
      case 'sec-studio': return <Tv className="w-4 h-4 shrink-0" />;
      case 'sec-auditorio': return <Volume2 className="w-4 h-4 shrink-0" />;
      case 'sec-foyer': return <Monitor className="w-4 h-4 shrink-0" />;
      case 'sec-recepcao': return <UserCheck className="w-4 h-4 shrink-0" />;
      case 'sec-lab-inovacao': return <Sparkles className="w-4 h-4 shrink-0" />;
      case 'sec-revista-jmu': return <BookOpen className="w-4 h-4 shrink-0" />;
      case 'sec-sacadi': return <Users className="w-4 h-4 shrink-0" />;
      case 'sec-cadmi': return <Users className="w-4 h-4 shrink-0" />;
      case 'sec-sacadi-cadmi': return <Users className="w-4 h-4 shrink-0" />;
      case 'sec-ti': return <Server className="w-4 h-4 shrink-0" />;
      case 'sec-reunioes': return <Users className="w-4 h-4 shrink-0" />;
      case 'sec-copa-terreo': return <Coffee className="w-4 h-4 shrink-0" />;
      case 'sec-copa-1piso': return <Flame className="w-4 h-4 shrink-0" />;
      default: return <Building2 className="w-4 h-4 shrink-0" />;
    }
  };

  const getSectorStats = (sectorId) => {
    const sectorAssets = assets.filter(a => a.setorId === sectorId);
    const total = sectorAssets.length;
    const conferidos = sectorAssets.filter(a => a.status === 'CONFERIDO').length;
    const isCompleted = total > 0 && conferidos === total;
    return { total, conferidos, isCompleted };
  };

  const totalAssetsCount = assets.length;

  return (
    <>
      {/* Botão Flutuante de Abrir Sidebar quando recolhida */}
      {!isOpen && (
        <button
          onClick={onToggle}
          title="Expandir barra lateral de setores"
          className="fixed left-2 top-20 z-30 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xl shadow-blue-900/40 border border-blue-400/50 transition-all duration-200 cursor-pointer flex items-center gap-1.5 animate-in fade-in"
        >
          <PanelLeftOpen className="w-4 h-4" />
          <span className="text-xs font-bold hidden sm:inline">Setores</span>
        </button>
      )}

      {/* Slide Bar Lateral Esquerdo */}
      <aside className={`shrink-0 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 transition-all duration-300 ease-in-out z-20 flex flex-col ${
        isOpen ? 'w-64 sm:w-72' : 'w-0 -translate-x-full overflow-hidden border-none'
      }`}>
        
        {/* Cabeçalho da Sidebar */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Áreas & Setores
              </h3>
              <p className="text-[10px] text-slate-400">
                {sectors.length} setores cadastrados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Botão Gerenciar Setores (+) */}
            <button
              onClick={onOpenManageSectors}
              title="Adicionar ou Configurar Setores"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Botão Recolher Slide Bar */}
            <button
              onClick={onToggle}
              title="Recolher barra lateral"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lista de Abas com Rolagem Vertical */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Aba: Todas as Áreas */}
          <button
            onClick={() => onSelectFilterMode('ALL_SECTORS')}
            className={`w-full px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
              filterMode === 'ALL_SECTORS'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/40 ring-1 ring-blue-400'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Layers className="w-4 h-4 shrink-0 text-cyan-400" />
              <span className="font-semibold truncate">Todas as Áreas</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/30 font-mono font-bold shrink-0">
              {totalAssetsCount}
            </span>
          </button>

          <div className="pt-2 pb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Setores com Carga
          </div>

          {/* Abas dos Setores */}
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
                className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/40 ring-1 ring-blue-400'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                {/* Nome do Setor:
                    - Inativo: Apenas nome direto (ex: Studio, SACADI)
                    - Ativo: Ícone + Nome - Responsável (ex: [Icon] Studio - Tadeu)
                */}
                <div className="flex items-center gap-2 truncate">
                  {isSelected ? (
                    stats.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    ) : (
                      getSectorIcon(sec.id)
                    )
                  ) : null}

                  <div className="truncate">
                    <span className={isSelected ? 'font-bold' : 'font-medium'}>
                      {sec.name}
                    </span>
                    {isSelected && sec.responsavel && (
                      <span className="opacity-90 font-normal ml-1 text-[11px] block truncate">
                        {sec.responsavel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badge de quantidade e status de conclusão */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {stats.isCompleted && !isSelected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-white/20 text-white font-bold' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {stats.total}
                  </span>
                </div>
              </button>
            );
          })}

        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 shrink-0 bg-slate-950/40">
          <div className="flex items-center justify-between mb-1">
            <span>Conferência Global</span>
            <strong className="text-slate-200">
              {assets.filter(a => a.status === 'CONFERIDO').length}/{totalAssetsCount}
            </strong>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${totalAssetsCount > 0 ? (assets.filter(a => a.status === 'CONFERIDO').length / totalAssetsCount) * 100 : 0}%`
              }}
            />
          </div>
        </div>

      </aside>
    </>
  );
};
