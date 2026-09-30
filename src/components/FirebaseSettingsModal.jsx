import React, { useState } from 'react';
import { X, Database, Save, CheckCircle2, ShieldCheck, KeyRound, Globe, Cloud } from 'lucide-react';
import { getStoredFirebaseConfig, saveFirebaseConfig, initFirebase } from '../services/firebase';

export const FirebaseSettingsModal = ({
  isOpen,
  onClose,
  onConfigUpdated
}) => {
  const existingConfig = getStoredFirebaseConfig() || {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  };

  const [config, setConfig] = useState(existingConfig);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!config.apiKey || !config.projectId) {
      alert('Por favor, informe ao menos apiKey e projectId do seu Firebase.');
      return;
    }

    saveFirebaseConfig(config);
    const result = initFirebase(config);

    if (result.isConfigured) {
      setStatusMsg('Firebase conectado com sucesso!');
      onConfigUpdated && onConfigUpdated(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setStatusMsg('Erro ao inicializar Firebase com as credenciais informadas.');
    }
  };

  const handleClear = () => {
    saveFirebaseConfig(null);
    setConfig({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    });
    setStatusMsg('Configurações removidas. Sistema operando em modo local.');
    onConfigUpdated && onConfigUpdated(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Conexão com Firebase</h3>
              <p className="text-xs text-slate-400">Sincronização em nuvem do Firestore e Firebase Storage</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-200 mb-4">
          <p className="font-semibold mb-1">Como obter as credenciais do seu Firebase:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-amber-200/90 text-[11px]">
            <li>Acesse o <strong>Firebase Console</strong> (console.firebase.google.com).</li>
            <li>Vá em <strong>Configurações do Projeto</strong> &gt; <strong>Geral</strong>.</li>
            <li>Copie os valores do seu app web (apiKey, projectId, storageBucket, etc.).</li>
          </ol>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-3">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              apiKey *
            </label>
            <input
              type="text"
              required
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                projectId *
              </label>
              <input
                type="text"
                required
                value={config.projectId}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                placeholder="meu-patrimonio-123"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                storageBucket
              </label>
              <input
                type="text"
                value={config.storageBucket}
                onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                placeholder="meu-patrimonio.appspot.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                authDomain
              </label>
              <input
                type="text"
                value={config.authDomain}
                onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                placeholder="meu-patrimonio.firebaseapp.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                appId
              </label>
              <input
                type="text"
                value={config.appId}
                onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                placeholder="1:123456789:web:abcdef"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          {statusMsg && (
            <div className="p-2.5 rounded-xl bg-slate-800 text-xs text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salvar & Conectar ao Firebase</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold transition-colors"
            >
              Limpar
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
