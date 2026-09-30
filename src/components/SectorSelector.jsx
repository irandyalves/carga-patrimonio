import React from 'react';
import { Building2, UserCheck, MapPin, ChevronDown, CheckCircle2 } from 'lucide-react';
import { SECTORS } from '../constants/sectors';

export const SectorSelector = ({
  activeSectorId,
  onSelectSector,
  filterMode, // 'MY_SECTOR' | 'ALL_SECTORS'
  onToggleFilterMode
}) => {
  const currentSector = SECTORS.find(s => s.id === activeSectorId) || SECTORS[0];

  return (
    <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Active Sector Details */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Seção / Setor Atual Selecionado
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                1 de 10 Setores
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {currentSector.name}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                Responsável: <strong className="text-white">{currentSector.responsavel}</strong>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {currentSector.sala}
              </span>
            </div>
          </div>
        </div>

        {/* Sector Switcher Dropdown & View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Sector Select Dropdown */}
          <div className="relative min-w-[220px]">
            <select
              value={activeSectorId}
              onChange={(e) => onSelectSector(e.target.value)}
              className="w-full appearance-none bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-medium rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all"
            >
              {SECTORS.map((sec) => (
                <option key={sec.id} value={sec.id} className="bg-slate-900 text-slate-200">
                  {sec.name} ({sec.responsavel})
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Filter Mode Toggle (Minha Carga vs Todos os Bens) */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => onToggleFilterMode('MY_SECTOR')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'MY_SECTOR'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Minha Carga ({currentSector.responsavel.split(' ')[0]})
            </button>
            <button
              onClick={() => onToggleFilterMode('ALL_SECTORS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'ALL_SECTORS'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos os 10 Setores
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
