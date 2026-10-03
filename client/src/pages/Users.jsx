import React, { useState, useEffect } from 'react';
import { UserCog, Plus, Search, Crown, Shield, Code, Eye, Edit3, Trash2, X, Sparkles } from 'lucide-react';
import api from '../api/client';
import RoleBadge from '../components/common/RoleBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmModal from '../components/common/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DEVELOPER',
    team: '',
    title: 'Software Engineer',
    status: 'Active'
  });

  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const fetchUsersAndTeams = async () => {
    try {
      const [usersRes, teamsRes] = await Promise.all([
        api.get(`/users?search=${encodeURIComponent(search)}`),
        api.get('/teams')
      ]);
      setUsers(usersRes.data.users || []);
      setTeams(teamsRes.data.teams || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndTeams();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, formData);
        success('User Updated', `${formData.name} permissions updated.`);
      } else {
        await api.post('/users', formData);
        success('User Created', `User account created for ${formData.name}.`);
      }
      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsersAndTeams();
    } catch (err) {
      error('Operation Failed', err.response?.data?.message || 'Error occurred.');
    }
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'DEVELOPER',
      team: u.team?._id || u.team || '',
      title: u.title || 'Software Engineer',
      status: u.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await api.delete(`/users/${deletingUser._id}`);
      success('User Removed', `${deletingUser.name} deleted.`);
      setDeletingUser(null);
      fetchUsersAndTeams();
    } catch (err) {
      error('Delete Failed', err.response?.data?.message || 'Could not delete user.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <UserCog className="w-6 h-6 text-purple-400" />
            <span>User Management & RBAC</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              {users.length} users
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Admin role assignments, team mapping, and user account access status
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({
              name: '',
              email: '',
              password: 'Password123!',
              role: 'DEVELOPER',
              team: teams[0]?._id || '',
              title: 'Software Engineer',
              status: 'Active'
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or title..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Fetching organization users..." size="lg" />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-4 py-3.5">Assigned Role</th>
                <th className="px-4 py-3.5">Team</th>
                <th className="px-4 py-3.5">Job Title</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                        alt={u.name}
                        className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                      />
                      <div>
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <RoleBadge role={u.role} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-medium">
                    {u.team?.name || 'Unassigned'}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">{u.title || 'Engineer'}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'Active'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Edit User"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {currentUser?._id !== u._id && (
                        <button
                          onClick={() => setDeletingUser(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-200 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
              <h3 className="text-base font-bold text-white">
                {editingUser ? `Edit ${editingUser.name}` : 'Create New User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="TEAM_ADMIN">TEAM_ADMIN</option>
                    <option value="DEVELOPER">DEVELOPER</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Team</label>
                <select
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Unassigned</option>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingUser)}
        title={`Delete user account for ${deletingUser?.name}?`}
        message="This will remove the user and revoke their platform access tokens immediately."
        confirmText="Delete User"
        confirmVariant="danger"
        onConfirm={handleDeleteUser}
        onClose={() => setDeletingUser(null)}
      />
    </div>
  );
};

export default Users;
