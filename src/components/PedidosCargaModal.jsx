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
        <div className="flex items-center justify-between pb-4 shrink-0">
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

        {/* Linha Divisória Superior: Encosta na borda do modal com gradiente (lado direito 100%) */}
        <div className="h-[1px] -mx-6 bg-gradient-to-r from-transparent via-slate-800/60 to-slate-700 shrink-0" />

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
                <div className="space-y-2.5 overflow-x-hidden">
                  {pendingPedidos.map((ped) => (
                    <div 
                      key={ped.id}
                      className="relative p-3.5 pr-6 -mr-6 rounded-l-2xl bg-slate-850/80 hover:bg-slate-850 border-l border-slate-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md group overflow-hidden"
                    >
                      {/* Linha superior com gradiente encostando na borda direita (100%) */}
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800/70 to-slate-700" />

                      {/* Linha inferior com gradiente encostando na borda direita (100%) */}
                      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800/70 to-slate-700" />

                      {/* Coluna 1: Informações do Bem e Solicitante */}
                      <div className="flex-1 min-w-0 md:pr-4 md:border-r md:border-slate-800/80">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md shrink-0">
                            {formatLast5Patrimonio(ped.numeroPatrimonio)}
                          </span>
                          <span className="text-sm font-bold text-slate-100 truncate block" title={ped.descricao}>
                            {ped.descricao}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1 truncate">
                            <User className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>Solicitado por:</span>
                            <strong className="text-slate-300 font-medium">{ped.solicitanteNome}</strong>
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400 font-mono text-[11px] shrink-0">{formatDate(ped.dataSolicitacao)}</span>
                        </div>
                      </div>

                      {/* Coluna 2: Origem e Destino (Reduzida em 15%: 190px - Sem borda direita) */}
                      <div className="w-[190px] min-w-[190px] max-w-[190px] shrink-0 flex items-center justify-center gap-1.5 text-xs md:px-2 overflow-hidden">
                        <span className="text-slate-400 font-medium shrink-0">De:</span>
                        <span className="text-slate-200 font-semibold truncate max-w-[70px] text-center" title={ped.setorOrigemNome}>
                          {ped.setorOrigemNome}
                        </span>
                        <ArrowRight className="w-3 h-3 text-amber-400 shrink-0 mx-0.5" />
                        <strong className="text-amber-300 font-bold truncate max-w-[70px] text-center" title={ped.setorDestinoNome}>
                          {ped.setorDestinoNome}
                        </strong>
                      </div>

                      {/* Coluna 3: Botões de Ação (Largura fixa e alinhada) */}
                      <div className="w-44 min-w-[176px] shrink-0 flex items-center justify-end gap-2">
                        <button
                          onClick={() => onRecusarPedido(ped.id)}
                          className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 transition-all cursor-pointer shadow-sm active:scale-95 text-center"
                          title="Rejeitar pedido"
                        >
                          Rejeitar
                        </button>

                        <button
                          onClick={() => onAprovarPedido(ped)}
                          className="flex-1 py-1.5 rounded-xl text-xs font-bold text-emerald-300 hover:text-slate-950 bg-emerald-500/20 hover:bg-emerald-400 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer shadow-sm active:scale-95 text-center"
                          title="Autorizar pedido"
                        >
                          Autorizar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Histórico de Pedidos Anteriores */}
              {pastPedidos.length > 0 && (
                <div className="space-y-2 pt-3 overflow-x-hidden">
                  {/* Linha Divisória Inferior: Encosta na borda do modal com gradiente (lado direito 100%) */}
                  <div className="h-[1px] -mx-6 mb-3 bg-gradient-to-r from-transparent via-slate-800/60 to-slate-700 shrink-0" />

                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Histórico ({pastPedidos.length})
                  </h4>

                  {pastPedidos.map(ped => (
                    <div 
                      key={ped.id}
                      className="relative p-3 pr-6 -mr-6 rounded-l-xl bg-slate-850/50 border-l border-slate-800 text-xs flex items-center justify-between gap-3 text-slate-400 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800/70 to-slate-700" />
                      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800/70 to-slate-700" />
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
