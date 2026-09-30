import React, { useState } from 'react';
import { 
  X, 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Controle de Empréstimos & Cautelas</h3>
              <p className="text-xs text-slate-400">Acompanhe retiradas, prazos de devolução e termos assinados</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-4 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por recebedor, patrimônio ou setor..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filterTab === 'ALL' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Todos ({cautelas.length})
            </button>
            <button
              onClick={() => setFilterTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filterTab === 'ACTIVE' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Em Aberto ({cautelas.filter(c => c.status === 'EM_ANDAMENTO').length})
            </button>
            <button
              onClick={() => setFilterTab('RETURNED')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filterTab === 'RETURNED' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Devolvidos ({cautelas.filter(c => c.status === 'DEVOLVIDO').length})
            </button>
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
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-indigo-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {cautela.numeroPatrimonio}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          isEmAndamento 
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {isEmAndamento ? 'Em Empréstimo' : 'Devolvido'}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-200 text-sm mt-1">{cautela.descricao}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadPDF(cautela)}
                        title="Baixar Termo em PDF"
                        className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Termo PDF</span>
                      </button>

                      {isEmAndamento && (
                        <button
                          onClick={() => onReturnCautela(cautela.id, cautela.assetId)}
                          className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Devolver Bem</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 mt-2">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">Recebedor: <strong className="text-slate-200">{cautela.responsavelRetirada}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">Contato: <strong className="text-slate-200">{cautela.telefone || 'N/I'}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">Previsão: <strong className="text-amber-300">{cautela.dataPrevistaDevolucao}</strong></span>
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
