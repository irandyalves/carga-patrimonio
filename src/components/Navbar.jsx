import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Boxes, 
  Search, 
  Mic, 
  MicOff,
  QrCode, 
  Plus, 
  Handshake, 
  ShieldCheck,
  Users,
  LogOut,
  Crown,
  Shield,
  X,
  PanelLeft,
  Inbox,
  ChevronDown,
  Check,
  UserCheck,
  Hash,
  CheckCircle2,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Bell,
  Server,
  Building2
} from 'lucide-react';
import { 
  startVoiceRecognition, 
  isSpeechRecognitionSupported 
} from '../services/speechRecognition';

export const Navbar = ({
  searchTerm,
  setSearchTerm,
  onOpenQrScanner,
  onOpenNewAsset,
  onOpenCautelas,
  onOpenLabels,
  onOpenExcel,
  onOpenFirebaseConfig,
  onOpenBackup,
  onOpenUsers,
  onVoiceDirectSearch,
  currentUser,
  userRole,
  onLogout,
  isFirebaseActive,
  cautelasCount = 0,
  conferidosCount = 0,
  onScrollToConferidos,
  onToggleSidebar,
  onOpenPedidos,
  pedidosCount = 0,
  onOpenDtinPendencias,
  dtinPendenciasCount = 0,
  currentPersona,
  onSelectPersona,
  sectors = [],
  activeSectorName = '',
  filterMode = 'MY_SECTOR',
  sortField = 'numeroPatrimonio',
  sortDirection = 'asc',
  onSort,
  isFullscreen = false,
  onToggleFullscreen,
  displaySettings
}) => {
  const isAdmin = userRole === 'admin';
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const userMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const searchInputRef = useRef(null);

  // Agrupa setores por detentor da carga (ordem alfabética pelo detentor)
  const groupedResponsibles = useMemo(() => {
    const map = new Map();
    sectors.forEach(sec => {
      const respKey = (sec.responsavel || sec.name || 'Sem Responsável').trim();
      if (!map.has(respKey)) {
        map.set(respKey, {
          responsavel: respKey,
          primarySectorId: sec.id,
          sectors: []
        });
      }
      map.get(respKey).sectors.push(sec);
    });
    return Array.from(map.values()).sort((a, b) => a.responsavel.localeCompare(b.responsavel, 'pt-BR'));
  }, [sectors]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const handleToggleVoice = () => {
    if (isVoiceListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsVoiceListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert('Reconhecimento de voz não é suportado pelo seu navegador. Use o Google Chrome ou Edge.');
      return;
    }

    setIsVoiceListening(true);
    try {
      const rec = startVoiceRecognition({
        onResult: ({ transcript, isFinal }) => {
          if (!transcript) return;
          const cleanText = transcript.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();
          setSearchTerm(cleanText);

          if (isFinal) {
            setIsVoiceListening(false);
            if (onVoiceDirectSearch) {
              onVoiceDirectSearch(cleanText);
            }
          }
        },
        onEnd: () => {
          setIsVoiceListening(false);
        },
        onError: (err) => {
          console.warn('Erro na busca por voz:', err);
          setIsVoiceListening(false);
        }
      });
      recognitionRef.current = rec;
    } catch (err) {
      console.error('Falha ao iniciar reconhecimento de voz:', err);
      setIsVoiceListening(false);
    }
  };

  const handleOpenMobileSearch = () => {
    setIsMobileSearchOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleCloseMobileSearch = () => {
    setIsMobileSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="w-full px-2 sm:px-4">
        <div className="flex items-center justify-between h-16 gap-1.5 sm:gap-3">
          
          {/* GRUPO ESQUERDA: Sidebar, Conferidos e Fullscreen (Ocultos no mobile quando a busca está aberta) */}
          <div className={`items-center gap-1.5 sm:gap-2 shrink-0 ${isMobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
            {/* Abrir / Recolher Setores */}
            <button
              onClick={onToggleSidebar}
              title="Abrir/Recolher Barra Lateral de Setores"
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center active:scale-95"
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            {/* Ir direto para Conferidos */}
            <button
              type="button"
              onClick={onScrollToConferidos}
              title={`Ir para a seção de Conferidos (${conferidosCount || 0} itens)`}
              className="px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-mono font-bold text-emerald-400">{conferidosCount || 0}</span>
            </button>
          </div>

          {/* GRUPO CENTRAL: Campo de Busca com expansão suave para a esquerda no mobile */}
          <div className="flex-1 flex items-center min-w-0 max-w-xl mx-1 sm:mx-2">
            
            {/* Versão Mobile: Botão da Lupa quando fechado */}
            {!isMobileSearchOpen && (
              <button
                type="button"
                onClick={handleOpenMobileSearch}
                title="Buscar patrimônio"
                className="md:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Campo de Busca Expansível (Visível sempre em desktop ou no mobile quando aberto) */}
            <div className={`w-full relative flex items-center transition-all duration-300 ${
              isMobileSearchOpen ? 'flex' : 'hidden md:flex'
            }`}>
              
              {/* Botão Fechar/Voltar Busca no Mobile */}
              {isMobileSearchOpen && (
                <button
                  type="button"
                  onClick={handleCloseMobileSearch}
                  className="md:hidden p-1.5 mr-1 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 cursor-pointer active:scale-95 shrink-0"
                  title="Fechar busca"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              <div className="relative flex-1 flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <Search className="w-4 h-4" />
                </div>
                
                <input
                  ref={searchInputRef}
                  id="main-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    isVoiceListening 
                      ? "🎙️ Ouvindo... Fale o patrimônio" 
                      : filterMode === 'MY_SECTOR' && activeSectorName
                        ? `Buscar em ${activeSectorName}...`
                        : "Buscar patrimônio ou descrição..."
                  }
                  className={`w-full bg-slate-800/90 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-all ${
                    isVoiceListening 
                      ? 'ring-2 ring-rose-500/50 bg-slate-900/90 placeholder-rose-300 font-medium' 
                      : 'focus:ring-2 focus:ring-indigo-500/50'
                  }`}
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                    title="Limpar texto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* GRUPO ISOLADO: Microfone (Voz), QR Code (Câmera), Fullscreen e Ordenação (junto à busca) */}
            <div className="flex items-center gap-1.5 ml-1.5 shrink-0">
              {/* Equalizador de Voz em tempo real quando ouvindo */}
              {isVoiceListening && (
                <div className="flex items-center gap-0.5 px-1 py-1" title="Captando áudio...">
                  <span className="w-1 h-3 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-4.5 bg-rose-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-2 bg-rose-400 rounded-full animate-bounce" />
                </div>
              )}

              {/* Botão de Microfone / Voz */}
              <button
                type="button"
                onClick={handleToggleVoice}
                title={isVoiceListening ? "Ouvindo sua voz... Clique para parar" : "Busca por Voz (Fale o número ou descrição)"}
                className={`relative p-2 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center active:scale-95 ${
                  isVoiceListening
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/60 ring-2 ring-rose-400 scale-105'
                    : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-indigo-600'
                }`}
              >
                {isVoiceListening && (
                  <>
                    <span className="absolute -inset-1 rounded-xl bg-rose-500/60 animate-ping pointer-events-none" />
                    <span className="absolute -inset-2 rounded-xl bg-rose-500/30 animate-pulse pointer-events-none" />
                  </>
                )}
                <Mic className={`w-4 h-4 relative z-10 ${isVoiceListening ? 'animate-pulse text-white' : ''}`} />
              </button>

              {/* Botão de QR Code / Código de Barras */}
              <button
                type="button"
                onClick={onOpenQrScanner}
                title="Escanear QR Code / Código de Barras pela Câmera"
                className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-blue-600 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
              >
                <QrCode className="w-4 h-4" />
              </button>

              {/* Alternar Tela Cheia Total (Fullscreen) */}
              {onToggleFullscreen && (
                <button
                  type="button"
                  onClick={onToggleFullscreen}
                  title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia Total (Fullscreen)"}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                    isFullscreen
                      ? 'bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-400/50 shadow-sm'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white'
                  }`}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-indigo-400" />
                  )}
                </button>
              )}
            </div>

          </div>

          {/* GRUPO DIREITA: Ações Desktop */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

            {/* Sino / Notificações de Envio ao DTIN (Visível em todas as telas) */}
            <button
              type="button"
              onClick={onOpenDtinPendencias}
              title={`Avisos e Autorizações de Envio ao DTIN (${dtinPendenciasCount || 0} pendente${dtinPendenciasCount === 1 ? '' : 's'})`}
              className={`relative px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                dtinPendenciasCount > 0
                  ? 'bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/70 shadow-lg shadow-cyan-950/60'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Bell className={`w-4 h-4 shrink-0 transition-transform ${dtinPendenciasCount > 0 ? 'text-cyan-400 animate-pulse scale-110' : 'text-slate-400'}`} />
                {dtinPendenciasCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>
              <span className="hidden lg:inline">DTIN</span>
              <span className={`px-1.5 py-0.5 font-mono font-bold rounded-full text-[10px] leading-none transition-all ${
                dtinPendenciasCount > 0 
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/40 font-black' 
                  : 'bg-slate-800/90 text-slate-400 border border-slate-700/60'
              }`}>
                {dtinPendenciasCount || 0}
              </span>
            </button>

            {/* Ações Desktop (Visíveis apenas em telas maiores / md+) */}
            <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
              
              {/* Pedidos & Solicitações de Carga */}
              <button
                type="button"
                onClick={onOpenPedidos}
                title={`Central de Pedidos e Solicitações de Carga (${pedidosCount || 0} pendente${pedidosCount === 1 ? '' : 's'})`}
                className="relative px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
              >
                <Inbox className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="hidden md:inline">Pedidos</span>
                <span className={`px-1.5 py-0.5 font-mono font-bold rounded-full text-[10px] leading-none transition-all ${
                  pedidosCount > 0 
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/40 animate-pulse' 
                    : 'bg-slate-800/90 text-slate-400 border border-slate-700/60'
                }`}>
                  {pedidosCount || 0}
                </span>
              </button>

              {/* Cautelas / Empréstimos Button with Badge */}
              <button
                type="button"
                onClick={onOpenCautelas}
                title={`Módulo de Empréstimos & Cautelas (${cautelasCount || 0} em andamento)`}
                className="relative px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
              >
                <Handshake className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="hidden md:inline">Cautelas</span>
                <span className={`px-1.5 py-0.5 font-mono font-bold rounded-full text-[10px] leading-none transition-all ${
                  cautelasCount > 0 
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/40' 
                    : 'bg-slate-800/90 text-slate-400 border border-slate-700/60'
                }`}>
                  {cautelasCount || 0}
                </span>
              </button>

              {/* Backup Tríplice Button */}
              <button
                onClick={onOpenBackup}
                title="Central de Backups (Local, Firebase e Google Drive)"
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-emerald-300 hover:bg-slate-800/80 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="hidden md:inline">Backup</span>
              </button>

              {/* Admin: Users Management */}
              {isAdmin && (
                <button
                  onClick={onOpenUsers}
                  title="Gerenciar Usuários e Permissões de Acesso"
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-indigo-300 hover:bg-slate-800/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="hidden lg:inline">Usuários</span>
                </button>
              )}

              {/* New Asset Button with Vibrant Glowing Green + */}
              {isAdmin && (
                <button
                  onClick={onOpenNewAsset}
                  title="Cadastrar Novo Bem Patrimonial"
                  className="px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-black text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15 flex items-center gap-1.5 transition-all cursor-pointer group shadow-[0_0_12px_rgba(16,185,129,0.25)] hover:shadow-[0_0_18px_rgba(16,185,129,0.45)]"
                >
                  <Plus className="w-5 h-5 text-emerald-400 stroke-[3.5] shrink-0 drop-shadow-[0_0_10px_rgba(52,211,153,0.95)] group-hover:scale-115 transition-transform" />
                  <span className="hidden sm:inline font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] tracking-wide">Novo Bem</span>
                </button>
              )}

              {/* User Profile Avatar with Click-to-Switch Listbox */}
              {currentUser && (
                <div className="relative flex items-center gap-2 pl-2 border-l border-slate-800 ml-1" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 group cursor-pointer p-1 rounded-xl hover:bg-slate-800/60 transition-all focus:outline-none"
                    title="Clique na foto para alternar usuário/setor ou gerenciar perfil"
                  >
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Avatar" 
                        className={`w-8 h-8 rounded-full ring-2 ${isAdmin ? 'ring-amber-400' : 'ring-emerald-400'} group-hover:ring-emerald-300 object-cover transition-all shadow-md`} 
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full ${isAdmin ? 'bg-gradient-to-tr from-amber-600 to-indigo-600 ring-amber-400' : 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-emerald-400'} text-white flex items-center justify-center font-bold text-xs ring-2 group-hover:ring-emerald-300 transition-all shadow-md`}>
                        {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="hidden xl:block text-left">
                      <p className="text-xs font-semibold text-white truncate max-w-[110px] group-hover:text-emerald-300 transition-colors">
                        {currentUser.displayName || currentUser.email.split('@')[0]}
                      </p>
                      <p className="text-[10px] uppercase font-bold flex items-center gap-0.5">
                        {isAdmin ? <Crown className="w-2.5 h-2.5 text-amber-400 inline" /> : <Shield className="w-2.5 h-2.5 inline text-emerald-400" />}
                        <span className={isAdmin ? 'text-amber-400' : 'text-emerald-400'}>
                          {isAdmin ? 'Admin' : 'Operador'}
                        </span>
                      </p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 hidden sm:block ${isUserMenuOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                  </button>

                  {/* Popover Dropdown Menu Opened on Avatar Click */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-900/98 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/90 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      
                      {/* Header do Usuário Atual */}
                      <div className="flex items-center gap-3 p-2 bg-slate-800/60 rounded-xl mb-2">
                        {currentUser.photoURL ? (
                          <img 
                            src={currentUser.photoURL} 
                            alt="Avatar" 
                            className={`w-10 h-10 rounded-full ring-2 ${isAdmin ? 'ring-amber-400' : 'ring-emerald-400'} object-cover`} 
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full ${isAdmin ? 'bg-gradient-to-tr from-amber-600 to-indigo-600 ring-amber-400' : 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-emerald-400'} text-white flex items-center justify-center font-bold text-sm ring-2`}>
                            {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {currentUser.displayName || currentUser.email.split('@')[0]}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate font-mono">
                            {currentUser.email}
                          </p>
                          <div className="mt-1 flex items-center gap-1">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isAdmin 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {isAdmin ? <Crown className="w-2.5 h-2.5" /> : <Shield className="w-2.5 h-2.5" />}
                              {isAdmin ? 'Administrador' : 'Operador'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Alternador de Perfis / Setores */}
                      {onSelectPersona && (
                        <div className="mt-2 pt-2 border-t border-slate-800">
                          <div className="px-2 pb-1.5 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-emerald-400" />
                              Trocar Visão de Setor
                            </span>
                            <span className="text-[9.5px] text-slate-500 font-mono">
                              {groupedResponsibles.length + 1} opções
                            </span>
                          </div>

                          {/* Listbox com altura para opções simultâneas */}
                          <div className="max-h-[380px] overflow-y-auto scrollbar-thin pr-0.5 space-y-1">
                            {/* Opção Admin: Irandy (Detentor) à esquerda • Admin Geral (Papel) à direita */}
                            <button
                              type="button"
                              onClick={() => {
                                onSelectPersona('admin');
                                setIsUserMenuOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                                (!currentPersona || currentPersona.id === 'admin')
                                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                                  : 'hover:bg-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-sm shrink-0">👑</span>
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className={`font-bold text-xs ${displaySettings?.sectorResponsavelColor || 'text-orange-400'} truncate`}>
                                    Irandy
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-slate-500 shrink-0" />
                                  <span className="text-amber-300 font-semibold text-[11px] truncate">
                                    Admin Geral
                                  </span>
                                </div>
                              </div>
                              {(!currentPersona || currentPersona.id === 'admin') && (
                                <Check className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
                              )}
                            </button>

                            {/* Opções dos Detentores da Carga (Lado Esquerdo: Detentor | Lado Direito: Setor ou Hint Bolinha) */}
                            {groupedResponsibles.map((item) => {
                              const isSelected = currentPersona && currentPersona.id !== 'admin' && (
                                currentPersona.sectorIds?.some(id => item.sectors.some(s => s.id === id)) ||
                                currentPersona.sectorId === item.primarySectorId ||
                                currentPersona.id === item.primarySectorId
                              );

                              return (
                                <div
                                  key={item.responsavel}
                                  className={`w-full px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-500/20 font-bold'
                                      : 'hover:bg-slate-800 text-slate-300'
                                  }`}
                                  onClick={() => {
                                    onSelectPersona(item.primarySectorId);
                                    setIsUserMenuOpen(false);
                                  }}
                                >
                                  {/* Lado Esquerdo: Detentor da Carga */}
                                  <div className="flex items-center gap-2 min-w-0 pr-2">
                                    <span className="text-sm shrink-0">👤</span>
                                    <span className={`font-bold text-xs ${displaySettings?.sectorResponsavelColor || 'text-orange-400'} truncate`}>
                                      {item.responsavel}
                                    </span>
                                  </div>

                                  {/* Lado Direito: Se 1 setor exibe o nome, se > 1 exibe hint bolinha com hover */}
                                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    {item.sectors.length === 1 ? (
                                      <span className="text-emerald-400 font-semibold text-[11px] truncate max-w-[120px] text-right">
                                        {item.sectors[0].name}
                                      </span>
                                    ) : (
                                      <div className="relative group/hint">
                                        <div 
                                          onClick={() => {
                                            onSelectPersona(item.primarySectorId);
                                            setIsUserMenuOpen(false);
                                          }}
                                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold cursor-pointer transition-colors"
                                          title={`Clique para selecionar ou passe o mouse para ver os ${item.sectors.length} setores`}
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                          <span>{item.sectors.length} setores</span>
                                        </div>

                                        {/* Hint / Tooltip flutuante ao passar o mouse */}
                                        <div className="absolute right-0 top-full mt-1.5 hidden group-hover/hint:block z-50 bg-slate-950/98 backdrop-blur-xl border border-slate-700 p-2.5 rounded-2xl shadow-2xl min-w-[200px] pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                                          <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            <Building2 className="w-3 h-3 text-emerald-400" />
                                            <span>Setores sob responsabilidade:</span>
                                          </div>
                                          <div className="mt-1.5 space-y-1 max-h-48 overflow-y-auto">
                                            {item.sectors.map(s => (
                                              <div key={s.id} className="text-xs text-emerald-300 font-medium flex items-center gap-2 py-0.5 px-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                                <span className="truncate">{s.name}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {isSelected && (
                                      <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Botão de Logout */}
                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sair da Conta (Logout)</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
