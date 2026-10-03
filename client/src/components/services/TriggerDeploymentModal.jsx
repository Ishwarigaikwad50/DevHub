import React, { useState } from 'react';
import { X, Rocket, Sparkles } from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const TriggerDeploymentModal = ({ isOpen, serviceId, serviceName, onClose, onDeployed }) => {
  const [formData, setFormData] = useState({
    environment: 'Production',
    version: 'v2.5.0',
    commitHash: Math.random().toString(16).substring(2, 9),
    status: 'Successful',
    notes: 'Standard version release deployment'
  });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.version) {
      error('Validation Error', 'Version tag is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/deployments', {
        service: serviceId,
        environment: formData.environment,
        version: formData.version,
        commitHash: formData.commitHash,
        status: formData.status,
        notes: formData.notes
      });
      success('Deployment Recorded', `Deployed ${formData.version} to ${formData.environment} [${formData.status}].`);
      onDeployed(res.data.deployment);
      onClose();
    } catch (err) {
      error('Deployment Failed', err.response?.data?.message || 'Could not record deployment.');
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
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Deploy Service</h3>
              <p className="text-xs text-slate-400">{serviceName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Environment</label>
              <select
                value={formData.environment}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option>Production</option>
                <option>Staging</option>
                <option>Development</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Version / Tag</label>
              <input
                type="text"
                required
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="e.g. v2.5.0"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Commit Hash</label>
              <input
                type="text"
                value={formData.commitHash}
                onChange={(e) => setFormData({ ...formData, commitHash: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Execution Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option>Successful</option>
                <option>Running</option>
                <option>Failed</option>
                <option>Rolled Back</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Release Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Summary of changes included in this deployment"
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
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              <span>{loading ? 'Deploying...' : 'Trigger Deploy'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TriggerDeploymentModal;
