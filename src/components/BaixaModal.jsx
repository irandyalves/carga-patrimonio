import React, { useState } from 'react';
import { X, Archive, UploadCloud, FileText, Trash2, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { uploadFileAttachment } from '../services/firebase';
import { formatPatrimonio } from '../utils/formatters';

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

  const formattedXX = formatPatrimonio(asset.numeroPatrimonio);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl relative max-h-[96vh] flex flex-col justify-between">
        
        {/* Botão Fechar no Topo */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors z-10 cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Selected Asset Box no Topo (com borda no patrimônio, descrição 2 linhas com ...) */}
        <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-3 mb-2.5 text-xs pr-11">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-lg sm:text-xl font-black font-mono text-rose-300 tracking-wider px-2 py-0.5 rounded-lg border border-rose-500/40 bg-rose-500/10 inline-block shadow-sm">
              {formattedXX}
            </span>
            <span className="text-xs sm:text-sm font-black uppercase text-slate-300 tracking-wide text-right">
              {asset.setorNome || 'Sem Setor'}
            </span>
          </div>
          <p className="font-semibold text-slate-200 text-xs sm:text-sm leading-snug line-clamp-2">
            {asset.descricao}
          </p>
        </div>

        {/* Form Compacto */}
        <form onSubmit={handleSubmit} className="space-y-2.5 text-left">
          
          {/* Motivo */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Motivo Principal da Baixa <span className="text-rose-400">*</span>
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500/50 cursor-pointer"
            >
              {MOTIVOS_BAIXA.map((m, idx) => (
                <option key={idx} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Observações / Anotações */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Observações, Justificativa e Parecer Técnico <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Descreva detalhes, nº de processo, laudo técnico ou destinação..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500/50 resize-none placeholder-slate-500"
            />
          </div>

          {/* Attachments Compacto (Ícone Upload à esquerda, linha única) */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-300">Documentos Comprobatórios</span>
              {isUploading && <span className="text-indigo-400 text-[10px] animate-pulse">Enviando...</span>}
            </div>

            {/* Drop / Upload zone compacta em linha */}
            <label className="border border-dashed border-slate-700 hover:border-rose-400/60 bg-slate-900/80 hover:bg-slate-850 rounded-xl px-3 py-2 flex items-center gap-2.5 cursor-pointer transition-colors">
              <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0 flex items-center justify-center">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">Clique para anexar arquivos</div>
                <div className="text-[9px] text-slate-500 truncate">PDF, DOCX, XLSX, PNG, JPG</div>
              </div>
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
              <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                {anexos.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-800 px-2.5 py-1 rounded-lg text-xs border border-slate-700">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="text-slate-200 truncate text-[11px]">{file.nome}</span>
                      <span className="text-[9px] text-slate-400">({file.tamanho})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-slate-400 hover:text-rose-400 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warning Compacto */}
          <div className="flex items-center gap-2 text-[10px] text-rose-300 bg-rose-950/25 border border-rose-800/30 px-2.5 py-1.5 rounded-xl">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="leading-tight">
              A baixa retira o bem do balanço ativo do setor. O histórico e documentos ficarão salvos permanentemente.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-1 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Confirmar Baixa do Patrimônio</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

