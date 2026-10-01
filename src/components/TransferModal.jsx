import React, { useState } from 'react';
import { X, ArrowRightLeft, Building2, User, MapPin, CheckCircle2 } from 'lucide-react';

export const TransferModal = ({
  isOpen,
  onClose,
  asset,
  sectors = [],
  onConfirmTransfer
}) => {
  const [destSectorId, setDestSectorId] = useState('');
  const [novaLocalizacao, setNovaLocalizacao] = useState('');
  const [motivoTransferencia, setMotivoTransferencia] = useState('');

  if (!isOpen || !asset) return null;

  const currentSector = sectors.find(s => s.id === asset.setorId) || { name: asset.setorNome, responsavel: asset.responsavel };
  const targetSector = sectors.find(s => s.id === (destSectorId || sectors[0]?.id));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetSector) return;

    onConfirmTransfer(asset.id, {
      setorId: targetSector.id,
      setorNome: targetSector.name,
      responsavel: targetSector.responsavel,
      localizacao: novaLocalizacao.trim() || targetSector.sala || asset.localizacao,
      motivo: motivoTransferencia.trim() || 'Transferência de carga entre setores'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Transferência de Carga</h3>
              <p className="text-xs text-slate-400">Transferir guarda e responsabilidade patrimonial</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Asset Header Box */}
        <div className="bg-slate-850 border border-slate-700/80 rounded-2xl p-3.5 mb-4 text-xs">
          <div className="flex items-center justify-between font-mono font-bold text-indigo-300 mb-1">
            <span>{asset.numeroPatrimonio}</span>
            <span className="text-slate-400 font-sans font-normal">Origem: {currentSector.name}</span>
          </div>
          <p className="font-semibold text-slate-200 text-sm">{asset.descricao}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Target Sector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              Setor de Destino (Novo Proprietário da Carga) *
            </label>
            <select
              value={destSectorId || (sectors[0]?.id || '')}
              onChange={(e) => {
                setDestSectorId(e.target.value);
                const s = sectors.find(sec => sec.id === e.target.value);
                if (s) setNovaLocalizacao(s.sala || '');
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              {sectors.map(s => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-emerald-400 font-semibold py-1">
                  🏢 {s.name} — Resp: {s.responsavel}
                </option>
              ))}
            </select>
          </div>

          {/* New Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Nova Localização Física (Sala / Bloco / Mesa)
            </label>
            <input
              type="text"
              value={novaLocalizacao}
              onChange={(e) => setNovaLocalizacao(e.target.value)}
              placeholder="Ex: Bloco B - Sala 204"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Transfer Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Motivo ou Despacho da Transferência
            </label>
            <input
              type="text"
              value={motivoTransferencia}
              onChange={(e) => setMotivoTransferencia(e.target.value)}
              placeholder="Ex: Remanejamento de pessoal, abertura de novo setor..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex gap-2.5">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Confirmar Transferência</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
