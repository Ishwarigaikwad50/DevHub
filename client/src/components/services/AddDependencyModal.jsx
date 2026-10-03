import React, { useState, useEffect } from 'react';
import { X, GitFork, Plus } from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const AddDependencyModal = ({ isOpen, currentServiceId, onClose, onAdded }) => {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    targetService: '',
    dependencyType: 'REST API',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen) {
      api.get('/services?limit=100').then((res) => {
        const filtered = (res.data.services || []).filter((s) => s._id !== currentServiceId);
        setServices(filtered);
        if (filtered.length > 0 && !formData.targetService) {
          setFormData((prev) => ({ ...prev, targetService: filtered[0]._id }));
        }
      }).catch(console.error);
    }
  }, [isOpen, currentServiceId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.targetService) {
      error('Validation Error', 'Please select a target service dependency.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/dependencies', {
        sourceService: currentServiceId,
        targetService: formData.targetService,
        dependencyType: formData.dependencyType,
        description: formData.description
      });
      success('Dependency Linked', 'Service dependency recorded successfully.');
      onAdded(res.data.dependency);
      onClose();
    } catch (err) {
      error('Failed to Link Dependency', err.response?.data?.message || 'Could not link dependency.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-400">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Downstream Dependency</h3>
              <p className="text-xs text-slate-400">Declare a service that this service depends on</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Service (Depends On)
            </label>
            <select
              required
              value={formData.targetService}
              onChange={(e) => setFormData({ ...formData, targetService: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {services.map((svc) => (
                <option key={svc._id} value={svc._id}>
                  {svc.name} ({svc.key}) — {svc.ownerTeam?.name || 'Unassigned'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dependency Protocol / Type
            </label>
            <select
              value={formData.dependencyType}
              onChange={(e) => setFormData({ ...formData, dependencyType: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option>REST API</option>
              <option>Database</option>
              <option>Message Queue</option>
              <option>External API</option>
              <option>Authentication</option>
              <option>Storage</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dependency Purpose / Notes
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Publishes async order events or calls transaction auth endpoint"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
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
              disabled={loading || services.length === 0}
              className="px-5 py-2 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Linking...' : 'Link Dependency'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDependencyModal;
