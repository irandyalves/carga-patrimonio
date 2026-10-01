import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Handshake, 
  Archive, 
  Printer, 
  Edit3, 
  AlertTriangle, 
  ArrowRightLeft, 
  Check, 
  Copy, 
  Trash2,
  MoreVertical,
  User,
  Layers,
  ChevronDown
} from 'lucide-react';
import { STATUS } from '../constants/sectors';

export const AssetTableRowCard = ({
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
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  // Check if asset belongs to another sector/carga
  const isOutOfPlace = activeSector && asset.setorId !== activeSector.id;
  const isConferido = asset.status === 'CONFERIDO';
  const isBaixado = asset.baixado || asset.status === 'BAIXADO';
  const isEmCautela = asset.status === 'EM_CAUTELA' || !!asset.cautelaAtual;

  // Extrair os últimos 5 dígitos para destaque visual
  const rawNum = String(asset.numeroPatrimonio || '');
  const last5 = rawNum.length >= 5 ? rawNum.slice(-5) : rawNum.padStart(5, '0');
  const prefix = rawNum.length > 5 ? rawNum.slice(0, -5) : '';

  const handleCopyTag = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(asset.numeroPatrimonio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConferenceClick = (e) => {
    e.stopPropagation();
    if (isBaixado) return;

    if (isConferido) {
      setShowUncheckConfirm(true);
    } else {
      onToggleConference(asset.id, true);
    }
  };

  const handleConfirmUncheck = (e) => {
    e.stopPropagation();
    setShowUncheckConfirm(false);
    onToggleConference(asset.id, false);
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className={`relative rounded-xl border transition-all duration-200 overflow-visible group w-full ${
      isOutOfPlace 
        ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400/60' 
        : isConferido 
          ? 'bg-slate-850/90 border-blue-500/40 shadow-sm shadow-blue-950/20 hover:border-blue-400/60' 
          : isBaixado
            ? 'bg-slate-900/60 border-rose-500/30 opacity-75'
            : 'bg-slate-850/90 border-slate-800 hover:border-slate-700 shadow-sm'
    }`}>
      
      {/* Aviso se for item fora da seção oficial */}
      {isOutOfPlace && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-3 py-1.5 text-xs text-amber-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium truncate">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate text-[11px]">
              Carga oficial de: <strong className="text-amber-200">{asset.setorNome}</strong> ({asset.responsavel})
            </span>
          </div>
          <button
            onClick={() => onTransferSector(asset)}
            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/30 hover:bg-amber-500 text-amber-100 hover:text-slate-950 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Transferir</span>
          </button>
        </div>
      )}

      {/* Linha Principal (Colunas alinhadas ocupando toda a largura da tela) */}
      <div className="p-3 sm:px-5 sm:py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs w-full">
        
        {/* Coluna 1: Patrimônio (Fonte Dobrada, SEM BORDAS) */}
        <div className="lg:w-44 shrink-0 flex items-center gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-indigo-400 select-all leading-none">
                {last5}
              </span>
              <button
                onClick={handleCopyTag}
                title="Copiar número do patrimônio"
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="mt-1 flex items-center gap-1.5">
              {prefix && (
                <span className="text-[10px] font-mono text-slate-500">
                  {prefix}
                </span>
              )}
              {isConferido ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Conferido
                </span>
              ) : isEmCautela ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  <Handshake className="w-3 h-3" /> Em Cautela
                </span>
              ) : isBaixado ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                  <Archive className="w-3 h-3" /> Baixado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                  <Clock className="w-3 h-3 text-amber-400" /> Pendente
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Coluna 2: Quantidade (SEM BORDAS) */}
        <div className="lg:w-20 shrink-0 flex items-center lg:justify-center">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-slate-400 lg:hidden">Qtde:</span>
            <span className="font-black text-xl sm:text-2xl text-cyan-300">
              {asset.quantidade || 1}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">un</span>
          </div>
        </div>

        {/* Coluna 3: Descrição do Bem (A MAIOR COLUNA) */}
        <div className="flex-[3] min-w-[280px]">
          <div className="flex items-baseline gap-2">
            <h4 className="text-sm sm:text-base font-semibold text-slate-100 group-hover:text-white transition-colors leading-snug">
              {asset.descricao}
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
            <span className="text-slate-300 font-medium">
              {asset.categoria}
            </span>
            {asset.localizacao && (
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {asset.localizacao}
              </span>
            )}
          </div>
        </div>

        {/* Coluna 4: Responsável */}
        <div className="lg:w-44 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block lg:hidden">Responsável:</span>
              <span className="font-semibold text-slate-200 truncate block text-xs" title={asset.responsavel}>
                {asset.responsavel || 'Não definido'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {asset.setorNome}
              </span>
            </div>
          </div>
        </div>

        {/* Coluna 5: Data de Aquisição */}
        <div className="lg:w-32 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block lg:hidden">Data Aquisição:</span>
              <span className="font-medium text-xs">
                {asset.dataAquisicao || asset.anoAquisicao || '---'}
              </span>
            </div>
          </div>
        </div>

        {/* Coluna 6: Valor Original */}
        <div className="lg:w-32 shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 block lg:hidden">Valor Original:</span>
            <span className="font-semibold text-slate-200 text-xs">
              {formatCurrency(asset.valorOriginal)}
            </span>
          </div>
        </div>

        {/* Coluna 7: Valor Atual */}
        <div className="lg:w-32 shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 block lg:hidden">Valor Atual:</span>
            <span className="font-bold text-emerald-400 text-xs">
              {formatCurrency(asset.valorAtual || asset.valorOriginal)}
            </span>
          </div>
        </div>

        {/* Coluna 8: Ações & Conferência */}
        <div className="lg:w-56 shrink-0 flex items-center justify-between lg:justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
          
          {/* Botão de Conferência */}
          {showUncheckConfirm ? (
            <div className="flex items-center gap-1 bg-slate-900 border border-amber-500/40 rounded-xl p-1 animate-in fade-in">
              <span className="text-[10px] text-amber-300 px-1 font-medium">Desmarcar?</span>
              <button
                onClick={handleConfirmUncheck}
                className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] cursor-pointer"
              >
                Sim
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowUncheckConfirm(false); }}
                className="px-1.5 py-1 text-slate-400 hover:text-white rounded-lg text-[10px] cursor-pointer"
              >
                Não
              </button>
            </div>
          ) : (
            <button
              onClick={handleConferenceClick}
              disabled={isBaixado}
              className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isConferido
                  ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:border-blue-500/60 shadow-sm shadow-blue-500/10'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isConferido ? 'text-blue-400' : 'text-indigo-200'}`} />
              <span>{isConferido ? 'Conferido' : 'Conferir Carga'}</span>
            </button>
          )}

          {/* Menu de Ações Rápidas Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsActionsOpen(!isActionsOpen);
              }}
              title="Ações do bem patrimonial"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer flex items-center"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isActionsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsActionsOpen(false);
                  }}
                />
                <div className="absolute right-0 bottom-full mb-2 lg:bottom-auto lg:top-full lg:mt-1 z-50 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsActionsOpen(false);
                      onOpenEdit(asset);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Editar Dados</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsActionsOpen(false);
                      onTransferSector(asset);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
                    <span>Transferir Setor</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsActionsOpen(false);
                      onOpenCautela(asset);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <Handshake className="w-3.5 h-3.5 text-amber-400" />
                    <span>Emitir Cautela</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsActionsOpen(false);
                      onPrintSingleLabel(asset);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <Printer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Imprimir Etiqueta</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsActionsOpen(false);
                      onOpenBaixa(asset);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <Archive className="w-3.5 h-3.5 text-purple-400" />
                    <span>Baixa Patrimonial</span>
                  </button>

                  <div className="h-px bg-slate-800 my-1" />

                  {showDeleteConfirm ? (
                    <div className="p-2 bg-rose-950/40 rounded-xl border border-rose-500/30 text-center">
                      <p className="text-[11px] text-rose-300 font-medium mb-1.5">Confirmar exclusão?</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsActionsOpen(false);
                            onDeleteAsset(asset.id);
                          }}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Excluir
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(false);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Bem</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
