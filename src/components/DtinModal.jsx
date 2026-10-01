import React, { useState } from 'react';
import { X, Server, UploadCloud, FileText, Trash2, CheckCircle2, Laptop, Send } from 'lucide-react';
import { uploadFileAttachment } from '../services/firebase';

const MOTIVOS_DTIN = [
  'Manutenção Corretiva / Reparo Técnico',
  'Troca de Peça / Upgrade (Memória RAM, SSD)',
  'Instalação e Configuração de Software / Sistema',
  'Laudo Técnico de Defeito / Inviabilidade',
  'Substituição por Novo Equipamento',
  'Remanejamento / Devolução ao Parque Tecnológico',
  'Outros Serviços de TI'
];

export const DtinModal = ({
  isOpen,
  onClose,
  asset,
  onConfirmDtin,
  currentUserName
}) => {
  const [motivo, setMotivo] = useState(MOTIVOS_DTIN[0]);
  const [chamado, setChamado] = useState('');
  const [dataEnvio, setDataEnvio] = useState(() => new Date().toLocaleDateString('pt-BR'));
  const [responsavel, setResponsavel] = useState(currentUserName || '');
  const [observacoes, setObservacoes] = useState('');
  const [anexos, setAnexos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !asset) return null;

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(file => uploadFileAttachment(file, 'documentos_dtin'));
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
      alert('Por favor, informe a descrição do serviço / observações para o DTIN.');
      return;
    }

    const dadosDtin = {
      data: dataEnvio || new Date().toLocaleDateString('pt-BR'),
      motivo,
      chamado: chamado.trim(),
      responsavel: responsavel.trim() || currentUserName || 'Responsável',
      observacoes: observacoes.trim(),
      anexos
    };

    onConfirmDtin(asset.id, dadosDtin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Enviar Equipamento ao DTIN</h3>
              <p className="text-xs text-slate-400">Diretoria / Departamento de Tecnologia da Informação</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Asset Header Box */}
        <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-3.5 mb-4 text-xs">
          <div className="flex items-center justify-between font-mono font-bold text-cyan-300 mb-1">
            <span>Patrimônio: {asset.numeroPatrimonio}</span>
            <span className="text-slate-400 font-sans font-normal">{asset.setorNome}</span>
          </div>
          <p className="font-semibold text-slate-200 text-sm">{asset.descricao}</p>
          {asset.numeroSerie && (
            <p className="text-[11px] text-slate-400 mt-1 font-mono">S/N: {asset.numeroSerie}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Motivo do Envio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Finalidade / Motivo do Envio ao DTIN *
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {MOTIVOS_DTIN.map((m, idx) => (
                <option key={idx} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Grid: Chamado / O.S. & Data de Envio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nº de Chamado / O.S. (Opcional)
              </label>
              <input
                type="text"
                value={chamado}
                onChange={(e) => setChamado(e.target.value)}
                placeholder="Ex: INC-2026-0894 ou OS #123"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data do Envio *
              </label>
              <input
                type="text"
                value={dataEnvio}
                onChange={(e) => setDataEnvio(e.target.value)}
                placeholder="DD/MM/AAAA"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          {/* Responsável / Solicitante */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Responsável pelo Envio / Solicitante
            </label>
            <input
              type="text"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Nome do operador ou responsável do setor"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* Observações / Descrição do Problema */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observações, Descrição do Defeito ou Procedimento *
            </label>
            <textarea
              required
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Descreva o problema constatado, peças a serem instaladas, histórico do equipamento..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* Attachments (PDF, Word, Fotos) */}
          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span>Anexar Documento / Guia de Remessa / O.S. (PDF, Word, Imagens)</span>
              {isUploading && <span className="text-cyan-400 text-[11px] animate-pulse">Enviando arquivos...</span>}
            </label>

            {/* Drop / Upload zone */}
            <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-900/50 rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
              <UploadCloud className="w-7 h-7 text-cyan-400/80 mb-1" />
              <span className="text-xs font-medium text-slate-200">Clique para anexar documento ou laudo</span>
              <span className="text-[10px] text-slate-500">PDF, DOCX, Imagens (Comprovante / Guia de Remessa)</span>
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
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-slate-200 truncate">{file.nome}</span>
                      <span className="text-[10px] text-slate-400">({file.tamanho})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-800 flex gap-3">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Confirmar Envio ao DTIN</span>
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
