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
  Info
} from 'lucide-react';
import { STATUS } from '../constants/sectors';

export const AssetTableRowCard = ({
  asset,
  activeSector,
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

  // Truncamento inteligente para descrições longas com hint bonito
  const isDescLong = (asset.descricao || '').length > 42;
  const shortDesc = isDescLong 
    ? `${asset.descricao.slice(0, 39).trim()}...` 
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

  return (
    <div className={`relative rounded-xl border transition-all duration-200 overflow-visible group w-full ${
      isOutOfPlace 
        ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400/60' 
        : isConferido 
          ? 'bg-slate-850/90 border-blue-500/40 shadow-sm shadow-blue-950/20 hover:border-blue-400/60' 
          : isBaixado
            ? 'bg-slate-900/60 border-rose-500/30 opacity-75'
            : 'bg-slate-850/90 border-slate-800 hover:border-slate-700 shadow-sm'
    }`}>
      
      {/* Aviso se for item fora da seção oficial */}
      {isOutOfPlace && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-3 py-1.5 text-xs text-amber-300 flex items-center justify-between gap-2">
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

      {/* Linha Principal (Colunas alinhadas ocupando toda a largura da tela) */}
      <div className="p-3 sm:px-5 sm:py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs w-full">
        
        {/* Coluna 1: Patrimônio (Fonte Dobrada, SEM BORDAS, SEM BADGE PENDENTE) */}
        <div className="lg:w-32 shrink-0 flex items-center gap-1.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-indigo-400 select-all leading-none">
                {formattedXX}
              </span>
              <button
                onClick={handleCopyTag}
                title="Copiar número do patrimônio"
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Tags e Badges especiais (Pendente removido conforme solicitado) */}
            <div className="mt-1 flex items-center gap-1.5">
              {prefix && (
                <span className="text-[10px] font-mono text-slate-500">
                  {prefix}
                </span>
              )}
              {isConferido ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Conferido
                </span>
              ) : isEmCautela ? (
                <div className="relative group/cautela inline-block">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 px-2 py-0.5 rounded border border-amber-500/30 cursor-pointer transition-all shadow-sm">
                    <Handshake className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Está com: <strong className="text-white">{cautelaDestino}</strong> ({cautelaPessoa})</span>
                  </div>

                  {/* Floating Document Popover on Hover */}
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover/cautela:flex flex-col z-50 w-72 sm:w-80 bg-slate-900/98 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-3.5 shadow-2xl shadow-purple-950/60 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">Doc. de Cautela / Empréstimo</div>
                          <div className="text-[10px] text-purple-300 font-mono">#{asset.cautelaAtual?.id || 'CAUTELA'}</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        EM ANDAMENTO
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-slate-400">Item: </span>
                        <strong className="text-white font-mono">{formattedXX}</strong> - {asset.descricao}
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Cautelado por:</span>
                          <strong className="text-purple-300">{cautelaPessoa}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Setor de Destino:</span>
                          <strong className="text-amber-300">{cautelaDestino}</strong>
                        </div>
                      </div>
                      {cautelaDoc && (
                        <div>
                          <span className="text-slate-400 text-[10px]">Doc / Matrícula: </span>
                          <span className="font-mono text-slate-300">{cautelaDoc}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Data Retirada:</span>
                          <span className="text-slate-300">{cautelaRetirada}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Previsão Devolução:</span>
                          <span className="text-amber-400 font-semibold">{cautelaDevolucao}</span>
                        </div>
                      </div>
                      {asset.cautelaAtual?.finalidade && (
                        <div className="pt-1 border-t border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Finalidade:</span>
                          <span className="text-slate-300 italic">"{asset.cautelaAtual.finalidade}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : isBaixado ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                  <Archive className="w-3 h-3" /> Baixado
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Coluna 2: Quantidade (SEM BORDAS, Centralizado) */}
        <div className="lg:w-14 shrink-0 flex items-center lg:justify-center">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-slate-400 lg:hidden">Qtde:</span>
            <span className="font-black text-xl sm:text-2xl text-cyan-300">
              {asset.quantidade || 1}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">un</span>
          </div>
        </div>

        {/* Coluna 3: Descrição do Bem (ESPAÇO MÁXIMO) + Hint Bonito para Descrição Longa */}
        <div className="flex-1 min-w-[280px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 
              className="text-sm sm:text-base font-semibold text-slate-100 group-hover:text-white transition-colors leading-snug"
              title={asset.descricao}
            >
              {shortDesc}
            </h4>

            {isDescLong && (
              <div className="relative group/hint inline-flex items-center">
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 bg-indigo-500/10 border border-indigo-500/30 transition-all cursor-pointer shadow-sm"
                  title="Passe o mouse para ver a descrição completa"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {/* Hint Bonito / Tooltip Flutuante */}
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover/hint:flex flex-col z-50 w-72 sm:w-96 bg-slate-900/98 backdrop-blur-xl border border-indigo-500/50 rounded-2xl p-3.5 shadow-2xl shadow-indigo-950/80 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                  <div className="flex items-center gap-2 pb-1.5 mb-1.5 border-b border-indigo-500/20">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-bold text-white text-[11px] uppercase tracking-wider">Descrição Completa</span>
                    <span className="ml-auto font-mono text-[10px] text-indigo-300 font-bold">{formattedXX}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-medium text-xs break-words">
                    {asset.descricao}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1 text-xs text-slate-400">
            {/* Localização Editável: Escolher / Digitar / Falar no Microfone */}
            {isEditingLocation ? (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="inline-flex items-center gap-1 bg-slate-900 border border-blue-500/70 rounded-xl p-1 shadow-xl z-20"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-1" />
                <input
                  type="text"
                  list={`loc-presets-${asset.id}`}
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveLocation(e);
                    if (e.key === 'Escape') setIsEditingLocation(false);
                  }}
                  placeholder="Ex: Está na sala de reuniões"
                  className="bg-slate-800 text-white text-xs px-2 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-400 min-w-[190px] sm:min-w-[240px]"
                  autoFocus
                />
                
                {/* Opções rápidas de escolha */}
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

                {/* Microfone para ditar por voz */}
                <button
                  type="button"
                  onClick={startLocationVoice}
                  title="Falar por voz no celular ou computador"
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isListeningLoc 
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse' 
                      : 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>

                {/* Salvar */}
                <button
                  type="button"
                  onClick={handleSaveLocation}
                  title="Salvar Localização"
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>

                {/* Cancelar */}
                <button
                  type="button"
                  onClick={() => setIsEditingLocation(false)}
                  title="Cancelar"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 group/loc">
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
                  title={canManageAsset ? "Clique para editar a localização (digitar ou escolher)" : "Bem de outro departamento: clique para informar localização e fazer pedido de carga"}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-blue-500/50 text-slate-300 hover:text-white transition-all text-xs cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate max-w-[200px]">
                    {asset.localizacao || 'Definir localização...'}
                  </span>
                  <Edit3 className="w-3 h-3 text-slate-400 opacity-60 group-hover/loc:opacity-100 ml-0.5" />
                </button>

                {/* Botão de microfone direto para ditar no mobile */}
                <button
                  type="button"
                  onClick={startLocationVoice}
                  title="Ditar localização por voz (ex: 'Está na sala de reuniões')"
                  className={`p-1 rounded-lg border transition-all cursor-pointer ${
                    isListeningLoc 
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' 
                      : 'bg-slate-800/80 hover:bg-blue-600/20 text-slate-400 hover:text-blue-300 border-slate-700/60'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Coluna 4: Responsável (Compacto) */}
        <div className="lg:w-36 shrink-0 flex items-center lg:justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0">
              <User className="w-3 h-3" />
            </div>
            <div className="truncate text-left">
              <span className="text-[10px] text-slate-400 block lg:hidden">Responsável:</span>
              <span className="font-semibold text-slate-200 truncate block text-xs" title={asset.responsavel}>
                {asset.responsavel || 'Não definido'}
              </span>
              {isGeneralView && asset.setorNome && (
                <span className="text-[10px] text-slate-400 block truncate">
                  {asset.setorNome}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Coluna 5: Data de Aquisição (Espremido) */}
        <div className="lg:w-24 shrink-0 flex items-center lg:justify-center text-center">
          <div className="flex items-center gap-1 text-slate-300">
            <Calendar className="w-3 h-3 text-slate-400 shrink-0 hidden sm:block" />
            <div>
              <span className="text-[10px] text-slate-400 block lg:hidden">Data Aquisição:</span>
              <span className="font-medium text-xs">
                {asset.dataAquisicao || asset.anoAquisicao || '---'}
              </span>
            </div>
          </div>
        </div>

        {/* Coluna 6: Valor Original (Espremido) */}
        <div className="lg:w-24 shrink-0 flex items-center lg:justify-center text-center">
          <div>
            <span className="text-[10px] text-slate-400 block lg:hidden">Valor Original:</span>
            <span className="font-semibold text-slate-200 text-xs">
              {formatCurrency(asset.valorOriginal)}
            </span>
          </div>
        </div>

        {/* Coluna 7: Valor Atual (Espremido) */}
        <div className="lg:w-24 shrink-0 flex items-center lg:justify-center text-center">
          <div>
            <span className="text-[10px] text-slate-400 block lg:hidden">Valor Atual:</span>
            <span className="font-bold text-emerald-400 text-xs">
              {formatCurrency(asset.valorAtual || asset.valorOriginal)}
            </span>
          </div>
        </div>

        {/* Coluna 8: Ações & Conferência (Colado na Direita) */}
        <div className="lg:w-40 shrink-0 flex items-center justify-end gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800 pr-1">
          
          {/* Botão de Conferência ou Bloqueio / Pedido de Carga */}
          {!canManageAsset ? (
            hasPendingPedido ? (
              <span className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 select-none">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Enviado</span>
              </span>
            ) : (
              <button
                onClick={() => onOpenSolicitacao(asset)}
                title="Este bem pertence a outro departamento. Clique para fazer um pedido e informar a qual setor ele pertence."
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25 transition-all cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>Pedido</span>
              </button>
            )
          ) : isGeneralView ? (
            <div 
              title="Na aba Geral não se pode conferir carga. Entre no setor específico para conferir."
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 text-slate-400 bg-slate-900/90 border border-slate-800 cursor-not-allowed select-none"
            >
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Bloqueado</span>
            </div>
          ) : isBaixado ? (
            <div className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 select-none">
              Baixado
            </div>
          ) : showUncheckConfirm ? (
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 p-1 rounded-xl">
              <span className="text-[10px] text-amber-200 font-bold px-1">Desmarcar?</span>
              <button
                onClick={handleConfirmUncheck}
                className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[10px] font-bold cursor-pointer"
              >
                Sim
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUncheckConfirm(false);
                }}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer"
              >
                Não
              </button>
            </div>
          ) : (
            <button
              onClick={handleConferenceClick}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isConferido
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:scale-[1.02]'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isConferido ? 'text-emerald-400' : 'text-white'}`} />
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
