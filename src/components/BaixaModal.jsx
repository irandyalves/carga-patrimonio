import React, { useState } from 'react';
import { X, Archive, UploadCloud, FileText, Trash2, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { uploadFileAttachment } from '../services/firebase';

const MOTIVOS_BAIXA = [
  'Quebra / Custo de reparo antieconômico',
  'Obsolescência / Defasagem tecnológica',
  'Doação Institucional / Cessão de Uso',
  'Alienação por Leilão Público',
  'Extravio / Furto / Roubo (com BO)',
  'Descarte Ecológico e Reciclagem',
  'Outros motivos justificados'
];

export const BaixaModal = ({
  isOpen,
  onClose,
  asset,
  onConfirmBaixa
}) => {
  const [motivo, setMotivo] = useState(MOTIVOS_BAIXA[0]);
  const [observacoes, setObservacoes] = useState('');
  const [anexos, setAnexos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !asset) return null;

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(file => uploadFileAttachment(file));
      const uploadedDocs = await Promise.all(uploadPromises);
      setAnexos(prev => [...prev, ...uploadedDocs]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erro ao anexar arquivo.');
    }
    setIsUploading(false);
  };

  const handleRemoveAttachment = (index) => {
    setAnexos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!observacoes.trim()) {
      alert('Por favor, informe a justificativa e observação detalhada da baixa.');
      return;
    }

    const dadosBaixa = {
      data: new Date().toLocaleString('pt-BR'),
      motivo,
      observacoes,
      anexos
    };

    onConfirmBaixa(asset.id, dadosBaixa);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Processo de Baixa Patrimonial</h3>
              <p className="text-xs text-slate-400">Desincorporação oficial e anexo de documentos comprobatórios</p>
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
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-3.5 mb-4 text-xs">
          <div className="flex items-center justify-between font-mono font-bold text-rose-300 mb-1">
            <span>{asset.numeroPatrimonio}</span>
            <span className="text-slate-400 font-sans font-normal">{asset.setorNome}</span>
          </div>
          <p className="font-semibold text-slate-200 text-sm">{asset.descricao}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Motivo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Motivo Principal da Baixa *
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            >
              {MOTIVOS_BAIXA.map((m, idx) => (
                <option key={idx} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Observações / Anotações */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observações, Justificativa e Parecer Técnico *
            </label>
            <textarea
              required
              rows={4}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Descreva detalhadamente a razão da baixa, número de processo administrativo, laudo técnico ou destinação do item..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>

          {/* Attachments (PDF, Word, Excel, Imagens) */}
          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span>Documentos Comprobatórios (PDF, Word, Excel, Fotos)</span>
              {isUploading && <span className="text-indigo-400 text-[11px] animate-pulse">Enviando arquivos...</span>}
            </label>

            {/* Drop / Upload zone */}
            <label className="border-2 border-dashed border-slate-700 hover:border-slate-500 bg-slate-900/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
              <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
              <span className="text-xs font-medium text-slate-200">Clique para selecionar arquivos</span>
              <span className="text-[10px] text-slate-500">PDF, DOCX, XLSX, PNG, JPG (Armazenados no Firebase Storage)</span>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Attachment List */}
            {anexos.length > 0 && (
              <div className="mt-3 space-y-2">
                {anexos.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-800 px-3 py-2 rounded-xl text-xs border border-slate-700">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-slate-200 truncate">{file.nome}</span>
                      <span className="text-[10px] text-slate-400">({file.tamanho})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 text-[11px] text-rose-300 bg-rose-950/30 border border-rose-800/40 p-3 rounded-xl">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              A baixa patrimonial é um ato oficial que retira o bem do balanço ativo do setor. O histórico e os documentos ficarão registrados permanentemente.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-800 flex gap-3">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Archive className="w-4 h-4" />
              <span>Confirmar Baixa do Patrimônio</span>
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
