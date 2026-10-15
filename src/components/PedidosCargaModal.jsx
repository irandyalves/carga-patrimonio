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
  History,
  Handshake,
  FileText,
  RotateCcw
} from 'lucide-react';
import { formatLast5Patrimonio } from '../utils/formatters';
import { generateCautelaPDF } from '../services/pdfGenerator';

export const PedidosCargaModal = ({
  isOpen,
  onClose,
  pedidos = [],
  cautelas = [],
  assets = [],
  isAdmin = false,
  onAprovarPedido,
  onRecusarPedido,
  onAprovarTodos,
  onExcluirHistorico,
  onLimparHistorico,
  onCancelarPedido,
  onReturnCautela,
  currentUserName = '',
  userSectorIds = [],
  activeSectorId = null,
  initialTab = 'pendentes'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'pendentes');
  const [historicoFilter, setHistoricoFilter] = useState('ALL'); // 'ALL' | 'PEDIDOS' | 'CAUTELAS'
  const [showConfirmAll, setShowConfirmAll] = useState(false);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const normName = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const myName = normName(currentUserName);

  // Quem enviou o pedido (remetente): só pode cancelar
  const isRemetente = (p) =>
    (myName && normName(p.solicitanteNome) === myName) ||
    (userSectorIds.length > 0 && userSectorIds.includes(p.setorOrigemId)) ||
    (activeSectorId && p.setorOrigemId === activeSectorId && p.setorDestinoId !== activeSectorId);

  // Quem recebe (resp. carga do setor destino) ou quem está com o setor de destino aberto, ou admin em pedidos de terceiros: aceita/rejeita
  const podeAceitar = (p) =>
    userSectorIds.includes(p.setorDestinoId) ||
    (activeSectorId && p.setorDestinoId === activeSectorId) ||
    (isAdmin && !isRemetente(p));

  const allPending = pedidos.filter(p => p.status === 'PENDENTE');
  // Usuário comum só vê pedidos em que está envolvido; admin vê todos
  const pendingPedidos = isAdmin ? allPending : allPending.filter(p => podeAceitar(p) || isRemetente(p));
  const aceitaveis = pendingPedidos.filter(podeAceitar);
  const pastPedidos = pedidos.filter(p => p.status !== 'PENDENTE');
  const totalHistoricoCount = pastPedidos.length + cautelas.length;

  // Ajusta a aba inicial ao abrir o modal com base na prop initialTab ou existência de pendências
  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      } else {
        const hasPending = pedidos.some(p => p.status === 'PENDENTE');
        setActiveTab(hasPending ? 'pendentes' : 'historico');
      }
      setShowConfirmAll(false);
      setShowConfirmDeleteAll(false);
    }
  }, [isOpen, initialTab]);

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

  const handleDownloadCautela = async (cautela) => {
    const asset = assets.find(a => a.id === cautela.assetId) || {
      numeroPatrimonio: cautela.numeroPatrimonio,
      descricao: cautela.descricao,
      setorNome: cautela.setorOrigem,
      valorOriginal: 0
    };
    await generateCautelaPDF(cautela, asset);
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
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
              activeTab === 'historico'
                ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}>
              {activeTab === 'historico' ? <History className="w-5 h-5" /> : <Inbox className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-lg">
                  {activeTab === 'historico' ? 'Históricos' : 'Pedidos'}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('pendentes')}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono cursor-pointer transition ${
                    activeTab === 'pendentes'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                  }`}
                  title="Ver pedidos pendentes de transferência"
                >
                  {pendingPedidos.length} pendente{pendingPedidos.length !== 1 ? 's' : ''}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('historico')}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition border ${
                    activeTab === 'historico'
                      ? 'bg-slate-700 text-white border-slate-600 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                  }`}
                  title="Ver histórico de pedidos e cautelas"
                >
                  <History className="w-3 h-3" />
                  <span>Histórico ({totalHistoricoCount})</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {activeTab === 'historico' 
                  ? 'Histórico de pedidos de transferência e termos de cautela'
                  : 'Solicitações de transferências de carga entre setores'}
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

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
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
                    Quando outros setores solicitarem a transferência de bens para sua carga, eles aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPedidos.map(ped => {
                    const canAccept = podeAceitar(ped);
                    const canCancel = isRemetente(ped);

                    return (
                      <div
                        key={ped.id}
                        className="bg-slate-850/80 border border-slate-750 hover:border-slate-700 rounded-2xl p-4 transition-all shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded text-xs">
                              {formatLast5Patrimonio(ped.numeroPatrimonio)}
                            </span>
                            <span className="font-semibold text-white text-sm truncate max-w-md">
                              {ped.descricao}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                            <span className="text-slate-400">
                              De: <strong className="text-amber-300 font-medium">{ped.setorOrigemNome}</strong> ({ped.solicitanteNome})
                            </span>
                            <span className="text-slate-500">→</span>
                            <span className="text-slate-400">
                              Para: <strong className="text-emerald-300 font-medium">{ped.setorDestinoNome}</strong>
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              {formatDate(ped.dataSolicitacao)}
                            </span>
                          </div>

                          {ped.motivo && (
                            <p className="text-xs text-slate-300 italic bg-slate-900/60 rounded-lg p-2 border border-slate-800 max-w-2xl">
                              &ldquo;{ped.motivo}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                          {canAccept && (
                            <>
                              <button
                                type="button"
                                onClick={() => onAprovarPedido && onAprovarPedido(ped.id)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-950/40 flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                title="Aceitar este bem na sua carga"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Aceitar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onRecusarPedido && onRecusarPedido(ped.id)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                title="Recusar a transferência deste bem"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Recusar</span>
                              </button>
                            </>
                          )}

                          {canCancel && !canAccept && (
                            <button
                              type="button"
                              onClick={() => onCancelarPedido && onCancelarPedido(ped.id)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-rose-600 border border-slate-700 hover:border-rose-600 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                              title="Cancelar esta solicitação de envio"
                            >
                              <span>Cancelar Envio</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ================= ABA 2: HISTÓRICO (PEDIDOS + CAUTELAS) ================= */}
          {activeTab === 'historico' && (
            <div className="space-y-3 overflow-x-hidden">
              
              {/* Barra de Filtros do Histórico: Todos | Pedidos | Cautelas */}
              <div className="flex items-center justify-between pb-1 pt-1 flex-wrap gap-2">
                <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setHistoricoFilter('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      historicoFilter === 'ALL'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Todos ({totalHistoricoCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoricoFilter('PEDIDOS')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      historicoFilter === 'PEDIDOS'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Pedidos ({pastPedidos.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoricoFilter('CAUTELAS')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      historicoFilter === 'CAUTELAS'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    <span>Cautelas ({cautelas.length})</span>
                  </button>
                </div>

                {pastPedidos.length > 0 && historicoFilter !== 'CAUTELAS' && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmDeleteAll(true)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Excluir todo o histórico de pedidos (aprovados e recusados)"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Excluir pedidos</span>
                  </button>
                )}
              </div>

              {totalHistoricoCount === 0 ? (
                <div className="text-center py-14 text-slate-400 space-y-3">
                  <History className="w-12 h-12 mx-auto text-slate-600 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-300">Nenhum histórico registrado no momento.</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Pedidos aceitos/recusados e termos de cautela aparecerão arquivados nesta seção.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">

                  {/* 1. SEÇÃO DE PEDIDOS DE TRANSFERÊNCIA */}
                  {(historicoFilter === 'ALL' || historicoFilter === 'PEDIDOS') && pastPedidos.length > 0 && (
                    <div className="space-y-2">
                      {historicoFilter === 'ALL' && (
                        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 pt-1 px-1">
                          <Inbox className="w-3.5 h-3.5" />
                          <span>Pedidos de Transferência ({pastPedidos.length})</span>
                        </div>
                      )}

                      {pastPedidos.map(ped => (
                        <div 
                          key={ped.id}
                          className="relative p-3 pr-6 -mr-6 rounded-l-xl transition-all flex items-center justify-between gap-3 text-xs text-slate-400 overflow-hidden shadow-sm group hover:bg-slate-800/30"
                        >
                          <div 
                            className="absolute inset-0 rounded-l-xl border-l-2 border-t border-b border-r-0 border-slate-700 bg-slate-850/60 pointer-events-none [mask-image:linear-gradient(to_right,black_0%,black_35%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_35%,transparent_100%)]" 
                          />

                          <div className="relative z-10 flex items-center justify-between gap-3 w-full">
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="text-slate-300 flex items-center gap-1.5 flex-wrap">
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                                  PEDIDO
                                </span>
                                <strong className="text-slate-200 font-mono text-xs">{formatLast5Patrimonio(ped.numeroPatrimonio)}</strong>
                                <span className="text-slate-300 font-medium"> - {ped.descricao}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                De: {ped.setorOrigemNome} → {ped.setorDestinoNome} • {formatDate(ped.dataSolicitacao)}
                              </div>
                            </div>

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

                  {/* 2. SEÇÃO DE CAUTELAS */}
                  {(historicoFilter === 'ALL' || historicoFilter === 'CAUTELAS') && cautelas.length > 0 && (
                    <div className="space-y-2">
                      {historicoFilter === 'ALL' && (
                        <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 pt-2 px-1">
                          <Handshake className="w-3.5 h-3.5" />
                          <span>Cautelas e Empréstimos ({cautelas.length})</span>
                        </div>
                      )}

                      {cautelas.map(c => {
                        const isDevolvido = c.status === 'DEVOLVIDO';
                        return (
                          <div
                            key={c.id || c.assetId}
                            className="relative p-3 pr-6 -mr-6 rounded-l-xl transition-all flex items-center justify-between gap-3 text-xs text-slate-400 overflow-hidden shadow-sm group hover:bg-slate-800/30"
                          >
                            <div 
                              className="absolute inset-0 rounded-l-xl border-l-2 border-t border-b border-r-0 border-purple-500/40 bg-slate-850/60 pointer-events-none [mask-image:linear-gradient(to_right,black_0%,black_35%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_35%,transparent_100%)]" 
                            />

                            <div className="relative z-10 flex items-center justify-between gap-3 w-full">
                              <div className="min-w-0 flex-1 pr-2">
                                <div className="text-slate-300 flex items-center gap-1.5 flex-wrap">
                                  <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                                    CAUTELA
                                  </span>
                                  <strong className="text-slate-200 font-mono text-xs">
                                    {formatLast5Patrimonio(c.numeroPatrimonio)}
                                  </strong>
                                  <span className="text-slate-300 font-medium"> - {c.descricao}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                                  <span>Com: <strong className="text-purple-300 font-semibold">{c.responsavelRetirada || c.responsavel}</strong> {c.setorDestino ? `(${c.setorDestino})` : ''}</span>
                                  <span>•</span>
                                  <span>Retirada: <span className="font-mono text-slate-300">{c.dataRetirada}</span></span>
                                  {c.dataPrevistaDevolucao && (
                                    <>
                                      <span>•</span>
                                      <span>Previsão: <span className="font-mono text-slate-300">{c.dataPrevistaDevolucao}</span></span>
                                    </>
                                  )}
                                  {c.dataDevolucao && (
                                    <>
                                      <span>•</span>
                                      <span className="text-emerald-400 font-medium">Devolvido em: <span className="font-mono">{c.dataDevolucao}</span></span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                                  isDevolvido 
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                }`}>
                                  {isDevolvido ? 'DEVOLVIDO' : 'EM ABERTO'}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadCautela(c)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-500/15 border border-slate-750 hover:border-purple-500/30 transition-all cursor-pointer shadow-sm active:scale-90"
                                  title="Baixar Termo de Cautela (PDF)"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>

                                {!isDevolvido && onReturnCautela && (
                                  <button
                                    type="button"
                                    onClick={() => onReturnCautela(c.id, c.assetId)}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-300 hover:text-white bg-emerald-500/15 hover:bg-emerald-600 border border-emerald-500/30 hover:border-emerald-600 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
                                    title="Receber devolução desta cautela"
                                  >
                                    <RotateCcw className="w-3 h-3 text-emerald-400" />
                                    <span>Receber Bem</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

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

        {/* Modal de Confirmação para Excluir Todo o Histórico de Pedidos */}
        {showConfirmDeleteAll && (
          <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-sm rounded-3xl flex items-center justify-center p-6 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white">Excluir Todo o Histórico de Pedidos?</h4>
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-rose-500 hover:bg-rose-400 shadow-lg shadow-rose-500/25 transition cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 stroke-[2]" />
                  <span>{isProcessing ? 'Excluindo...' : 'Confirmar e Excluir'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
