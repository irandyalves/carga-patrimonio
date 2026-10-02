import React from 'react';
import { 
  X, 
  Bell, 
  Check, 
  Trash2, 
  Building2, 
  ArrowRight, 
  Clock, 
  User, 
  AlertCircle, 
  Server, 
  FileText, 
  CheckCircle2, 
  RotateCcw, 
  AlertTriangle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { formatPatrimonio, formatLast5Patrimonio } from '../utils/formatters';

export const PendenciasDtinModal = ({
  isOpen,
  onClose,
  pendencias = [],
  onAuthorizeDtin,
  onRejectDtin,
  currentUser,
  isAdmin = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/30 w-full max-w-3xl rounded-3xl p-5 sm:p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/50">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg">
                  Autorização de Envio para a DTIN
                </h3>
                {pendencias.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono animate-pulse">
                    {pendencias.length} pendente{pendencias.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Avisos e solicitações de envio de equipamentos para a Tecnologia da Informação
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 scrollbar-thin">
          
          {pendencias.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500">
                <CheckCircle2 className="w-7 h-7 text-emerald-400/70" />
              </div>
              <p className="text-sm font-semibold text-slate-300">Nenhuma autorização pendente de DTIN no momento.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Quando o setor de TI (Santana) solicitar o envio de um equipamento sob sua responsabilidade, o aviso aparecerá aqui para sua confirmação.
              </p>
            </div>
          ) : (
            <>
              {/* Aviso explicativo */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-cyan-200/90 leading-relaxed">
                  <strong>Atenção do Detentor da Carga:</strong> O responsável pela TI (Santana) solicitou o encaminhamento do(s) equipamento(s) abaixo para a Diretoria de Tecnologia da Informação (DTIN). Por favor, avalie os detalhes e confirme ou recuse a saída do item.
                </div>
              </div>

              {/* Lista de Itens Pendentes */}
              {pendencias.map((item) => {
                const dados = item.pendenciaDtin || item.dadosDtin || {};
                return (
                  <div 
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-850 border border-cyan-500/30 hover:border-cyan-500/50 transition-all space-y-3 shadow-lg shadow-slate-950/40"
                  >
                    {/* Topo do Item: Patrimônio, Descrição e Setor */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-750 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-base font-black text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/40">
                            {formatPatrimonio(item.numeroPatrimonio)}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {item.descricao}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 flex-wrap">
                          <span>Setor Atual: <strong className="text-slate-200 font-semibold">{item.setorNome || 'Setor'}</strong> ({item.responsavel || 'Detentor'})</span>
                          <span>•</span>
                          <span>Solicitado por: <strong className="text-cyan-300 font-semibold">{dados.responsavel || dados.solicitante || 'Santana (TI)'}</strong></span>
                          <span>•</span>
                          <span className="text-slate-400">{dados.data || dados.dataSolicitacao || 'Hoje'}</span>
                        </div>
                      </div>

                      {/* Badge DTIN */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold shrink-0 self-start sm:self-center">
                        <Server className="w-3.5 h-3.5" />
                        <span>Destino: DTIN</span>
                      </div>
                    </div>

                    {/* Detalhes do Envio */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                          Finalidade / Motivo
                        </span>
                        <p className="text-slate-200 font-medium">{dados.motivo || 'Manutenção Corretiva'}</p>
                      </div>

                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                          Nº Chamado / O.S.
                        </span>
                        <p className="text-cyan-300 font-mono font-medium">{dados.chamado || 'Não informado'}</p>
                      </div>
                    </div>

                    {/* Observações e Diagnóstico */}
                    {dados.observacoes && (
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                        <span className="text-[10.5px] font-bold text-cyan-400 uppercase tracking-wider block">
                          Observações / Diagnóstico do Santana (TI):
                        </span>
                        <p className="text-slate-200 leading-relaxed italic">
                          "{dados.observacoes}"
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

                    {/* Botões de Ação para o Detentor */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => onRejectDtin(item.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 transition-colors cursor-pointer"
                        title="Recusar a saída deste equipamento para o DTIN"
                      >
                        Recusar Envio
                      </button>

                      <button
                        type="button"
                        onClick={() => onAuthorizeDtin(item.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 shadow-md shadow-cyan-500/30 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        title="Confirmar e autorizar o envio deste equipamento para o DTIN"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Confirmar e Autorizar Envio</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
