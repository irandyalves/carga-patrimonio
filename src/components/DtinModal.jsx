import React, { useState, useMemo } from 'react';
import { 
  X, 
  Server, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Send, 
  Search, 
  Plus, 
  Laptop, 
  Building2, 
  Check, 
  AlertCircle,
  Hash
} from 'lucide-react';
import { uploadFileAttachment } from '../services/firebase';
import { formatPatrimonio, formatLast5Patrimonio } from '../utils/formatters';
import { matchesAsset } from '../utils/searchUtils';

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
  asset = null,
  assets = [],
  sectors = [],
  defaultSectorId = '',
  onConfirmDtin,
  currentUserName
}) => {
  // Modo de seleção de bem quando não fornecido previamente: 'EXISTING' (pesquisar) ou 'NEW' (cadastrar novo)
  const [selectionMode, setSelectionMode] = useState('EXISTING');
  const [selectedAsset, setSelectedAsset] = useState(asset);
  const [searchQuery, setSearchQuery] = useState('');

  // Formulário de Novo Equipamento (fora da carga inicial)
  const [newPatrimonio, setNewPatrimonio] = useState('');
  const [newDescricao, setNewDescricao] = useState('');
  const [newSetorId, setNewSetorId] = useState(defaultSectorId || (sectors[0]?.id || 'sec-ti'));
  const [newResponsavel, setNewResponsavel] = useState('');
  const [newNumeroSerie, setNewNumeroSerie] = useState('');
  const [newLocalizacao, setNewLocalizacao] = useState('');

  // Formulário do Envio ao DTIN
  const [motivo, setMotivo] = useState(MOTIVOS_DTIN[0]);
  const [chamado, setChamado] = useState('');
  const [dataEnvio, setDataEnvio] = useState(() => new Date().toLocaleDateString('pt-BR'));
  const [responsavel, setResponsavel] = useState(currentUserName || '');
  const [observacoes, setObservacoes] = useState('');
  const [anexos, setAnexos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Sincroniza quando asset prop mudar
  React.useEffect(() => {
    setSelectedAsset(asset);
    if (!asset) {
      setSelectionMode('EXISTING');
      setSearchQuery('');
      setNewPatrimonio('');
      setNewDescricao('');
      setNewNumeroSerie('');
      setNewLocalizacao('');
    }
  }, [asset, isOpen]);

  // Atualiza responsável padrão quando muda o setor selecionado no novo cadastro
  React.useEffect(() => {
    const sec = sectors.find(s => s.id === newSetorId);
    if (sec && sec.responsavel) {
      setNewResponsavel(sec.responsavel);
    }
  }, [newSetorId, sectors]);

  // Lista filtrada de bens existentes para seleção
  const filteredExistingAssets = useMemo(() => {
    if (!searchQuery.trim()) return assets.slice(0, 15);
    return assets.filter(a => matchesAsset(a, searchQuery)).slice(0, 25);
  }, [assets, searchQuery]);

  if (!isOpen) return null;

  const targetAsset = asset || selectedAsset;
  const isCreatingNew = !asset && selectionMode === 'NEW';

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

    // Validações para Novo Bem
    if (isCreatingNew) {
      if (!newPatrimonio.trim()) {
        alert('Por favor, informe o número do patrimônio do equipamento.');
        return;
      }
      if (!newDescricao.trim()) {
        alert('Por favor, informe a descrição do equipamento (ex: Microcomputador Dell OptiPlex).');
        return;
      }
    } else if (!targetAsset) {
      alert('Por favor, selecione ou cadastre o equipamento que será enviado para a DTIN.');
      return;
    }

    if (!observacoes.trim()) {
      alert('Por favor, informe a descrição do serviço / observações para a DTIN.');
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

    if (isCreatingNew) {
      const targetSec = sectors.find(s => s.id === newSetorId) || sectors[0];
      const newAssetData = {
        numeroPatrimonio: newPatrimonio.trim(),
        descricao: newDescricao.trim(),
        setorId: targetSec?.id || 'sec-ti',
        setorNome: targetSec?.name || 'TI',
        responsavel: newResponsavel.trim() || targetSec?.responsavel || 'Responsável',
        numeroSerie: newNumeroSerie.trim(),
        localizacao: newLocalizacao.trim()
      };
      onConfirmDtin(null, dadosDtin, newAssetData);
    } else {
      onConfirmDtin(targetAsset.id, dadosDtin, null);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl relative max-h-[96vh] flex flex-col justify-between overflow-hidden">
        
        {/* Botão Fechar no Topo */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors z-10 cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabeçalho do Modal */}
        <div className="flex items-center gap-2.5 pb-2.5 mb-2 border-b border-slate-800 pr-10">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">
              Envio de Equipamento para a DTIN
            </h2>
            <p className="text-[11px] text-slate-400">
              Diretoria de Tecnologia da Informação (Manutenção, reparos e laudos)
            </p>
          </div>
        </div>

        {/* Se não houver bem pré-selecionado, oferece abas de pesquisa ou cadastro de novo bem */}
        {!asset && (
          <div className="mb-3 space-y-2.5">
            {/* Abas Alternadoras */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectionMode('EXISTING');
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectionMode === 'EXISTING'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Pesquisar na Carga</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectionMode('NEW');
                  setSelectedAsset(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectionMode === 'NEW'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cadastrar Novo Equipamento</span>
              </button>
            </div>

            {/* Modo 1: Pesquisa de Bem Existente */}
            {selectionMode === 'EXISTING' && !selectedAsset && (
              <div className="space-y-2 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Digite o número de patrimônio, modelo ou descrição..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    autoFocus
                  />
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 scrollbar-thin pr-1">
                  {filteredExistingAssets.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Nenhum equipamento encontrado com "{searchQuery}".
                    </div>
                  ) : (
                    filteredExistingAssets.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelectedAsset(a)}
                        className="w-full text-left p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-2 group cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-cyan-300">
                              {formatLast5Patrimonio(a.numeroPatrimonio)}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                              {a.setorNome || 'Sem Setor'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 truncate group-hover:text-cyan-200">
                            {a.descricao}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          Selecionar →
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Modo 2: Formulário para Cadastrar Novo Equipamento (Fora da carga) */}
            {selectionMode === 'NEW' && (
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-3 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-1">
                  <Laptop className="w-4 h-4 shrink-0" />
                  <span>Dados do Equipamento a Cadastrar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-300 mb-0.5">
                      Nº Patrimônio <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newPatrimonio}
                      onChange={(e) => setNewPatrimonio(e.target.value)}
                      placeholder="Ex: 42.542 ou 42542"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-300 mb-0.5">
                      Setor de Origem <span className="text-emerald-400">*</span>
                    </label>
                    <select
                      value={newSetorId}
                      onChange={(e) => setNewSetorId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      {sectors.map((sec) => (
                        <option key={sec.id} value={sec.id}>{sec.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-300 mb-0.5">
                    Descrição do Equipamento <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newDescricao}
                    onChange={(e) => setNewDescricao(e.target.value)}
                    placeholder="Ex: Microcomputador Dell OptiPlex 7070 com monitor e teclado"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                      Nº de Série / S/N (Opcional)
                    </label>
                    <input
                      type="text"
                      value={newNumeroSerie}
                      onChange={(e) => setNewNumeroSerie(e.target.value)}
                      placeholder="Ex: 8X9Q2Y1"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                      Responsável
                    </label>
                    <input
                      type="text"
                      value={newResponsavel}
                      onChange={(e) => setNewResponsavel(e.target.value)}
                      placeholder="Nome do responsável"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected Asset Box (quando já definido) */}
        {targetAsset && (
          <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-2xl p-2.5 mb-2 text-xs relative">
            {!asset && (
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="absolute top-2 right-2 text-[10px] font-bold text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
              >
                Trocar bem
              </button>
            )}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base sm:text-lg font-black font-mono text-cyan-300 px-2 py-0.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 shadow-sm">
                {formatPatrimonio(targetAsset.numeroPatrimonio)}
              </span>
              <span className="text-xs font-black uppercase text-slate-300 tracking-wide">
                {targetAsset.setorNome || 'Sem Setor'}
              </span>
            </div>
            <p className="font-semibold text-slate-200 text-xs leading-snug line-clamp-2">
              {targetAsset.descricao}
            </p>
            {targetAsset.numeroSerie && (
              <p className="text-[10px] text-cyan-400/80 mt-0.5 font-mono">S/N: {targetAsset.numeroSerie}</p>
            )}
          </div>
        )}

        {/* Form dos Dados de Envio ao DTIN */}
        <form onSubmit={handleSubmit} className="space-y-2 text-left flex-1 overflow-y-auto pr-1">
          
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

          {/* Grid: Chamado / O.S. & Data de Envio */}
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

          {/* Observações / Defeito Constatado */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Observações / Defeito Constatado <span className="text-cyan-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Descreva o defeito, peças a serem instaladas ou serviços solicitados..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none placeholder-slate-500"
            />
          </div>

          {/* Attachments Compacto */}
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-300">Anexar Documento / Guia</span>
              {isUploading && <span className="text-cyan-400 text-[10px] animate-pulse">Enviando...</span>}
            </div>

            <label className="border border-dashed border-slate-700 hover:border-cyan-400/60 bg-slate-900/80 hover:bg-slate-850 rounded-xl px-2.5 py-1.5 flex items-center gap-2 cursor-pointer transition-colors">
              <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0 flex items-center justify-center">
                <UploadCloud className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-slate-200 truncate">Clique para anexar comprovante ou laudo</div>
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

            {anexos.length > 0 && (
              <div className="mt-1.5 space-y-1 max-h-16 overflow-y-auto">
                {anexos.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-800 px-2 py-0.5 rounded-lg text-xs border border-slate-700">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileText className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="text-slate-200 truncate text-[10.5px]">{file.nome}</span>
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
          <div className="pt-2 flex gap-2">
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
              <span>{isCreatingNew ? 'Cadastrar e Enviar ao DTIN' : 'Confirmar Envio ao DTIN'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
