import React from 'react';
import { 
  X, 
  Send, 
  Check, 
  Trash2, 
  Building2, 
  ArrowRight, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Inbox
} from 'lucide-react';
import { formatLast5Patrimonio } from '../utils/formatters';

export const PedidosCargaModal = ({
  isOpen,
  onClose,
  pedidos = [],
  isAdmin = false,
  onAprovarPedido,
  onRecusarPedido
}) => {
  if (!isOpen) return null;

  const formatDate = (val) => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleString('pt-BR');
  };

  const pendingPedidos = pedidos.filter(p => p.status === 'PENDENTE');
  const pastPedidos = pedidos.filter(p => p.status !== 'PENDENTE');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg">Pedidos de Carga Patrimonial</h3>
                {pendingPedidos.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 font-mono">
                    {pendingPedidos.length} pendente{pendingPedidos.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Solicitações e avisos de patrimônios pertencentes a outros setores
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin">
          
          {pedidos.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <Inbox className="w-12 h-12 mx-auto text-slate-600 stroke-[1.5]" />
              <p className="text-sm font-medium">Nenhum pedido de carga registrado no momento.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Quando um operador localizar um bem de outro setor e fizer uma solicitação, ela aparecerá aqui.
              </p>
            </div>
          ) : (
            <>
              {/* Pendentes */}
              {pendingPedidos.length > 0 && (
                <div className="space-y-2.5">
                  {pendingPedidos.map((ped) => (
                    <div 
                      key={ped.id}
                      className="p-3.5 rounded-2xl bg-slate-850 border border-amber-500/30 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-black text-indigo-400 shrink-0">
                            {formatLast5Patrimonio(ped.numeroPatrimonio)}
                          </span>
                          <span className="text-sm font-semibold text-white truncate" title={ped.descricao}>
                            {ped.descricao}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <span>Solicitado por: <strong className="text-slate-300">{ped.solicitanteNome}</strong></span>
                          <span>•</span>
                          <span>{formatDate(ped.dataSolicitacao)}</span>
                        </div>
                      </div>

                      {/* Rota de Transferência Solicitada e Botões de Ação logo abaixo */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-2 text-xs bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-750 shrink-0">
                          <span className="text-slate-400 font-medium">De: {ped.setorOrigemNome}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-bold text-amber-300">{ped.setorDestinoNome}</span>
                        </div>

                        {/* Ações (REJEITAR / AUTORIZAR) compactas */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onRecusarPedido(ped.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-sm shadow-rose-600/30 flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                            <span>REJEITAR</span>
                          </button>

                          <button
                            onClick={() => onAprovarPedido(ped)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30 flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>AUTORIZAR</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Histórico de Pedidos Anteriores */}
              {pastPedidos.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Histórico ({pastPedidos.length})
                  </h4>

                  {pastPedidos.map(ped => (
                    <div 
                      key={ped.id}
                      className="p-3 rounded-xl bg-slate-850/50 border border-slate-800 text-xs flex items-center justify-between gap-3 text-slate-400"
                    >
                      <div>
                        <strong className="text-slate-300 font-mono">{formatLast5Patrimonio(ped.numeroPatrimonio)}</strong> - {ped.descricao}
                        <div className="text-[11px] text-slate-500">
                          De: {ped.setorOrigemNome} ➔ {ped.setorDestinoNome} • {formatDate(ped.dataSolicitacao)}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        ped.status === 'APROVADO' 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {ped.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
