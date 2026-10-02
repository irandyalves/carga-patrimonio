import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert, 
  Check, 
  Building2, 
  HelpCircle 
} from 'lucide-react';
import { formatPatrimonio } from '../utils/formatters';

const MOTIVOS_EXCLUSAO = [
  'Item cadastrado em duplicidade',
  'Erro de digitação / Cadastro indevido',
  'Bem não pertence ao inventário deste órgão',
  'Item desincorporado / Anulado administrativamente',
  'Outro motivo justificado'
];

export const DeleteAssetModal = ({
  isOpen,
  onClose,
  asset,
  onConfirmDelete
}) => {
  const [motivo, setMotivo] = useState(MOTIVOS_EXCLUSAO[0]);
  const [justificativa, setJustificativa] = useState('');
  const [confirmedAwareness, setConfirmedAwareness] = useState(false);

  if (!isOpen || !asset) return null;

  const formattedXX = formatPatrimonio(asset.numeroPatrimonio);
  const isEmCautela = asset.status === 'EM_CAUTELA' || !!asset.cautelaAtual;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!motivo) {
      alert('Por favor, selecione o motivo da exclusão.');
      return;
    }

    if (motivo === 'Outro motivo justificado' && !justificativa.trim()) {
      alert('Por favor, informe a justificativa detalhada da exclusão.');
      return;
    }

    if (!confirmedAwareness) {
      alert('Por favor, confirme que está ciente da exclusão definitiva.');
      return;
    }

    onConfirmDelete(asset.id, {
      motivo,
      justificativa: justificativa.trim() || motivo,
      dataExclusao: new Date().toLocaleString('pt-BR')
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-rose-500/40 w-full max-w-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl shadow-rose-950/60 relative animate-in zoom-in-95 duration-150 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho de Alerta de Segurança */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Excluir Bem Patrimonial</h3>
              <span className="text-[11px] text-rose-300 font-medium">Confirmação de Segurança com Registro</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Box de Identificação do Bem a ser Excluído */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Nº {formattedXX}
              </span>
              <span className="text-[10px] text-slate-400">
                Setor: <strong className="text-slate-200">{asset.setorNome || 'Não informado'}</strong>
              </span>
            </div>
            <p className="text-slate-200 font-semibold text-xs leading-snug line-clamp-2">
              {asset.descricao}
            </p>
          </div>

          {/* Alerta caso esteja em cautela */}
          {isEmCautela && (
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Atenção:</strong> Este bem consta atualmente em <strong>Cautela / Empréstimo</strong>. A exclusão também encerrará o registro da cautela.
              </span>
            </div>
          )}

          {/* Seleção do Motivo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <span>Motivo da Exclusão</span>
              <span className="text-rose-400">*</span>
            </label>
            <div className="space-y-1">
              {MOTIVOS_EXCLUSAO.map((m) => (
                <label
                  key={m}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all border ${
                    motivo === m
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-200 font-semibold'
                      : 'bg-slate-800/50 border-slate-800 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="motivoExclusao"
                    value={m}
                    checked={motivo === m}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="accent-rose-500 cursor-pointer"
                  />
                  <span>{m}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Justificativa / Observação */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Observação / Justificativa {motivo === 'Outro motivo justificado' && <span className="text-rose-400">*</span>}</span>
              <span className="text-[10px] text-slate-500 font-normal">Opcional</span>
            </label>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Descreva detalhes ou número de processo da exclusão..."
              rows={2}
              className="w-full bg-slate-950 text-white text-xs px-3 py-2 rounded-xl border border-slate-700/80 focus:border-rose-500/60 focus:outline-none focus:ring-1 focus:ring-rose-500/40 transition-all resize-none placeholder-slate-500"
            />
          </div>

          {/* Trava de Confirmação e Ciência */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/20 cursor-pointer group">
              <input
                type="checkbox"
                checked={confirmedAwareness}
                onChange={(e) => setConfirmedAwareness(e.target.checked)}
                className="w-4 h-4 rounded accent-rose-500 cursor-pointer shrink-0"
              />
              <span className="text-[11px] text-slate-300 group-hover:text-white select-none leading-tight">
                Estou ciente de que esta ação é definitiva e removerá este bem do inventário.
              </span>
            </label>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!confirmedAwareness}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                confirmedAwareness
                  ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-rose-600/30 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirmar Exclusão</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
