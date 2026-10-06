import React, { useState, useEffect } from 'react';
import { X, Handshake, Calendar, User, Phone, FileText, Download, CheckCircle } from 'lucide-react';
import { generateCautelaPDF } from '../services/pdfGenerator';
import { formatLast5Patrimonio } from '../utils/formatters';

export const CautelaModal = ({
  isOpen,
  onClose,
  asset,
  sectors = [],
  onSaveCautela,
  initialResponsavel = '',
  initialTelefone = ''
}) => {
  const [formData, setFormData] = useState({
    responsavelRetirada: '',
    documento: '',
    telefone: '',
    setorDestino: 'ASCOM',
    dataRetirada: new Date().toISOString().slice(0, 16).replace('T', ' '),
    dataPrevistaDevolucao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' '),
    finalidade: '',
    observacoes: ''
  });

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Pré-preenche nome e contato vindos do botão 'Cautelar item' da barra de seleção
  useEffect(() => {
    if (isOpen && asset) {
      setFormData(prev => ({ ...prev, responsavelRetirada: initialResponsavel || '', telefone: initialTelefone || '' }));
    }
  }, [isOpen, asset?.id, initialResponsavel, initialTelefone]);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.responsavelRetirada) return;

    const newCautela = {
      id: `caut-${Date.now().toString().slice(-4)}`,
      assetId: asset.id,
      numeroPatrimonio: asset.numeroPatrimonio,
      descricao: asset.descricao,
      responsavelRetirada: formData.responsavelRetirada,
      documento: formData.documento,
      telefone: formData.telefone,
      setorOrigem: asset.setorNome,
      setorDestino: formData.setorDestino,
      dataRetirada: formData.dataRetirada,
      dataPrevistaDevolucao: formData.dataPrevistaDevolucao,
      finalidade: formData.finalidade,
      observacoes: formData.observacoes,
      status: 'EM_ANDAMENTO',
      dataDevolucao: null,
      condicaoDevolucao: null
    };

    // Generate and download Termo PDF
    setIsGeneratingPdf(true);
    try {
      await generateCautelaPDF(newCautela, asset);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
    setIsGeneratingPdf(false);

    onSaveCautela(newCautela, asset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal aumentado em 15% (max-w-2xl) */}
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header (Sem o subtítulo de geração de termo) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg tracking-tight">Emissão de Cautela / Empréstimo</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Asset Header Box: Nr Patrimônio à esquerda e grande + Descrição do bem e Origem */}
        <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 mb-4 flex items-center gap-4 shadow-sm">
          {/* Nr Patrimônio à esquerda e grande */}
          <div className="shrink-0 flex flex-col items-center justify-center bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-xl shadow-inner min-w-[130px]">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Patrimônio</span>
            <span className="font-mono text-2xl sm:text-3xl font-black text-indigo-400 tracking-tight">
              {formatLast5Patrimonio(asset.numeroPatrimonio)}
            </span>
          </div>

          {/* Grande descrição do bem e a origem */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-base sm:text-lg leading-snug mb-1.5">
              {asset.descricao}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold">
                Origem: <strong className="text-white">{asset.setorNome}</strong> {asset.responsavel ? `(${asset.responsavel})` : ''}
              </span>
              {asset.localizacao && (
                <span className="text-slate-400">
                  • {asset.localizacao}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Borrower Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-purple-400" />
                Nome do Recebedor (Cautelado) *
              </label>
              <input
                type="text"
                required
                value={formData.responsavelRetirada}
                onChange={(e) => setFormData({ ...formData, responsavelRetirada: e.target.value })}
                placeholder="Ex: Lucas Rocha"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Document / Matricula */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Documento / Matrícula
              </label>
              <input
                type="text"
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                placeholder="Ex: MG-14.882.102 / MAT-409"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Phone / Whatsapp */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(11) 98765-4321"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Destination Sector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Setor de Destino / Aplicação *
              </label>
              <select
                value={formData.setorDestino}
                onChange={(e) => setFormData({ ...formData, setorDestino: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              >
                <option value="ASCOM" className="bg-slate-900 text-emerald-400 font-semibold">🏢 ASCOM (Assessoria de Comunicação)</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.name} className="bg-slate-900 text-emerald-400 font-semibold">🏢 {s.name}</option>
                ))}
                <option value="Gabinete" className="bg-slate-900 text-slate-300">Gabinete</option>
                <option value="Cerimonial" className="bg-slate-900 text-slate-300">Cerimonial</option>
                <option value="Evento Externo" className="bg-slate-900 text-slate-300">Evento Externo</option>
                <option value="Manutenção" className="bg-slate-900 text-slate-300">Manutenção Especializada</option>
              </select>
            </div>

            {/* Departure Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data / Hora da Retirada
              </label>
              <input
                type="text"
                value={formData.dataRetirada}
                onChange={(e) => setFormData({ ...formData, dataRetirada: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Return Expected Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Previsão de Devolução *
              </label>
              <input
                type="text"
                required
                value={formData.dataPrevistaDevolucao}
                onChange={(e) => setFormData({ ...formData, dataPrevistaDevolucao: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Finalidade do Empréstimo
            </label>
            <input
              type="text"
              value={formData.finalidade}
              onChange={(e) => setFormData({ ...formData, finalidade: e.target.value })}
              placeholder="Ex: Treinamento interno, evento externo, uso temporário..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Accessories & Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observações e Acessórios Entregues
            </label>
            <textarea
              rows={2}
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Ex: Entregue com cabo de energia, fonte e case de transporte em bom estado."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex gap-3">
            <button
              type="submit"
              disabled={isGeneratingPdf}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Handshake className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Registrando...' : 'Confirmar Cautela / Empréstimo'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
