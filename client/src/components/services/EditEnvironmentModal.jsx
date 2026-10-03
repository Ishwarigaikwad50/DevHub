import React, { useState, useEffect } from 'react';
import { X, Globe2, Save } from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const EditEnvironmentModal = ({ isOpen, environment, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    baseUrl: '',
    healthCheckUrl: '',
    version: '',
    deploymentStatus: 'Healthy'
  });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen && environment) {
      setFormData({
        baseUrl: environment.baseUrl || '',
        healthCheckUrl: environment.healthCheckUrl || '',
        version: environment.version || '',
        deploymentStatus: environment.deploymentStatus || 'Healthy'
      });
    }
  }, [isOpen, environment]);

  if (!isOpen || !environment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/environments/${environment._id}`, formData);
      success('Environment Updated', `${environment.name} configuration saved.`);
      onUpdated(res.data.environment);
      onClose();
    } catch (err) {
      error('Update Failed', err.response?.data?.message || 'Could not update environment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit {environment.name} Environment</h3>
              <p className="text-xs text-slate-400">Configure base URLs and health check endpoint</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Base URL</label>
            <input
              type="url"
              required
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Health Check URL</label>
            <input
              type="url"
              required
              value={formData.healthCheckUrl}
              onChange={(e) => setFormData({ ...formData, healthCheckUrl: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Deployed Version</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={formData.deploymentStatus}
                onChange={(e) => setFormData({ ...formData, deploymentStatus: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option>Healthy</option>
                <option>Degraded</option>
                <option>Down</option>
                <option>Unknown</option>
              </select>
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
              <span>{loading ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEnvironmentModal;
