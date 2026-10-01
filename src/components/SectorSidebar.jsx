import React, { useMemo } from 'react';
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
  ShieldCheck,
  Lock,
  FileText
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
  onOpenManageSectors,
  userRole = 'admin',
  userSectorId = null,
  statusFilter = 'ALL',
  onSelectStatusFilter = () => {},
  onExportReportPDF = () => {}
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
    const pendentes = sectorAssets.filter(a => a.status === 'PENDENTE').length;
    const cautelas = sectorAssets.filter(a => a.status === 'EM_CAUTELA' || a.cautelaAtual).length;
    const baixados = sectorAssets.filter(a => a.status === 'BAIXADO' || a.baixado).length;
    const isCompleted = total > 0 && conferidos === total;
    return { total, conferidos, pendentes, cautelas, baixados, isCompleted };
  };

  const totalAssetsCount = assets.length;
  const activeSector = sectors.find(s => s.id === activeSectorId) || sectors[0];
  const activeSectorStats = activeSector ? getSectorStats(activeSector.id) : null;
  const sectorPct = activeSectorStats && activeSectorStats.total > 0
    ? Math.round((activeSectorStats.conferidos / (activeSectorStats.total - activeSectorStats.baixados || 1)) * 100)
    : 0;

  // Setores ordenados em ordem alfabética (A-Z)
  const sortedSectors = useMemo(() => {
    return [...sectors].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
  }, [sectors]);

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
      <aside className={`shrink-0 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 transition-all duration-300 ease-in-out z-20 flex flex-col h-full select-none ${
        isOpen ? 'w-64 sm:w-72' : 'w-0 -translate-x-full overflow-hidden border-none'
      }`}>
        
        {/* Cabeçalho da Sidebar */}
        <div className="h-[58px] px-3.5 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
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
            {/* Botão Gerenciar Setores (+) visível apenas para admin */}
            {userRole === 'admin' && (
              <button
                onClick={onOpenManageSectors}
                title="Adicionar ou Configurar Setores"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}

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
        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Aba: Todas as Áreas */}
          <div className="space-y-0.5">
            <button
              onClick={() => {
                onSelectFilterMode('ALL_SECTORS');
                onSelectStatusFilter('ALL');
              }}
              className={`w-full px-3 py-2.5 text-xs flex items-center justify-between gap-2 transition-all cursor-pointer rounded-xl ${
                filterMode === 'ALL_SECTORS'
                  ? 'bg-gradient-to-r from-blue-600/40 via-blue-600/15 to-transparent text-white font-bold border-l-4 border-l-blue-400 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Layers className="w-4 h-4 shrink-0 text-cyan-400" />
                <span className="font-semibold truncate">Todas as Áreas</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                filterMode === 'ALL_SECTORS'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-black/30 text-slate-300'
              }`}>
                {totalAssetsCount}
              </span>
            </button>

            {/* Sub-opções indentadas quando Todas as Áreas está selecionado (Animação Cortina 400ms) */}
            <div className={`curtain-menu ${filterMode === 'ALL_SECTORS' ? 'is-open' : ''}`}>
              <div className="curtain-content">
                <div className="ml-3 pl-2.5 my-1 border-l-2 border-indigo-500/50 space-y-0.5">
                  {[
                    { id: 'PENDENTES', label: 'Pendentes', count: assets.filter(a => a.status === 'PENDENTE').length, color: 'text-amber-400', dot: 'bg-amber-400' },
                    { id: 'CONFERIDOS', label: 'Conferidos', count: assets.filter(a => a.status === 'CONFERIDO').length, color: 'text-emerald-400', dot: 'bg-emerald-400' },
                    { id: 'CAUTELAS', label: 'Em Cautela', count: assets.filter(a => a.status === 'EM_CAUTELA' || a.cautelaAtual).length, color: 'text-blue-400', dot: 'bg-blue-400' },
                    { id: 'BAIXADOS', label: 'Baixados', count: assets.filter(a => a.status === 'BAIXADO' || a.baixado).length, color: 'text-rose-400', dot: 'bg-rose-400' },
                  ].map(tab => {
                    const isSubActive = statusFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => onSelectStatusFilter(tab.id)}
                        className={`w-full px-2.5 py-1.5 text-[11px] font-medium flex items-center justify-between transition-all cursor-pointer text-left rounded-lg ${
                          isSubActive
                            ? 'bg-gradient-to-r from-indigo-600/40 via-indigo-600/15 to-transparent text-white font-bold border-l-[3px] border-l-indigo-400 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border-l-[3px] border-l-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot} shrink-0`} />}
                          <span className="truncate">{tab.label}</span>
                        </div>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono shrink-0 ${
                          isSubActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'bg-slate-800/80 text-slate-400'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}

                  {/* Botão Emitir Relatório logo abaixo de Baixados */}
                  {onExportReportPDF && (
                    <button
                      type="button"
                      onClick={onExportReportPDF}
                      title="Emitir Relatório Geral de Inventário em PDF"
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition-colors cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 shrink-0" />
                        <span className="truncate">Emitir Relatório</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800/80 text-slate-400 group-hover:text-slate-300 font-bold shrink-0">PDF</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Abas dos Setores com Sub-Opções de Status Indentadas */}
          {sortedSectors.map((sec) => {
            const stats = getSectorStats(sec.id);
            const isSelected = filterMode === 'MY_SECTOR' && activeSectorId === sec.id;
            const isMySector = userRole === 'operador' && userSectorId === sec.id;
            const isOtherSector = userRole === 'operador' && userSectorId && userSectorId !== sec.id;

            return (
              <div key={sec.id} className="space-y-0.5">
                <button
                  onClick={() => {
                    onSelectFilterMode('MY_SECTOR');
                    onSelectSector(sec.id);
                    onSelectStatusFilter('ALL');
                  }}
                  className={`w-full px-3 py-2 text-xs flex items-center justify-between gap-2 transition-all cursor-pointer text-left rounded-xl ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600/40 via-blue-600/15 to-transparent text-white font-bold border-l-4 border-l-blue-400 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Nome do Setor */}
                  <div className="flex items-center gap-2 truncate">
                    {isSelected ? (
                      stats.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                      ) : (
                        getSectorIcon(sec.id)
                      )
                    ) : null}

                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className={isSelected ? 'font-bold' : 'font-medium'}>
                          {sec.name}
                        </span>
                        {isMySector && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/40 shrink-0">
                            Meu Setor
                          </span>
                        )}
                        {isOtherSector && (
                          <span className="text-slate-500 shrink-0" title="Outro departamento (Apenas consulta)">
                            <Lock className="w-3 h-3 inline" />
                          </span>
                        )}
                      </div>
                      {isSelected && sec.responsavel && (
                        <span className="text-orange-400 font-semibold text-[11px] block truncate mt-0.5">
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
                      isSelected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {stats.total}
                    </span>
                  </div>
                </button>

                {/* Sub-opções de status indentadas abaixo do setor clicado (Animação Cortina 400ms) */}
                <div className={`curtain-menu ${isSelected ? 'is-open' : ''}`}>
                  <div className="curtain-content">
                    <div className="ml-3 pl-2.5 my-1 border-l-2 border-indigo-500/50 space-y-0.5">
                      {[
                        { id: 'PENDENTES', label: 'Pendentes', count: stats.pendentes, color: 'text-amber-400', dot: 'bg-amber-400' },
                        { id: 'CONFERIDOS', label: 'Conferidos', count: stats.conferidos, color: 'text-emerald-400', dot: 'bg-emerald-400' },
                        { id: 'CAUTELAS', label: 'Em Cautela', count: stats.cautelas, color: 'text-blue-400', dot: 'bg-blue-400' },
                        { id: 'BAIXADOS', label: 'Baixados', count: stats.baixados, color: 'text-rose-400', dot: 'bg-rose-400' },
                      ].map(tab => {
                        const isSubActive = statusFilter === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => onSelectStatusFilter(tab.id)}
                            className={`w-full px-2.5 py-1.5 text-[11px] font-medium flex items-center justify-between transition-all cursor-pointer text-left rounded-lg ${
                              isSubActive
                                ? 'bg-gradient-to-r from-indigo-600/40 via-indigo-600/15 to-transparent text-white font-bold border-l-[3px] border-l-indigo-400 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border-l-[3px] border-l-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot} shrink-0`} />}
                              <span className="truncate">{tab.label}</span>
                            </div>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono shrink-0 ${
                              isSubActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'bg-slate-800/80 text-slate-400'
                            }`}>
                              {tab.count}
                            </span>
                          </button>
                        );
                      })}

                      {/* Botão Emitir Relatório logo abaixo de Baixados */}
                      {onExportReportPDF && (
                        <button
                          type="button"
                          onClick={onExportReportPDF}
                          title={`Emitir Relatório de Inventário do setor ${sec.name} em PDF`}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition-colors cursor-pointer text-left group"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 shrink-0" />
                            <span className="truncate">Emitir Relatório</span>
                          </div>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800/80 text-slate-400 group-hover:text-slate-300 font-bold shrink-0">PDF</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        </div>

        {/* Rodapé da Sidebar - Fixado no Rodapé Esquerdo */}
        <div className="shrink-0 sticky bottom-0 z-20 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-3 text-[11px] text-slate-400 space-y-2.5 shadow-2xl">
          {/* Barra de Progresso do Setor Ativo (oculta quando TODAS AS ÁREAS está selecionado) */}
          {filterMode !== 'ALL_SECTORS' && activeSector && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="truncate pr-1 text-slate-300 font-medium">
                  {activeSector.name}
                </span>
                <span className="shrink-0 font-mono text-[10px] font-bold text-blue-400">
                  <strong className="text-white">{activeSectorStats?.conferidos || 0}</strong>/{activeSectorStats?.total || 0} ({sectorPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300 shadow-sm shadow-blue-500/30"
                  style={{
                    width: `${Math.min(100, sectorPct)}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Barra de Conferência Geral */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-300 font-medium">Conferência Geral</span>
              <span className="shrink-0 font-mono text-[10px] font-bold text-emerald-400">
                <strong className="text-white">{assets.filter(a => a.status === 'CONFERIDO').length}</strong>/{totalAssetsCount} ({totalAssetsCount > 0 ? Math.round((assets.filter(a => a.status === 'CONFERIDO').length / totalAssetsCount) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-300 shadow-sm shadow-emerald-500/30"
                style={{
                  width: `${totalAssetsCount > 0 ? (assets.filter(a => a.status === 'CONFERIDO').length / totalAssetsCount) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
