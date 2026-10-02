import React, { useEffect } from 'react';
import { 
  X, 
  Bell, 
  Check, 
  Server, 
  FileText, 
  ExternalLink
} from 'lucide-react';
import { formatPatrimonio } from '../utils/formatters';

export const PendenciasDtinModal = ({
  isOpen,
  onClose,
  pendencias = [],
  onAuthorizeDtin,
  onRejectDtin,
  currentUser,
  isAdmin = false
}) => {
  // Se estiver aberto mas não houver pendências, fecha imediatamente sem mostrar tela vazia
  useEffect(() => {
    if (isOpen && pendencias.length === 0) {
      onClose();
    }
  }, [isOpen, pendencias.length, onClose]);

  if (!isOpen || pendencias.length === 0) return null;

  // Confirmação com fechamento imediato se for a última pendência
  const handleConfirmItem = (itemId) => {
    onAuthorizeDtin(itemId);
    if (pendencias.length <= 1) {
      onClose();
    }
  };

  // Recusa com fechamento imediato se for a última pendência
  const handleRejectItem = (itemId) => {
    onRejectDtin(itemId);
    if (pendencias.length <= 1) {
      onClose();
    }
  };

  // Nome do detentor para o cabeçalho (em maiúsculas)
  const detentorName = (
    currentUser?.displayName || 
    currentUser?.name || 
    pendencias[0]?.responsavel || 
    'TADEU'
  ).toUpperCase();

  // Data da solicitação (da primeira pendência ou data de hoje)
  const dataSolicitacao = 
    pendencias[0]?.pendenciaDtin?.data || 
    pendencias[0]?.dadosDtin?.data || 
    new Date().toLocaleDateString('pt-BR');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-5xl rounded-3xl p-5 sm:p-7 shadow-2xl relative flex flex-col max-h-[92vh]">
        
        {/* Cabeçalho com Ícone Sino Vermelho Pulsante Suave */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-800 shrink-0 gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Sino Vermelho com Pulsação Suave */}
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-950/50 shrink-0 mt-0.5 animate-pulse">
              <Bell className="w-6 h-6 text-rose-500 fill-rose-500/20" />
            </div>
            
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-extrabold text-white text-base sm:text-lg leading-snug">
                  <span className="text-rose-400 font-black">{detentorName}</span>, o Santana está solicitando autorização para enviar para DTIN os equipamentos abaixo.
                </h3>
                {pendencias.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                    {pendencias.length} pendente{pendencias.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Data da solicitação: <strong className="text-slate-200 font-semibold">{dataSolicitacao}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Equipamentos */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4 scrollbar-thin">
          
          {pendencias.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500">
                <CheckCircle2 className="w-7 h-7 text-emerald-400/70" />
              </div>
              <p className="text-sm font-semibold text-slate-300">Nenhuma autorização pendente de DTIN no momento.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Quando o responsável pela TI solicitar o envio de um equipamento sob sua responsabilidade, o aviso aparecerá aqui para sua confirmação.
              </p>
            </div>
          ) : (
            pendencias.map((item) => {
              const dados = item.pendenciaDtin || item.dadosDtin || {};
              return (
                <div 
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-850 border border-slate-700/80 hover:border-cyan-500/40 transition-all space-y-4 shadow-xl shadow-slate-950/50"
                >
                  {/* Topo do Item: Patrimônio Grande e Bold, Descrição (max 2 linhas) */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-750 pb-3.5">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl sm:text-4xl font-black font-mono text-cyan-400 tracking-tight drop-shadow-[0_0_12px_rgba(34,211,238,0.25)]">
                          {formatPatrimonio(item.numeroPatrimonio)}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
                        {item.descricao}
                      </p>
                    </div>

                    {/* Badge Destino DTIN */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold shrink-0 self-start">
                      <Server className="w-4 h-4 text-cyan-400" />
                      <span>Destino: DTIN</span>
                    </div>
                  </div>

                  {/* Informações: Finalidade / Motivo & Quem enviou */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                        Finalidade / Motivo
                      </span>
                      <p className="text-cyan-300 font-bold text-sm">
                        {dados.motivo || 'Defeito / Reparo Técnico (Laboratório / Oficina)'}
                      </p>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                        Quem enviou
                      </span>
                      <p className="text-cyan-300 font-bold text-sm">
                        {dados.responsavel || dados.solicitante || 'Santana'}
                      </p>
                    </div>
                  </div>

                  {/* Observações / Defeito / Diagnóstico (em verde) */}
                  {dados.observacoes && (
                    <div className="bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-500/30 text-xs space-y-1">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Observações:
                      </span>
                      <p className="text-emerald-300 leading-relaxed whitespace-pre-wrap font-semibold text-sm">
                        {dados.observacoes}
                      </p>
                    </div>
                  )}

                  {/* Anexos se houver */}
                  {dados.anexos && dados.anexos.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        Documentos Anexados ({dados.anexos.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {dados.anexos.map((anexo, idx) => (
                          <a
                            key={idx}
                            href={anexo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950/50 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[180px]">{anexo.nome}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botões de Ação: Recusar no lado ESQUERDO e Confirmar no lado DIREITO */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleRejectItem(item.id)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 transition-all cursor-pointer active:scale-95"
                      title="Recusar a saída deste equipamento para o DTIN"
                    >
                      Recusar Envio
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmItem(item.id)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                      title="Confirmar e autorizar o envio deste equipamento para o DTIN"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirmar e Autorizar Envio</span>
                    </button>
                  </div>

                </div>
              );
            })
          )}

        </div>

      </div>
    </div>
  );
};
