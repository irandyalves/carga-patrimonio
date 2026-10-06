import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Check, 
  CheckCheck,
  Trash2, 
  Building2, 
  ArrowRight, 
  ArrowDown, 
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
  onLimparHistorico,
  onCancelarPedido,
  currentUserName = '',
  userSectorIds = []
}) => {
  const [activeTab, setActiveTab] = useState('pendentes'); // 'pendentes' | 'historico'
  const [showConfirmAll, setShowConfirmAll] = useState(false);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const normName = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const myName = normName(currentUserName);

  // Quem enviou o pedido (remetente): só pode cancelar
  const isRemetente = (p) =>
    (myName && normName(p.solicitanteNome) === myName) ||
    (userSectorIds.length > 0 && userSectorIds.includes(p.setorOrigemId));

  // Quem recebe (resp. carga do setor destino) ou admin em pedidos de terceiros: aceita/rejeita
  const podeAceitar = (p) =>
    userSectorIds.includes(p.setorDestinoId) || (isAdmin && !isRemetente(p));

  const allPending = pedidos.filter(p => p.status === 'PENDENTE');
  // Usuário comum só vê pedidos em que está envolvido; admin vê todos
  const pendingPedidos = isAdmin ? allPending : allPending.filter(p => podeAceitar(p) || isRemetente(p));
  const aceitaveis = pendingPedidos.filter(podeAceitar);
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

  // ESC fecha o modal (ou primeiro a confirmação aberta, se houver)
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (showConfirmAll) setShowConfirmAll(false);
      else if (showConfirmDeleteAll) setShowConfirmDeleteAll(false);
      else onClose && onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, showConfirmAll, showConfirmDeleteAll, onClose]);

  if (!isOpen) return null;

  const formatDate = (val) => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleString('pt-BR');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !isProcessing) onClose && onClose(); }}
    >
      <style>{`
        @keyframes pedidoSetaFlow {
          0%   { transform: translateY(-14px); opacity: 0; }
          35%  { transform: translateY(0);     opacity: 1; }
          65%  { transform: translateY(0);     opacity: 1; }
          100% { transform: translateY(14px);  opacity: 0; }
        }
      `}</style>
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
        
        {/* Header Superior */}
        <div className="flex items-center justify-between pb-3 shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-lg">Pedidos</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'pendentes' ? 'historico' : 'pendentes')}
                  className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 font-mono cursor-pointer hover:bg-amber-400 transition"
                  title="Ver pedidos pendentes"
                >
                  {pendingPedidos.length} pendente{pendingPedidos.length !== 1 ? 's' : ''}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'historico' ? 'pendentes' : 'historico')}
                  className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition border ${
                    activeTab === 'historico'
                      ? 'bg-slate-700 text-white border-slate-600'
                      : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                  }`}
                  title={activeTab === 'historico' ? 'Voltar aos pendentes' : 'Ver histórico (aceitos e rejeitados)'}
                >
                  <History className="w-3 h-3" />
                  Histórico{pastPedidos.length > 0 ? ` (${pastPedidos.length})` : ''}
                </button>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Solicitações de transferências de carga entre setores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab === 'pendentes' && aceitaveis.length > 0 && (
              <button
                type="button"
                onClick={() => setShowConfirmAll(true)}
                disabled={isProcessing}
                className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-950/40 flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                title={`Aceitar todos os ${aceitaveis.length} pedidos pendentes de uma só vez`}
              >
                <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Aceitar Todos ({aceitaveis.length})</span>
              </button>
            )}
          </div>
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
                            <span className="font-mono text-[10px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md shrink-0">
                              {formatLast5Patrimonio(ped.numeroPatrimonio)}
                            </span>
                            <span className="text-[11px] font-bold text-slate-100 truncate block" title={ped.descricao}>
                              {ped.descricao}
                            </span>
                          </div>
                          <div className="border-t border-dashed border-slate-700 my-2" />
                          <div className="text-[10px] text-slate-300 leading-relaxed">
                            {podeAceitar(ped) ? (
                              <>
                                {ped.responsavelDestino ? <><strong className="text-white font-bold">{ped.responsavelDestino}</strong>, o{' '}</> : 'O '}
                                <strong className="text-white font-bold">{ped.solicitanteNome}</strong>
                                {' '}do setor{' '}
                                <strong className="text-slate-100">{ped.setorOrigemNome}</strong>
                                {' '}enviou o item acima para o seu setor{' '}
                                <strong className="text-amber-400 font-bold">({ped.setorDestinoNome})</strong>
                                {' '}e está aguardando o seu aceite.
                              </>
                            ) : (
                              <>
                                ⏳ Aguardando{' '}
                                <strong className="text-white font-bold">{ped.responsavelDestino || 'o responsável'}</strong>
                                , resp. carga do{' '}
                                <strong className="text-amber-400 font-bold">{ped.setorDestinoNome}</strong>
                                , dar o aceite por lá.
                              </>
                            )}
                            <span className="text-slate-600 mx-1.5">•</span>
                            <span className="text-slate-400 font-mono text-[9px]">{formatDate(ped.dataSolicitacao)}</span>
                          </div>
                        </div>

                        {/* Origem e Destino (resumo visual) */}
                        <div className="w-[152px] min-w-[152px] max-w-[152px] shrink-0 flex flex-col items-center justify-center gap-0.5 text-[10px] md:px-2 overflow-hidden">
                          <span className="text-slate-200 font-semibold truncate max-w-full text-center" title={ped.setorOrigemNome}>
                            {ped.setorOrigemNome}
                          </span>
                          <div className="shrink-0" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '22px', overflow: 'hidden' }}>
                            <ArrowDown className="w-4 h-4" color="#34d399" strokeWidth={3} style={{ color: '#34d399', animation: 'pedidoSetaFlow 1.2s ease-in-out infinite' }} />
                            <ArrowDown className="w-4 h-4" color="#34d399" strokeWidth={3} style={{ color: '#34d399', animation: 'pedidoSetaFlow 1.2s ease-in-out 0.2s infinite' }} />
                          </div>
                          <strong className="text-amber-300 font-bold truncate max-w-full text-center" title={ped.setorDestinoNome}>
                            {ped.setorDestinoNome}
                          </strong>
                        </div>

                        {/* Botões de Ação: destinatário aceita/rejeita; remetente só cancela */}
                        <div className="w-[85px] min-w-[85px] shrink-0 flex flex-col items-stretch justify-center gap-2">
                          {podeAceitar(ped) ? (
                            <>
                              <button
                                type="button"
                                onClick={() => onRecusarPedido(ped.id)}
                                className="flex-1 py-1.5 rounded-xl text-[10px] font-semibold text-rose-400 hover:text-white bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 transition-all cursor-pointer shadow-sm active:scale-95 text-center"
                                title="Rejeitar pedido"
                              >
                                Rejeitar
                              </button>

                              <button
                                type="button"
                                onClick={() => onAprovarPedido(ped)}
                                className="flex-1 py-1.5 rounded-xl text-[10px] font-bold text-emerald-300 hover:text-slate-950 bg-emerald-500/20 hover:bg-emerald-400 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer shadow-sm active:scale-95 text-center"
                                title="Aceitar pedido"
                              >
                                Aceitar
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onCancelarPedido && onCancelarPedido(ped.id)}
                              className="py-2 rounded-xl text-[10px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-rose-600 border border-slate-600 hover:border-rose-600 transition-all cursor-pointer shadow-sm active:scale-95 text-center"
                              title="Desistir do envio deste item"
                            >
                              Cancelar
                            </button>
                          )}
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
                            De: {ped.setorOrigemNome} → {ped.setorDestinoNome} • {formatDate(ped.dataSolicitacao)}
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
                  Confirma a aprovação e transferência de todos os <strong className="text-emerald-400 font-mono text-sm">{aceitaveis.length}</strong> {aceitaveis.length === 1 ? 'item pendente' : 'itens pendentes'} para seus respectivos setores de destino?
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
                        await onAprovarTodos(aceitaveis);
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
