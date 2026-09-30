import React, { useState } from 'react';
import { X, FileSpreadsheet, UploadCloud, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { exportAssetsToExcel, importAssetsFromExcel } from '../services/excelService';

export const ExcelImportExportModal = ({
  isOpen,
  onClose,
  assets = [],
  onImportSuccess
}) => {
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    exportAssetsToExcel(assets, `Inventario_Patrimonio_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportMessage('');

    try {
      const imported = await importAssetsFromExcel(file);
      onImportSuccess(imported);
      setImportMessage(`Sucesso! ${imported.length} itens importados da planilha.`);
    } catch (err) {
      console.error('Import error:', err);
      setImportMessage('Erro ao processar planilha. Verifique o formato do arquivo.');
    }
    setImporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Planilhas Excel & CSV</h3>
              <p className="text-xs text-slate-400">Importação em massa de itens e exportação de relatórios</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          
          {/* Export Section */}
          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-sm font-semibold text-white mb-1">Exportar Base Completa</h4>
            <p className="text-xs text-slate-400 mb-3">
              Baixe todos os {assets.length} bens patrimoniais cadastrados formatados para Excel (.xlsx).
            </p>
            <button
              onClick={handleExport}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Exportar {assets.length} Itens para Excel</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-sm font-semibold text-white mb-1">Importar Base Existente</h4>
            <p className="text-xs text-slate-400 mb-3">
              Se você já tem uma planilha com até 1.000 itens ou mais, envie para cadastrar automaticamente.
            </p>

            <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-900/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
              <UploadCloud className="w-8 h-8 text-emerald-400 mb-1" />
              <span className="text-xs font-medium text-slate-200">
                {importing ? 'Processando planilha...' : 'Clique para selecionar arquivo .xlsx ou .csv'}
              </span>
              <span className="text-[10px] text-slate-500">Colunas suportadas: Número Patrimônio, Descrição, Setor, Valor</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={importing}
                className="hidden"
              />
            </label>

            {importMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-slate-800 text-xs text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{importMessage}</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
