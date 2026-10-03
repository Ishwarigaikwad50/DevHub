import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Plus, Search, Filter, RefreshCw, GitCommit, CheckCircle2, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import TriggerDeploymentModal from '../components/services/TriggerDeploymentModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

export const Deployments = () => {
  const [deployments, setDeployments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedEnv, setSelectedEnv] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [selectedServiceForDeploy, setSelectedServiceForDeploy] = useState(null);

  const { isViewer } = useAuth();

  const fetchDeployments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedEnv) params.append('environment', selectedEnv);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedService) params.append('service', selectedService);
      params.append('limit', 100);

      const [depsRes, servicesRes] = await Promise.all([
        api.get(`/deployments?${params.toString()}`),
        api.get('/services?limit=100')
      ]);

      setDeployments(depsRes.data.deployments || []);
      setServices(servicesRes.data.services || []);
      if (servicesRes.data.services?.length > 0 && !selectedServiceForDeploy) {
        setSelectedServiceForDeploy(servicesRes.data.services[0]);
      }
    } catch (err) {
      console.error('Failed to load deployments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, [selectedEnv, selectedStatus, selectedService]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Rocket className="w-6 h-6 text-amber-400" />
            <span>Deployments & Releases</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              {deployments.length} releases
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deployment logs, commit hashes, release notes, and environment rollout states
          </p>
        </div>

        {!isViewer && (
          <button
            onClick={() => setIsDeployModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Service</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500 w-full sm:w-60"
        >
          <option value="">All Services</option>
          {services.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={selectedEnv}
          onChange={(e) => setSelectedEnv(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500 w-full sm:w-48"
        >
          <option value="">All Environments</option>
          <option value="Production">Production</option>
          <option value="Staging">Staging</option>
          <option value="Development">Development</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500 w-full sm:w-48"
        >
          <option value="">All Statuses</option>
          <option value="Successful">Successful</option>
          <option value="Failed">Failed</option>
          <option value="Running">Running</option>
          <option value="Pending">Pending</option>
          <option value="Rolled Back">Rolled Back</option>
        </select>
      </div>

      {/* Deployments Table */}
      {loading ? (
        <LoadingSpinner text="Fetching deployment audit log..." size="lg" />
      ) : deployments.length === 0 ? (
        <EmptyState icon={Rocket} title="No deployments found" description="Try selecting different filters." />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Service</th>
                <th className="px-4 py-3.5">Version & Commit</th>
                <th className="px-4 py-3.5">Environment</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Deployed By</th>
                <th className="px-4 py-3.5">Release Notes</th>
                <th className="px-5 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deployments.map((dep) => (
                <tr key={dep._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/services/${dep.service?._id}`}
                      className="font-bold text-white hover:text-blue-400 flex items-center gap-1.5"
                    >
                      <span>{dep.service?.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white font-mono">{dep.version}</div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <GitCommit className="w-3 h-3" />
                      <span>{dep.commitHash}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-300">{dep.environment}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={dep.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">
                    <div className="flex items-center gap-2">
                      <img
                        src={dep.deployedBy?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${dep.deployedBy?.name || 'CI'}`}
                        alt="user"
                        className="w-5 h-5 rounded-full border border-slate-700"
                      />
                      <span>{dep.deployedBy?.name || 'GitHub Actions'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 max-w-sm truncate">{dep.notes || '—'}</td>
                  <td className="px-5 py-3.5 text-right text-slate-400 font-mono">
                    {new Date(dep.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deployment Modal */}
      {selectedServiceForDeploy && (
        <TriggerDeploymentModal
          isOpen={isDeployModalOpen}
          serviceId={selectedServiceForDeploy._id}
          serviceName={selectedServiceForDeploy.name}
          onClose={() => setIsDeployModalOpen(false)}
          onDeployed={() => fetchDeployments()}
        />
      )}
    </div>
  );
};

export default Deployments;
