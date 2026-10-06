import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Download, 
  HardDrive, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FolderDown, 
  Upload, 
  KeyRound,
  FileJson
} from 'lucide-react';
import { 
  generateBackupPayload, 
  downloadLocalBackupFile, 
  saveSnapshotToFirebase, 
  uploadBackupToGoogleDrive 
} from '../services/backupService';
import { exportAssetsToExcel } from '../services/excelService';

export const BackupModal = ({
  isOpen,
  onClose,
  assets = [],
  sectors = [],
  cautelas = [],
  isFirebaseActive,
  onRestoreBackup,
  isAdmin = true,
  userSector = null,
  userSectorIds = []
}) => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  
  const [stepsStatus, setStepsStatus] = useState({
    local: 'idle', // 'idle' | 'running' | 'success' | 'error'
    excel: 'idle',
    firebase: 'idle',
    googleDrive: 'idle'
  });

  const [restoreMessage, setRestoreMessage] = useState('');

  if (!isOpen) return null;

  const isCommonUser = !isAdmin;
  const effectiveSectorIds = (userSectorIds && userSectorIds.length > 0)
    ? userSectorIds
    : (userSector ? [userSector.id] : []);

  // Bens restritos ao setor do usuário comum (ou todos se admin)
  const targetAssets = isCommonUser
    ? assets.filter(a => effectiveSectorIds.includes(a.setorId))
    : assets;

  const targetSectors = isCommonUser
    ? sectors.filter(s => effectiveSectorIds.includes(s.id))
    : sectors;

  const targetCautelas = isCommonUser
    ? cautelas.filter(c => targetAssets.some(a => a.id === c.assetId || a.numeroPatrimonio === c.numeroPatrimonio))
    : cautelas;

  const sectorName = userSector?.name || (targetSectors[0]?.name) || 'Meu Setor';
  const cleanSectorName = sectorName.replace(/[/\\?%*:|"<>]/g, '_').trim();

  // Execute Multi-tier Backup
  const handleExecuteAllBackups = async () => {
    setIsBackingUp(true);
    const payload = generateBackupPayload(targetAssets, targetSectors, targetCautelas);
    const dateStr = new Date().toISOString().slice(0, 10);

    // 1. Local JSON Download
    setStepsStatus(prev => ({ ...prev, local: 'running' }));
    try {
      const jsonFileName = isCommonUser 
        ? `BACKUP_PATRIMONIO_${cleanSectorName}_${dateStr}.json` 
        : null;
      downloadLocalBackupFile(payload, jsonFileName);
      setStepsStatus(prev => ({ ...prev, local: 'success' }));
    } catch (e) {
      setStepsStatus(prev => ({ ...prev, local: 'error' }));
    }

    // 2. Local Excel Consolidation Download
    setStepsStatus(prev => ({ ...prev, excel: 'running' }));
    try {
      const excelFileName = isCommonUser
        ? `BACKUP_PLANILHA_${cleanSectorName}_${dateStr}.xlsx`
        : `BACKUP_PLANILHA_PATRIMONIO_${dateStr}.xlsx`;
      exportAssetsToExcel(targetAssets, excelFileName);
      setStepsStatus(prev => ({ ...prev, excel: 'success' }));
    } catch (e) {
      setStepsStatus(prev => ({ ...prev, excel: 'error' }));
    }

    // 3. Firebase Snapshot (SOMENTE ADMIN! JAMAIS AFETA O FIREBASE PARA USUÁRIOS COMUNS)
    if (!isCommonUser) {
      setStepsStatus(prev => ({ ...prev, firebase: 'running' }));
      if (isFirebaseActive) {
        const fbResult = await saveSnapshotToFirebase(payload);
        setStepsStatus(prev => ({ ...prev, firebase: fbResult.success ? 'success' : 'error' }));
      } else {
        setStepsStatus(prev => ({ ...prev, firebase: 'skipped' }));
      }
    }

    // 4. Google Drive
    setStepsStatus(prev => ({ ...prev, googleDrive: 'running' }));
    if (googleAccessToken) {
      const driveResult = await uploadBackupToGoogleDrive(payload, googleAccessToken);
      setStepsStatus(prev => ({ ...prev, googleDrive: driveResult.success ? 'success' : 'error' }));
    } else {
      setStepsStatus(prev => ({ ...prev, googleDrive: 'skipped' }));
    }

    setIsBackingUp(false);
  };

  // Restore from local JSON backup file
  const handleRestoreFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.assets && Array.isArray(parsed.assets)) {
          onRestoreBackup(parsed);
          setRestoreMessage(`Backup de ${parsed.dataGeracao || 'data anterior'} restaurado com sucesso! (${parsed.assets.length} bens e ${parsed.sectors?.length || 0} setores)`);
        } else {
          setRestoreMessage('Arquivo de backup inválido. Formato JSON incompatível.');
        }
      } catch (err) {
        setRestoreMessage('Erro ao ler arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                {isCommonUser ? `Backup do Setor: ${sectorName}` : 'Central de Backups & Proteção Tríplice'}
              </h3>
              <p className="text-xs text-slate-400">
                {isCommonUser 
                  ? 'Gere cópias de segurança do seu setor em arquivo local, planilha Excel ou Google Drive' 
                  : 'Gere cópias de segurança no PC, Firebase e Google Drive do órgão'}
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

        <div className="space-y-4">
          
          {/* Main 1-Click Backup Trigger Banner */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-850 to-indigo-950/40 p-5 rounded-2xl border border-emerald-500/30 text-center">
            <h4 className="text-base font-bold text-white mb-1">
              {isCommonUser ? 'Backup do Setor em 1 Clique' : 'Backup Completo em 1 Clique'}
            </h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto mb-4">
              {isCommonUser 
                ? <>Dispara o download dos <strong>{targetAssets.length} bens</strong> do setor <strong>{sectorName}</strong> em arquivo local, planilha Excel e Google Drive.</>
                : <>Dispara a gravação simultânea de todos os <strong>{assets.length} bens</strong>, <strong>{sectors.length} setores</strong> e <strong>{cautelas.length} cautelas</strong> nos 3 destinos.</>}
            </p>

            <button
              onClick={handleExecuteAllBackups}
              disabled={isBackingUp}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 mx-auto transition-all disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isBackingUp ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isCommonUser ? 'Gerando Backup do Setor...' : 'Executando Backup Tríplice...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>{isCommonUser ? 'Fazer Backup do Meu Setor' : 'Fazer Backup Geral Agora'}</span>
                </>
              )}
            </button>
          </div>

          {/* Backup Destinations Progress / Status */}
          <div className={`grid grid-cols-1 ${isCommonUser ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
            
            {/* Destination 1: Local JSON */}
            <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-white">1. Arquivo Local (.JSON)</div>
                  <div className="text-[11px] text-slate-400">{isCommonUser ? 'Bens do setor' : 'Download no PC/celular'}</div>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                stepsStatus.local === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                stepsStatus.local === 'running' ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 'text-slate-500'
              }`}>
                {stepsStatus.local === 'success' ? 'Concluído ✓' : stepsStatus.local === 'running' ? 'Baixando...' : 'Pronto'}
              </span>
            </div>

            {/* Destination 2: Local Excel */}
            <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FolderDown className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-semibold text-white">2. Planilha (.XLSX)</div>
                  <div className="text-[11px] text-slate-400">{isCommonUser ? 'Planilha do setor' : 'Tabela de auditoria'}</div>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                stepsStatus.excel === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                stepsStatus.excel === 'running' ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 'text-slate-500'
              }`}>
                {stepsStatus.excel === 'success' ? 'Concluído ✓' : stepsStatus.excel === 'running' ? 'Gerando...' : 'Pronto'}
              </span>
            </div>

            {/* Destination 3: Firebase Cloud (SOMENTE ADMIN - JAMAIS PARA USUÁRIO COMUM) */}
            {!isCommonUser && (
              <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Cloud className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">3. Nuvem Firebase</div>
                    <div className="text-[11px] text-slate-400">Snapshot no Firestore</div>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  stepsStatus.firebase === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                  stepsStatus.firebase === 'skipped' ? 'bg-slate-800 text-slate-500' :
                  stepsStatus.firebase === 'running' ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                  isFirebaseActive ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {stepsStatus.firebase === 'success' ? 'Gravado ✓' : stepsStatus.firebase === 'skipped' ? 'Modo Local' : isFirebaseActive ? 'Conectado' : 'Não Configurado'}
                </span>
              </div>
            )}

            {/* Destination 4: Google Drive */}
            <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cloud className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-xs font-semibold text-white">{isCommonUser ? '3. Google Drive' : '4. Google Drive do Órgão'}</div>
                  <div className="text-[11px] text-slate-400">Pasta segura na nuvem</div>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                stepsStatus.googleDrive === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                stepsStatus.googleDrive === 'skipped' ? 'bg-slate-800 text-slate-500' :
                googleAccessToken ? 'text-blue-400' : 'text-slate-600'
              }`}>
                {stepsStatus.googleDrive === 'success' ? 'Enviado ✓' : googleAccessToken ? 'Pronto' : 'Token Opcional'}
              </span>
            </div>

          </div>

          {/* Google Drive Token Input (Optional) */}
          <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800 text-xs">
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              Token de Acesso do Google Drive (Opcional para upload direto no Drive do órgão):
            </label>
            <input
              type="password"
              value={googleAccessToken}
              onChange={(e) => setGoogleAccessToken(e.target.value)}
              placeholder="Cole o Access Token OAuth2 do Google Cloud aqui..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Emergency Restore Section (SOMENTE ADMIN) */}
          {!isCommonUser && (
            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                Restauração de Emergência a Partir de Backup
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                Se você precisar restaurar a base após troca de máquina ou exclusão indevida, envie o arquivo `.json` gerado anteriormente.
              </p>

              <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-900/50 rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                <FileJson className="w-6 h-6 text-indigo-400 mb-1" />
                <span className="text-xs font-medium text-slate-200">Selecionar arquivo BACKUP_PATRIMONIO_...json</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>

              {restoreMessage && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-800 text-xs text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{restoreMessage}</span>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
