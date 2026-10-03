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
  FileText,
  Eraser,
  UploadCloud,
  Sliders,
  Settings,
  RotateCcw,
  CheckCheck,
  Copy,
  AlertTriangle
} from 'lucide-react';

export const SectorSidebar = ({
  isOpen = true,
  onToggle,
  sectors = [],
  activeSectorId,
  onSelectSector,
  filterMode, // 'MY_SECTOR' | 'ALL_SECTORS' | 'DUPLICATES'
  onSelectFilterMode,
  assets = [],
  duplicateCount = 0,
  onOpenManageSectors,
  userRole = 'admin',
  userSectorId = null,
  userSectorIds = [],
  statusFilter = 'ALL',
  onSelectStatusFilter = () => {},
  onExportReportPDF = () => {},
  onClearSectorAssets,
  onOpenImport,
  displaySettings,
  onOpenDisplaySettings,
  onOpenBatchStatusChange
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
  const conferidosCount = useMemo(() => assets.filter(a => a.status === 'CONFERIDO').length, [assets]);
  const generalPct = totalAssetsCount > 0
    ? Math.round((conferidosCount / totalAssetsCount) * 100)
    : 0;
  const activeSector = sectors.find(s => s.id === activeSectorId) || sectors[0];
  const activeSectorStats = activeSector ? getSectorStats(activeSector.id) : null;
  const sectorPct = activeSectorStats && activeSectorStats.total > 0
    ? Math.round((activeSectorStats.conferidos / (activeSectorStats.total - activeSectorStats.baixados || 1)) * 100)
    : 0;

  // Helper para gerar o gradiente de vermelho (distintos) até verde (verde iniciando em 80%)
  const getProgressBarGradient = (pct, variant = 'sector') => {
    // Setor: Vermelho Coral (#f43f5e) -> Âmbar (#f59e0b) -> Verde Esmeralda (#10b981) a partir de 80%
    // Geral: Vermelho Escuro Intenso (#881337) -> Dourado (#eab308) -> Verde Neon (#22c55e) a partir de 80%
    const startRed = variant === 'sector' ? '#f43f5e' : '#881337';
    const midColor = variant === 'sector' ? '#f59e0b' : '#eab308';
    const endGreen = variant === 'sector' ? '#10b981' : '#22c55e';
    const safePct = Math.min(100, Math.max(0, pct || 0));
    const bgSize = safePct > 0 ? `${(100 / safePct) * 100}% 100%` : '100% 100%';
    const glowColor = safePct >= 80 ? 'rgba(34, 197, 94, 0.45)' : safePct >= 50 ? 'rgba(245, 158, 11, 0.35)' : 'rgba(239, 68, 68, 0.35)';

    return {
      background: `linear-gradient(90deg, ${startRed} 0%, ${midColor} 50%, ${endGreen} 80%, ${endGreen} 100%)`,
      backgroundSize: bgSize,
      backgroundPosition: 'left center',
      backgroundRepeat: 'no-repeat',
      width: `${safePct}%`,
      boxShadow: safePct > 0 ? `0 0 8px ${glowColor}` : 'none'
    };
  };

  const getProgressTextColor = (pct, variant = 'sector') => {
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 50) return 'text-amber-400';
    return variant === 'sector' ? 'text-rose-400' : 'text-red-400';
  };

  // Setores ordenados em ordem alfabética (A-Z)
  const sortedSectors = useMemo(() => {
    return [...sectors].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
  }, [sectors]);

  return (
    <>
      {/* Backdrop Overlay para Mobile */}
      {isOpen && (
        <div 
          onClick={onToggle}
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Slide Bar Lateral Esquerdo */}
      <aside className={`fixed inset-y-0 left-0 z-40 lg:static lg:z-20 shrink-0 bg-slate-900/98 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col h-full select-none ${
        isOpen ? 'w-72 shadow-2xl lg:shadow-none' : 'w-0 -translate-x-full overflow-hidden border-none'
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
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Botão Configurações Visuais: Engrenagem com bolinha do centro vermelha */}
            {onOpenDisplaySettings && (
              <button
                type="button"
                onClick={onOpenDisplaySettings}
                title="Configurações Visuais: Habilitar R$, cores de patrimônio e nomes"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center group active:scale-95"
              >
                <div className="relative flex items-center justify-center">
                  <Settings className="w-4 h-4 text-slate-300 group-hover:text-white transition-transform duration-300 group-hover:rotate-45" />
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,1)] pointer-events-none" />
                </div>
              </button>
            )}

            {/* Botão Gerenciar Setores (+) Verde e Brilhoso (Reduzido em 20%) */}
            {userRole === 'admin' && (
              <button
                onClick={onOpenManageSectors}
                title="Adicionar ou Configurar Setores"
                className="w-6 h-6 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.7)] hover:shadow-[0_0_16px_rgba(16,185,129,0.9)] transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center border border-emerald-300/40"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
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
          
          {/* Aba: TODOS (Visão Geral de Todas as Áreas) */}
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
                <span className="font-semibold truncate uppercase tracking-wide">TODOS</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                filterMode === 'ALL_SECTORS'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-black/30 text-slate-300'
              }`}>
                {totalAssetsCount}
              </span>
            </button>

            {/* Sub-opções indentadas quando TODOS está selecionado (Animação Cortina 400ms) */}
            <div className={`curtain-menu ${filterMode === 'ALL_SECTORS' ? 'is-open' : ''}`}>
              <div className="curtain-content">
                <div className="ml-3 pl-2.5 my-1 border-l-2 border-indigo-500/50 space-y-0.5">
                  {[
                    { id: 'PENDENTES', label: 'Pendentes', count: assets.filter(a => a.status === 'PENDENTE').length, color: 'text-amber-400', dot: 'bg-amber-400' },
                    { id: 'CONFERIDOS', label: 'Conferidos', count: assets.filter(a => a.status === 'CONFERIDO').length, color: 'text-emerald-400', dot: 'bg-emerald-400' },
                    { id: 'CAUTELAS', label: 'Em Cautela', count: assets.filter(a => a.status === 'EM_CAUTELA' || a.cautelaAtual).length, color: 'text-blue-400', dot: 'bg-blue-400' },
                    { id: 'BAIXADOS', label: 'Baixados', count: assets.filter(a => a.status === 'BAIXADO' || a.baixado).length, color: 'text-rose-400', dot: 'bg-rose-400' },
                  ].filter(tab => tab.count > 0).map(tab => {
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
                  {userRole === 'admin' && onExportReportPDF && (
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

          {/* Aba Especial: Patrimônio Duplicado - Aparece de forma inteligente APENAS se houver casos a analisar */}
          {duplicateCount > 0 && (
            <div className="pt-0.5 animate-in fade-in duration-200">
              <button
                onClick={() => {
                  onSelectFilterMode('DUPLICATES');
                  onSelectStatusFilter('ALL');
                }}
                className={`w-full px-3 py-2 text-xs flex items-center justify-between gap-2 transition-all cursor-pointer rounded-xl ${
                  filterMode === 'DUPLICATES'
                    ? 'bg-gradient-to-r from-amber-600/40 via-amber-600/15 to-transparent text-white font-bold border-l-4 border-l-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold border-l-4 border-l-amber-500/60'
                }`}
                title={`${duplicateCount} bens com número de patrimônio duplicado detectados para análise`}
              >
                <div className="flex items-center gap-2 truncate">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
                  <span className="truncate font-semibold">Patrimônio Duplicado</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 bg-amber-500/25 text-amber-300 border border-amber-400/40 shadow-sm animate-pulse">
                  {duplicateCount}
                </span>
              </button>
            </div>
          )}

          {/* Abas dos Setores com Sub-Opções de Status Indentadas */}
          {sortedSectors.map((sec) => {
            const stats = getSectorStats(sec.id);
            const isSelected = filterMode === 'MY_SECTOR' && activeSectorId === sec.id;
            const isMySector = userRole === 'operador' && (
              (userSectorIds && userSectorIds.length > 0)
                ? userSectorIds.includes(sec.id)
                : (userSectorId === sec.id)
            );
            const isOtherSector = userRole === 'operador' && !isMySector;
            const canManageSector = userRole === 'admin' || isMySector;

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

                    <div className="truncate min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={isSelected ? 'font-bold text-white' : 'font-medium'}>
                          {sec.name}
                        </span>
                        {sec.responsavel && (
                          <span className={`flex items-center gap-1.5 ${displaySettings?.sectorResponsavelColor || 'text-orange-400'} font-semibold text-[11px] truncate shrink-0`}>
                            <span className="w-1 h-1 rounded-full bg-slate-500 shrink-0" />
                            <span>{sec.responsavel}</span>
                          </span>
                        )}
                        {isOtherSector && (
                          <span className="text-slate-500 shrink-0" title="Outro departamento (Apenas consulta)">
                            <Lock className="w-3 h-3 inline" />
                          </span>
                        )}
                      </div>
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
                      ].filter(tab => tab.count > 0).map(tab => {
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
                      {canManageSector && onExportReportPDF && (
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

                      {/* Botão Importar diretamente para este Setor */}
                      {canManageSector && onOpenImport && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenImport(sec.id);
                          }}
                          title={`Importar carga de bens (Excel, Word, CSV, TXT) diretamente para o setor ${sec.name}`}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30 transition-colors cursor-pointer text-left group border border-transparent hover:border-emerald-500/20"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <UploadCloud className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0" />
                            <span className="truncate">Importar</span>
                          </div>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold shrink-0">Carga</span>
                        </button>
                      )}

                      {/* Menu de Enviados para a DTIN: Oculta se tiver 0 */}
                      {(() => {
                        const isTiSector = sec.id === 'sec-ti' || (sec.name || '').toUpperCase().trim() === 'TI' || (sec.name || '').toLowerCase().includes('tecnologia');
                        const dtinCount = isTiSector
                          ? assets.filter(a => a.status === 'ENVIADO_DTIN' || a.enviadoDtin).length
                          : assets.filter(a => a.setorId === sec.id && (a.status === 'ENVIADO_DTIN' || a.enviadoDtin)).length;

                        if (dtinCount === 0) return null;

                        return (
                          <button
                            type="button"
                            onClick={() => onSelectStatusFilter('ENVIADOS_DTIN')}
                            title="Filtrar equipamentos enviados para a DTIN"
                            className={`w-full mt-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between transition-all cursor-pointer text-left group ${
                              statusFilter === 'ENVIADOS_DTIN'
                                ? 'bg-gradient-to-r from-cyan-600/40 via-cyan-600/15 to-transparent text-white font-bold border-l-[3px] border-l-cyan-400 shadow-sm'
                                : 'text-cyan-400 hover:text-cyan-200 hover:bg-slate-800/70 border-l-[3px] border-l-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <Server className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 shrink-0" />
                              <span className="truncate">Enviados para a DTIN</span>
                            </div>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono shrink-0 ${
                              statusFilter === 'ENVIADOS_DTIN'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                                : 'bg-slate-800/80 text-cyan-400'
                            }`}>
                              {dtinCount}
                            </span>
                          </button>
                        );
                      })()}

                      {/* Botão Limpar Dados do Setor: Oculta se tiver 0 | Ícone Borracha Vermelhinha */}
                      {(() => {
                        const sectorAssetsCount = assets.filter(a => a.setorId === sec.id).length;
                        if (!canManageSector || !onClearSectorAssets || sectorAssetsCount === 0) return null;

                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClearSectorAssets(sec.id);
                            }}
                            title={`Limpar todos os bens vinculados ao setor ${sec.name}`}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer text-left group border border-transparent hover:border-rose-500/20"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <Eraser className="w-3.5 h-3.5 text-rose-400 group-hover:text-rose-300 shrink-0" />
                              <span className="truncate">Limpar Dados do Setor</span>
                            </div>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800/80 text-slate-400 group-hover:text-rose-300 font-bold shrink-0">
                              {sectorAssetsCount}
                            </span>
                          </button>
                        );
                      })()}

                      {/* Ações em Lote para este Setor: Só exibe se houver itens para alterar */}
                      {(() => {
                        if (!canManageSector || !onOpenBatchStatusChange) return null;
                        const conferidosCount = assets.filter(a => a.setorId === sec.id && a.status === 'CONFERIDO').length;
                        const pendentesCount = assets.filter(a => a.setorId === sec.id && a.status !== 'CONFERIDO' && a.status !== 'BAIXADO').length;

                        if (conferidosCount === 0 && pendentesCount === 0) return null;

                        return (
                          <div className="pt-1 mt-1 border-t border-slate-800/80 space-y-0.5">
                            {conferidosCount > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenBatchStatusChange({ 
                                    targetType: 'SECTOR', 
                                    sectorId: sec.id, 
                                    sectorName: sec.name, 
                                    newStatus: 'PENDENTE' 
                                  });
                                }}
                                title={`Tornar todos os bens do setor ${sec.name} como PENDENTES`}
                                className="w-full px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between text-amber-400 hover:text-amber-200 hover:bg-amber-950/30 transition-colors cursor-pointer text-left group border border-transparent hover:border-amber-500/20"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <RotateCcw className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300 shrink-0" />
                                  <span className="truncate font-semibold">Tornar TUDO pendente</span>
                                </div>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold shrink-0">
                                  {conferidosCount}
                                </span>
                              </button>
                            )}

                            {pendentesCount > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenBatchStatusChange({ 
                                    targetType: 'SECTOR', 
                                    sectorId: sec.id, 
                                    sectorName: sec.name, 
                                    newStatus: 'CONFERIDO' 
                                  });
                                }}
                                title={`Tornar todos os bens do setor ${sec.name} como CONFERIDOS`}
                                className="w-full px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/30 transition-colors cursor-pointer text-left group border border-transparent hover:border-emerald-500/20"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300 shrink-0" />
                                  <span className="truncate font-semibold">Tornar TUDO conferido</span>
                                </div>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold shrink-0">
                                  {pendentesCount}
                                </span>
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        </div>

        {/* Rodapé da Sidebar - Seção Exclusiva das Barras de Progresso */}
        <div className="shrink-0 sticky bottom-0 z-20 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-3 text-[11px] text-slate-400 space-y-3 shadow-2xl">
          
          {/* Barra de Progresso do Setor Ativo (oculta em TODOS e Duplicados) */}
          {filterMode === 'MY_SECTOR' && activeSector && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <span className="truncate text-slate-300 font-medium">
                    {activeSector.name}
                  </span>
                  <span className="shrink-0 font-mono text-[10.5px] text-slate-400">
                    {activeSectorStats?.conferidos || 0}/<strong className="text-white font-black">{activeSectorStats?.total || 0}</strong>
                  </span>
                </div>
                <span className={`shrink-0 font-mono text-[10.5px] font-bold ${getProgressTextColor(sectorPct, 'sector')}`}>
                  {sectorPct}%
                </span>
              </div>
              <div className="w-full bg-slate-800/90 rounded-full h-[9px] overflow-hidden shadow-inner">
                <div 
                  className="h-full rounded-full transition-all duration-500 relative"
                  style={getProgressBarGradient(sectorPct, 'sector')}
                >
                  {sectorPct > 0 && sectorPct < 100 && (
                    <span className="absolute right-0 top-0 bottom-0 w-[2px] bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,1)] pointer-events-none" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Barra de Conferência Geral */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <span className="truncate text-slate-300 font-medium">Conferência Geral</span>
                <span className="shrink-0 font-mono text-[10.5px] text-slate-400">
                  {conferidosCount}/<strong className="text-white font-black">{totalAssetsCount}</strong>
                </span>
              </div>
              <span className={`shrink-0 font-mono text-[10.5px] font-bold ${getProgressTextColor(generalPct, 'general')}`}>
                {generalPct}%
              </span>
            </div>
            <div className="w-full bg-slate-800/90 rounded-full h-1.5 overflow-hidden shadow-inner">
              <div 
                className="h-full rounded-full transition-all duration-500 relative"
                style={getProgressBarGradient(generalPct, 'general')}
              >
                {generalPct > 0 && generalPct < 100 && (
                  <span className="absolute right-0 top-0 bottom-0 w-[2px] bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,1)] pointer-events-none" />
                )}
              </div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
