import React from 'react';
import { 
  Laptop, 
  Monitor, 
  Cpu, 
  Printer, 
  Server, 
  CheckCheck, 
  X, 
  Sparkles, 
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

export const TiManagementModal = ({
  isOpen,
  onClose,
  tiAssets = [],
  onSelectAllTi,
  onDirectAssignTi,
  onFilterOnlyTi,
  isFilterOnlyTiActive = false,
  selectedCount = 0
}) => {
  if (!isOpen) return null;

  // Categorização resumida dos itens de TI
  const monitorsCount = tiAssets.filter(a => {
    const text = `${a.descricao || ''} ${a.modelo || ''}`.toLowerCase();
    return text.includes('monitor') || text.includes('display');
  }).length;

  const notebooksCount = tiAssets.filter(a => {
    const text = `${a.descricao || ''} ${a.modelo || ''}`.toLowerCase();
    return text.includes('notebook') || text.includes('laptop') || text.includes('macbook');
  }).length;

  const desktopsCount = tiAssets.filter(a => {
    const text = `${a.descricao || ''} ${a.modelo || ''}`.toLowerCase();
    return text.includes('computador') || text.includes('desktop') || text.includes('cpu');
  }).length;

  const printersCount = tiAssets.filter(a => {
    const text = `${a.descricao || ''} ${a.modelo || ''}`.toLowerCase();
    return text.includes('impressora') || text.includes('scanner') || text.includes('multifuncional');
  }).length;

  const othersCount = Math.max(0, tiAssets.length - (monitorsCount + notebooksCount + desktopsCount + printersCount));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-cyan-500/50 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl shadow-cyan-950/70 relative animate-in zoom-in-95 duration-200 flex flex-col space-y-4">
        
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600/30 to-indigo-600/20 border border-cyan-500/50 text-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-950/50">
              <Laptop className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                <span>Bens de Informática (TI)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 font-black border border-cyan-400/40">
                  {tiAssets.length} {tiAssets.length === 1 ? 'item' : 'itens'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Detecção inteligente de computadores, notebooks, monitores e periféricos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo por Categoria */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center text-center">
            <Monitor className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-medium">Monitores</span>
            <span className="text-sm font-black text-white font-mono">{monitorsCount}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center text-center">
            <Laptop className="w-4 h-4 text-indigo-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-medium">Notebooks</span>
            <span className="text-sm font-black text-white font-mono">{notebooksCount}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center text-center">
            <Cpu className="w-4 h-4 text-purple-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-medium">Desktops/CPUs</span>
            <span className="text-sm font-black text-white font-mono">{desktopsCount}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center text-center">
            <Server className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-medium">Outros / Rede</span>
            <span className="text-sm font-black text-white font-mono">{othersCount + printersCount}</span>
          </div>
        </div>

        {/* Informação Operacional */}
        <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200/90 leading-relaxed flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>
            Ao selecionar os itens, a <strong>barra de ações será exibida à direita da tela</strong> permitindo transferir tudo para TI ou qualquer outro setor com apenas 1 clique.
          </span>
        </div>

        {/* Botões de Ação */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          {/* Botão: Selecionar Todos de TI */}
          <button
            type="button"
            onClick={() => {
              onSelectAllTi();
              onClose();
            }}
            disabled={tiAssets.length === 0}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-600 text-white font-black text-xs shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-95 disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4 text-cyan-200 stroke-[2.5]" />
            <span>Selecionar Todos os {tiAssets.length} Itens de TI ⚡</span>
          </button>

          {/* Botão Opcional: Atribuir Direto para TI */}
          {onDirectAssignTi && (
            <button
              type="button"
              onClick={() => {
                onDirectAssignTi();
                onClose();
              }}
              disabled={tiAssets.length === 0}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Server className="w-4 h-4 text-indigo-400" />
              <span>Mudar Direto para TI</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
