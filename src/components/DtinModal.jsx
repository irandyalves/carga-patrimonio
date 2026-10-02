import React, { useState } from 'react';
import { X, Server, UploadCloud, FileText, Trash2, Send } from 'lucide-react';
import { uploadFileAttachment } from '../services/firebase';
import { formatPatrimonio } from '../utils/formatters';

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

  const formattedXX = formatPatrimonio(asset.numeroPatrimonio);

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

        {/* Selected Asset Box no Topo (sem cabeçalho extra, patrimônio 100% maior com borda, setor maiúsculo bold) */}
        <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-2xl p-3 mb-2.5 text-xs pr-11">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-cyan-300 tracking-wider px-2 py-0.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 inline-block shadow-sm">
              {formattedXX}
            </span>
            <span className="text-xs sm:text-sm font-black uppercase text-slate-300 tracking-wide text-right">
              {asset.setorNome || 'Sem Setor'}
            </span>
          </div>
          <p className="font-semibold text-slate-200 text-xs sm:text-sm leading-snug line-clamp-2">
            {asset.descricao}
          </p>
          {asset.numeroSerie && (
            <p className="text-[10px] text-cyan-400/80 mt-1 font-mono">S/N: {asset.numeroSerie}</p>
          )}
        </div>

        {/* Form Compacto */}
        <form onSubmit={handleSubmit} className="space-y-2.5 text-left">
          
          {/* Motivo do Envio */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Finalidade / Motivo do Envio ao DTIN <span className="text-cyan-400">*</span>
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
            >
              {MOTIVOS_DTIN.map((m, idx) => (
                <option key={idx} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Grid: Chamado / O.S. & Data de Envio & Responsável em Grid Compacto */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Nº Chamado / O.S. <span className="text-[10px] text-slate-500 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                value={chamado}
                onChange={(e) => setChamado(e.target.value)}
                placeholder="Ex: INC-2026 / OS 123"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-mono placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Data do Envio <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={dataEnvio}
                onChange={(e) => setDataEnvio(e.target.value)}
                placeholder="DD/MM/AAAA"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          {/* Responsável / Solicitante */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Responsável pelo Envio / Solicitante
            </label>
            <input
              type="text"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Nome do operador ou responsável do setor"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-600"
            />
          </div>

          {/* Observações / Descrição do Problema */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Observações / Defeito Constatado <span className="text-cyan-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Descreva o problema constatado, peças a serem instaladas..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none placeholder-slate-500"
            />
          </div>

          {/* Attachments Compacto (Ícone Upload à esquerda, linha única) */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-300">Anexar Documento / Guia</span>
              {isUploading && <span className="text-cyan-400 text-[10px] animate-pulse">Enviando...</span>}
            </div>

            {/* Drop / Upload zone compacta em linha */}
            <label className="border border-dashed border-slate-700 hover:border-cyan-400/60 bg-slate-900/80 hover:bg-slate-850 rounded-xl px-3 py-2 flex items-center gap-2.5 cursor-pointer transition-colors">
              <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0 flex items-center justify-center">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">Clique para anexar documento ou laudo</div>
                <div className="text-[9px] text-slate-500 truncate">PDF, DOCX, XLSX, PNG, JPG (Comprovante / Guia)</div>
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
                      <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
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
              className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirmar Envio ao DTIN</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
