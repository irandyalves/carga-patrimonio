import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Check, 
  CheckCheck,
  Trash2, 
  Building2, 
  ArrowRight, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Inbox,
  History
} from 'lucide-react';
import { formatLast5Patrimonio } from '../utils/formatters';

export const PedidosCargaModal = ({
  isOpen,
  onClose,
  pedidos = [],
  isAdmin = false,
  onAprovarPedido,
  onRecusarPedido,
  onAprovarTodos,
  onExcluirHistorico,
  onLimparHistorico
}) => {
  const [activeTab, setActiveTab] = useState('pendentes'); // 'pendentes' | 'historico'
  const [showConfirmAll, setShowConfirmAll] = useState(false);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingPedidos = pedidos.filter(p => p.status === 'PENDENTE');
  const pastPedidos = pedidos.filter(p => p.status !== 'PENDENTE');

  // Ajusta a aba inicial ao abrir o modal com base na existência de pendências
  useEffect(() => {
    if (isOpen) {
      const hasPending = pedidos.some(p => p.status === 'PENDENTE');
      setActiveTab(hasPending ? 'pendentes' : 'historico');
      setShowConfirmAll(false);
      setShowConfirmDeleteAll(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (val) => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleString('pt-BR');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
        
        {/* Header Superior */}
        <div className="flex items-center justify-between pb-3 shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-lg">Pedidos de Carga Patrimonial</h3>
                {pendingPedidos.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 font-mono">
                    {pendingPedidos.length} pendente{pendingPedidos.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">
                Solicitações e transferências de patrimônios pertencentes a outros setores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab === 'pendentes' && pendingPedidos.length > 0 && (
              <button
                type="button"
                onClick={() => setShowConfirmAll(true)}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-950/40 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                title={`Aceitar todos os ${pendingPedidos.length} pedidos pendentes de uma só vez`}
              >
                <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Aceitar Todos ({pendingPedidos.length})</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navegação por Abas: Pendentes vs Histórico */}
        <div className="flex items-center gap-2 pt-1 pb-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('pendentes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pendentes'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/35 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pendentes</span>
            {pendingPedidos.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                activeTab === 'pendentes'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-amber-400 border border-amber-500/30'
              }`}>
                {pendingPedidos.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('historico')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'historico'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico</span>
            {pastPedidos.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'historico'
                  ? 'bg-slate-700 text-slate-200'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {pastPedidos.length}
              </span>
            )}
          </button>
        </div>

        {/* Linha Divisória com gradiente */}
        <div className="h-[1px] -mx-6 bg-gradient-to-r from-slate-700 via-slate-800/60 to-transparent shrink-0" />

        {/* Conteúdo das Abas */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin">
          
          {/* ================= ABA 1: PENDENTES ================= */}
          {activeTab === 'pendentes' && (
            <>
              {pendingPedidos.length === 0 ? (
                <div className="text-center py-14 text-slate-400 space-y-3">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500/40 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-300">Nenhum pedido pendente no momento.</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Todas as solicitações de transferência de carga pendentes foram avaliadas e arquivadas no Histórico.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 overflow-x-hidden">
                  <div className="flex items-center justify-between pb-1 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Pendentes de Decisão ({pendingPedidos.length})
                    </span>

                    {pendingPedidos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setShowConfirmAll(true)}
                        disabled={isProcessing}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer hover:underline transition py-0.5 px-2 rounded-lg hover:bg-emerald-500/10"
                        title="Aceitar todos os pedidos pendentes"
                      >
                        <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Aceitar todos ({pendingPedidos.length})</span>
                      </button>
                    )}
                  </div>

                  {pendingPedidos.map((ped) => (
                    <div 
                      key={ped.id}
                      className="relative p-3.5 pr-6 -mr-6 rounded-l-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md group overflow-hidden"
                    >
                      {/* Borda contínua com gradiente para transparente à direita */}
                      <div 
                        className="absolute inset-0 rounded-l-2xl border-l-2 border-t border-b border-r-0 border-slate-700 bg-slate-850/90 pointer-events-none [mask-image:linear-gradient(to_right,black_0%,black_35%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_35%,transparent_100%)]" 
                      />

                      {/* Conteúdo do Card */}
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
                        {/* Informações do Bem e Solicitante */}
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

                        {/* Origem e Destino */}
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

                        {/* Botões de Ação */}
                        <div className="w-44 min-w-[176px] shrink-0 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onRecusarPedido(ped.id)}
                            className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 transition-all cursor-pointer shadow-sm active:scale-95 text-center"
                            title="Rejeitar pedido"
                          >
                            Rejeitar
                          </button>

                          <button
                            type="button"
                            onClick={() => onAprovarPedido(ped)}
                            className="flex-1 py-1.5 rounded-xl text-xs font-bold text-emerald-300 hover:text-slate-950 bg-emerald-500/20 hover:bg-emerald-400 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer shadow-sm active:scale-95 text-center"
                            title="Aceitar pedido"
                          >
                            Aceitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ================= ABA 2: HISTÓRICO ================= */}
          {activeTab === 'historico' && (
            <div className="space-y-3 overflow-x-hidden">
              {/* Cabeçalho do Título Histórico com Botão 'Excluir tudo' à direita */}
              <div className="flex items-center justify-between pb-1 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" />
                  <span>Histórico ({pastPedidos.length})</span>
                </h4>

                {pastPedidos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmDeleteAll(true)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Excluir todo o histórico de pedidos (aprovados e recusados)"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Excluir tudo</span>
                  </button>
                )}
              </div>

              {pastPedidos.length === 0 ? (
                <div className="text-center py-14 text-slate-400 space-y-3">
                  <History className="w-12 h-12 mx-auto text-slate-600 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-300">Nenhum histórico registrado no momento.</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Pedidos que foram aceitos ou recusados serão arquivados nesta seção.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pastPedidos.map(ped => (
                    <div 
                      key={ped.id}
                      className="relative p-3 pr-6 -mr-6 rounded-l-xl transition-all flex items-center justify-between gap-3 text-xs text-slate-400 overflow-hidden shadow-sm group hover:bg-slate-800/30"
                    >
                      {/* Borda contínua suave */}
                      <div 
                        className="absolute inset-0 rounded-l-xl border-l-2 border-t border-b border-r-0 border-slate-700 bg-slate-850/60 pointer-events-none [mask-image:linear-gradient(to_right,black_0%,black_35%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_35%,transparent_100%)]" 
                      />

                      <div className="relative z-10 flex items-center justify-between gap-3 w-full">
                        {/* Informações do Item */}
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="text-slate-300">
                            <strong className="text-slate-200 font-mono text-xs">{formatLast5Patrimonio(ped.numeroPatrimonio)}</strong>
                            <span className="text-slate-300 font-medium"> - {ped.descricao}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            De: {ped.setorOrigemNome} ➔ {ped.setorDestinoNome} • {formatDate(ped.dataSolicitacao)}
                          </div>
                        </div>

                        {/* Status + Botão Lixeirinha Lado Direito */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                            ped.status === 'APROVADO' 
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}>
                            {ped.status}
                          </span>

                          <button
                            type="button"
                            onClick={() => onExcluirHistorico && onExcluirHistorico(ped.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer active:scale-90"
                            title="Excluir este item do histórico"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal de Confirmação para Aceitar Todos */}
        {showConfirmAll && (
          <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-sm rounded-3xl flex items-center justify-center p-6 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white">Aceitar Todos os Pedidos?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Confirma a aprovação e transferência de todos os <strong className="text-emerald-400 font-mono text-sm">{pendingPedidos.length}</strong> {pendingPedidos.length === 1 ? 'item pendente' : 'itens pendentes'} para seus respectivos setores de destino?
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmAll(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setIsProcessing(true);
                    try {
                      if (onAprovarTodos) {
                        await onAprovarTodos(pendingPedidos);
                      }
                      setShowConfirmAll(false);
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/25 transition cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isProcessing ? 'Processando...' : 'Confirmar e Aceitar Todos'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação para Excluir Todo o Histórico */}
        {showConfirmDeleteAll && (
          <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-sm rounded-3xl flex items-center justify-center p-6 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white">Excluir Todo o Histórico?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Confirma a exclusão definitiva de todos os <strong className="text-rose-400 font-mono text-sm">{pastPedidos.length}</strong> registros do histórico de pedidos (aprovados e recusados)?
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmDeleteAll(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setIsProcessing(true);
                    try {
                      if (onLimparHistorico) {
                        await onLimparHistorico();
                      }
                      setShowConfirmDeleteAll(false);
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isProcessing ? 'Excluindo...' : 'Confirmar e Excluir Tudo'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
