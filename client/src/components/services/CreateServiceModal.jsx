import React, { useState, useEffect } from 'react';
import { X, Server, Sparkles } from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const CreateServiceModal = ({ isOpen, onClose, onCreated }) => {
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    serviceType: 'Backend Service',
    ownerTeam: '',
    technologies: '',
    language: 'JavaScript',
    criticality: 'Tier 2 - High',
    repositoryUrl: '',
    documentationUrl: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen) {
      api.get('/teams').then((res) => {
        setTeams(res.data.teams || []);
        if (res.data.teams?.length > 0 && !formData.ownerTeam) {
          setFormData((prev) => ({ ...prev, ownerTeam: res.data.teams[0]._id }));
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    const name = e.target.value;
    const generatedKey = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      key: prev.key === '' || prev.key === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ? generatedKey : prev.key
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.key || !formData.description || !formData.ownerTeam) {
      error('Validation Error', 'Please fill in all required fields (Name, Key, Description, Team).');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/services', {
        ...formData,
        technologies: formData.technologies.split(',').map((t) => t.trim()).filter(Boolean),
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      });
      success('Service Registered', `${res.data.service.name} has been added to DevHub.`);
      onCreated(res.data.service);
      onClose();
    } catch (err) {
      error('Creation Failed', err.response?.data?.message || 'Could not register service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register New Service</h3>
              <p className="text-xs text-slate-400">Add a new microservice or application to the organization catalog</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Service Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Payment Service"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Unique Key <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="e.g. payment-service"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this service do, what business domain does it belong to?"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Owner Team <span className="text-rose-400">*</span>
              </label>
              <select
                required
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Criticality Tier</label>
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
                placeholder="e.g. TypeScript, Go, Python"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                placeholder="e.g. Express, MongoDB, Redis, Docker"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                placeholder="https://github.com/org/repo"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Documentation URL</label>
              <input
                type="url"
                value={formData.documentationUrl}
                onChange={(e) => setFormData({ ...formData, documentationUrl: e.target.value })}
                placeholder="https://docs.internal/service"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Registering...' : 'Register Service'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateServiceModal;
