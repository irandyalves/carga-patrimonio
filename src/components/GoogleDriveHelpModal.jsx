import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Cloud, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Zap, 
  Building2, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Lock,
  FileJson
} from 'lucide-react';

export const GoogleDriveHelpModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'console' | 'about'
  const [copiedScope, setCopiedScope] = useState(false);

  // Fechar com tecla ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const driveScope = 'https://www.googleapis.com/auth/drive.file';

  const handleCopyScope = () => {
    navigator.clipboard.writeText(driveScope);
    setCopiedScope(true);
    setTimeout(() => setCopiedScope(false), 2500);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div 
        className="bg-slate-900 border border-slate-750 w-full max-w-4xl rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/90 relative text-left max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-inner shadow-blue-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                Guia de Ativação do Google Drive
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Passo a Passo
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Aprenda a obter o Token OAuth2 para salvar backups diretamente na nuvem do órgão
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Fechar guia de ajuda"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'quick'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Método Rápido (2 min)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'console'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Método Oficial (Google Cloud)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Segurança & Como Funciona</span>
          </button>
        </div>

        {/* Conteúdo com Rolagem Suave */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-4 text-xs text-slate-300">
          
          {/* TAB 1: Método Rápido via OAuth Playground */}
          {activeTab === 'quick' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-[11.5px] text-slate-300 leading-relaxed">
                  <strong className="text-blue-300 font-semibold block mb-0.5">O que é este método?</strong>
                  Utiliza o utilitário oficial do Google (<span className="text-white font-mono">OAuth 2.0 Playground</span>) para gerar um token de autorização direto em segundos, sem precisar cadastrar novos aplicativos no Google Cloud. Ideal para backups imediatos!
                </div>
              </div>

              {/* Passos numerados */}
              <div className="space-y-3">
                
                {/* Passo 1 */}
                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="font-bold text-white text-xs">Abra o Google OAuth Playground</div>
                    <p className="text-slate-400 text-[11px]">
                      Acesse a ferramenta oficial do Google para autorização de APIs em uma nova aba:
                    </p>
                    <a
                      href="https://developers.google.com/oauthplayground"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer mt-1"
                    >
                      <span>Abrir Google OAuth Playground</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Passo 2 */}
                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="font-bold text-white text-xs">Selecione o Escopo do Google Drive</div>
                    <p className="text-slate-400 text-[11px]">
                      No painel esquerdo (<strong className="text-slate-200">Step 1: Select & authorize APIs</strong>), role até a seção <strong className="text-white">Drive API v3</strong> e marque:
                    </p>
                    
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-750 font-mono text-[10.5px] text-amber-300">
                      <span className="truncate">{driveScope}</span>
                      <button
                        type="button"
                        onClick={handleCopyScope}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                        title="Copiar escopo para colar na busca"
                      >
                        {copiedScope ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400 font-bold">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[10px]">Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-[10.5px] text-slate-400 italic">
                      💡 Dica de segurança: esse escopo permite ao sistema criar <strong>apenas seus próprios arquivos de backup</strong>, sem ler suas fotos ou outros documentos.
                    </div>
                  </div>
                </div>

                {/* Passo 3 */}
                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="font-bold text-white text-xs">Autorize o Acesso com sua Conta</div>
                    <p className="text-slate-400 text-[11px]">
                      No rodapé da lista à esquerda, clique no botão azul <strong className="text-blue-300">"Authorize APIs"</strong>.
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Faça login com a conta Google institucional ou do órgão onde deseja guardar os backups e confirme as permissões.
                    </p>
                  </div>
                </div>

                {/* Passo 4 */}
                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="font-bold text-white text-xs">Gere e Copie o Access Token</div>
                    <p className="text-slate-400 text-[11px]">
                      No painel que se abre (<strong className="text-slate-200">Step 2: Exchange authorization code for tokens</strong>), clique no botão azul:
                    </p>
                    <div className="inline-block px-3 py-1 rounded-lg bg-blue-900/60 text-blue-200 font-bold text-[11px] border border-blue-600/40">
                      Exchange authorization code for tokens
                    </div>
                    <p className="text-slate-400 text-[11px] pt-1">
                      Em seguida, copie o texto do campo <strong className="text-emerald-400">"Access token"</strong> (ele começa com <code className="text-amber-300 font-mono">ya29...</code>).
                    </p>
                  </div>
                </div>

                {/* Passo 5 */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                    5
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="font-bold text-emerald-300 text-xs">Cole no Sistema e Dispare o Backup!</div>
                    <p className="text-slate-300 text-[11px]">
                      Volte na tela da <strong>Central de Backups</strong>, cole o código no campo <em>"Token de Acesso do Google Drive"</em> e clique em <strong>"Fazer Backup Geral Agora"</strong>.
                    </p>
                    <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-400 font-semibold pt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>O arquivo será salvo no Google Drive imediatamente!</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: Método Oficial via Google Cloud Console */}
          {activeTab === 'console' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 text-[11.5px] text-slate-300 leading-relaxed">
                Este método é recomendado para a <strong>equipe de TI / Administradores</strong> do órgão que desejam configurar uma aplicação corporativa permanente vinculada ao Google Workspace.
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="font-bold text-white text-xs block mb-1">1. Criar Projeto no Google Cloud:</span>
                  <p className="text-slate-400 text-[11px] mb-2">
                    Acesse o console do Google Cloud e crie um novo projeto com o nome do órgão (ex: <span className="text-slate-200 font-mono">Carga-Patrimonio-Backups</span>).
                  </p>
                  <a
                    href="https://console.cloud.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium hover:underline"
                  >
                    <span>Ir para o Google Cloud Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="font-bold text-white text-xs block mb-1">2. Ativar a Google Drive API:</span>
                  <p className="text-slate-400 text-[11px]">
                    No menu lateral, navegue até <strong>APIs e Serviços &gt; Biblioteca</strong>. Pesquise por <strong>Google Drive API</strong> e clique no botão azul <strong>Ativar</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="font-bold text-white text-xs block mb-1">3. Configurar a Tela de Consentimento OAuth:</span>
                  <p className="text-slate-400 text-[11px]">
                    Em <strong>Tela de Consentimento OAuth</strong>, selecione <em>Interno</em> (caso utilize Google Workspace do órgão) ou <em>Externo</em>. Defina o nome do app como <strong>Carga Patrimônio</strong> e adicione o escopo <code className="text-amber-300 font-mono">https://www.googleapis.com/auth/drive.file</code>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="font-bold text-white text-xs block mb-1">4. Criar Credenciais Web:</span>
                  <p className="text-slate-400 text-[11px]">
                    Vá em <strong>Credenciais &gt; Criar Credenciais &gt; ID do cliente OAuth</strong>. Escolha <em>Aplicativo da Web</em>, informe as origens JavaScript autorizadas (ex: o domínio onde o sistema está hospedado) e conclua.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Segurança e Como Funciona */}
          {activeTab === 'about' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Segurança e Privacidade Absolutas</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  O sistema de patrimônio utiliza o escopo restrito <code className="text-amber-300 font-mono">drive.file</code>. Isso significa que o sistema <strong>NÃO tem acesso a nenhum arquivo pré-existente</strong> no seu Google Drive (nem fotos, planilhas ou pastas pessoais). Ele apenas recebe autorização para enviar e gravar os novos backups que ele mesmo gera.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <FileJson className="w-4 h-4 text-cyan-400" />
                  <span>Como o arquivo fica salvo no Google Drive?</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  O backup é transmitido via protocolo multipart da Google Drive API v3 e gravado na raiz do seu Drive com o nome padronizado:
                </p>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-750 font-mono text-[10.5px] text-cyan-300">
                  BACKUP_PATRIMONIO_ORGAO_YYYY-MM-DDTHH-MM-SS.json
                </div>
                <p className="text-slate-400 text-[11px]">
                  Contendo todos os bens, setores, cautelas, histórico e metadados de auditoria.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>E se eu não quiser usar o Google Drive?</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  O Google Drive é <strong>100% opcional</strong>. O sistema já realiza simultaneamente o <strong>Download Local (.JSON)</strong>, a <strong>Planilha de Auditoria (.XLSX)</strong> e o <strong>Snapshot na Nuvem Firebase</strong>. Você já possui proteção completa mesmo sem configurar o Drive!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Rodapé do Modal */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400">
            Dúvidas? Gere o token em 1 minuto pelo <strong className="text-slate-300">Método Rápido</strong>.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Entendido, Fechar
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default GoogleDriveHelpModal;
