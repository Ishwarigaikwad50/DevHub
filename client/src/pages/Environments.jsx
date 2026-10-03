import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe2, Server, Search, Filter, RefreshCw, ExternalLink, Activity, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const Environments = () => {
  const [environments, setEnvironments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEnv, setSelectedEnv] = useState('');

  const fetchEnvironments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/environments');
      setEnvironments(res.data.environments || []);
    } catch (err) {
      console.error('Failed to load environments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvironments();
  }, []);

  const filteredEnvs = environments.filter((env) => {
    const matchesSearch = !search || env.service?.name?.toLowerCase().includes(search.toLowerCase()) || env.service?.key?.toLowerCase().includes(search.toLowerCase()) || env.baseUrl?.toLowerCase().includes(search.toLowerCase());
    const matchesEnv = !selectedEnv || env.name === selectedEnv;
    return matchesSearch && matchesEnv;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Globe2 className="w-6 h-6 text-blue-400" />
            <span>Environment Matrix</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              {environments.length} instances
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deployment status across Development, Staging, and Production tiers
          </p>
        </div>

        <button
          onClick={fetchEnvironments}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Matrix</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service or base URL..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={selectedEnv}
          onChange={(e) => setSelectedEnv(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500 w-full sm:w-48"
        >
          <option value="">All Tiers</option>
          <option value="Production">Production</option>
          <option value="Staging">Staging</option>
          <option value="Development">Development</option>
        </select>
      </div>

      {/* Environments Table */}
      {loading ? (
        <LoadingSpinner text="Aggregating environment health..." size="lg" />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Service</th>
                <th className="px-4 py-3.5">Environment</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Deployed Version</th>
                <th className="px-4 py-3.5">Base Endpoint URL</th>
                <th className="px-5 py-3.5 text-right">Last Deployed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEnvs.map((env) => (
                <tr key={env._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/services/${env.service?._id}`}
                      className="font-bold text-white hover:text-blue-400 flex items-center gap-1.5"
                    >
                      <span>{env.service?.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </Link>
                    <div className="text-[11px] font-mono text-slate-400">{env.service?.ownerTeam?.name}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">
                      {env.name}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={env.deploymentStatus} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-blue-400">v{env.version}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-300 truncate max-w-xs">{env.baseUrl || '—'}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-slate-400">
                    {new Date(env.lastDeployedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Environments;
