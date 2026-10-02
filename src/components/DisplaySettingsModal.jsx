import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Palette, 
  DollarSign, 
  Eye, 
  Check, 
  CheckCircle2, 
  RotateCcw, 
  Save, 
  Building2, 
  Sliders,
  Layers,
  Sparkles,
  CloudUpload
} from 'lucide-react';

export const UNCHECK_COLOR_OPTIONS = [
  { id: 'text-indigo-400', label: 'Índigo', bg: 'bg-indigo-500', hex: '#818cf8' },
  { id: 'text-cyan-400', label: 'Ciano', bg: 'bg-cyan-500', hex: '#22d3ee' },
  { id: 'text-blue-400', label: 'Azul', bg: 'bg-blue-500', hex: '#60a5fa' },
  { id: 'text-amber-400', label: 'Âmbar', bg: 'bg-amber-500', hex: '#fbbf24' },
  { id: 'text-rose-400', label: 'Carmim', bg: 'bg-rose-500', hex: '#fb7185' },
  { id: 'text-purple-400', label: 'Púrpura', bg: 'bg-purple-500', hex: '#c084fc' },
  { id: 'text-slate-100', label: 'Branco', bg: 'bg-slate-100', hex: '#f1f5f9' }
];

export const CHECKED_COLOR_OPTIONS = [
  { id: 'text-emerald-400', label: 'Esmeralda', bg: 'bg-emerald-500', hex: '#34d399' },
  { id: 'text-lime-400', label: 'Lima', bg: 'bg-lime-500', hex: '#a3e635' },
  { id: 'text-cyan-400', label: 'Ciano', bg: 'bg-cyan-500', hex: '#22d3ee' },
  { id: 'text-blue-400', label: 'Azul', bg: 'bg-blue-500', hex: '#60a5fa' },
  { id: 'text-amber-400', label: 'Dourado', bg: 'bg-amber-500', hex: '#fbbf24' },
  { id: 'text-white', label: 'Branco', bg: 'bg-white', hex: '#ffffff' }
];

export const SECTOR_NAME_COLOR_OPTIONS = [
  { id: 'text-amber-400', label: 'Âmbar', bg: 'bg-amber-500', hex: '#fbbf24' },
  { id: 'text-orange-400', label: 'Laranja', bg: 'bg-orange-500', hex: '#fb923c' },
  { id: 'text-cyan-400', label: 'Ciano', bg: 'bg-cyan-500', hex: '#22d3ee' },
  { id: 'text-emerald-400', label: 'Esmeralda', bg: 'bg-emerald-500', hex: '#34d399' },
  { id: 'text-indigo-400', label: 'Índigo', bg: 'bg-indigo-500', hex: '#818cf8' },
  { id: 'text-rose-400', label: 'Rosa', bg: 'bg-rose-500', hex: '#fb7185' },
  { id: 'text-purple-400', label: 'Violeta', bg: 'bg-purple-500', hex: '#c084fc' },
  { id: 'text-slate-300', label: 'Cinza Claro', bg: 'bg-slate-300', hex: '#cbd5e1' }
];

export const DEFAULT_DISPLAY_SETTINGS = {
  showCurrencyPrefix: false,
  uncheckPatrimonioColor: 'text-indigo-400',
  checkedPatrimonioColor: 'text-emerald-400',
  sectorResponsavelColor: 'text-orange-400',
  defaultStatusFilter: 'ALL',
  defaultFilterMode: 'MY_SECTOR'
};

export const DisplaySettingsModal = ({
  isOpen,
  onClose,
  settings = DEFAULT_DISPLAY_SETTINGS,
  onSaveSettings
}) => {
  const [localSettings, setLocalSettings] = useState({
    ...DEFAULT_DISPLAY_SETTINGS,
    ...settings
  });

  React.useEffect(() => {
    if (isOpen) {
      setLocalSettings({
        ...DEFAULT_DISPLAY_SETTINGS,
        ...settings
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelect = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_DISPLAY_SETTINGS);
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl relative max-h-[96vh] flex flex-col justify-between overflow-hidden">
        
        {/* Botão Fechar no Topo */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors z-10 cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-2.5 pb-2.5 mb-2 border-b border-slate-800 pr-10">
          <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">
              Configurações de Exibição & Visual
            </h2>
            <p className="text-[11px] text-slate-400">
              Personalize cores dos patrimônios, valores e filtros padrão
            </p>
          </div>
        </div>

        {/* Corpo com Scroll */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
          
          {/* PREVIEW EM TEMPO REAL */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Pré-visualização em Tempo Real
              </span>
              <span className="text-slate-500 lowercase font-normal">como ficará na tela</span>
            </div>

            <div className="space-y-1.5">
              {/* Item Pendente de Exemplo */}
              <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`font-mono text-sm sm:text-base font-black tracking-tight ${localSettings.uncheckPatrimonioColor}`}>
                    42.542
                  </span>
                  <span className="text-slate-200 text-xs font-semibold truncate">
                    Microcomputador Dell OptiPlex (Pendente)
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-emerald-400 text-xs font-mono">
                    {localSettings.showCurrencyPrefix ? 'R$ 1.605,61' : '1.605,61'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                    Conferir
                  </span>
                </div>
              </div>

              {/* Item Conferido de Exemplo */}
              <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-xl border border-emerald-500/20">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`font-mono text-sm sm:text-base font-black tracking-tight ${localSettings.checkedPatrimonioColor}`}>
                    38.910
                  </span>
                  <span className="text-slate-200 text-xs font-semibold truncate">
                    Mesa de Trabalho em L (Conferido)
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-emerald-400 text-xs font-mono">
                    {localSettings.showCurrencyPrefix ? 'R$ 950,00' : '950,00'}
                  </span>
                  <span className="flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 drop-shadow-[0_0_8px_rgba(74,222,128,0.95)]">
                      <path d="M4.5 12.75L9.5 17.75L19.5 6.75" stroke="#4ade80" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Setor e Nome de Exemplo */}
              <div className="flex items-center gap-2 bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800/80 text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-bold text-slate-200">AUDITÓRIO</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className={`font-semibold ${localSettings.sectorResponsavelColor}`}>
                  João Silva (Responsável)
                </span>
              </div>
            </div>
          </div>

          {/* 1. SEÇÃO MOEDA (HABILITAR O R$) */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Exibir Prefixo Monetário ("R$")</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Quando desativado, exibe apenas os números (ex: <strong>1.605,61</strong> em vez de <strong>R$ 1.605,61</strong>)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('showCurrencyPrefix')}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ml-3 ${
                  localSettings.showCurrencyPrefix ? 'bg-emerald-600' : 'bg-slate-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                  localSettings.showCurrencyPrefix ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* 2. SEÇÃO COR DO PATRIMÔNIO SEM CHECK (PENDENTE) */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3 space-y-2">
            <label className="block text-xs font-bold text-white">
              Cor do Nº de Patrimônio <span className="text-indigo-400 font-normal">(Sem Check / Pendente)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {UNCHECK_COLOR_OPTIONS.map((c) => {
                const isSelected = localSettings.uncheckPatrimonioColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect('uncheckPatrimonioColor', c.id)}
                    className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-500/20 ring-1 ring-indigo-400/50 shadow-sm'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${c.bg} shrink-0`} />
                    <span className={`font-bold ${c.id}`}>{c.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-indigo-400 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. SEÇÃO COR DO PATRIMÔNIO CHECADO (CONFERIDO) */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3 space-y-2">
            <label className="block text-xs font-bold text-white">
              Cor do Nº de Patrimônio <span className="text-emerald-400 font-normal">(Checado / Conferido ✓)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CHECKED_COLOR_OPTIONS.map((c) => {
                const isSelected = localSettings.checkedPatrimonioColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect('checkedPatrimonioColor', c.id)}
                    className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/20 ring-1 ring-emerald-400/50 shadow-sm'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${c.bg} shrink-0`} />
                    <span className={`font-bold ${c.id}`}>{c.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-emerald-400 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. SEÇÃO COR DO NOME À FRENTE DO SETOR */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3 space-y-2">
            <label className="block text-xs font-bold text-white">
              Cor do Nome à Frente do Setor <span className="text-amber-400 font-normal">(Responsável)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SECTOR_NAME_COLOR_OPTIONS.map((c) => {
                const isSelected = localSettings.sectorResponsavelColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect('sectorResponsavelColor', c.id)}
                    className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/20 ring-1 ring-amber-400/50 shadow-sm'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${c.bg} shrink-0`} />
                    <span className={`font-bold ${c.id}`}>{c.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-amber-400 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. SEÇÃO O QUE VEM MOSTRANDO POR PADRÃO */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3 space-y-2">
            <label className="block text-xs font-bold text-white">
              Filtro Padrão ao Abrir o Sistema
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ALL', label: 'Todos os Bens' },
                { id: 'PENDENTES', label: 'Apenas Pendentes' },
                { id: 'CONFERIDOS', label: 'Apenas Conferidos' }
              ].map((opt) => {
                const isSelected = localSettings.defaultStatusFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect('defaultStatusFilter', opt.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Rodapé com Botões Restaurar e Salvar */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleReset}
            title="Restaurar valores padrões de fábrica"
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Padrões</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>Salvar & Sincronizar na Nuvem</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
