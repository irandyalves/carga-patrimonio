import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Search, 
  Mic, 
  MicOff,
  QrCode, 
  Plus, 
  FileSpreadsheet, 
  Handshake, 
  ShieldCheck,
  Users,
  LogOut,
  Crown,
  Shield,
  X,
  PanelLeft,
  Inbox,
  ChevronDown
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
  sectors = []
}) => {
  const isAdmin = userRole === 'admin';
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const recognitionRef = React.useRef(null);

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
              title="Abrir/Recolher Slide Bar Lateral de Setores"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isVoiceListening ? "🎙️ Ouvindo... Fale o patrimônio ou descrição" : "Buscar patrimônio por número ou descrição..."}
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

            {/* Excel Import/Export */}
            <button
              onClick={onOpenExcel}
              title="Importar / Exportar Planilha Excel"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="hidden lg:inline">Excel</span>
            </button>

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

            {/* New Asset Button */}
            {isAdmin && (
              <button
                onClick={onOpenNewAsset}
                title="Cadastrar Novo Bem Patrimonial"
                className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="hidden sm:inline">Novo Bem</span>
              </button>
            )}

            {/* User Profile & Persona Switcher */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800 ml-1">
                <div 
                  className="flex items-center gap-2"
                  title={`${currentUser.displayName || currentUser.email} (${isAdmin ? 'Administrador' : `Operador: ${currentPersona?.sectorName || 'Setor'}`})`}
                >
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full ring-2 ring-indigo-500/50 object-cover" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-medium text-white truncate max-w-[110px]">
                      {currentUser.displayName || currentUser.email.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-indigo-400 uppercase font-semibold flex items-center gap-0.5">
                      {isAdmin ? <Crown className="w-2.5 h-2.5 text-amber-400 inline" /> : <Shield className="w-2.5 h-2.5 inline" />}
                      {isAdmin ? 'Admin' : (currentPersona?.sectorName || 'Operador')}
                    </p>
                  </div>
                </div>

                {/* Persona Switcher Selector for Testing Operator Views */}
                {onSelectPersona && (
                  <select
                    value={currentPersona?.id || 'admin'}
                    onChange={(e) => onSelectPersona(e.target.value)}
                    title="Alternar perfil de visão (Admin ou Operador de Setor)"
                    className="hidden lg:block bg-slate-800/90 border border-slate-700/80 hover:border-indigo-500 text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none cursor-pointer font-medium"
                  >
                    <option value="admin">👑 Admin (Todos os Setores)</option>
                    {sectors.map(sec => (
                      <option key={sec.id} value={sec.id}>
                        👤 {sec.responsavel} ({sec.name})
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={onLogout}
                  title="Sair / Fazer Logout"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
