import React from 'react';
import { 
  Boxes, 
  Search, 
  Mic, 
  QrCode, 
  Plus, 
  FileSpreadsheet, 
  Printer, 
  Handshake, 
  Database,
  ShieldCheck,
  X
} from 'lucide-react';

export const Navbar = ({
  searchTerm,
  setSearchTerm,
  onOpenVoiceSearch,
  onOpenQrScanner,
  onOpenNewAsset,
  onOpenCautelas,
  onOpenLabels,
  onOpenExcel,
  onOpenFirebaseConfig,
  onOpenBackup,
  isFirebaseActive,
  cautelasCount = 0
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">CargaPatrimônio</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Gestão & Conferência de Carga Patrimonial</p>
            </div>
          </div>

          {/* Search Bar with Voice and QR inside */}
          <div className="flex-1 max-w-xl mx-2">
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar patrimônio por número ou descrição..."
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-24 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-20 text-slate-400 hover:text-slate-200 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Voice & QR Scanner Buttons inside Search Bar */}
              <div className="absolute right-1.5 flex items-center gap-1">
                <button
                  onClick={onOpenVoiceSearch}
                  title="Busca por Voz (Falar número ou descrição)"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-700/50 hover:bg-indigo-600 transition-colors"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenQrScanner}
                  title="Escanear QR Code / Código de Barras pela Câmera"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-700/50 hover:bg-blue-600 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Cautelas / Empréstimos Button with Badge */}
            <button
              onClick={onOpenCautelas}
              title="Módulo de Empréstimos & Cautelas"
              className="relative px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Handshake className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Cautelas</span>
              {cautelasCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px]">
                  {cautelasCount}
                </span>
              )}
            </button>

            {/* Print Labels Button */}
            <button
              onClick={onOpenLabels}
              title="Gerar Etiquetas com QR Code em PDF"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span className="hidden lg:inline">Etiquetas</span>
            </button>

            {/* Backup Tríplice Button */}
            <button
              onClick={onOpenBackup}
              title="Central de Backups (Local, Firebase e Google Drive)"
              className="px-2.5 sm:px-3 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Backup</span>
            </button>

            {/* Excel Import/Export */}
            <button
              onClick={onOpenExcel}
              title="Importar / Exportar Planilha Excel"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Excel</span>
            </button>

            {/* Firebase Status & Config Button */}
            <button
              onClick={onOpenFirebaseConfig}
              title={isFirebaseActive ? "Conectado ao Firebase Firestore" : "Configurar Conexão com Firebase"}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isFirebaseActive 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              <span className={`w-2 h-2 rounded-full ${isFirebaseActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            </button>

            {/* New Asset Button */}
            <button
              onClick={onOpenNewAsset}
              className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Bem</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
