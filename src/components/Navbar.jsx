import React, { useState, useEffect, useRef } from 'react';
import { 
  Boxes, 
  Search, 
  Mic, 
  MicOff,
  QrCode, 
  Plus, 
  FileSpreadsheet,
  FileText,
  FileCode,
  File,
  UploadCloud, 
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
  UserCheck
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
  onToggleSidebar,
  onOpenPedidos,
  pedidosCount = 0,
  currentPersona,
  onSelectPersona,
  sectors = [],
  activeSectorName = '',
  filterMode = 'MY_SECTOR'
}) => {
  const isAdmin = userRole === 'admin';
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const userMenuRef = React.useRef(null);
  const importMenuRef = React.useRef(null);
  const recognitionRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (importMenuRef.current && !importMenuRef.current.contains(event.target)) {
        setIsImportMenuOpen(false);
      }
    };
    if (isUserMenuOpen || isImportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isImportMenuOpen]);

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

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="w-full px-2 sm:px-4">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Title with Slide Bar Toggle Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleSidebar}
              title="Abrir/Recolher Barra Lateral de Setores"
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center active:scale-95 border border-blue-400/40"
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">Carga Patrimonial</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ONLINE
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar with Inline Voice and QR inside */}
          <div className="flex-1 max-w-xl mx-2">
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              
              <input
                id="main-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  isVoiceListening 
                    ? "🎙️ Ouvindo... Fale o patrimônio ou descrição" 
                    : filterMode === 'MY_SECTOR' && activeSectorName
                      ? `Buscar em ${activeSectorName} (ou digite direto)...`
                      : "Buscar patrimônio por número ou descrição..."
                }
                className={`w-full bg-slate-800/90 border rounded-xl pl-9 pr-28 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-all ${
                  isVoiceListening 
                    ? 'border-rose-500 ring-2 ring-rose-500/40 bg-slate-900/90 placeholder-rose-300 font-medium' 
                    : 'border-slate-700/80 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500'
                }`}
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-24 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Voice & QR Scanner Buttons inside Search Bar */}
              <div className="absolute right-1.5 flex items-center gap-1.5">
                {/* Voice Equalizer Visual Waves when listening */}
                {isVoiceListening && (
                  <div className="flex items-center gap-0.5 px-1 py-1" title="Captando áudio...">
                    <span className="w-1 h-3 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-4.5 bg-rose-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-2 bg-rose-400 rounded-full animate-bounce" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleToggleVoice}
                  title={isVoiceListening ? "Ouvindo sua voz... Clique para parar" : "Busca por Voz (Fale o número ou descrição - Busca direta)"}
                  className={`relative p-1.5 rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center ${
                    isVoiceListening
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/60 ring-2 ring-rose-400 scale-105'
                      : 'text-slate-300 hover:text-white bg-slate-700/50 hover:bg-indigo-600'
                  }`}
                >
                  {isVoiceListening && (
                    <>
                      <span className="absolute -inset-1 rounded-lg bg-rose-500/60 animate-ping pointer-events-none" />
                      <span className="absolute -inset-2 rounded-lg bg-rose-500/30 animate-pulse pointer-events-none" />
                    </>
                  )}
                  <Mic className={`w-4 h-4 relative z-10 ${isVoiceListening ? 'animate-pulse text-white' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={onOpenQrScanner}
                  title="Escanear QR Code / Código de Barras pela Câmera"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-700/50 hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Pedidos & Solicitações de Carga */}
            <button
              onClick={onOpenPedidos}
              title="Central de Pedidos e Solicitações de Carga"
              className="relative px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Inbox className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden md:inline">Pedidos</span>
              {pedidosCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px] animate-pulse">
                  {pedidosCount}
                </span>
              )}
            </button>

            {/* Cautelas / Empréstimos Button with Badge */}
            <button
              onClick={onOpenCautelas}
              title="Módulo de Empréstimos & Cautelas"
              className="relative px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Handshake className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden md:inline">Cautelas</span>
              {cautelasCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px]">
                  {cautelasCount}
                </span>
              )}
            </button>

            {/* Backup Tríplice Button */}
            <button
              onClick={onOpenBackup}
              title="Central de Backups (Local, Firebase e Google Drive)"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-emerald-300 hover:bg-slate-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="hidden md:inline">Backup</span>
            </button>

            {/* Menu Importar com Listbox de Formatos (Excel, Word, CSV, TXT) */}
            <div className="relative" ref={importMenuRef}>
              <button
                type="button"
                onClick={() => setIsImportMenuOpen(!isImportMenuOpen)}
                title="Importar Carga de Arquivos (Excel, Word, CSV, TXT)"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isImportMenuOpen
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 bg-slate-800/40 border border-slate-700/60'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Importar</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isImportMenuOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {/* Listbox Dropdown com Excel, Word, CSV, TXT */}
              {isImportMenuOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 z-50 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-2 min-w-[220px] text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800">
                    Selecione o Formato
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsImportMenuOpen(false);
                      onOpenExcel?.('excel');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-white">Excel</div>
                      <div className="text-[10px] text-slate-400 font-mono">.xlsx, .xls</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsImportMenuOpen(false);
                      onOpenExcel?.('word');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-white">Word</div>
                      <div className="text-[10px] text-slate-400 font-mono">.docx (tabelas e listas)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsImportMenuOpen(false);
                      onOpenExcel?.('csv');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-white">CSV</div>
                      <div className="text-[10px] text-slate-400 font-mono">.csv (delimitado)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsImportMenuOpen(false);
                      onOpenExcel?.('txt');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                      <File className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-white">TXT</div>
                      <div className="text-[10px] text-slate-400 font-mono">.txt (tabular)</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Admin: Users Management */}
            {isAdmin && (
              <button
                onClick={onOpenUsers}
                title="Gerenciar Usuários e Permissões de Acesso"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-indigo-300 hover:bg-slate-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
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
                className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-black text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15 flex items-center gap-1.5 transition-all cursor-pointer group border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)] hover:shadow-[0_0_18px_rgba(16,185,129,0.45)]"
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
                      className="w-8 h-8 rounded-full ring-2 ring-indigo-500 group-hover:ring-emerald-400 object-cover transition-all shadow-md" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-500 group-hover:ring-emerald-400 transition-all shadow-md">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-semibold text-white truncate max-w-[110px] group-hover:text-emerald-300 transition-colors">
                      {currentUser.displayName || currentUser.email.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-indigo-400 uppercase font-bold flex items-center gap-0.5">
                      {isAdmin ? <Crown className="w-2.5 h-2.5 text-amber-400 inline" /> : <Shield className="w-2.5 h-2.5 inline text-emerald-400" />}
                      <span className={isAdmin ? 'text-amber-400' : 'text-emerald-400'}>
                        {isAdmin ? 'Admin' : (currentPersona?.sectorName || 'Operador')}
                      </span>
                    </p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 hidden sm:block ${isUserMenuOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>

                {/* Popover Dropdown Menu Opened on Avatar Click */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-900/98 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/90 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* Header do Usuário Atual */}
                    <div className="flex items-center gap-3 p-2 bg-slate-800/60 rounded-xl border border-slate-700/50 mb-2">
                      {currentUser.photoURL ? (
                        <img 
                          src={currentUser.photoURL} 
                          alt="Avatar" 
                          className="w-10 h-10 rounded-full ring-2 ring-emerald-400 object-cover" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm ring-2 ring-emerald-400">
                          {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {currentUser.displayName || currentUser.email.split('@')[0]}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {currentUser.email}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
                            isAdmin 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {isAdmin ? <Crown className="w-2.5 h-2.5" /> : <Shield className="w-2.5 h-2.5" />}
                            {isAdmin ? 'Administrador' : `Operador: ${currentPersona?.sectorName || 'Setor'}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Alternador de Perfis / Setores (10 opções visíveis no listbox com setor em verdinho) */}
                    {onSelectPersona && (
                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <div className="px-2 pb-1.5 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-400" />
                            Trocar Visão de Setor
                          </span>
                          <span className="text-[9.5px] text-slate-500 font-mono">
                            {sectors.length + 1} opções
                          </span>
                        </div>

                        {/* Listbox com altura para 10 opções simultâneas */}
                        <div className="max-h-[380px] overflow-y-auto scrollbar-thin pr-0.5 space-y-1">
                          {/* Opção Admin */}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectPersona('admin');
                              setIsUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                              (!currentPersona || currentPersona.id === 'admin')
                                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">👑</span>
                              <div>
                                <span className="text-amber-300 font-bold">Admin Geral</span>
                                <span className="text-[10px] text-slate-400 block font-normal">Acesso total a todos os setores</span>
                              </div>
                            </div>
                            {(!currentPersona || currentPersona.id === 'admin') && (
                              <Check className="w-4 h-4 text-amber-400 shrink-0" />
                            )}
                          </button>

                          {/* Opções dos Setores - Setor em verdinho e 10 opções visíveis */}
                          {sectors.map((sec) => {
                            const isSelected = currentPersona?.id === sec.id;
                            return (
                              <button
                                key={sec.id}
                                type="button"
                                onClick={() => {
                                  onSelectPersona(sec.id);
                                  setIsUserMenuOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-500/20 border border-emerald-500/40 font-bold'
                                    : 'hover:bg-slate-800 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-sm shrink-0">👤</span>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      {/* Setor em verdinho bold */}
                                      <span className="text-emerald-400 font-bold text-xs tracking-wide">
                                        {sec.name}
                                      </span>
                                    </div>
                                    <span className="text-[10.5px] text-slate-300 block truncate font-medium">
                                      {sec.responsavel || 'Sem responsável'}
                                    </span>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
                                )}
                              </button>
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
    </header>
  );
};
