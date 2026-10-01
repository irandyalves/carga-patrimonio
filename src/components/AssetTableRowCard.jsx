import React, { useState, useEffect, useRef } from 'react';
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
  Building2,
  Palette,
  ExternalLink,
  RotateCcw,
  Server,
  Laptop
} from 'lucide-react';
import { STATUS } from '../constants/sectors';
import { HighlightText } from './HighlightText';
import { formatCurrency, formatDepreciacao, formatPatrimonio, formatDisplayDate } from '../utils/formatters';

const COLOR_OPTIONS = [
  { id: 'default', label: 'Padrão', bg: 'bg-slate-700', border: 'border-slate-600' },
  { id: 'emerald', label: 'Verde Esmeralda', bg: 'bg-emerald-500', border: 'border-emerald-400' },
  { id: 'blue', label: 'Azul Real', bg: 'bg-sky-500', border: 'border-sky-400' },
  { id: 'amber', label: 'Amarelo / Dourado', bg: 'bg-amber-500', border: 'border-amber-400' },
  { id: 'rose', label: 'Vermelho / Rosa', bg: 'bg-rose-500', border: 'border-rose-400' },
  { id: 'purple', label: 'Roxo / Violeta', bg: 'bg-purple-500', border: 'border-purple-400' },
  { id: 'cyan', label: 'Ciano / Turquesa', bg: 'bg-cyan-500', border: 'border-cyan-400' },
  { id: 'orange', label: 'Laranja / Coral', bg: 'bg-orange-500', border: 'border-orange-400' }
];

const CARD_COLOR_CLASSES = {
  emerald: 'bg-emerald-950/20 border-l-4 border-l-emerald-400 hover:bg-emerald-950/30',
  blue: 'bg-sky-950/20 border-l-4 border-l-sky-400 hover:bg-sky-950/30',
  amber: 'bg-amber-950/20 border-l-4 border-l-amber-400 hover:bg-amber-950/30',
  rose: 'bg-rose-950/20 border-l-4 border-l-rose-400 hover:bg-rose-950/30',
  purple: 'bg-purple-950/20 border-l-4 border-l-purple-400 hover:bg-purple-950/30',
  cyan: 'bg-cyan-950/20 border-l-4 border-l-cyan-400 hover:bg-cyan-950/30',
  orange: 'bg-orange-950/20 border-l-4 border-l-orange-400 hover:bg-orange-950/30'
};

const FONT_COLOR_MAP = {
  emerald: {
    patrimonio: 'text-emerald-400 font-black drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    descricao: 'text-emerald-300 font-bold hover:text-emerald-200 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]',
    quantidade: 'text-emerald-300'
  },
  blue: {
    patrimonio: 'text-sky-400 font-black drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]',
    descricao: 'text-sky-300 font-bold hover:text-sky-200 drop-shadow-[0_0_4px_rgba(56,189,248,0.3)]',
    quantidade: 'text-sky-300'
  },
  amber: {
    patrimonio: 'text-amber-400 font-black drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]',
    descricao: 'text-amber-300 font-bold hover:text-amber-200 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]',
    quantidade: 'text-amber-300'
  },
  rose: {
    patrimonio: 'text-rose-400 font-black drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]',
    descricao: 'text-rose-300 font-bold hover:text-rose-200 drop-shadow-[0_0_4px_rgba(251,113,133,0.3)]',
    quantidade: 'text-rose-300'
  },
  purple: {
    patrimonio: 'text-purple-400 font-black drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]',
    descricao: 'text-purple-300 font-bold hover:text-purple-200 drop-shadow-[0_0_4px_rgba(192,132,252,0.3)]',
    quantidade: 'text-purple-300'
  },
  cyan: {
    patrimonio: 'text-cyan-400 font-black drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]',
    descricao: 'text-cyan-300 font-bold hover:text-cyan-200 drop-shadow-[0_0_4px_rgba(34,211,238,0.3)]',
    quantidade: 'text-cyan-300'
  },
  orange: {
    patrimonio: 'text-orange-400 font-black drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]',
    descricao: 'text-orange-300 font-bold hover:text-orange-200 drop-shadow-[0_0_4px_rgba(251,146,60,0.3)]',
    quantidade: 'text-orange-300'
  }
};

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
  onCancelBaixa,
  onOpenDtin,
  onReturnDtin,
  onPrintSingleLabel,
  onTransferSector,
  onDeleteAsset,
  onUpdateLocation,
  onUpdateObservation,
  onUpdateCardColor,
  onOpenSolicitacao,
  hasPendingPedido = false,
  searchTerm = '',
  visibleColumns = {
    responsavel: true,
    dataAquisicao: true,
    valorOriginal: true,
    valorAtual: true
  },
  index = 0
}) => {
  const [copied, setCopied] = useState(false);
  const [showUncheckConfirm, setShowUncheckConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelBaixaConfirm, setShowCancelBaixaConfirm] = useState(false);
  const [showReturnDtinConfirm, setShowReturnDtinConfirm] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDescModalOpen, setIsDescModalOpen] = useState(false);
  const [isBaixaResumoOpen, setIsBaixaResumoOpen] = useState(false);
  const [isDtinResumoOpen, setIsDtinResumoOpen] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  // Posicionamento inteligente para nunca ser cortado pelo cabeçalho
  const [cautelaPlacement, setCautelaPlacement] = useState(() => (index < 4 ? 'bottom' : 'top'));
  const [isCautelaModalViewOpen, setIsCautelaModalViewOpen] = useState(false);
  const [actionsPlacement, setActionsPlacement] = useState(() => (index < 3 ? 'bottom' : 'top'));

  const handleCautelaMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.top < 280) {
      setCautelaPlacement('bottom');
    } else {
      setCautelaPlacement('top');
    }
  };

  // Estados de edição inline de localização com suporte a voz e auto-close
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationValue, setLocationValue] = useState(asset.localizacao || '');
  const [showLocListbox, setShowLocListbox] = useState(false);
  const [isListeningLoc, setIsListeningLoc] = useState(false);
  const locTimerRef = useRef(null);
  const locContainerRef = useRef(null);

  useEffect(() => {
    setLocationValue(asset.localizacao || '');
  }, [asset.localizacao]);

  // Estados de edição inline de observação com inteligência de setor, voz e auto-close
  const [isEditingObs, setIsEditingObs] = useState(false);
  const [obsValue, setObsValue] = useState(asset.observacao || '');
  const [showObsListbox, setShowObsListbox] = useState(false);
  const [isListeningObs, setIsListeningObs] = useState(false);
  const obsTimerRef = useRef(null);
  const obsContainerRef = useRef(null);
  const colorPickerRef = useRef(null);

  useEffect(() => {
    setObsValue(asset.observacao || '');
  }, [asset.observacao]);

  // Temporizador de inatividade de 8 segundos para fechar edições inline automaticamente
  const resetLocTimer = () => {
    if (locTimerRef.current) clearTimeout(locTimerRef.current);
    locTimerRef.current = setTimeout(() => {
      setIsEditingLocation(false);
      setShowLocListbox(false);
    }, 8000);
  };

  const resetObsTimer = () => {
    if (obsTimerRef.current) clearTimeout(obsTimerRef.current);
    obsTimerRef.current = setTimeout(() => {
      setIsEditingObs(false);
      setShowObsListbox(false);
    }, 8000);
  };

  const openLocEdit = (e) => {
    e?.stopPropagation();
    window.dispatchEvent(new CustomEvent('close-inlines', { detail: { id: asset.id, field: 'location' } }));
    setIsEditingObs(false);
    setShowObsListbox(false);
    setIsEditingLocation(true);
    setShowLocListbox(true);
    resetLocTimer();
  };

  const closeLocEdit = () => {
    if (locTimerRef.current) clearTimeout(locTimerRef.current);
    setIsEditingLocation(false);
    setShowLocListbox(false);
  };

  const openObsEdit = (e) => {
    e?.stopPropagation();
    window.dispatchEvent(new CustomEvent('close-inlines', { detail: { id: asset.id, field: 'obs' } }));
    setIsEditingLocation(false);
    setShowLocListbox(false);
    setIsEditingObs(true);
    setShowObsListbox(true);
    resetObsTimer();
  };

  const closeObsEdit = () => {
    if (obsTimerRef.current) clearTimeout(obsTimerRef.current);
    setIsEditingObs(false);
    setShowObsListbox(false);
  };

  // Escuta evento global: ao clicar para editar em um campo/card, fecha edições anteriores
  useEffect(() => {
    const handleCloseInlines = (e) => {
      if (e.detail?.id !== asset.id || e.detail?.field !== 'location') {
        setIsEditingLocation(false);
        setShowLocListbox(false);
      }
      if (e.detail?.id !== asset.id || e.detail?.field !== 'obs') {
        setIsEditingObs(false);
        setShowObsListbox(false);
      }
    };
    window.addEventListener('close-inlines', handleCloseInlines);
    return () => {
      window.removeEventListener('close-inlines', handleCloseInlines);
      if (locTimerRef.current) clearTimeout(locTimerRef.current);
      if (obsTimerRef.current) clearTimeout(obsTimerRef.current);
    };
  }, [asset.id]);

  // Fechar ao clicar fora ou tecla Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isEditingLocation && locContainerRef.current && !locContainerRef.current.contains(e.target)) {
        closeLocEdit();
      }
      if (isEditingObs && obsContainerRef.current && !obsContainerRef.current.contains(e.target)) {
        closeObsEdit();
      }
      if (isColorPickerOpen && colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
        setIsColorPickerOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsBaixaResumoOpen(false);
        setIsDtinResumoOpen(false);
        setIsDescModalOpen(false);
        setIsCautelaModalViewOpen(false);
        setIsColorPickerOpen(false);
        closeLocEdit();
        closeObsEdit();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditingLocation, isEditingObs, isColorPickerOpen]);

  // Permissões: Administrador pode tudo. Operador só altera bens do seu próprio departamento.
  const isAdmin = userRole === 'admin';
  const canManageAsset = isAdmin || (userSectorId && asset.setorId === userSectorId);

  // Check if asset belongs to another sector/carga (não se aplica em visualização Geral)
  const isOutOfPlace = !isGeneralView && activeSector && asset.setorId !== activeSector.id;
  const isConferido = asset.status === 'CONFERIDO';
  const isBaixado = asset.baixado || asset.status === 'BAIXADO';
  const isEmCautela = asset.status === 'EM_CAUTELA' || !!asset.cautelaAtual;
  const isEnviadoDtin = asset.status === 'ENVIADO_DTIN' || !!asset.enviadoDtin;
  const isInformática = asset.categoria === 'Equipamentos de Informática' || 
                        asset.setorId === 'sec-ti' || 
                        (activeSector && activeSector.id === 'sec-ti') ||
                        /monitor|computador|notebook|cpu|teclado|mouse|switch|servidor|impressora|nobreak|scanner|estabilizador|estação|gabinete|laptop|ti|rede|roteador|fonte|nobreak|patch/i.test(asset.descricao || '');

  // Informações da cautela para hover e exibição de "Está com: ASCOM (Jean)"
  const cautelaDestino = asset.cautelaAtual?.setorDestino || 'ASCOM';
  const cautelaPessoa = asset.cautelaAtual?.responsavelRetirada || asset.cautelaAtual?.responsavel || 'Jean';
  const cautelaDoc = asset.cautelaAtual?.documento || asset.cautelaAtual?.matricula || '';
  const cautelaRetirada = asset.cautelaAtual?.dataRetirada || '01/10/2026';
  const cautelaDevolucao = asset.cautelaAtual?.dataPrevistaDevolucao || asset.cautelaAtual?.dataPrevisaoDevolucao || '08/10/2026';

  // Extrair e formatar o número de patrimônio (remove prefixo de 5 dígitos e preserva os 4 ou 5 dígitos finais)
  const formattedXX = formatPatrimonio(asset.numeroPatrimonio);

  // Truncamento inteligente para descrições longas com hint bonito
  const isDescLong = (asset.descricao || '').length > 35;

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

  const handleSaveLocation = (e, directVal = null) => {
    e?.stopPropagation();
    const val = (directVal !== null ? directVal : locationValue).trim();
    if (onUpdateLocation && val) {
      onUpdateLocation(asset.id, val);
    }
    closeLocEdit();
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

  const handleSaveObservation = (e, directVal = null) => {
    e?.stopPropagation();
    const val = (directVal !== null ? directVal : obsValue).trim();
    if (onUpdateObservation) {
      onUpdateObservation(asset.id, val);
    }
    closeObsEdit();
  };

  const startObservationVoice = (e) => {
    e?.stopPropagation();
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Reconhecimento de voz não suportado pelo seu navegador.');
      return;
    }
    setIsEditingObs(true);
    resetObsTimer();
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListeningObs(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          const formatted = transcript.charAt(0).toUpperCase() + transcript.slice(1);
          setObsValue(formatted);
          if (onUpdateObservation) {
            onUpdateObservation(asset.id, formatted);
            closeObsEdit();
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

  const cardColorClass = asset.cardColor ? CARD_COLOR_CLASSES[asset.cardColor] : null;

  return (
    <div 
      id={`asset-row-${asset.id}`}
      className={`relative transition-all duration-150 overflow-visible group w-full border-b border-slate-800/80 ${
        cardColorClass
          ? cardColorClass
          : isOutOfPlace 
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
              Carga oficial de: <strong className="text-amber-200"><HighlightText text={asset.setorNome} query={searchTerm} /></strong> (<HighlightText text={asset.responsavel} query={searchTerm} />)
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

      {/* Linha Principal (Linha debaixo da slidebar, colunas perfeitamente alinhadas com cabeçalho até a borda direita) */}
      <div className="pl-6 pr-2 py-0.5 sm:py-1 flex items-center gap-2 text-[11px] w-full">
        
        {/* Coluna 1: Patrimônio */}
        <div className="w-28 shrink-0 flex items-center gap-1.5">
          {/* Ícone de Baixa ou Indicador Visual de Conferido em TODAS AS ÁREAS */}
          {isBaixado ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsBaixaResumoOpen(true);
              }}
              title="Clique para ver o resumo da baixa e documentos (PDF)"
              className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-400 hover:text-rose-200 transition-all cursor-pointer shadow-sm shrink-0 flex items-center justify-center hover:scale-110 active:scale-95 group/baixa"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          ) : (isGeneralView && isConferido) ? (
            <div
              title="Item Conferido"
              className="w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.35)]"
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          ) : null}

          <div className="flex items-center">
            <span className={`font-mono text-base sm:text-[18px] font-black tracking-tight select-all leading-none ${
              FONT_COLOR_MAP[asset.cardColor]?.patrimonio || (isConferido ? 'text-emerald-400' : 'text-indigo-400')
            }`}>
              <HighlightText text={formattedXX} query={searchTerm} />
            </span>
          </div>
        </div>

        {/* Coluna 2: Quantidade */}
        {visibleColumns?.quantidade !== false && (
          <div className="w-12 shrink-0 flex items-center justify-center animate-in fade-in duration-150">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[9px] text-slate-400 lg:hidden">Qtde:</span>
              <span className={`font-black text-sm sm:text-[15px] leading-none ${
                FONT_COLOR_MAP[asset.cardColor]?.quantidade || 'text-cyan-300'
              }`}>
                {asset.quantidade || 1}
              </span>
              <span className="text-[8.5px] font-medium text-slate-400">un</span>
            </div>
          </div>
        )}

        {/* Coluna 3: Item / Descrição (Expande e ocupa o espaço liberado pelas colunas ocultadas) */}
        <div className="flex-1 min-w-0 shrink flex items-center gap-1.5 overflow-hidden whitespace-nowrap transition-all">
          <h4 
            onClick={(e) => {
              e.stopPropagation();
              setIsDescModalOpen(true);
            }}
            className={`text-xs sm:text-[12.5px] font-semibold transition-colors truncate whitespace-nowrap cursor-pointer ${
              FONT_COLOR_MAP[asset.cardColor]?.descricao || 'text-slate-100 group-hover:text-white hover:text-indigo-300'
            }`}
            title="Clique para ver a descrição completa no modal"
          >
            <HighlightText text={asset.descricao} query={searchTerm} />
          </h4>

          {isEnviadoDtin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDtinResumoOpen(true);
              }}
              title="Equipamento enviado ao DTIN (Clique para ver detalhes e documentos)"
              className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 text-[10px] flex items-center gap-1 hover:bg-cyan-500/30 transition-all cursor-pointer shrink-0 shadow-sm animate-pulse hover:animate-none"
            >
              <Server className="w-3 h-3 text-cyan-400" />
              <span>No DTIN</span>
            </button>
          )}

          {isDescLong && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDescModalOpen(true);
              }}
              className="p-1 rounded-lg text-indigo-400 hover:text-indigo-200 hover:bg-indigo-500/20 bg-indigo-500/10 border border-indigo-500/30 transition-all cursor-pointer shadow-sm shrink-0"
              title="Clique para ver a descrição completa no modal"
            >
              <Info className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Coluna 4: Marca */}
        {visibleColumns?.marca !== false && (
          <div className="w-28 shrink-0 flex items-center justify-start text-left truncate animate-in fade-in duration-150">
            <span className="text-[11px] font-semibold text-slate-300 truncate" title={asset.marca || '---'}>
              <HighlightText text={asset.marca || '---'} query={searchTerm} />
            </span>
          </div>
        )}

        {/* Coluna 5: Modelo */}
        {visibleColumns?.modelo !== false && (
          <div className="w-28 shrink-0 flex items-center justify-start text-left truncate animate-in fade-in duration-150">
            <span className="text-[11px] font-medium text-slate-400 truncate" title={asset.modelo || '---'}>
              <HighlightText text={asset.modelo || '---'} query={searchTerm} />
            </span>
          </div>
        )}

        {/* Coluna 6: Localização */}
        <div className="w-48 shrink-0 flex items-center justify-start text-left">
          {isEditingLocation ? (
            <div 
              ref={locContainerRef}
              onClick={(e) => e.stopPropagation()} 
              className="relative flex items-center z-30 animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Campo de Entrada e Botão Dropdown */}
              <div className="relative inline-flex items-center">
                <input
                  type="text"
                  value={locationValue}
                  onChange={(e) => {
                    setLocationValue(e.target.value);
                    resetLocTimer();
                    setShowLocListbox(true);
                  }}
                  onFocus={() => {
                    resetLocTimer();
                    setShowLocListbox(true);
                  }}
                  onKeyDown={(e) => {
                    resetLocTimer();
                    if (e.key === 'Enter') handleSaveLocation(e);
                    if (e.key === 'Escape') closeLocEdit();
                  }}
                  placeholder="Selecione ou digite o setor..."
                  className="bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-lg border border-blue-500/80 focus:outline-none focus:ring-1 focus:ring-emerald-400 min-w-[140px] pr-6 shadow-xl"
                  autoFocus
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLocListbox(!showLocListbox);
                    resetLocTimer();
                  }}
                  className="absolute right-1 p-0.5 text-slate-400 hover:text-white cursor-pointer"
                  title="Mostrar setores"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLocListbox ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>

                {/* Listbox customizado com 10 opções visíveis contendo SOMENTE os setores */}
                {showLocListbox && (
                  <div className="absolute left-0 top-full mt-1.5 w-64 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800 flex items-center justify-between">
                      <span>Setores</span>
                      <span className="text-[9px] text-emerald-400 font-mono">10 visíveis</span>
                    </div>
                    <div className="h-[320px] max-h-[320px] overflow-y-auto scrollbar-thin p-0.5 space-y-0.5">
                      {sectors.map((s) => (
                        <button
                          key={`loc-sec-${s.id}`}
                          type="button"
                          onClick={(e) => {
                            setLocationValue(s.name);
                            handleSaveLocation(e, s.name);
                          }}
                          className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-emerald-400 font-bold tracking-wide drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]">
                              {s.name}
                            </span>
                            {s.responsavel && (
                              <span className="text-[10px] text-slate-400 truncate">
                                ({s.responsavel})
                              </span>
                            )}
                          </div>
                          <Check className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botão de Voz */}
              <div className="inline-flex items-center ml-1.5">
                <button
                  type="button"
                  onClick={startLocationVoice}
                  title="Ditar localização por voz"
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer shadow-sm ${
                    isListeningLoc 
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse' 
                      : 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Mic className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-0.5 group/loc">
              <button
                type="button"
                onClick={(e) => {
                  if (!canManageAsset) {
                    onOpenSolicitacao(asset);
                  } else {
                    openLocEdit(e);
                  }
                }}
                title={canManageAsset ? "Clique para editar a localização" : "Clique para informar localização"}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-[11px] cursor-pointer"
              >
                <span className="truncate max-w-[175px]">
                  <HighlightText text={asset.localizacao || 'Onde está?'} query={searchTerm} />
                </span>
                <Edit3 className="w-2.5 h-2.5 text-slate-400 opacity-60 group-hover/loc:opacity-100 ml-0.5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  openLocEdit(e);
                  startLocationVoice(e);
                }}
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

        {/* Coluna 7: Observação */}
        <div className="w-52 shrink-0 flex items-center justify-start text-left">
          {isEditingObs ? (
            <div 
              ref={obsContainerRef}
              onClick={(e) => e.stopPropagation()} 
              className="relative flex items-center z-30 animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Campo de Entrada e Botão Dropdown */}
              <div className="relative inline-flex items-center">
                <input
                  type="text"
                  value={obsValue}
                  onChange={(e) => {
                    setObsValue(e.target.value);
                    resetObsTimer();
                    setShowObsListbox(true);
                  }}
                  onFocus={() => {
                    resetObsTimer();
                    setShowObsListbox(true);
                  }}
                  onKeyDown={(e) => {
                    resetObsTimer();
                    if (e.key === 'Enter') handleSaveObservation(e);
                    if (e.key === 'Escape') closeObsEdit();
                  }}
                  placeholder="Ex: Está no Studio..."
                  className="bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-lg border border-blue-500/80 focus:outline-none focus:ring-1 focus:ring-emerald-400 min-w-[135px] pr-6 shadow-xl"
                  autoFocus
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowObsListbox(!showObsListbox);
                    resetObsTimer();
                  }}
                  className="absolute right-1 p-0.5 text-slate-400 hover:text-white cursor-pointer"
                  title="Mostrar opções de observação"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showObsListbox ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>

                {/* Listbox customizado reduzido em 25% com 10 opções visíveis */}
                {showObsListbox && (
                  <div className="absolute left-0 top-full mt-1.5 w-[216px] bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1.5 py-1 border-b border-slate-800 flex items-center justify-between">
                      <span>Sugestões</span>
                      <span className="text-[8.5px] text-emerald-400 font-mono">10 visíveis</span>
                    </div>
                    <div className="h-[320px] max-h-[320px] overflow-y-auto scrollbar-thin p-0.5 space-y-0.5">
                      {sectors.map((s) => (
                        <button
                          key={`obs-sec-${s.id}`}
                          type="button"
                          onClick={(e) => {
                            const val = `Está no ${s.name}`;
                            setObsValue(val);
                            handleSaveObservation(e, val);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="text-slate-300 font-normal">Está no</span>
                          <span className="text-emerald-400 font-bold drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]">{s.name}</span>
                        </button>
                      ))}
                      {[
                        'Em manutenção técnica',
                        'Emprestado provisoriamente',
                        'Aguardando recolhimento',
                        'Sem etiqueta patrimonial',
                        'Em uso constante no setor',
                        'Aguardando vistoria / baixa'
                      ].map((opt) => (
                        <button
                          key={`obs-preset-${opt}`}
                          type="button"
                          onClick={(e) => {
                            setObsValue(opt);
                            handleSaveObservation(e, opt);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botão de Voz */}
              <div className="inline-flex items-center ml-1.5">
                <button
                  type="button"
                  onClick={startObservationVoice}
                  title="Ditar observação por voz"
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer shadow-sm ${
                    isListeningObs 
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse' 
                      : 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Mic className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : isEmCautela ? (
            <div 
              className="relative group/cautela inline-block"
              onMouseEnter={handleCautelaMouseEnter}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCautelaModalViewOpen(true);
                }}
                title="Clique para abrir os detalhes da cautela em um modal"
                className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-amber-300 hover:text-amber-200 cursor-pointer transition-colors"
              >
                <Handshake className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate max-w-[240px]">Está com: <strong className="text-white">{cautelaDestino}</strong> ({cautelaPessoa})</span>
              </button>

              {/* Floating Document Popover on Hover (Posicionamento inteligente: abre para baixo no limite do cabeçalho) */}
              <div className={`absolute left-0 ${
                cautelaPlacement === 'bottom' 
                  ? 'top-full mt-2' 
                  : 'bottom-full mb-2'
              } hidden group-hover/cautela:flex flex-col z-50 w-72 sm:w-80 bg-slate-900/98 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-3.5 shadow-2xl shadow-purple-950/80 text-[11px] text-slate-200 animate-in fade-in zoom-in-95 duration-150 pointer-events-none`}>
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
                    onClick={(e) => openObsEdit(e)}
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
                      <HighlightText text={asset.observacao} query={searchTerm} />
                    </span>
                    <Edit3 className="w-2.5 h-2.5 text-slate-400 opacity-60 group-hover/obs:opacity-100 ml-0.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      openObsEdit(e);
                      startObservationVoice(e);
                    }}
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
                onClick={(e) => openObsEdit(e)}
                title="Clique para adicionar observação"
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800/80 text-slate-500 hover:text-slate-300 transition-all text-[11px] cursor-pointer"
              >
                <span>---</span>
                <Edit3 className="w-2.5 h-2.5 opacity-40 group-hover/obs:opacity-100 text-slate-400 ml-0.5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  openObsEdit(e);
                  startObservationVoice(e);
                }}
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
        {visibleColumns?.responsavel !== false && (
          <div className="w-28 shrink-0 flex items-center justify-center text-center animate-in fade-in duration-150">
            <div className="truncate w-full">
              <span className="font-semibold text-slate-200 truncate block text-[10px]" title={asset.responsavel}>
                <HighlightText text={asset.responsavel || '---'} query={searchTerm} />
              </span>
              {isGeneralView && asset.setorNome && (
                <span className="text-[8.5px] text-slate-400 block truncate">
                  <HighlightText text={asset.setorNome} query={searchTerm} />
                </span>
              )}
            </div>
          </div>
        )}

        {/* Coluna 7: Data de Aquisição */}
        {visibleColumns?.dataAquisicao !== false && (
          <div className="w-24 shrink-0 flex items-center justify-center text-center animate-in fade-in duration-150">
            <span className="font-medium text-[11px] text-slate-300">
              {formatDisplayDate(asset.dataAquisicao || asset.anoAquisicao)}
            </span>
          </div>
        )}

        {/* Coluna 8: Valor Original */}
        {visibleColumns?.valorOriginal !== false && (
          <div className="w-28 shrink-0 flex items-center justify-end text-right pr-2 animate-in fade-in duration-150">
            <span className="font-semibold text-slate-200 text-[11px] whitespace-nowrap">
              {formatCurrency(asset.valorOriginal)}
            </span>
          </div>
        )}

        {/* Coluna 11: Valor Atual */}
        {visibleColumns?.valorAtual !== false && (
          <div className="w-28 shrink-0 flex items-center justify-end text-right pr-2 animate-in fade-in duration-150">
            <span className="font-bold text-emerald-400 text-[11px] whitespace-nowrap">
              {formatCurrency(asset.valorAtual || asset.valorOriginal)}
            </span>
          </div>
        )}

        {/* Coluna 12: Depreciação */}
        {visibleColumns?.depreciacao !== false && (
          <div className="w-28 shrink-0 flex items-center justify-end text-right pr-2 animate-in fade-in duration-150">
            <span className="font-semibold text-amber-400 text-[11px] whitespace-nowrap" title={String(asset.depreciacao || '')}>
              {formatDepreciacao(
                asset.depreciacao || 
                (asset.valorOriginal && asset.valorAtual && Number(asset.valorOriginal) > Number(asset.valorAtual) 
                  ? Number(asset.valorOriginal) - Number(asset.valorAtual) 
                  : '')
              )}
            </span>
          </div>
        )}

        {/* Coluna 13: Ações & Conferência movidos para o limite da borda direita */}
        <div className="w-28 shrink-0 flex items-center justify-end gap-1.5 pr-0.5">
          
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
            <div className="z-20 flex items-center gap-1.5 bg-slate-950 border border-amber-500 px-2 py-0.5 rounded-lg shadow-xl shadow-black select-none whitespace-nowrap">
              <span className="text-[10px] text-amber-300 font-bold">Desmarcar?</span>
              <button
                onClick={handleConfirmUncheck}
                className="px-1.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[10px] font-bold cursor-pointer transition-colors shadow-sm"
              >
                Sim
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUncheckConfirm(false);
                }}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[10px] font-semibold cursor-pointer transition-colors"
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

          {/* Seletor de Cor da Linha / Card */}
          <div className="relative" ref={colorPickerRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsColorPickerOpen(!isColorPickerOpen);
              }}
              title="Marcar / destacar linha com uma cor"
              className={`p-1 rounded-lg transition-all cursor-pointer ${
                asset.cardColor 
                  ? 'text-white bg-slate-800 ring-1 ring-white/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Palette className={`w-3.5 h-3.5 ${
                asset.cardColor === 'emerald' ? 'text-emerald-400' :
                asset.cardColor === 'blue' ? 'text-blue-400' :
                asset.cardColor === 'amber' ? 'text-amber-400' :
                asset.cardColor === 'rose' ? 'text-rose-400' :
                asset.cardColor === 'purple' ? 'text-purple-400' :
                asset.cardColor === 'cyan' ? 'text-cyan-400' :
                asset.cardColor === 'orange' ? 'text-orange-400' : 'text-slate-400'
              }`} />
            </button>

            {isColorPickerOpen && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-full mb-2 z-50 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-2 flex flex-col gap-1.5 min-w-[170px] animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1 border-b border-slate-800 flex items-center justify-between">
                  <span>Destacar Card</span>
                  {asset.cardColor && (
                    <button 
                      onClick={() => {
                        onUpdateCardColor?.(asset.id, 'default');
                        setIsColorPickerOpen(false);
                      }}
                      className="text-[9px] text-rose-400 hover:underline cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5 p-1">
                  {COLOR_OPTIONS.map((opt) => {
                    const isSelected = (asset.cardColor || 'default') === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onUpdateCardColor?.(asset.id, opt.id);
                          setIsColorPickerOpen(false);
                        }}
                        title={opt.label}
                        className={`w-6 h-6 rounded-full ${opt.bg} border-2 ${
                          isSelected ? 'border-white scale-110 shadow-lg ring-2 ring-indigo-400' : 'border-slate-800 hover:scale-105'
                        } flex items-center justify-center transition-all cursor-pointer`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white drop-shadow" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Menu Dropdown de Ações colado à direita */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                if (rect.top < 260) {
                  setActionsPlacement('bottom');
                } else {
                  setActionsPlacement('top');
                }
                setIsActionsOpen(!isActionsOpen);
              }}
              title="Mais opções do bem"
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
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
                <div className={`absolute right-0 ${
                  actionsPlacement === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
                } w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100`}>
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

                  {!isBaixado && (
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
                  )}

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

                  {/* Opção DTIN para Equipamentos de Informática ou dentro de TI */}
                  {!isBaixado && isInformática && (
                    isEnviadoDtin ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsActionsOpen(false);
                            setIsDtinResumoOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-cyan-300 hover:bg-cyan-950/40 hover:text-cyan-200 transition-colors cursor-pointer text-left font-medium"
                        >
                          <Server className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Ver Detalhes DTIN</span>
                        </button>

                        {showReturnDtinConfirm ? (
                          <div className="p-2 bg-cyan-950/40 rounded-xl border border-cyan-500/30 text-center my-1">
                            <p className="text-[11px] text-cyan-300 font-medium mb-1.5">Confirmar retorno do DTIN?</p>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsActionsOpen(false);
                                  setShowReturnDtinConfirm(false);
                                  onReturnDtin && onReturnDtin(asset.id);
                                }}
                                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Retornar
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowReturnDtinConfirm(false);
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
                              setShowReturnDtinConfirm(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer text-left"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retornar do DTIN</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsActionsOpen(false);
                          onOpenDtin && onOpenDtin(asset);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-cyan-300 hover:bg-cyan-950/40 hover:text-cyan-200 transition-colors cursor-pointer text-left font-medium"
                      >
                        <Server className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Enviar DTIN</span>
                      </button>
                    )
                  )}

                  {isBaixado ? (
                    showCancelBaixaConfirm ? (
                      <div className="p-2 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-center my-1">
                        <p className="text-[11px] text-emerald-300 font-medium mb-1.5">Cancelar baixa e reativar bem?</p>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsActionsOpen(false);
                              setShowCancelBaixaConfirm(false);
                              onCancelBaixa && onCancelBaixa(asset.id);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer"
                          >
                            Reativar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCancelBaixaConfirm(false);
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
                          setShowCancelBaixaConfirm(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer text-left font-semibold"
                        title="Cancelar a baixa patrimonial e reativar o bem no setor"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Cancelar Baixa</span>
                      </button>
                    )
                  ) : (
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
                  )}

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

      {/* Modalzinho Minimalista de Descrição / Sobre o Item */}
      {isDescModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-100"
          onClick={(e) => {
            e.stopPropagation();
            setIsDescModalOpen(false);
          }}
        >
          <div 
            className="bg-slate-900/98 border border-slate-700/80 w-full max-w-sm rounded-2xl p-4 shadow-2xl shadow-black/80 relative animate-in zoom-in-95 duration-100 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Topo Compacto */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Nº {formattedXX}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  Detalhes do Item
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsDescModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Texto Descrição */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-3 shadow-inner">
              <p className="text-slate-100 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap select-text font-medium break-words">
                <HighlightText text={asset.descricao} query={searchTerm} />
              </p>
            </div>

            {/* Micro metadados (Marca / Modelo / Local) */}
            {(asset.marca || asset.modelo || asset.localizacao) && (
              <div className="grid grid-cols-2 gap-1.5 text-[10.5px] mb-3">
                {(asset.marca || asset.modelo) && (
                  <div className="px-2 py-1.5 rounded-lg bg-slate-800/40 border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">Marca / Modelo:</span>
                    <span className="text-slate-200 font-semibold truncate block">
                      {[asset.marca, asset.modelo].filter(Boolean).join(' - ')}
                    </span>
                  </div>
                )}
                {asset.localizacao && (
                  <div className="px-2 py-1.5 rounded-lg bg-slate-800/40 border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">Local:</span>
                    <span className="text-slate-200 font-semibold truncate block">
                      {asset.localizacao}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Ação Rápida */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(asset.descricao || '');
                  setCopiedDesc(true);
                  setTimeout(() => setCopiedDesc(false), 2000);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedDesc ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copiar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsDescModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold shadow-sm transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Cautela */}
      {isCautelaModalViewOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setIsCautelaModalViewOpen(false);
          }}
        >
          <div 
            className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Termo de Cautela / Empréstimo</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      Nº {formattedXX}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      EM ANDAMENTO
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCautelaModalViewOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Item Cautelado</span>
                <p className="text-white font-medium text-sm">
                  <strong className="font-mono text-indigo-400 mr-1.5"><HighlightText text={formattedXX} query={searchTerm} /></strong>
                  <HighlightText text={asset.descricao} query={searchTerm} />
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Responsável / Retirada:</span>
                  <strong className="text-white text-sm block"><HighlightText text={cautelaPessoa} query={searchTerm} /></strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Setor de Destino:</span>
                  <strong className="text-amber-300 text-sm block"><HighlightText text={cautelaDestino} query={searchTerm} /></strong>
                </div>
              </div>

              {cautelaDoc && (
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Documento / Matrícula:</span>
                  <span className="font-mono text-slate-200 font-semibold"><HighlightText text={cautelaDoc} query={searchTerm} /></span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Data de Retirada:</span>
                  <span className="text-slate-200 font-semibold">{cautelaRetirada}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Previsão de Devolução:</span>
                  <strong className="text-amber-400 font-bold">{cautelaDevolucao}</strong>
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="flex items-center justify-end gap-2 mt-5 pt-3.5 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCautelaModalViewOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suspenso: Resumo da Baixa Patrimonial com Abertura Direta de PDF/Documento */}
      {isBaixaResumoOpen && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setIsBaixaResumoOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-rose-500/30 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Resumo da Baixa Patrimonial</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-rose-300 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                      Nº <HighlightText text={formattedXX} query={searchTerm} />
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      BAIXADO / DESINCORPORADO
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBaixaResumoOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="space-y-3.5 text-xs">
              {/* Box Item Info */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Item Baixado</span>
                <p className="text-white font-medium text-sm">
                  <strong className="font-mono text-rose-400 mr-1.5"><HighlightText text={formattedXX} query={searchTerm} /></strong>
                  <HighlightText text={asset.descricao} query={searchTerm} />
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span>Setor: <strong className="text-slate-300 font-medium"><HighlightText text={asset.setorNome || activeSector?.name} query={searchTerm} /></strong></span>
                  {asset.numeroSerie && <span>Série: <strong className="font-mono text-slate-300"><HighlightText text={asset.numeroSerie} query={searchTerm} /></strong></span>}
                </div>
              </div>

              {/* Informações da Baixa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Motivo da Baixa:</span>
                  <strong className="text-rose-300 text-xs block leading-snug">
                    {asset.dadosBaixa?.motivo || 'Baixa Patrimonial Oficial'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Data do Registro:</span>
                  <strong className="text-slate-200 text-xs block">
                    {asset.dadosBaixa?.data || asset.dadosBaixa?.dataHoraRegistro || '01/10/2026'}
                  </strong>
                </div>
              </div>

              {/* Observações / Parecer */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                  Justificativa / Parecer Técnico
                </span>
                <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                  {asset.dadosBaixa?.observacoes || asset.observacao || 'Processo de desincorporação patrimonial homologado.'}
                </p>
              </div>

              {/* Documentos Comprobatórios / Anexos PDF */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                  Documento / Processo Comprobatório (PDF)
                </span>

                {asset.dadosBaixa?.anexos && asset.dadosBaixa.anexos.length > 0 ? (
                  <div className="space-y-2">
                    {asset.dadosBaixa.anexos.map((doc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (doc.url) {
                            window.open(doc.url, '_blank');
                          }
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-rose-500/50 hover:bg-rose-950/20 transition-all text-left group/doc cursor-pointer shadow-sm"
                        title="Clique para abrir o documento/PDF"
                      >
                        <div className="flex items-center gap-2.5 truncate min-w-0">
                          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover/doc:bg-rose-500/20 group-hover/doc:text-rose-300 transition-colors shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-semibold text-slate-200 group-hover/doc:text-white truncate">
                              {doc.nome || `Documento_Baixa_${idx + 1}.pdf`}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              {doc.tamanho && <span>{doc.tamanho}</span>}
                              <span>• Clique para abrir PDF</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-rose-400 group-hover/doc:text-rose-300 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 shrink-0">
                          <span>Abrir PDF</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (asset.dadosBaixa?.documento || asset.documento) ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const docUrl = asset.dadosBaixa?.documentoUrl || asset.documentoUrl || asset.dadosBaixa?.documento || asset.documento;
                      if (docUrl && (docUrl.startsWith('http') || docUrl.startsWith('data:'))) {
                        window.open(docUrl, '_blank');
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-rose-500/50 hover:bg-rose-950/20 transition-all text-left cursor-pointer group/doc"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover/doc:bg-rose-500/20 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {asset.dadosBaixa?.documento || asset.documento}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-rose-400 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 shrink-0">
                      <span>Visualizar</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-center text-slate-400 text-xs">
                    Nenhum documento ou PDF anexado neste registro de baixa.
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé */}
            <div className="flex items-center justify-between gap-2 mt-5 pt-3.5 border-t border-slate-800">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Deseja realmente cancelar a baixa deste patrimônio e reativá-lo no setor?')) {
                    setIsBaixaResumoOpen(false);
                    onCancelBaixa && onCancelBaixa(asset.id);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cancelar o processo de baixa e reativar este bem no balanço do setor"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cancelar Baixa (Reativar)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBaixaResumoOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suspenso: Resumo do Envio ao DTIN com Abertura Direta de PDF/Documento */}
      {isDtinResumoOpen && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setIsDtinResumoOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-cyan-500/30 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Equipamento Enviado ao DTIN</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      Nº {formattedXX}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      EM ATENDIMENTO NO DTIN
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDtinResumoOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="space-y-3.5 text-xs">
              {/* Box Item Info */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Item de Informática</span>
                <p className="text-white font-medium text-sm">
                  <strong className="font-mono text-cyan-400 mr-1.5"><HighlightText text={formattedXX} query={searchTerm} /></strong>
                  <HighlightText text={asset.descricao} query={searchTerm} />
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span>Setor: <strong className="text-slate-300 font-medium"><HighlightText text={asset.setorNome || activeSector?.name} query={searchTerm} /></strong></span>
                  {asset.numeroSerie && <span>S/N: <strong className="font-mono text-slate-300"><HighlightText text={asset.numeroSerie} query={searchTerm} /></strong></span>}
                </div>
              </div>

              {/* Informações do Envio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Finalidade / Motivo:</span>
                  <strong className="text-cyan-300 text-xs block leading-snug">
                    {asset.dadosDtin?.motivo || 'Manutenção Corretiva / Suporte Técnico'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Data do Envio:</span>
                  <strong className="text-slate-200 text-xs block">
                    {asset.dadosDtin?.data || '01/10/2026'}
                  </strong>
                </div>
              </div>

              {/* Chamado & Responsável */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {asset.dadosDtin?.chamado && (
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Nº Chamado / O.S.:</span>
                    <strong className="text-indigo-300 font-mono text-xs block">
                      {asset.dadosDtin.chamado}
                    </strong>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Solicitante / Responsável:</span>
                  <strong className="text-slate-200 text-xs block">
                    {asset.dadosDtin?.responsavel || activeSector?.responsavel || 'Operador'}
                  </strong>
                </div>
              </div>

              {/* Observações / Descrição do Defeito */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                  Descrição do Problema / Procedimento
                </span>
                <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                  {asset.dadosDtin?.observacoes || 'Equipamento entregue ao DTIN para avaliação técnica.'}
                </p>
              </div>

              {/* Documentos Comprobatórios / Anexos PDF */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                  Documento / Guia de Remessa / O.S. (PDF)
                </span>

                {asset.dadosDtin?.anexos && asset.dadosDtin.anexos.length > 0 ? (
                  <div className="space-y-2">
                    {asset.dadosDtin.anexos.map((doc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (doc.url) {
                            window.open(doc.url, '_blank');
                          }
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all text-left group/doc cursor-pointer shadow-sm"
                        title="Clique para abrir o documento/PDF"
                      >
                        <div className="flex items-center gap-2.5 truncate min-w-0">
                          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover/doc:bg-cyan-500/20 group-hover/doc:text-cyan-300 transition-colors shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-semibold text-slate-200 group-hover/doc:text-white truncate">
                              {doc.nome || `Documento_DTIN_${idx + 1}.pdf`}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              {doc.tamanho && <span>{doc.tamanho}</span>}
                              <span>• Clique para abrir PDF</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover/doc:text-cyan-300 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                          <span>Abrir PDF</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-center text-slate-400 text-xs">
                    Nenhum documento ou PDF anexado neste envio.
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé */}
            <div className="flex items-center justify-between gap-2 mt-5 pt-3.5 border-t border-slate-800">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Deseja confirmar o retorno deste equipamento do DTIN para o setor?')) {
                    setIsDtinResumoOpen(false);
                    onReturnDtin && onReturnDtin(asset.id);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Confirmar retorno do DTIN e reintegrar equipamento ao setor"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirmar Retorno do DTIN</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDtinResumoOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
