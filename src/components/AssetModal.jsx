import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Building2, DollarSign, Calendar, MapPin, Tag, Image, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../constants/sectors';

export const AssetModal = ({
  isOpen,
  onClose,
  onSave,
  assetToEdit,
  defaultSectorId,
  sectors = []
}) => {
  const [formData, setFormData] = useState({
    numeroPatrimonio: '',
    descricao: '',
    categoria: CATEGORIES[0],
    setorId: defaultSectorId || sectors[0]?.id || 'sec-ti',
    setorNome: '',
    localizacao: '',
    responsavel: '',
    anoAquisicao: new Date().getFullYear(),
    valorOriginal: '',
    valorAtual: '',
    foto: ''
  });

  useEffect(() => {
    if (assetToEdit) {
      setFormData({
        numeroPatrimonio: assetToEdit.numeroPatrimonio || '',
        descricao: assetToEdit.descricao || '',
        categoria: assetToEdit.categoria || CATEGORIES[0],
        setorId: assetToEdit.setorId || sectors[0]?.id || 'sec-ti',
        setorNome: assetToEdit.setorNome || '',
        localizacao: assetToEdit.localizacao || '',
        responsavel: assetToEdit.responsavel || '',
        anoAquisicao: assetToEdit.anoAquisicao || new Date().getFullYear(),
        valorOriginal: assetToEdit.valorOriginal || '',
        valorAtual: assetToEdit.valorAtual || assetToEdit.valorOriginal || '',
        foto: assetToEdit.foto || ''
      });
    } else {
      const selectedSec = sectors.find(s => s.id === (defaultSectorId || sectors[0]?.id)) || sectors[0] || { id: 'sec-ti', name: 'Geral', sala: 'Sala 01', responsavel: 'Responsável' };
      setFormData({
        numeroPatrimonio: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
        descricao: '',
        categoria: CATEGORIES[0],
        setorId: selectedSec.id,
        setorNome: selectedSec.name,
        localizacao: selectedSec.sala || '',
        responsavel: selectedSec.responsavel || '',
        anoAquisicao: new Date().getFullYear(),
        valorOriginal: '',
        valorAtual: '',
        foto: ''
      });
    }
  }, [assetToEdit, defaultSectorId, isOpen, sectors]);

  const handleSectorChange = (secId) => {
    const sec = sectors.find(s => s.id === secId);
    if (sec) {
      setFormData(prev => ({
        ...prev,
        setorId: sec.id,
        setorNome: sec.name,
        responsavel: sec.responsavel,
        localizacao: prev.localizacao || sec.sala || ''
      }));
    }
  };

  // Auto calculate depreciation (10% per year suggestion)
  const handleAutoDepreciate = () => {
    const vOrig = parseFloat(formData.valorOriginal);
    const ano = parseInt(formData.anoAquisicao, 10);
    if (!isNaN(vOrig) && !isNaN(ano)) {
      const anosDeUso = Math.max(0, new Date().getFullYear() - ano);
      const taxaDepreciacao = 0.10; // 10% a.a.
      const vDepreciado = Math.max(vOrig * 0.1, vOrig * (1 - (anosDeUso * taxaDepreciacao)));
      setFormData(prev => ({
        ...prev,
        valorAtual: vDepreciado.toFixed(2)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.numeroPatrimonio || !formData.descricao) return;

    onSave({
      ...formData,
      valorOriginal: parseFloat(formData.valorOriginal) || 0,
      valorAtual: parseFloat(formData.valorAtual || formData.valorOriginal) || 0,
      anoAquisicao: parseInt(formData.anoAquisicao, 10) || new Date().getFullYear(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                {assetToEdit ? 'Editar Bem Patrimonial' : 'Novo Cadastro de Patrimônio'}
              </h3>
              <p className="text-xs text-slate-400">Preencha os dados do tombamento e localização</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Tag / Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nº de Patrimônio *
              </label>
              <input
                type="text"
                required
                value={formData.numeroPatrimonio}
                onChange={(e) => setFormData({ ...formData, numeroPatrimonio: e.target.value.toUpperCase() })}
                placeholder="Ex: PAT-1045"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-indigo-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Category */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoria do Bem
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descrição Completa do Item *
            </label>
            <textarea
              required
              rows={2}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Ex: Notebook Dell Latitude 5430 Core i7 16GB 512GB SSD, com fonte original"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Sector & Responsible Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-850 p-4 rounded-2xl border border-slate-800">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Setor Oficial (Carga) *
              </label>
              <select
                value={formData.setorId}
                onChange={(e) => handleSectorChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Responsável Oficial
              </label>
              <input
                type="text"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Localização Física Detalhada (Sala, Armário, Vaga)
              </label>
              <input
                type="text"
                value={formData.localizacao}
                onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                placeholder="Ex: Bloco A - Sala 101 - Mesa 03"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

          </div>

          {/* Acquisition & Financial Values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Ano de Aquisição
              </label>
              <input
                type="number"
                min="1990"
                max={new Date().getFullYear() + 1}
                value={formData.anoAquisicao}
                onChange={(e) => setFormData({ ...formData, anoAquisicao: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Valor Original (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.valorOriginal}
                onChange={(e) => setFormData({ ...formData, valorOriginal: e.target.value })}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Valor Atual (R$)
                </label>
                <button
                  type="button"
                  onClick={handleAutoDepreciate}
                  title="Calcular depreciação linear automática"
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                >
                  <Sparkles className="w-3 h-3" /> Auto
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                value={formData.valorAtual}
                onChange={(e) => setFormData({ ...formData, valorAtual: e.target.value })}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-emerald-400 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

          </div>

          {/* Image URL / Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Image className="w-3.5 h-3.5 text-slate-400" />
              Link da Foto do Item (Opcional)
            </label>
            <input
              type="url"
              value={formData.foto}
              onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
              placeholder="https://..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex gap-3">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{assetToEdit ? 'Salvar Alterações' : 'Cadastrar Patrimônio'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
