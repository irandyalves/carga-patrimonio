import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Handshake, 
  Archive, 
  FileText
} from 'lucide-react';

export const ConferenceStats = ({
  stats = {},
  activeSector,
  onExportReportPDF
}) => {
  const safeStats = {
    pctConferido: stats?.pctConferido || 0,
    conferidos: stats?.conferidos || 0,
    total: stats?.total || 0,
    pendentes: stats?.pendentes || 0,
    cautelas: stats?.cautelas || 0,
    baixados: stats?.baixados || 0
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Progress Bar & Percentage */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">
                Progresso da Conferência de Carga
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {safeStats.pctConferido}% Concluído
              </span>
            </div>
            <span className="text-xs text-slate-400">
              <strong className="text-white">{safeStats.conferidos}</strong> de <strong className="text-white">{safeStats.total}</strong> itens conferidos
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 flex">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${safeStats.pctConferido}%` }}
            />
          </div>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/70 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Conferidos</div>
              <div className="text-sm font-bold text-white">{safeStats.conferidos}</div>
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/70 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Pendentes</div>
              <div className="text-sm font-bold text-white">{safeStats.pendentes}</div>
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/70 flex items-center gap-2">
            <Handshake className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Em Cautela</div>
              <div className="text-sm font-bold text-white">{safeStats.cautelas}</div>
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/70 flex items-center gap-2">
            <Archive className="w-4 h-4 text-rose-400" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Baixados</div>
              <div className="text-sm font-bold text-white">{safeStats.baixados}</div>
            </div>
          </div>

          {/* Export PDF Report Button */}
          <button
            onClick={onExportReportPDF}
            className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Emitir Relatório</span>
          </button>

        </div>

      </div>
    </div>
  );
};
