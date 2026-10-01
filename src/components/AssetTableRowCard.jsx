import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Handshake, 
  Archive, 
  Printer, 
  Edit3, 
  AlertTriangle, 
  ArrowRightLeft, 
  Check, 
  Copy, 
  Trash2,
  MoreVertical,
  User,
  Layers,
  ChevronDown,
  Lock,
  FileText,
  Mic,
  X,
  Send,
  Info,
  Sparkles,
  Building2
} from 'lucide-react';
import { STATUS } from '../constants/sectors';

export const AssetTableRowCard = ({
  asset,
  activeSector,
  sectors = [],
  currentUserName,
  userRole = 'admin',
  userSectorId = null,
  isGeneralView = false,
  onToggleConference,
  onOpenEdit,
  onOpenCautela,
  onOpenBaixa,
  onPrintSingleLabel,
  onTransferSector,
  onDeleteAsset,
  onUpdateLocation,
  onUpdateObservation,
  onOpenSolicitacao,
  hasPendingPedido = false
}) => {
  const [copied, setCopied] = useState(false);
  const [showUncheckConfirm, setShowUncheckConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  // Estados de edição inline de localização com suporte a voz
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationValue, setLocationValue] = useState(asset.localizacao || '');
  const [isListeningLoc, setIsListeningLoc] = useState(false);

  useEffect(() => {
    setLocationValue(asset.localizacao || '');
  }, [asset.localizacao]);

  // Estados de edição inline de observação com inteligência de setor e voz
  const [isEditingObs, setIsEditingObs] = useState(false);
  const [obsValue, setObsValue] = useState(asset.observacao || '');
  const [isListeningObs, setIsListeningObs] = useState(false);

  useEffect(() => {
    setObsValue(asset.observacao || '');
  }, [asset.observacao]);

  // Permissões: Administrador pode tudo. Operador só altera bens do seu próprio departamento.
  const isAdmin = userRole === 'admin';
  const canManageAsset = isAdmin || (userSectorId && asset.setorId === userSectorId);

  // Check if asset belongs to another sector/carga (não se aplica em visualização Geral)
  const isOutOfPlace = !isGeneralView && activeSector && asset.setorId !== activeSector.id;
  const isConferido = asset.status === 'CONFERIDO';
  const isBaixado = asset.baixado || asset.status === 'BAIXADO';
  const isEmCautela = asset.status === 'EM_CAUTELA' || !!asset.cautelaAtual;

  // Informações da cautela para hover e exibição de "Está com: ASCOM (Jean)"
  const cautelaDestino = asset.cautelaAtual?.setorDestino || 'ASCOM';
  const cautelaPessoa = asset.cautelaAtual?.responsavelRetirada || asset.cautelaAtual?.responsavel || 'Jean';
  const cautelaDoc = asset.cautelaAtual?.documento || asset.cautelaAtual?.matricula || '';
  const cautelaRetirada = asset.cautelaAtual?.dataRetirada || '01/10/2026';
  const cautelaDevolucao = asset.cautelaAtual?.dataPrevistaDevolucao || asset.cautelaAtual?.dataPrevisaoDevolucao || '08/10/2026';

  // Extrair os últimos 5 dígitos para formato amigável XX.XXX (facilita a leitura)
  const rawNum = String(asset.numeroPatrimonio || '');
  const digitsOnly = rawNum.replace(/\D/g, '');
  const last5 = digitsOnly.length >= 5 ? digitsOnly.slice(-5) : digitsOnly.padStart(5, '0');
  const formattedXX = `${last5.slice(0, 2)}.${last5.slice(2)}`;
  const prefix = digitsOnly.length > 5 ? digitsOnly.slice(0, -5) : '';

  // Truncamento inteligente para descrições longas com hint bonito (ampliado em 40%)
  const isDescLong = (asset.descricao || '').length > 60;
  const shortDesc = isDescLong 
    ? `${asset.descricao.slice(0, 57).trim()}...` 
    : asset.descricao;

  const handleCopyTag = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(formattedXX);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConferenceClick = (e) => {
    e.stopPropagation();
    if (isBaixado) return;

    if (isConferido) {
      setShowUncheckConfirm(true);
    } else {
      onToggleConference(asset.id, true);
    }
  };

  const handleConfirmUncheck = (e) => {
    e.stopPropagation();
    setShowUncheckConfirm(false);
    onToggleConference(asset.id, false);
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Reconhecimento de Voz para Localização (Mobile / Desktop)
  const startLocationVoice = (e) => {
    e?.stopPropagation();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Reconhecimento de voz não suportado neste navegador. Utilize o Google Chrome, Edge ou Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListeningLoc(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          const formatted = transcript.charAt(0).toUpperCase() + transcript.slice(1);
          setLocationValue(formatted);
          if (onUpdateLocation) {
            onUpdateLocation(asset.id, formatted);
            setIsEditingLocation(false);
          }
        }
        setIsListeningLoc(false);
      };

      recognition.onerror = () => {
        setIsListeningLoc(false);
      };

      recognition.onend = () => {
        setIsListeningLoc(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListeningLoc(false);
    }
  };

  const handleSaveLocation = (e) => {
    e?.stopPropagation();
    if (onUpdateLocation && locationValue.trim()) {
      onUpdateLocation(asset.id, locationValue.trim());
    }
    setIsEditingLocation(false);
  };

  // Detecção Inteligente de Setor na Observação (ex: "está no studio" -> reconhece o setor Studio)
  const detectSectorInText = (text) => {
    if (!text || typeof text !== 'string') return null;
    const clean = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (!clean) return null;

    for (const sec of sectors) {
      const secClean = (sec.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      if (!secClean) continue;

      if (clean.includes(secClean)) {
        return sec;
      }

      const words = secClean.split(/\s+/).filter(w => w.length > 2 && !['de', 'da', 'do', 'das', 'dos', 'para', 'com', 'esta', 'no', 'na', 'sala'].includes(w));
      for (const w of words) {
        const regex = new RegExp(`\\b${w}\\b`, 'i');
        if (regex.test(clean)) {
          return sec;
        }
      }
    }
    return null;
  };

  const handleSaveObservation = (e) => {
    e?.stopPropagation();
    const trimmed = obsValue.trim();
    if (onUpdateObservation) {
      onUpdateObservation(asset.id, trimmed);
    }
    setIsEditingObs(false);
  };

  const startObservationVoice = (e) => {
    e?.stopPropagation();
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Reconhecimento de voz não suportado pelo seu navegador.');
      return;
    }
    setIsEditingObs(true);
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListeningObs(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          const formatted = transcript.charAt(0).toUpperCase() + transcript.slice(1);
          setObsValue(formatted);
          if (onUpdateObservation) {
            onUpdateObservation(asset.id, formatted);
            setIsEditingObs(false);
          }
        }
        setIsListeningObs(false);
      };

      recognition.onerror = () => {
        setIsListeningObs(false);
      };

      recognition.onend = () => {
        setIsListeningObs(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListeningObs(false);
    }
  };

  return (
    <div className={`relative transition-all duration-150 overflow-visible group w-full border-b border-slate-800/80 ${
      isOutOfPlace 
        ? 'bg-amber-950/20 hover:bg-amber-950/30' 
        : isConferido 
          ? 'bg-slate-900/40 hover:bg-slate-850/60' 
          : isBaixado
            ? 'bg-slate-950/60 opacity-70 hover:opacity-85'
            : 'hover:bg-slate-850/50'
    }`}>
      
      {/* Aviso se for item fora da seção oficial */}
      {isOutOfPlace && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 pl-10 pr-9 py-1.5 text-xs text-amber-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium truncate">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate text-[11px]">
              Carga oficial de: <strong className="text-amber-200">{asset.setorNome}</strong> ({asset.responsavel})
            </span>
          </div>
          {canManageAsset ? (
            <button
              onClick={() => onTransferSector(asset)}
              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/30 hover:bg-amber-500 text-amber-100 hover:text-slate-950 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>Transferir</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenSolicitacao(asset)}
              className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Informar / Fazer Pedido</span>
            </button>
          )}
        </div>
      )}

      {/* Linha Principal (Linha debaixo da slidebar, colunas alinhadas com cabeçalho) */}
      <div className="pl-10 pr-9 py-1.5 flex items-center gap-2 text-[11px] w-full">
        
        {/* Coluna 1: Patrimônio */}
        <div className="w-28 shrink-0 flex items-center gap-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className={`font-mono text-xl sm:text-[23px] font-black tracking-tight select-all leading-none ${
                isConferido ? 'text-emerald-400' : 'text-indigo-400'
              }`}>
                {formattedXX}
              </span>
              <button
                onClick={handleCopyTag}
                title="Copiar número do patrimônio"
                className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            
            {/* Tags e Badges especiais */}
            <div className="mt-0.5 flex items-center gap-1">
              {prefix && (
                <span className="text-[9px] font-mono text-slate-500">
                  {prefix}
                </span>
              )}
              {isConferido ? (
                <span className="inline-flex items-center text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  Conferido
                </span>
              ) : isBaixado ? (
                <span className="inline-flex items-center text-[9px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                  Baixado
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Coluna 2: Quantidade */}
        <div className="w-12 shrink-0 flex items-center justify-center">
          <div className="flex items-baseline gap-0.5">
            <span className="text-[10px] text-slate-400 lg:hidden">Qtde:</span>
            <span className="font-black text-lg sm:text-[20px] text-cyan-300">
              {asset.quantidade || 1}
            </span>
            <span className="text-[9px] font-semibold text-slate-400">un</span>
          </div>
        </div>

        {/* Coluna 3: Descrição do Bem (Flexível para empurrar Localização para a direita) */}
        <div className="flex-[1.2] min-w-[280px] shrink-0 flex items-center gap-1.5 flex-wrap">
          <h4 
            className="text-xs sm:text-[13px] font-semibold text-slate-100 group-hover:text-white transition-colors leading-snug"
            title={asset.descricao}
          >
            {shortDesc}
          </h4>

          {isDescLong && (
            <div className="relative group/hint inline-flex items-center">
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="p-0.5 rounded text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 bg-indigo-500/10 border border-indigo-500/30 transition-all cursor-pointer shadow-sm"
                title="Passe o mouse para ver a descrição completa"
              >
                <Info className="w-3 h-3" />
              </button>

              {/* Hint Bonito / Tooltip Flutuante */}
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover/hint:flex flex-col z-50 w-72 sm:w-96 bg-slate-900/98 backdrop-blur-xl border border-indigo-500/50 rounded-2xl p-3 shadow-2xl shadow-indigo-950/80 text-[11px] text-slate-200 animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                <div className="flex items-center gap-1.5 pb-1 mb-1 border-b border-indigo-500/20">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="font-bold text-white text-[10px] uppercase tracking-wider">Descrição Completa</span>
                  <span className="ml-auto font-mono text-[9px] text-indigo-300 font-bold">{formattedXX}</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-medium text-[11px] break-words">
                  {asset.descricao}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Coluna 4: Localização */}
        <div className="w-56 shrink-0 flex items-center justify-start text-left">
          {isEditingLocation ? (
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="inline-flex items-center gap-1 bg-slate-900 border border-blue-500/70 rounded-lg p-0.5 shadow-xl z-20"
            >
              <input
                type="text"
                list={`loc-presets-${asset.id}`}
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveLocation(e);
                  if (e.key === 'Escape') setIsEditingLocation(false);
                }}
                placeholder="Ex: Sala de reuniões"
                className="bg-slate-800 text-white text-[11px] px-1.5 py-0.5 rounded border border-slate-700 focus:outline-none focus:border-blue-400 min-w-[140px]"
                autoFocus
              />
              <datalist id={`loc-presets-${asset.id}`}>
                <option value="Está na Sala de Reuniões" />
                <option value="Está na Copa Cozinha Térreo" />
                <option value="Está na Copa 1º Piso" />
                <option value="Está no Studio" />
                <option value="Está no Auditório" />
                <option value="Está no Foyer" />
                <option value="Está na Recepção" />
                <option value="Está no Laboratório Inovação" />
                <option value="Está na Revista JMU" />
                <option value="Está no SACADI" />
                <option value="Está no CADMI" />
                <option value="Está na TI" />
                <option value="Almoxarifado" />
              </datalist>

              <button
                type="button"
                onClick={startLocationVoice}
                title="Falar por voz"
                className={`p-1 rounded border transition-all cursor-pointer ${
                  isListeningLoc 
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse' 
                    : 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                }`}
              >
                <Mic className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleSaveLocation}
                title="Salvar"
                className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors"
              >
                <Check className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setIsEditingLocation(false)}
                title="Cancelar"
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-0.5 group/loc">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!canManageAsset) {
                    onOpenSolicitacao(asset);
                  } else {
                    setIsEditingLocation(true);
                  }
                }}
                title={canManageAsset ? "Clique para editar a localização" : "Clique para informar localização"}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-[11px] cursor-pointer"
              >
                <span className="truncate max-w-[175px]">
                  {asset.localizacao || 'Onde está?'}
                </span>
                <Edit3 className="w-2.5 h-2.5 text-slate-400 opacity-60 group-hover/loc:opacity-100 ml-0.5" />
              </button>

              <button
                type="button"
                onClick={startLocationVoice}
                title="Ditar localização por voz"
                className={`p-1 rounded transition-all cursor-pointer ${
                  isListeningLoc 
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse' 
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-rose-400'
                }`}
              >
                <Mic className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Coluna 5: Observação (Afastada de localização, com edição inline e detecção inteligente de setor) */}
        <div className="flex-1 min-w-[220px] pl-6 shrink-0 flex items-center justify-start text-left">
          {isEditingObs ? (
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="inline-flex flex-col gap-1 bg-slate-900 border border-blue-500/80 rounded-lg p-1 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  list={`obs-presets-${asset.id}`}
                  value={obsValue}
                  onChange={(e) => setObsValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveObservation(e);
                    if (e.key === 'Escape') setIsEditingObs(false);
                  }}
                  placeholder="Ex: Está no Studio..."
                  className="bg-slate-800 text-white text-[11px] px-2 py-0.5 rounded border border-slate-700 focus:outline-none focus:border-blue-400 min-w-[170px]"
                  autoFocus
                />

                <datalist id={`obs-presets-${asset.id}`}>
                  {sectors.map(s => (
                    <option key={s.id} value={`Está no ${s.name}`} />
                  ))}
                  <option value="Em manutenção técnica" />
                  <option value="Emprestado provisoriamente" />
                  <option value="Aguardando recolhimento" />
                  <option value="Sem etiqueta patrimonial" />
                </datalist>

                <button
                  type="button"
                  onClick={startObservationVoice}
                  title="Ditar observação por voz"
                  className={`p-1 rounded border transition-all cursor-pointer ${
                    isListeningObs 
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse' 
                      : 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                  }`}
                >
                  <Mic className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={handleSaveObservation}
                  title="Salvar Observação"
                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors"
                >
                  <Check className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditingObs(false)}
                  title="Cancelar"
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Detecção inteligente de setor na observação */}
              {(() => {
                const detected = detectSectorInText(obsValue);
                if (!detected) return null;
                return (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[9.5px] text-cyan-300">
                    <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>Setor identificado: <strong className="text-white font-semibold">{detected.name}</strong></span>
                    {detected.id !== asset.setorId && (
                      <span className="text-[9px] text-amber-300 font-bold ml-auto">(Outro setor)</span>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : isEmCautela ? (
            <div className="relative group/cautela inline-block">
              <div className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 px-1.5 py-0.5 rounded border border-amber-500/30 cursor-pointer transition-all shadow-sm">
                <Handshake className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate max-w-[240px]">Está com: <strong className="text-white">{cautelaDestino}</strong> ({cautelaPessoa})</span>
              </div>

              {/* Floating Document Popover on Hover */}
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover/cautela:flex flex-col z-50 w-72 sm:w-80 bg-slate-900/98 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-3 shadow-2xl shadow-purple-950/60 text-[11px] text-slate-200 animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-purple-500/20">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded bg-purple-500/20 text-purple-400">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-[11px]">Doc. de Cautela / Empréstimo</div>
                      <div className="text-[9px] text-purple-300 font-mono">#{asset.cautelaAtual?.id || 'CAUTELA'}</div>
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    EM ANDAMENTO
                  </span>
                </div>

                <div className="space-y-1 text-[10px]">
                  <div>
                    <span className="text-slate-400">Item: </span>
                    <strong className="text-white font-mono">{formattedXX}</strong> - {asset.descricao}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <div>
                      <span className="text-slate-400 block text-[9px]">Cautelado por:</span>
                      <strong className="text-purple-300">{cautelaPessoa}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Setor de Destino:</span>
                      <strong className="text-amber-300">{cautelaDestino}</strong>
                    </div>
                  </div>
                  {cautelaDoc && (
                    <div>
                      <span className="text-slate-400 text-[9px]">Doc / Matrícula: </span>
                      <span className="font-mono text-slate-300">{cautelaDoc}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[9px]">Data Retirada:</span>
                      <span className="text-slate-300">{cautelaRetirada}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Previsão Devolução:</span>
                      <span className="text-amber-400 font-semibold">{cautelaDevolucao}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : asset.observacao ? (
            (() => {
              const detected = detectSectorInText(asset.observacao);
              return (
                <div className="inline-flex items-center gap-1 group/obs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingObs(true);
                    }}
                    title="Clique para editar a observação"
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                      detected 
                        ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/30' 
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {detected && (
                      <Building2 className="w-3 h-3 text-cyan-400 shrink-0" />
                    )}
                    <span className="truncate max-w-[210px]" title={asset.observacao}>
                      {asset.observacao}
                    </span>
                    <Edit3 className="w-2.5 h-2.5 text-slate-400 opacity-60 group-hover/obs:opacity-100 ml-0.5" />
                  </button>

                  <button
                    type="button"
                    onClick={startObservationVoice}
                    title="Ditar observação por voz"
                    className={`p-1 rounded transition-all cursor-pointer ${
                      isListeningObs 
                        ? 'bg-rose-500/20 text-rose-400 animate-pulse' 
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-blue-400'
                    }`}
                  >
                    <Mic className="w-3 h-3" />
                  </button>
                </div>
              );
            })()
          ) : (
            <div className="inline-flex items-center gap-1 group/obs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingObs(true);
                }}
                title="Clique para adicionar observação"
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800/80 text-slate-500 hover:text-slate-300 transition-all text-[11px] cursor-pointer"
              >
                <span>---</span>
                <Edit3 className="w-2.5 h-2.5 opacity-40 group-hover/obs:opacity-100 text-slate-400 ml-0.5" />
              </button>

              <button
                type="button"
                onClick={startObservationVoice}
                title="Ditar observação por voz"
                className={`p-1 rounded opacity-0 group-hover/obs:opacity-100 hover:opacity-100 transition-all cursor-pointer ${
                  isListeningObs 
                    ? 'opacity-100 bg-rose-500/20 text-rose-400 animate-pulse' 
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-blue-400'
                }`}
              >
                <Mic className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Coluna 6: Responsável */}
        <div className="w-28 shrink-0 flex items-center justify-center text-center">
          <div className="truncate w-full">
            <span className="font-semibold text-slate-200 truncate block text-[11px]" title={asset.responsavel}>
              {asset.responsavel || '---'}
            </span>
            {isGeneralView && asset.setorNome && (
              <span className="text-[9px] text-slate-400 block truncate">
                {asset.setorNome}
              </span>
            )}
          </div>
        </div>

        {/* Coluna 7: Data de Aquisição */}
        <div className="w-24 shrink-0 flex items-center justify-center text-center">
          <span className="font-medium text-[11px] text-slate-300">
            {asset.dataAquisicao || asset.anoAquisicao || '---'}
          </span>
        </div>

        {/* Coluna 8: Valor Original */}
        <div className="w-24 shrink-0 flex items-center justify-center text-center">
          <span className="font-semibold text-slate-200 text-[11px]">
            {formatCurrency(asset.valorOriginal)}
          </span>
        </div>

        {/* Coluna 9: Valor Atual */}
        <div className="w-24 shrink-0 flex items-center justify-center text-center">
          <span className="font-bold text-emerald-400 text-[11px]">
            {formatCurrency(asset.valorAtual || asset.valorOriginal)}
          </span>
        </div>

        {/* Coluna 10: Ações & Conferência */}
        <div className="w-28 shrink-0 flex items-center justify-end gap-1.5 pr-1">
          
          {/* Bloqueado / Conferência / Pedido */}
          {!canManageAsset ? (
            hasPendingPedido ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 select-none">
                Enviado
              </span>
            ) : (
              <button
                onClick={() => onOpenSolicitacao(asset)}
                title="Fazer pedido de carga"
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer"
              >
                Pedido
              </button>
            )
          ) : isGeneralView ? (
            <div 
              title="Bloqueado"
              className="p-1 rounded text-rose-500 hover:text-rose-400 cursor-not-allowed select-none"
            >
              <Lock className="w-3.5 h-3.5 text-rose-500" />
            </div>
          ) : isBaixado ? (
            <div className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 select-none">
              Baixado
            </div>
          ) : showUncheckConfirm ? (
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 p-0.5 rounded">
              <span className="text-[9px] text-amber-200 font-bold px-0.5">Desmarcar?</span>
              <button
                onClick={handleConfirmUncheck}
                className="px-1 py-0.2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[9px] font-bold cursor-pointer"
              >
                Sim
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUncheckConfirm(false);
                }}
                className="px-1 py-0.2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] cursor-pointer"
              >
                Não
              </button>
            </div>
          ) : (
            <button
              onClick={handleConferenceClick}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer shadow-sm ${
                isConferido
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:scale-[1.02]'
              }`}
            >
              <span>{isConferido ? 'Conferido' : 'Conferir'}</span>
            </button>
          )}

          {/* Menu Dropdown de Ações colado à direita */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsActionsOpen(!isActionsOpen);
              }}
              title="Mais opções do bem"
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isActionsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsActionsOpen(false);
                    setShowDeleteConfirm(false);
                  }} 
                />
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {!canManageAsset ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsActionsOpen(false);
                          onOpenSolicitacao(asset);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer text-left font-semibold"
                      >
                        <Send className="w-3.5 h-3.5 text-amber-400" />
                        <span>Fazer Pedido de Carga</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsActionsOpen(false);
                          onPrintSingleLabel(asset);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
                      >
                        <Printer className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Imprimir Etiqueta</span>
                      </button>
                    </>
                  ) : (
                    <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsActionsOpen(false);
                      onOpenEdit(asset);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Editar Dados</span>
                  </button>

                  {!isGeneralView && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsActionsOpen(false);
                        onTransferSector(asset);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Transferir Setor</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsActionsOpen(false);
                      onOpenCautela(asset);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <Handshake className="w-3.5 h-3.5 text-amber-400" />
                    <span>Emitir Cautela</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsActionsOpen(false);
                      onPrintSingleLabel(asset);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <Printer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Imprimir Etiqueta</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsActionsOpen(false);
                      onOpenBaixa(asset);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <Archive className="w-3.5 h-3.5 text-purple-400" />
                    <span>Baixa Patrimonial</span>
                  </button>

                  <div className="h-px bg-slate-800 my-1" />

                  {showDeleteConfirm ? (
                    <div className="p-2 bg-rose-950/40 rounded-xl border border-rose-500/30 text-center">
                      <p className="text-[11px] text-rose-300 font-medium mb-1.5">Confirmar exclusão?</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsActionsOpen(false);
                            onDeleteAsset(asset.id);
                          }}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Excluir
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(false);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Bem</span>
                    </button>
                  )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
