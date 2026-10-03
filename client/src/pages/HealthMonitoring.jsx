import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Play, CheckCircle2, AlertTriangle, XCircle, Wrench, RefreshCw, Server, ExternalLink, Clock } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export const HealthMonitoring = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingAll, setCheckingAll] = useState(false);
  const { success, error } = useToast();

  const fetchHealth = async () => {
    try {
      const res = await api.get('/health/summary');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load health summary:', err);
    } finally {
      setLoading(false);
      setCheckingAll(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRunAll = async () => {
    setCheckingAll(true);
    try {
      const res = await api.post('/health/check-all');
      success('Health Checks Complete', res.data.message || 'Probes executed.');
      fetchHealth();
    } catch (err) {
      error('Health Checks Failed', err.response?.data?.message || 'Error occurred.');
      setCheckingAll(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Querying health telemetry probes..." size="lg" />;
  }

  const { summary, recentChecks } = data || {};

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-emerald-400" />
            <span>Service Health & Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous background health monitoring, HTTP status latency, and fault alerts
          </p>
        </div>

        <button
          onClick={handleRunAll}
          disabled={checkingAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
        >
          <Play className={`w-4 h-4 ${checkingAll ? 'animate-spin' : ''}`} />
          <span>{checkingAll ? 'Probing All Services...' : 'Run All Health Checks'}</span>
        </button>
      </div>

      {/* Health Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-medium text-slate-400">System Availability</div>
          <div className="mt-2 text-3xl font-black text-emerald-400 font-mono">
            {summary?.uptimePercentage}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Across {summary?.totalServices} services</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-medium text-slate-400">Avg Probe Response Time</div>
          <div className="mt-2 text-3xl font-black text-blue-400 font-mono">
            {summary?.avgResponseTimeMs} ms
          </div>
          <div className="mt-1 text-[11px] text-slate-500">p95 Latency SLA Target &lt; 150ms</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-medium text-slate-400">Healthy Services</div>
          <div className="mt-2 text-3xl font-black text-white font-mono">
            {summary?.healthyServices} / {summary?.totalServices}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium">Operating normally</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-medium text-slate-400">Impaired / Degraded</div>
          <div className="mt-2 text-3xl font-black text-amber-400 font-mono">
            {(summary?.degradedServices || 0) + (summary?.downServices || 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {summary?.downServices} down · {summary?.degradedServices} degraded
          </div>
        </div>
      </div>

      {/* Recent Health Probes Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Recent Probe Log History</h3>

        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Service</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">HTTP Code</th>
                <th className="px-4 py-3.5">Latency</th>
                <th className="px-4 py-3.5">Probe URL</th>
                <th className="px-4 py-3.5">Result</th>
                <th className="px-5 py-3.5 text-right">Checked At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentChecks?.map((hc) => (
                <tr key={hc._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link to={`/services/${hc.service?._id}`} className="font-bold text-white hover:text-blue-400 flex items-center gap-1.5">
                      <span>{hc.service?.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={hc.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-white">{hc.httpStatus}</td>
                  <td className="px-4 py-3.5 font-mono text-blue-400">{hc.responseTimeMs} ms</td>
                  <td className="px-4 py-3.5 font-mono text-slate-400 max-w-xs truncate">{hc.url}</td>
                  <td className="px-4 py-3.5">
                    {hc.isSuccess ? (
                      <span className="text-emerald-400 font-medium">Passed</span>
                    ) : (
                      <span className="text-rose-400 font-medium truncate max-w-xs block">{hc.errorMessage || 'Failed'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right text-slate-400 font-mono">
                    {new Date(hc.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HealthMonitoring;
