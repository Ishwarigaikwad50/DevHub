import React, { useState } from 'react';
import { X, Code2, Plus } from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const AddApiModal = ({ isOpen, serviceId, onClose, onAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    endpoint: '/api/v1/',
    method: 'GET',
    version: 'v1',
    description: '',
    authRequired: true,
    status: 'Active',
    exampleRequest: '{\n  \n}',
    exampleResponse: '{\n  "status": "success"\n}'
  });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.endpoint) {
      error('Validation Error', 'Please specify API name and endpoint path.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/apis', {
        ...formData,
        service: serviceId
      });
      success('API Registered', `${formData.method} ${formData.endpoint} added to catalog.`);
      onAdded(res.data.api);
      onClose();
    } catch (err) {
      error('Creation Failed', err.response?.data?.message || 'Could not register API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register API Endpoint</h3>
              <p className="text-xs text-slate-400">Add an exposed REST route to this service</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">API Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Process Charge"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Version</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">HTTP Method</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono font-bold text-white focus:outline-none focus:border-blue-500"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>PATCH</option>
                <option>DELETE</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Endpoint Path</label>
              <input
                type="text"
                required
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                placeholder="/api/v1/resource/:id"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this endpoint do, what parameters does it take?"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">Example Request JSON</label>
              <textarea
                rows={4}
                value={formData.exampleRequest}
                onChange={(e) => setFormData({ ...formData, exampleRequest: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">Example Response JSON</label>
              <textarea
                rows={4}
                value={formData.exampleResponse}
                onChange={(e) => setFormData({ ...formData, exampleResponse: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-blue-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="authCheck"
              checked={formData.authRequired}
              onChange={(e) => setFormData({ ...formData, authRequired: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
            />
            <label htmlFor="authCheck" className="text-xs text-slate-300">
              Requires Bearer Token / API Authentication
            </label>
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
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Adding...' : 'Add Endpoint'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddApiModal;
