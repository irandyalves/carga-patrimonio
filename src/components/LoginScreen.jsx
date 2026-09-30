import React, { useState } from 'react';
import { ShieldCheck, LogIn, AlertTriangle, Lock, UserCheck, CheckCircle2 } from 'lucide-react';
import { loginWithGoogle } from '../services/firebase';

export function LoginScreen({ onLoginSuccess, authError, isConfigured }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(authError || null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await loginWithGoogle();
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      console.error('Erro no login Google:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('A janela de login do Google foi fechada antes de concluir.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('Este domínio não está autorizado no Firebase Authentication (adicione localhost no console).');
      } else {
        setErrorMsg(err.message || 'Falha ao autenticar com o Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-5 ring-4 ring-indigo-500/20">
            <ShieldCheck className="w-11 h-11 text-white" />
          </div>
          <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold tracking-wider uppercase rounded-full mb-2">
            Acesso Restrito & Seguro
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Sistema de Patrimônio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestão, Cautelas e Conferência em Tempo Real
          </p>
        </div>

        {/* Error Alert */}
        {(errorMsg || authError) && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 text-sm animate-shake">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Acesso Não Autorizado</p>
              <p className="text-xs text-rose-300/90 mt-0.5">
                {errorMsg || authError}
              </p>
            </div>
          </div>
        )}

        {/* Google Sign-in Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3.5 px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-base shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span className="group-hover:translate-x-0.5 transition-transform">
            {loading ? 'Autenticando...' : 'Entrar com a Conta Google'}
          </span>
        </button>

        {/* Security Info Card */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            Políticas de Acesso
          </div>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Acesso restrito aos <strong>usuários autorizados</strong> pelo administrador.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Autenticação criptografada com padrão oficial Google OAuth 2.0.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
