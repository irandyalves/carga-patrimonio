import React, { useRef } from 'react';
import { 
  Building2, 
  UserCheck, 
  MapPin, 
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
  PenTool,
  BookOpen,
  Volume2
} from 'lucide-react';

export const SectorTabs = ({
  sectors = [],
  activeSectorId,
  onSelectSector,
  filterMode, // 'MY_SECTOR' | 'ALL_SECTORS'
  onSelectFilterMode,
  assets = [],
  onOpenManageSectors,
  onOpenNewAsset
}) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Ícones representativos para as abas ativas dos setores
  const getSectorIcon = (secId) => {
    switch (secId) {
      case 'sec-studio': return <Tv className="w-3.5 h-3.5 shrink-0" />;
      case 'sec-auditorio': return <Volume2 className="w-3.5 h-3.5 shrink-0" />;
      case 'sec-foyer': return <Monitor className="w-3.5 h-3.5 shrink-0" />;
      case 'sec-recepcao': return <UserCheck className="w-3.5 h-3.5 shrink-0" />;
      case 'sec-lab-inovacao': return <Sparkles className="w-3.5 h-3.5 shrink-0" />;
      case 'sec-revista-jmu': return <BookOpen className="w-3.5 h-3.5 shrink-0" />;
      case 'sec-sacadi': return <Users className="w-3.5 h-3.5 shrink-0" />;
      case 'sec-cadmi': return <Users className="w-3.5 h-3.5 shrink-0" />;
      case 'sec-sacadi-cadmi': return <Users className="w-3.5 h-3.5 shrink-0" />;
      case 'sec-ti': return <Server className="w-3.5 h-3.5 shrink-0" />;
      case 'sec-reunioes': return <Users className="w-3.5 h-3.5 shrink-0" />;
      case 'sec-copa-terreo': return <Coffee className="w-3.5 h-3.5 shrink-0" />;
      case 'sec-copa-1piso': return <Flame className="w-3.5 h-3.5 shrink-0" />;
      default: return <Building2 className="w-3.5 h-3.5 shrink-0" />;
    }
  };

  // Cores de abas
  const getTabColor = (index, isSelected) => {
    if (isSelected) {
      return 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/40 border-b-2 border-white ring-1 ring-blue-400';
    }
    const palettes = [
      'bg-[#2d225a] hover:bg-[#392c73] text-indigo-100 border-[#47368f]',
      'bg-[#1e2a5e] hover:bg-[#27377a] text-blue-100 border-[#324599]',
      'bg-[#3b1d5c] hover:bg-[#4d2578] text-purple-100 border-[#5e2e94]',
      'bg-[#19324d] hover:bg-[#204266] text-cyan-100 border-[#2b598a]',
      'bg-[#26245c] hover:bg-[#34317d] text-indigo-100 border-[#433ea1]',
    ];
    return `${palettes[index % palettes.length]} border-t border-x`;
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
    <div className="w-full space-y-2">
      
      {/* 1. BARRA SUPERIOR DE ABAS (SEM BORDA EXTERNA) */}
      <div className="relative flex items-center bg-slate-950/80 p-1.5 rounded-2xl shadow-md">
        
        {/* Botão de Scroll Esquerda */}
        <button
          onClick={() => scroll('left')}
          title="Rolar abas para a esquerda"
          className="shrink-0 p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer mr-1 z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Abas com rolagem horizontal contínua */}
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none scroll-smooth flex-1"
        >
          
          {/* Aba: TODOS */}
          <button
            onClick={() => onSelectFilterMode('ALL_SECTORS')}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all duration-150 ${
              filterMode === 'ALL_SECTORS'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/40 ring-1 ring-blue-400'
                : 'bg-[#1b233d] hover:bg-[#242f52] text-slate-200 border border-slate-700/60'
            }`}
          >
            {filterMode === 'ALL_SECTORS' && <Layers className="w-3.5 h-3.5" />}
            <span className="font-semibold whitespace-nowrap uppercase tracking-wide">TODOS</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-mono font-bold">
              {totalAssetsCount}
            </span>
          </button>

          {/* Abas dos Setores:
              - Inativa: Apenas o NOME DIRETO do setor (ex: Studio, Auditório, SACADI)
              - Ativa: Ícone + Nome do Setor - Responsável (ex: [Icon] Studio - Tadeu)
          */}
          {sectors.map((sec, idx) => {
            const stats = getSectorStats(sec.id);
            const isSelected = filterMode === 'MY_SECTOR' && activeSectorId === sec.id;
            const colorClass = getTabColor(idx, isSelected);

            return (
              <button
                key={sec.id}
                onClick={() => {
                  onSelectFilterMode('MY_SECTOR');
                  onSelectSector(sec.id);
                }}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all duration-150 ${colorClass}`}
              >
                {/* Quando selecionado: exibe ícone (ou check se 100% conferido) */}
                {isSelected && (
                  stats.isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  ) : (
                    getSectorIcon(sec.id)
                  )
                )}

                {/* Texto da Aba:
                    - Inativo: nome direto do setor
                    - Ativo: Nome do Setor - Responsável
                */}
                <span className="whitespace-nowrap tracking-wide">
                  <strong className={isSelected ? 'font-bold' : 'font-medium'}>{sec.name}</strong>
                  {isSelected && sec.responsavel && (
                    <span className="opacity-90 font-normal ml-1.5">
                      - {sec.responsavel}
                    </span>
                  )}
                </span>

                {/* Contador de itens */}
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black' : 'bg-black/30 text-white/90'
                }`}>
                  {stats.total}
                </span>
              </button>
            );
          })}

          {/* Botão de Adicionar / Gerenciar Setor (+) estilo Print 2 */}
          <button
            onClick={onOpenManageSectors}
            title="Adicionar ou Configurar Setores"
            className="shrink-0 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
          </button>

        </div>

        {/* Botão de Scroll Direita */}
        <button
          onClick={() => scroll('right')}
          title="Rolar abas para a direita"
          className="shrink-0 p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1 z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
