import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro na aplicação capturado pelo ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
            <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ⚠️
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Ops! Ocorreu um imprevisto na interface</h1>
            <p className="text-sm text-slate-400 mb-6">
              {this.state.error?.message || 'Erro inesperado de renderização.'}
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('carga_patrimonio_current_user');
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
