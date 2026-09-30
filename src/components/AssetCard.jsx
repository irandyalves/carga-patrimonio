import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Handshake, 
  Archive, 
  FileText, 
  Printer, 
  Edit3, 
  AlertTriangle, 
  ArrowRightLeft, 
  Check, 
  Copy, 
  ExternalLink,
  ShieldAlert,
  Info,
  Trash2
} from 'lucide-react';
import { STATUS } from '../constants/sectors';

export const AssetCard = ({
  asset,
  activeSector,
  currentUserName,
  onToggleConference,
  onOpenEdit,
  onOpenCautela,
  onOpenBaixa,
  onPrintSingleLabel,
  onTransferSector,
  onDeleteAsset
}) => {
  const [copied, setCopied] = useState(false);
  const [showUncheckConfirm, setShowUncheckConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if asset belongs to another sector (Sobra / Fora da seção)
  const isOutOfPlace = activeSector && asset.setorId !== activeSector.id;
  const isConferido = asset.status === 'CONFERIDO';
  const isBaixado = asset.baixado || asset.status === 'BAIXADO';
  const isEmCautela = asset.status === 'EM_CAUTELA' || !!asset.cautelaAtual;

  const handleCopyTag = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(asset.numeroPatrimonio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConferenceClick = () => {
    if (isBaixado) return;

    if (isConferido) {
      // Show confirmation before unchecking to prevent accidental uncheck
      setShowUncheckConfirm(true);
    } else {
      // Mark as conferido
      onToggleConference(asset.id, true);
    }
  };

  const handleConfirmUncheck = () => {
    setShowUncheckConfirm(false);
    onToggleConference(asset.id, false);
  };

  return (
    <div className={`relative rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden group ${
      isOutOfPlace 
        ? 'bg-amber-950/20 border-amber-500/40 shadow-amber-950/10' 
        : isConferido 
          ? 'bg-slate-850/90 border-blue-500/40 shadow-lg shadow-blue-950/20 ring-1 ring-blue-500/20' 
          : isBaixado
            ? 'bg-slate-900/60 border-rose-500/30 opacity-80'
            : 'bg-slate-850 border-slate-800 hover:border-slate-700 shadow-sm'
    }`}>

      {/* 1. TOP NOTICE / MESSAGE: Out of place item warning */}
      {isOutOfPlace && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-3.5 py-2 text-xs text-amber-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium truncate">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">
              Carga oficial de: <strong className="text-amber-200">{asset.setorNome}</strong> ({asset.responsavel})
            </span>
          </div>
          <button
            onClick={() => onTransferSector(asset)}
            className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/30 hover:bg-amber-500 text-amber-100 hover:text-slate-950 transition-colors flex items-center gap-1 shrink-0"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Transferir</span>
          </button>
        </div>
      )}

      {/* 2. TOP NOTICE / MESSAGE: Conference confirmation status */}
      {isConferido && !isOutOfPlace && (
        <div className="bg-blue-500/15 border-b border-blue-500/30 px-3.5 py-1.5 text-xs text-blue-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">
              Conferido em: <strong className="text-blue-200">{asset.conferidoEm || 'Data recente'}</strong> {asset.conferidoPor ? `por ${asset.conferidoPor}` : ''}
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300 shrink-0">
            Auditado
          </span>
        </div>
      )}

      {/* 3. TOP NOTICE / MESSAGE: Cautela status */}
      {isEmCautela && (
        <div className="bg-purple-500/15 border-b border-purple-500/30 px-3.5 py-1.5 text-xs text-purple-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium truncate">
            <Handshake className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">
              Em Cautela com: <strong className="text-purple-200">{asset.cautelaAtual?.responsavelRetirada || 'Retirado'}</strong>
            </span>
          </div>
          <span className="text-[10px] text-purple-300 font-mono shrink-0">
            Devolução: {asset.cautelaAtual?.dataPrevistaDevolucao?.split(' ')[0] || 'A definir'}
          </span>
        </div>
      )}

      {/* 4. TOP NOTICE / MESSAGE: Baixa status */}
      {isBaixado && (
        <div className="bg-rose-500/15 border-b border-rose-500/30 px-3.5 py-1.5 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium truncate">
            <Archive className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">
              BEM BAIXADO / DESINCORPORADO ({asset.dadosBaixa?.motivo?.substring(0, 35)}...)
            </span>
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row: Tag Badge & Status Pill */}
          <div className="flex items-start justify-between gap-2 mb-2.5">
            
            {/* Tag Badge */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyTag}
                title="Copiar número do patrimônio"
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-bold text-indigo-300 flex items-center gap-1.5 transition-colors"
              >
                <span>{asset.numeroPatrimonio}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>

              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60 font-medium hidden sm:inline">
                {asset.categoria || 'Geral'}
              </span>
            </div>

            {/* Status Pill */}
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS[asset.status]?.color || 'bg-slate-700 text-slate-300'}`}>
                {STATUS[asset.status]?.label || asset.status}
              </span>
            </div>

          </div>

          {/* Description */}
          <h3 className="font-semibold text-slate-100 text-sm sm:text-base leading-snug line-clamp-2 mb-2.5">
            {asset.descricao}
          </h3>

          {/* Location & Sector Info */}
          <div className="space-y-1.5 text-xs text-slate-300 mb-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">Local: <strong className="text-slate-200">{asset.localizacao || 'Não especificado'}</strong></span>
            </div>

            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="truncate">Setor Oficial: <strong className="text-slate-200">{asset.setorNome}</strong></span>
              <span>Resp: <strong className="text-slate-200">{asset.responsavel}</strong></span>
            </div>
          </div>

          {/* Financial Values & Year */}
          <div className="grid grid-cols-3 gap-2 text-center bg-slate-900/40 p-2 rounded-xl border border-slate-800/80 mb-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Aquisição</span>
              <span className="font-semibold text-slate-200">{asset.anoAquisicao || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Vlr Original</span>
              <span className="font-semibold text-slate-200">
                R$ {Number(asset.valorOriginal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Vlr Atual</span>
              <span className="font-bold text-emerald-400">
                R$ {Number(asset.valorAtual || asset.valorOriginal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* If Baixado, show attachments info */}
          {isBaixado && asset.dadosBaixa && (
            <div className="text-xs bg-rose-950/20 border border-rose-500/20 rounded-xl p-2.5 mb-3 text-rose-200">
              <div className="font-semibold mb-1 flex items-center gap-1 text-rose-300">
                <Info className="w-3.5 h-3.5" />
                <span>Observação da Baixa:</span>
              </div>
              <p className="text-[11px] text-rose-200/90 line-clamp-2">{asset.dadosBaixa.observacoes}</p>
              {asset.dadosBaixa.anexos && asset.dadosBaixa.anexos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {asset.dadosBaixa.anexos.map((anexo, idx) => (
                    <a
                      key={idx}
                      href={anexo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] bg-rose-900/40 hover:bg-rose-900/70 text-rose-200 px-2 py-0.5 rounded border border-rose-700/40 flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      <span className="max-w-[120px] truncate">{anexo.nome}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Card Actions Footer */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
          
          {/* Main Conference Button with Anti-accidental uncheck */}
          {!isBaixado ? (
            <div>
              {!showUncheckConfirm ? (
                <button
                  onClick={handleConferenceClick}
                  className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    isConferido
                      ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isConferido ? 'text-blue-400' : 'text-white'}`} />
                  <span>{isConferido ? '✓ Bem Conferido (Clique para Desmarcar)' : 'Conferir / Ticar Carga'}</span>
                </button>
              ) : (
                /* Uncheck Safety Confirmation */
                <div className="bg-slate-900 border border-amber-500/50 rounded-xl p-2.5 text-center animate-in fade-in duration-200">
                  <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-semibold mb-1">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Confirmar desmarque de conferência?</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Para evitar desmarques involuntários na auditoria, confirme a ação:
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirmUncheck}
                      className="flex-1 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium"
                    >
                      Sim, Desmarcar
                    </button>
                    <button
                      onClick={() => setShowUncheckConfirm(false)}
                      className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Delete Asset Inline Confirmation */}
          {showDeleteConfirm && (
            <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-2.5 text-center animate-in fade-in">
              <span className="text-xs text-rose-200 font-semibold block mb-1">
                Excluir definitivamente o patrimônio {asset.numeroPatrimonio}?
              </span>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    onDeleteAsset(asset.id);
                  }}
                  className="flex-1 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium"
                >
                  Confirmar Exclusão
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Secondary Action Icons */}
          {!showDeleteConfirm && (
            <div className="flex items-center justify-between gap-1 text-slate-400 pt-1">
              <div className="flex items-center gap-1">
                
                {/* Cautela Action */}
                {!isBaixado && (
                  <button
                    onClick={() => onOpenCautela(asset)}
                    title={isEmCautela ? "Ver / Finalizar Cautela" : "Emitir Termo de Cautela / Empréstimo"}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-purple-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{isEmCautela ? 'Cautela' : 'Emprestar'}</span>
                  </button>
                )}

                {/* Transfer Action */}
                <button
                  onClick={() => onTransferSector(asset)}
                  title="Transferir para outro setor / responsável"
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-300 text-xs flex items-center gap-1 transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Transferir</span>
                </button>

                {/* Baixa Action */}
                {!isBaixado && (
                  <button
                    onClick={() => onOpenBaixa(asset)}
                    title="Registrar Baixa Patrimonial (Obsolescência, Descarte, Doação)"
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Baixar</span>
                  </button>
                )}

              </div>

              <div className="flex items-center gap-1">
                {/* Print Label */}
                <button
                  onClick={() => onPrintSingleLabel(asset)}
                  title="Imprimir Etiqueta com QR Code"
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>

                {/* Edit Asset */}
                <button
                  onClick={() => onOpenEdit(asset)}
                  title="Editar informações do patrimônio"
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                {/* Delete Asset */}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Excluir patrimônio do sistema"
                  className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
