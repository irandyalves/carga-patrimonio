import React, { useState, useMemo } from 'react';
import { 
  X, 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  User, 
  Mail, 
  MapPin, 
  Layers, 
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Check
} from 'lucide-react';

export const SectorsManagementModal = ({
  isOpen,
  onClose,
  sectors = [],
  assets = [],
  users = [],
  onSaveSector,
  onDeleteSector
}) => {
  const [editingSector, setEditingSector] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    responsavel: '',
    email: '',
    sala: ''
  });

  // Lista unificada de responsáveis disponíveis para puxar (usuários do sistema + responsáveis já cadastrados)
  const availableUsers = useMemo(() => {
    const map = new Map();
    // 1. Usuários autorizados no sistema
    users.forEach(u => {
      const emailKey = (u.email || '').toLowerCase().trim();
      if (emailKey) {
        map.set(emailKey, {
          name: u.name || u.displayName || emailKey.split('@')[0],
          email: u.email,
          role: u.role || 'operador',
          isRegisteredUser: true
        });
      }
    });

    // 2. Responsáveis existentes nos setores atuais
    sectors.forEach(s => {
      const emailKey = (s.email || '').toLowerCase().trim();
      const nameKey = (s.responsavel || '').trim();
      if (emailKey && !map.has(emailKey)) {
        map.set(emailKey, {
          name: nameKey || emailKey.split('@')[0],
          email: s.email,
          role: 'operador',
          isRegisteredUser: false
        });
      } else if (!emailKey && nameKey) {
        const dummyKey = `name-${nameKey.toLowerCase()}`;
        if (!map.has(dummyKey)) {
          map.set(dummyKey, {
            name: nameKey,
            email: '',
            role: 'operador',
            isRegisteredUser: false
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
  }, [users, sectors]);

  // Lista de setores ordenada em ordem alfabética (A-Z)
  const sortedSectors = useMemo(() => {
    return [...sectors].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
  }, [sectors]);

  const [deleteConfirmSector, setDeleteConfirmSector] = useState(null);
  const [reassignSectorId, setReassignSectorId] = useState('');

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingSector(null);
    setFormData({
      id: '',
      name: '',
      responsavel: '',
      email: '',
      sala: ''
    });
  };

  const handleStartEdit = (sector) => {
    setIsCreating(false);
    setEditingSector(sector);
    setFormData({
      id: sector.id,
      name: sector.name,
      responsavel: sector.responsavel,
      email: sector.email || '',
      sala: sector.sala || ''
    });
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingSector(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.responsavel.trim()) return;

    onSaveSector({
      ...formData,
      id: editingSector ? editingSector.id : (formData.id || `sec-${Date.now()}`)
    });

    handleCancelForm();
  };

  const handleDeleteClick = (sector) => {
    const linkedAssets = assets.filter(a => a.setorId === sector.id);
    setDeleteConfirmSector({ sector, linkedCount: linkedAssets.length });
    const available = sectors.filter(s => s.id !== sector.id);
    setReassignSectorId(available[0]?.id || '');
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmSector) {
      onDeleteSector(deleteConfirmSector.sector.id, reassignSectorId);
      setDeleteConfirmSector(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Gerenciar Setores & Responsáveis</h3>
              <p className="text-xs text-slate-400">Cadastre, altere ou exclua setores da instituição</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        {!isCreating && !editingSector && !deleteConfirmSector && (
          <div className="flex items-center justify-between mb-4 shrink-0">
            <span className="text-xs text-slate-400">
              Total de <strong className="text-white">{sectors.length}</strong> setores cadastrados
            </span>
            <button
              onClick={handleStartCreate}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Setor</span>
            </button>
          </div>
        )}

        {/* Create / Edit Form */}
        {(isCreating || editingSector) && (
          <form onSubmit={handleFormSubmit} className="bg-slate-850 p-4 rounded-2xl border border-indigo-500/30 mb-4 shrink-0 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                {isCreating ? 'Cadastrar Novo Setor' : `Editando: ${editingSector.name}`}
              </h4>
              <button
                type="button"
                onClick={handleCancelForm}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nome do Setor / Seção *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Auditoria Interna"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Responsável Oficial da Carga *</span>
                  </label>
                  {availableUsers.length > 0 && (
                    <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      Puxar cadastrado
                    </span>
                  )}
                </div>

                {/* Seletor Rápido dos Usuários Cadastrados */}
                {availableUsers.length > 0 && (
                  <select
                    value=""
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      if (!selectedVal) return;
                      const cand = availableUsers.find(u => u.email === selectedVal || u.name === selectedVal);
                      if (cand) {
                        setFormData(prev => ({
                          ...prev,
                          responsavel: cand.name,
                          email: cand.email || prev.email
                        }));
                      }
                    }}
                    className="w-full mb-1.5 bg-slate-900 border border-indigo-500/40 hover:border-indigo-400 text-indigo-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all"
                  >
                    <option value="" disabled>
                      👥 Puxar usuário responsável...
                    </option>
                    {availableUsers.map((u, i) => (
                      <option key={`${u.email || u.name}-${i}`} value={u.email || u.name} className="bg-slate-900 text-white">
                        {u.name} {u.email ? `(${u.email})` : ''} {u.isRegisteredUser ? '✓ Usuário do Sistema' : ''}
                      </option>
                    ))}
                  </select>
                )}

                {/* Input com Autocomplete via Datalist */}
                <input
                  type="text"
                  required
                  list="responsibles-datalist"
                  value={formData.responsavel}
                  onChange={(e) => {
                    const val = e.target.value;
                    const matched = availableUsers.find(u => 
                      u.name.toLowerCase() === val.toLowerCase() || 
                      (u.email && u.email.toLowerCase() === val.toLowerCase())
                    );
                    if (matched) {
                      setFormData(prev => ({
                        ...prev,
                        responsavel: matched.name,
                        email: matched.email || prev.email
                      }));
                    } else {
                      setFormData(prev => ({ ...prev, responsavel: val }));
                    }
                  }}
                  placeholder="Ex: Alex ou selecione da lista acima"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />

                <datalist id="responsibles-datalist">
                  {availableUsers.map((u, i) => (
                    <option key={`dl-${u.email || u.name}-${i}`} value={u.name}>
                      {u.email ? `${u.email} (${u.role})` : u.name}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>E-mail de Contato (Login do Responsável)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@empresa.com.br"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Localização Padrão (Sala / Bloco)</span>
                </label>
                <input
                  type="text"
                  value={formData.sala}
                  onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                  placeholder="Ex: Bloco B - Sala 301"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            {/* Aviso de Vínculo de Acesso e Login do Responsável */}
            {(() => {
              const isLinkedToSystemUser = users.some(u => 
                (u.email && formData.email && u.email.toLowerCase().trim() === formData.email.toLowerCase().trim()) ||
                (u.name && formData.responsavel && u.name.toLowerCase().trim() === formData.responsavel.toLowerCase().trim())
              );
              if (isLinkedToSystemUser) {
                return (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>Vínculo de Acesso Ativo:</strong> Ao efetuar login com <u>{formData.email || formData.responsavel}</u>, o sistema reconhecerá este setor como "Meu Setor" para este operador.
                    </span>
                  </div>
                );
              }
              if (formData.responsavel.trim()) {
                return (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-400 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Dica:</strong> Para que <u>{formData.responsavel}</u> tenha acesso ao logar, informe o e-mail Google dele e autorize-o no menu <strong>Usuários</strong>.
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Setor</span>
              </button>
            </div>
          </form>
        )}

        {/* Delete Confirmation Warning */}
        {deleteConfirmSector && (
          <div className="bg-rose-950/30 border border-rose-500/50 p-4 rounded-2xl mb-4 shrink-0 animate-in fade-in space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-200">
                  Excluir setor "{deleteConfirmSector.sector.name}"?
                </h4>
                <p className="text-xs text-rose-300/90 mt-0.5">
                  {deleteConfirmSector.linkedCount > 0 
                    ? `Existem ${deleteConfirmSector.linkedCount} bens patrimoniais vinculados a este setor. Selecione para qual setor deseja transferir estes bens:`
                    : 'Nenhum bem patrimonial vinculado a este setor. A exclusão será imediata.'}
                </p>
              </div>
            </div>

            {deleteConfirmSector.linkedCount > 0 && (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                  Transferir bens restantes para:
                </label>
                <select
                  value={reassignSectorId}
                  onChange={(e) => setReassignSectorId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {sortedSectors
                    .filter(s => s.id !== deleteConfirmSector.sector.id)
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.responsavel})</option>
                    ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-rose-900/40">
              <button
                type="button"
                onClick={() => setDeleteConfirmSector(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-rose-950/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar Exclusão</span>
              </button>
            </div>
          </div>
        )}

        {/* Sectors List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {sortedSectors.map((sector) => {
            const linkedCount = assets.filter(a => a.setorId === sector.id).length;

            return (
              <div
                key={sector.id}
                className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{sector.name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 font-mono">
                      {linkedCount} bens
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      Resp: <strong className="text-white">{sector.responsavel}</strong>
                    </span>
                    {sector.sala && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {sector.sala}
                      </span>
                    )}
                    {sector.email && (
                      <span className="text-slate-500">
                        {sector.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleStartEdit(sector)}
                    title="Editar informações do setor"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => handleDeleteClick(sector)}
                    disabled={sectors.length <= 1}
                    title={sectors.length <= 1 ? "É necessário ter ao menos 1 setor" : "Excluir setor"}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800/60 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
