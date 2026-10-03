import React, { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const EditServiceModal = ({ isOpen, service, onClose, onUpdated }) => {
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serviceType: 'Backend Service',
    ownerTeam: '',
    status: 'Healthy',
    criticality: 'Tier 2 - High',
    technologies: '',
    language: 'JavaScript',
    repositoryUrl: '',
    documentationUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen && service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        serviceType: service.serviceType || 'Backend Service',
        ownerTeam: service.ownerTeam?._id || service.ownerTeam || '',
        status: service.status || 'Healthy',
        criticality: service.criticality || 'Tier 2 - High',
        technologies: (service.technologies || []).join(', '),
        language: service.language || 'JavaScript',
        repositoryUrl: service.repositoryUrl || '',
        documentationUrl: service.documentationUrl || ''
      });

      api.get('/teams').then((res) => {
        setTeams(res.data.teams || []);
      }).catch(console.error);
    }
  }, [isOpen, service]);

  if (!isOpen || !service) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/services/${service._id}`, {
        ...formData,
        technologies: formData.technologies.split(',').map((t) => t.trim()).filter(Boolean)
      });
      success('Service Updated', `${res.data.service.name} details have been updated.`);
      onUpdated(res.data.service);
      onClose();
    } catch (err) {
      error('Update Failed', err.response?.data?.message || 'Could not update service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Service</h3>
              <p className="text-xs text-slate-400 font-mono">{service.key}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Service Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option>Healthy</option>
                <option>Degraded</option>
                <option>Down</option>
                <option>Maintenance</option>
                <option>Unknown</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Team</label>
              <select
                value={formData.ownerTeam}
                onChange={(e) => setFormData({ ...formData, ownerTeam: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Service Type</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option>Backend Service</option>
                <option>Frontend Application</option>
                <option>Mobile Application</option>
                <option>API</option>
                <option>Worker</option>
                <option>Scheduled Job</option>
                <option>Database</option>
                <option>External Integration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Criticality</label>
              <select
                value={formData.criticality}
                onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option>Tier 1 - Critical</option>
                <option>Tier 2 - High</option>
                <option>Tier 3 - Medium</option>
                <option>Tier 4 - Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Language</label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Technologies</label>
              <input
                type="text"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Repository URL</label>
              <input
                type="url"
                value={formData.repositoryUrl}
                onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Documentation URL</label>
              <input
                type="url"
                value={formData.documentationUrl}
                onChange={(e) => setFormData({ ...formData, documentationUrl: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceModal;
