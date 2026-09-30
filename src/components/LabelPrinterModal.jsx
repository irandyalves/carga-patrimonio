import React, { useState } from 'react';
import { X, Printer, QrCode, CheckSquare, Square, Download, Sparkles } from 'lucide-react';
import { generateLabelsPDF } from '../services/pdfGenerator';

export const LabelPrinterModal = ({
  isOpen,
  onClose,
  assets = [],
  activeSector
}) => {
  const [selectedIds, setSelectedIds] = useState(assets.map(a => a.id));
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleToggleSelectAll = () => {
    if (selectedIds.length === assets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assets.map(a => a.id));
    }
  };

  const handleToggleId = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handlePrintLabels = async () => {
    const assetsToPrint = assets.filter(a => selectedIds.includes(a.id));
    if (!assetsToPrint.length) {
      alert('Selecione ao menos um patrimônio para gerar as etiquetas.');
      return;
    }

    setIsGenerating(true);
    try {
      await generateLabelsPDF(assetsToPrint);
    } catch (err) {
      console.error('Error printing labels:', err);
      alert('Erro ao gerar PDF de etiquetas.');
    }
    setIsGenerating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Impressor de Etiquetas de Patrimônio</h3>
              <p className="text-xs text-slate-400">Geração de etiquetas em Folha A4 com QR Code escaneável</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between bg-slate-850 p-3 rounded-2xl border border-slate-800 mb-4 shrink-0">
          <button
            onClick={handleToggleSelectAll}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
          >
            {selectedIds.length === assets.length ? (
              <>
                <CheckSquare className="w-4 h-4" />
                <span>Desmarcar Todos</span>
              </>
            ) : (
              <>
                <Square className="w-4 h-4" />
                <span>Selecionar Todos ({assets.length})</span>
              </>
            )}
          </button>

          <span className="text-xs text-slate-400">
            <strong className="text-white">{selectedIds.length}</strong> etiquetas selecionadas
          </span>
        </div>

        {/* Assets List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {assets.map((asset) => {
            const isSelected = selectedIds.includes(asset.id);

            return (
              <div
                key={asset.id}
                onClick={() => handleToggleId(asset.id)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-slate-800/90 border-cyan-500/40 text-white' 
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="text-cyan-400">
                    {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                  </div>

                  <span className="font-mono font-bold text-xs bg-slate-950 px-2 py-1 rounded text-cyan-300 border border-slate-800">
                    {asset.numeroPatrimonio}
                  </span>

                  <span className="text-xs font-medium truncate">{asset.descricao}</span>
                </div>

                <span className="text-[11px] text-slate-500 hidden sm:block shrink-0">
                  {asset.setorNome}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-800 flex gap-3 shrink-0 mt-4">
          <button
            onClick={handlePrintLabels}
            disabled={isGenerating || selectedIds.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Gerando PDF...' : `Gerar PDF com ${selectedIds.length} Etiquetas`}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
