import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Building2, 
  User, 
  MapPin, 
  AlertCircle, 
  Mic, 
  FileText,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { formatLast5Patrimonio } from '../utils/formatters';

export const SolicitacaoCargaModal = ({
  isOpen,
  onClose,
  asset,
  sectors = [],
  currentUser,
  userSector,
  onSubmitPedido
}) => {
  const [destSectorId, setDestSectorId] = useState('');
  const [localizacaoFisica, setLocalizacaoFisica] = useState('');
  const [motivo, setMotivo] = useState('');
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  useEffect(() => {
    if (asset) {
      // Por padrão, sugere o setor do usuário ou o primeiro disponível
      const defaultSecId = userSector?.id || (sectors.find(s => s.id !== asset.setorId)?.id || sectors[0]?.id || '');
      setDestSectorId(defaultSecId);
      
      const targetSec = sectors.find(s => s.id === defaultSecId);
      setLocalizacaoFisica(asset.localizacao || targetSec?.sala || '');
      setMotivo(`Este bem (patrimônio ${formatLast5Patrimonio(asset.numeroPatrimonio)}) é do setor ${targetSec?.name || 'nosso setor'}. Solicito a regularização e transferência da carga.`);
    }
  }, [asset, userSector, sectors]);

  if (!isOpen || !asset) return null;

  const currentSector = sectors.find(s => s.id === asset.setorId) || { name: asset.setorNome, responsavel: asset.responsavel };
  const targetSector = sectors.find(s => s.id === destSectorId) || sectors[0];

  const handleSectorChange = (newSectorId) => {
    setDestSectorId(newSectorId);
    const sec = sectors.find(s => s.id === newSectorId);
    if (sec) {
      setMotivo(`Este bem (patrimônio ${formatLast5Patrimonio(asset.numeroPatrimonio)}) é do setor ${sec.name}. Solicito a regularização e transferência da carga.`);
    }
  };

  // Reconhecimento de Voz para o motivo/observação
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Reconhecimento de voz não suportado neste navegador. Use Google Chrome ou Edge.');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'pt-BR';
      rec.continuous = false;
      rec.interimResults = false;

      setIsListeningVoice(true);

      rec.onresult = (e) => {
        const transcript = e.results[0]?.[0]?.transcript;
        if (transcript) {
          setMotivo(prev => prev ? `${prev} ${transcript}` : transcript);
        }
        setIsListeningVoice(false);
      };

      rec.onerror = () => setIsListeningVoice(false);
      rec.onend = () => setIsListeningVoice(false);

      rec.start();
    } catch (err) {
      console.error(err);
      setIsListeningVoice(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetSector) return;

    onSubmitPedido({
      assetId: asset.id,
      numeroPatrimonio: asset.numeroPatrimonio,
      descricao: asset.descricao,
      setorOrigemId: currentSector.id || asset.setorId,
      setorOrigemNome: currentSector.name,
      responsavelOrigem: currentSector.responsavel,
      setorDestinoId: targetSector.id,
      setorDestinoNome: targetSector.name,
      responsavelDestino: targetSector.responsavel,
      localizacaoFisica: localizacaoFisica.trim() || targetSector.sala || asset.localizacao,
      motivo: motivo.trim() || `Este bem pertence ao setor ${targetSector.name}`,
      solicitanteNome: currentUser?.displayName || currentUser?.email || 'Operador',
      solicitanteEmail: currentUser?.email || '',
      dataSolicitacao: new Date().toLocaleString('pt-BR'),
      status: 'PENDENTE'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                Informar Carga / Fazer Pedido
              </h3>
              <p className="text-xs text-slate-400">
                Informar que este bem localizado pertence a outro departamento
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card do Bem Encontrado */}
        <div className="bg-slate-850 border border-slate-700/80 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between font-mono font-bold text-indigo-300 mb-1">
            <span className="text-lg text-indigo-400">{formatLast5Patrimonio(asset.numeroPatrimonio)}</span>
            <span className="text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-sans">
              Carga oficial atual: {currentSector.name} ({currentSector.responsavel})
            </span>
          </div>
          <p className="font-semibold text-slate-100 text-sm leading-snug">{asset.descricao}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span>Categoria: <strong className="text-slate-300">{asset.categoria}</strong></span>
            {asset.localizacao && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                {asset.localizacao}
              </span>
            )}
          </div>
        </div>

        {/* Formulário de Pedido */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Selecionar o setor a que o bem pertence */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Informar que este bem pertence ao setor: *</span>
            </label>
            <select
              value={destSectorId}
              onChange={(e) => handleSectorChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-amber-400"
              required
            >
              {sectors.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} - Responsável: {s.responsavel}
                </option>
              ))}
            </select>
          </div>

          {/* Onde o bem está localizado fisicamente agora */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Onde o bem está fisicamente agora?</span>
            </label>
            <input
              type="text"
              value={localizacaoFisica}
              onChange={(e) => setLocalizacaoFisica(e.target.value)}
              placeholder="Ex: Está na Sala de Reuniões, Mesa 03"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Justificativa / Mensagem do Pedido com Microfone de Voz */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Mensagem do Pedido / Justificativa:</span>
              </label>
              
              <button
                type="button"
                onClick={handleVoiceInput}
                title="Ditar justificativa por voz"
                className={`text-xs px-2 py-0.5 rounded-lg border flex items-center gap-1 cursor-pointer transition-all ${
                  isListeningVoice 
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse' 
                    : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isListeningVoice ? 'Ouvindo...' : 'Falar por Voz'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Este monitor (patrimônio) é do setor X. Foi encontrado aqui e solicitamos a transferência de carga."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-400 leading-relaxed"
              required
            />
          </div>

          {/* Informações do Solicitante */}
          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <span>Solicitante: <strong className="text-slate-200">{currentUser?.displayName || currentUser?.email || 'Operador'}</strong></span>
            </div>
            <span className="text-[11px] text-amber-400">Notificação enviada ao Administrador</span>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Pedido de Carga</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
