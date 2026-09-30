import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  User, 
  X, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  Crown
} from 'lucide-react';
import { DEFAULT_ADMIN_EMAILS } from '../services/firebase';

export function UserManagementModal({ 
  isOpen, 
  onClose, 
  users = [], 
  currentUser,
  onAddUser, 
  onDeleteUser 
}) {
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('operador');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      setError('Este e-mail já está cadastrado na lista de autorizados.');
      return;
    }

    setSubmitting(true);
    try {
      await onAddUser({
        email: cleanEmail,
        name: newName.trim() || cleanEmail.split('@')[0],
        role: newRole,
        addedBy: currentUser?.email || 'Administrador',
        addedAt: new Date().toISOString()
      });
      setSuccess(`Usuário ${cleanEmail} autorizado com sucesso!`);
      setNewEmail('');
      setNewName('');
      setNewRole('operador');
    } catch (err) {
      setError(err.message || 'Erro ao adicionar usuário.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (email) => {
    const isSuper = DEFAULT_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
    if (isSuper) {
      alert('Não é possível remover o Super Administrador principal.');
      return;
    }

    if (confirm(`Tem certeza que deseja revogar o acesso de ${email}?`)) {
      try {
        await onDeleteUser(email);
        setSuccess(`Acesso de ${email} revogado.`);
      } catch (err) {
        setError(err.message || 'Erro ao remover usuário.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Gerenciar Acessos & Usuários
              </h2>
              <p className="text-xs text-slate-400">
                Apenas e-mails Google cadastrados aqui poderão acessar o sistema
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Alerts */}
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              {error}
            </div>
          )}
          {success && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              {success}
            </div>
          )}

          {/* Add User Form */}
          <form onSubmit={handleAdd} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                Autorizar Novo E-mail Google
              </h3>
              <span className="text-xs text-slate-400">
                Total cadastrados: <strong className="text-indigo-400">{users.length}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5">
                <label className="block text-xs font-medium text-slate-400 mb-1">E-mail Google</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="usuario@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome / Identificação</label>
                <input
                  type="text"
                  placeholder="Nome do Usuário"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-400 mb-1">Nível de Acesso</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="operador">Operador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                {submitting ? 'Adicionando...' : 'Autorizar Acesso'}
              </button>
            </div>
          </form>

          {/* User List */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Usuários com Acesso Permitido ({users.length})
            </h3>

            <div className="space-y-2">
              {users.map((u) => {
                const isSuper = DEFAULT_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(u.email.toLowerCase());
                const isAdmin = u.role === 'admin' || isSuper;

                return (
                  <div
                    key={u.email}
                    className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isAdmin ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'}`}>
                        {isSuper ? <Crown className="w-4 h-4 text-amber-400" /> : isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{u.name || u.email.split('@')[0]}</span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {isSuper ? 'Super Admin' : isAdmin ? 'Admin' : 'Operador'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>

                    {!isSuper && (
                      <button
                        onClick={() => handleDelete(u.email)}
                        title="Revogar Acesso"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserManagementModal;
