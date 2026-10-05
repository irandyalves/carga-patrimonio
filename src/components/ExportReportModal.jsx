import React, { useState, useRef } from 'react';
import { 
  FileText, 
  X, 
  ArrowDown01, 
  ArrowDownAZ, 
  UserCheck,
  MapPin,
  SlidersHorizontal,
  Check,
  GripVertical,
  RotateCcw
} from 'lucide-react';

export const AVAILABLE_REPORT_COLUMNS = [
  // Colunas padrão iniciais (ativas por padrão)
  { id: 'patrimonio', label: 'Patrimônio', desc: 'Número de tombo', isDefault: true },
  { id: 'descricao', label: 'Descrição do item', desc: 'Especificação do bem', isDefault: true },
  { id: 'setorNome', label: 'Setor Oficial', desc: 'Setor de lotação', isDefault: true },
  { id: 'responsavel', label: 'Resp. Carga', desc: 'Detentor patrimonial', isDefault: true },
  { id: 'localizacao', label: 'Onde Está', desc: 'Local físico do bem', isDefault: true },
  { id: 'status', label: 'Status', desc: 'Conferido / Pendente', isDefault: true },
  { id: 'valorAtual', label: 'Valor Atual', desc: 'Valor atual contábil', isDefault: true },
  // Demais colunas do sistema (exceto quantidade) - iniciam em cinza (desmarcadas)
  { id: 'marca', label: 'Marca', desc: 'Fabricante do bem', isDefault: false },
  { id: 'modelo', label: 'Modelo', desc: 'Modelo do bem', isDefault: false },
  { id: 'dataAquisicao', label: 'Data Aquisição', desc: 'Data de incorporação', isDefault: false },
  { id: 'valorOriginal', label: 'Valor Original', desc: 'Valor histórico inicial', isDefault: false },
  { id: 'depreciacao', label: 'Depreciação', desc: 'Percentual depreciado', isDefault: false }
];

const STORAGE_KEY_SELECTIONS = 'carga_patrimonio_report_columns_v2';
const STORAGE_KEY_ORDER = 'carga_patrimonio_report_columns_order_v2';

export function ExportReportModal({ isOpen, onClose, onConfirmExport, sectorName }) {
  // Estado das colunas selecionadas
  const [selectedColumns, setSelectedColumns] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SELECTIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    
    // Padrão: 7 principais ativas, 5 adicionais desmarcadas (cinza)
    const initial = {};
    AVAILABLE_REPORT_COLUMNS.forEach(col => {
      initial[col.id] = col.isDefault;
    });
    return initial;
  });

  // Estado da ordem das colunas (reordenável via Drag & Drop)
  const [columnList, setColumnList] = useState(() => {
    try {
      const storedOrder = localStorage.getItem(STORAGE_KEY_ORDER);
      if (storedOrder) {
        const orderIds = JSON.parse(storedOrder);
        if (Array.isArray(orderIds) && orderIds.length > 0) {
          const colMap = new Map(AVAILABLE_REPORT_COLUMNS.map(c => [c.id, c]));
          const reordered = [];
          orderIds.forEach(id => {
            if (colMap.has(id)) {
              reordered.push(colMap.get(id));
              colMap.delete(id);
            }
          });
          // Adiciona quaisquer novas colunas que não estavam na ordem salva
          colMap.forEach(col => reordered.push(col));
          return reordered;
        }
      }
    } catch (e) {}
    return AVAILABLE_REPORT_COLUMNS;
  });

  // Estados do Drag & Drop
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const hasDraggedRef = useRef(false);

  if (!isOpen) return null;

  const toggleColumn = (colId) => {
    setSelectedColumns(prev => {
      const updated = { ...prev, [colId]: !prev[colId] };
      try {
        localStorage.setItem(STORAGE_KEY_SELECTIONS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleSelectAll = (selectAllState) => {
    const updated = {};
    AVAILABLE_REPORT_COLUMNS.forEach(c => {
      updated[c.id] = selectAllState;
    });
    setSelectedColumns(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SELECTIONS, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleResetOrder = () => {
    setColumnList(AVAILABLE_REPORT_COLUMNS);
    try {
      localStorage.removeItem(STORAGE_KEY_ORDER);
    } catch (e) {}
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, index) => {
    hasDraggedRef.current = true;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...columnList];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    setColumnList(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(updated.map(c => c.id)));
    } catch (err) {}
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    // Pequeno delay para evitar que o clique pós-drag marque/desmarque
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 100);
  };

  const handleExport = (sortBy) => {
    const hasAny = Object.values(selectedColumns).some(Boolean);
    if (!hasAny) {
      alert('Por favor, selecione ao menos uma coluna para compor o relatório.');
      return;
    }
    // Passa sortBy, selectedColumns e a ordem exata das colunas
    const orderedColumnIds = columnList.map(c => c.id);
    onConfirmExport(sortBy, selectedColumns, orderedColumnIds);
  };

  const selectedCount = Object.values(selectedColumns).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal com largura aumentada em 15% (max-w-2xl) */}
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 p-6 flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-normal">
                  EMITIR RELATÓRIO DE CARGA PATRIMONIAL
                </h3>
                <span className="text-slate-600 font-semibold hidden sm:inline">|</span>
                <span className="text-xs sm:text-sm font-bold text-orange-300 uppercase tracking-wide">
                  {sectorName ? `SETOR: ${sectorName.toUpperCase()}` : 'TODOS OS SETORES'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="overflow-y-auto py-4 space-y-4 scrollbar-thin">
          
          {/* Seção 1: Seleção e Reordenação de Colunas via Drag & Drop */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Colunas no Relatório ({selectedCount}/{AVAILABLE_REPORT_COLUMNS.length})
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  Marcar Todas
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="text-slate-400 hover:text-slate-300 font-medium cursor-pointer"
                >
                  Desmarcar
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={handleResetOrder}
                  title="Restaurar sequência padrão das colunas"
                  className="text-slate-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restaurar
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-2.5 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>Arraste os cards para reordenar a sequência das colunas (da esquerda para a direita no PDF).</span>
            </p>

            {/* Grid com cards organizados via Drag & Drop */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {columnList.map((col, index) => {
                const isChecked = !!selectedColumns[col.id];
                const isBeingDragged = draggedIndex === index;
                const isOver = dragOverIndex === index && draggedIndex !== index;

                return (
                  <div
                    key={col.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      if (!hasDraggedRef.current) {
                        toggleColumn(col.id);
                      }
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all select-none cursor-pointer group ${
                      isBeingDragged 
                        ? 'opacity-40 border-dashed border-indigo-400 scale-[0.98]' 
                        : isOver 
                          ? 'border-indigo-400 ring-2 ring-indigo-500/50 scale-[1.02] bg-indigo-950/60' 
                          : isChecked
                            ? 'bg-indigo-600/15 border-indigo-500/50 text-white shadow-sm shadow-indigo-950/40 ring-1 ring-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-600/20'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-500 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 pr-1.5">
                      {/* Drag Handle & Order Badge */}
                      <div 
                        className="cursor-grab active:cursor-grabbing text-slate-500 group-hover:text-indigo-300 p-0.5 -ml-0.5 shrink-0 transition-colors"
                        title="Arraste para reposicionar a coluna"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                      
                      <span className={`w-4 h-4 rounded text-[9.5px] font-bold flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}>
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <p className={`text-[11.5px] font-semibold truncate ${
                          isChecked ? 'text-indigo-200' : 'text-slate-300'
                        }`}>
                          {col.label}
                        </p>
                        <p className="text-[9.5px] text-slate-500 truncate">
                          {col.desc}
                        </p>
                      </div>
                    </div>

                    {/* Checkbox indicator */}
                    <div className={`w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'border border-slate-600 bg-slate-800/60 text-transparent'
                    }`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seção 2: Ordenação com cards reduzidos em 60% (4 opções: Patrimônio, Item, Resp. Carga, Onde Está) */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-center mb-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Você quer que o relatório venha ordenado por:
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Selecione o critério para gerar e baixar o PDF com as colunas na ordem definida acima
              </p>
            </div>

            {/* Grid com 4 cards compactos (redução de ~60% no tamanho) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Botão 1: Patrimônio */}
              <button
                type="button"
                onClick={() => handleExport('PATRIMONIO')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 hover:bg-indigo-950/70 border border-indigo-500/30 hover:border-indigo-400 text-white transition-all cursor-pointer group shadow-sm hover:scale-102 active:scale-98"
                title="Ordenar numericamente pelo número de patrimônio"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 group-hover:bg-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 transition-colors">
                  <ArrowDown01 className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-[11px] font-bold block text-white group-hover:text-indigo-200 truncate">
                    Patrimônio
                  </span>
                  <span className="text-[9px] text-indigo-300/80 block truncate">
                    Nº Tombo
                  </span>
                </div>
              </button>

              {/* Botão 2: Item */}
              <button
                type="button"
                onClick={() => handleExport('ITEM')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 hover:bg-emerald-950/70 border border-emerald-500/30 hover:border-emerald-400 text-white transition-all cursor-pointer group shadow-sm hover:scale-102 active:scale-98"
                title="Ordenar alfabeticamente pela descrição do item"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 group-hover:bg-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 transition-colors">
                  <ArrowDownAZ className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-[11px] font-bold block text-white group-hover:text-emerald-200 truncate">
                    Item
                  </span>
                  <span className="text-[9px] text-emerald-300/80 block truncate">
                    Descrição A-Z
                  </span>
                </div>
              </button>

              {/* Botão 3: Resp. Carga */}
              <button
                type="button"
                onClick={() => handleExport('RESPONSAVEL')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 hover:bg-amber-950/70 border border-amber-500/30 hover:border-amber-400 text-white transition-all cursor-pointer group shadow-sm hover:scale-102 active:scale-98"
                title="Ordenar alfabeticamente pelo responsável pela carga"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 group-hover:bg-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 transition-colors">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-[11px] font-bold block text-white group-hover:text-amber-200 truncate">
                    Resp. Carga
                  </span>
                  <span className="text-[9px] text-amber-300/80 block truncate">
                    Detentor A-Z
                  </span>
                </div>
              </button>

              {/* Botão 4: Onde Está */}
              <button
                type="button"
                onClick={() => handleExport('LOCALIZACAO')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 hover:bg-sky-950/70 border border-sky-500/30 hover:border-sky-400 text-white transition-all cursor-pointer group shadow-sm hover:scale-102 active:scale-98"
                title="Ordenar alfabeticamente pelo local físico onde o bem está"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 group-hover:bg-sky-500/40 flex items-center justify-center text-sky-300 shrink-0 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-[11px] font-bold block text-white group-hover:text-sky-200 truncate">
                    Onde Está
                  </span>
                  <span className="text-[9px] text-sky-300/80 block truncate">
                    Localização A-Z
                  </span>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportReportModal;
