import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users2, Plus, ArrowUpRight, MessageSquare, Mail, Server, User, X, Sparkles } from 'lucide-react';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    contactEmail: '',
    slackChannel: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const { isAdmin, isTeamAdmin } = useAuth();
  const { success, error } = useToast();

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data.teams || []);
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setSubmitting(true);
    try {
      const res = await api.post('/teams', formData);
      success('Team Created', `${res.data.team.name} squad registered.`);
      setIsModalOpen(false);
      setFormData({ name: '', key: '', description: '', contactEmail: '', slackChannel: '' });
      fetchTeams();
    } catch (err) {
      error('Failed to Create Team', err.response?.data?.message || 'Error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading engineering teams..." size="lg" />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users2 className="w-6 h-6 text-purple-400" />
            <span>Engineering Teams</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              {teams.length} teams
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Squad structure, service ownership, contact points, and squad leads
          </p>
        </div>

        {(isAdmin || isTeamAdmin) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Team</span>
          </button>
        )}
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <EmptyState icon={Users2} title="No teams registered" description="Create engineering squads to assign service ownership." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teams.map((team) => (
            <div
              key={team._id}
              className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-purple-950/70 border border-purple-800/60 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <Users2 className="w-5 h-5" />
                    </div>
                    <div>
                      <Link
                        to={`/teams/${team._id}`}
                        className="text-base font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5"
                      >
                        <span>{team.name}</span>
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <div className="text-xs font-mono text-slate-400">{team.key}</div>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {team.description || 'No description provided.'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Lead</span>
                  </span>
                  <span className="font-medium text-white">{team.lead?.name || 'Unassigned'}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5" />
                    <span>Services Owned</span>
                  </span>
                  <span className="font-bold text-blue-400 font-mono">{team.serviceCount || 0}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Slack</span>
                  </span>
                  <span className="font-mono text-slate-300">{team.slackChannel || '#eng-squad'}</span>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    to={`/teams/${team._id}`}
                    className="w-full text-center py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    View Team Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-400">
                  <Users2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Engineering Team</h3>
                  <p className="text-xs text-slate-400">Establish a new squad and ownership group</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Payments Team"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Unique Key</label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="e.g. payments"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Team domain and engineering responsibilities"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="team-eng@devhub.io"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Slack Channel</label>
                  <input
                    type="text"
                    value={formData.slackChannel}
                    onChange={(e) => setFormData({ ...formData, slackChannel: e.target.value })}
                    placeholder="#team-squad"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Creating...' : 'Create Squad'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
