import React, { useState, useEffect } from 'react';
import { 
  Handshake, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  User, 
  Phone, 
  Search,
  Download
} from 'lucide-react';
import { generateCautelaPDF } from '../services/pdfGenerator';

export const CautelaListModal = ({
  isOpen,
  onClose,
  cautelas = [],
  assets = [],
  onReturnCautela
}) => {
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'RETURNED'
  const [search, setSearch] = useState('');

  // ESC fecha o modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose && onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCautelas = cautelas.filter(c => {
    if (filterTab === 'ACTIVE' && c.status !== 'EM_ANDAMENTO') return false;
    if (filterTab === 'RETURNED' && c.status !== 'DEVOLVIDO') return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.numeroPatrimonio.toLowerCase().includes(q) ||
        c.descricao.toLowerCase().includes(q) ||
        c.responsavelRetirada.toLowerCase().includes(q) ||
        c.setorDestino.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDownloadPDF = async (cautela) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose && onClose();
        }
      }}
    >
      <div 
        className="bg-slate-900 border border-slate-800 w-full max-w-[930px] rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        
        {/* Header Unificado */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 mb-3 shrink-0">
          {/* Título + Ícone */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg leading-tight">Cautelas e Empréstimos</h3>
              <p className="text-[11px] text-slate-400">Acompanhe retiradas, prazos e termos assinados</p>
            </div>
          </div>

          {/* Barra de Pesquisa e Filtros na mesma linha */}
          <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
            <div className="relative w-44 sm:w-56 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar recebedor, patrimônio..."
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>

            <div className="flex p-0.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-medium shrink-0">
              <button
                type="button"
                onClick={() => setFilterTab('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${filterTab === 'ALL' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Todos ({cautelas.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('ACTIVE')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${filterTab === 'ACTIVE' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Em Aberto ({cautelas.filter(c => c.status === 'EM_ANDAMENTO').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('RETURNED')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${filterTab === 'RETURNED' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Devolvidos ({cautelas.filter(c => c.status === 'DEVOLVIDO').length})
              </button>
            </div>
          </div>
        </div>

        {/* List of Cautelas */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredCautelas.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Nenhuma cautela encontrada com os filtros atuais.
            </div>
          ) : (
            filteredCautelas.map((cautela) => {
              const isEmAndamento = cautela.status === 'EM_ANDAMENTO';

              return (
                <div
                  key={cautela.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isEmAndamento 
                      ? 'bg-slate-850 border-purple-500/30 shadow-sm' 
                      : 'bg-slate-900/50 border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex flex-row items-stretch justify-between gap-3 mb-1">
                    <div className="flex-1 min-w-0">
                      {/* Linha 1: Patrimônio, Status (sem arredondamento) e Dados de Recebedor / Contato / Previsão */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-mono font-extrabold text-[14px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 shadow-sm shrink-0">
                          {cautela.numeroPatrimonio}
                        </span>

                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-none border uppercase tracking-wider shrink-0 ${
                          isEmAndamento 
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {isEmAndamento ? 'Em Empréstimo' : 'Devolvido'}
                        </span>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 min-w-0 flex-wrap">
                          <div className="flex items-center gap-1 shrink-0">
                            <User className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">Recebedor: <strong className="text-slate-200">{cautela.responsavelRetirada}</strong></span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">Contato: <strong className="text-slate-200">{cautela.telefone || 'N/I'}</strong></span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">Previsão: <strong className="text-amber-300 font-medium">{cautela.dataPrevistaDevolucao}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Linha 2: Descrição do Item */}
                      <h4 className="font-normal text-slate-200 text-[11.9px] leading-snug mt-1.5">{cautela.descricao}</h4>
                    </div>

                    {/* Coluna de ações: separada da descrição por linha pontilhada vertical */}
                    <div className="w-[120px] shrink-0 flex flex-col justify-center gap-2 pl-3 border-l-2 border-dotted border-slate-600">
                      <button
                        onClick={() => handleDownloadPDF(cautela)}
                        title="Baixar Termo em PDF"
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 flex items-center justify-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Termo PDF</span>
                      </button>

                      {isEmAndamento && (
                        <button
                          onClick={() => onReturnCautela(cautela.id, cautela.assetId)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-all whitespace-nowrap cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Devolver Bem</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {cautela.finalidade && (
                    <p className="text-[11px] text-slate-400 mt-2 italic">
                      Finalidade: {cautela.finalidade}
                    </p>
                  )}

                  {cautela.dataDevolucao && (
                    <div className="text-[11px] text-emerald-400 mt-1 font-medium">
                      ✓ Devolvido em {cautela.dataDevolucao}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
