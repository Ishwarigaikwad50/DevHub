import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Users,
  Code2,
  Rocket,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  RefreshCw,
  GitFork,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import CriticalityBadge from '../components/common/CriticalityBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { success, error } = useToast();

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleQuickProbe = async (serviceId, serviceName) => {
    try {
      const res = await api.post(`/health/check/${serviceId}`);
      success('Health Probe Executed', `${serviceName} status: ${res.data.serviceStatus} (${res.data.check.responseTimeMs}ms)`);
      fetchDashboard();
    } catch (err) {
      error('Probe Failed', err.response?.data?.message || 'Health probe failed.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Aggregating platform telemetry & metrics..." size="lg" />;
  }

  const { metrics, charts, recentActivity, recentDeployments, attentionServices } = data || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            Engineering Platform Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time catalog analytics, dependency health, and deployment operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Metrics</span>
          </button>
          <Link
            to="/services"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Explore Catalog</span>
          </Link>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Services */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Services</span>
            <div className="p-2 rounded-xl bg-blue-950/70 border border-blue-800/50 text-blue-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics?.totalServices || 0}</span>
            <span className="text-xs font-medium text-emerald-400">
              {metrics?.healthPercentage}% Healthy
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
            <span>{metrics?.healthyServices} healthy</span> · <span>{metrics?.degradedServices} degraded</span> · <span>{metrics?.downServices} down</span>
          </div>
        </div>

        {/* Total Teams */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Engineering Teams</span>
            <div className="p-2 rounded-xl bg-purple-950/70 border border-purple-800/50 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics?.totalTeams || 0}</span>
            <span className="text-xs font-medium text-slate-400">Active Squads</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Owning {metrics?.totalServices} catalog services
          </div>
        </div>

        {/* APIs Exposed */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">APIs & Endpoints</span>
            <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-800/50 text-emerald-400">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics?.totalApis || 0}</span>
            <span className="text-xs font-medium text-blue-400 font-mono">REST Catalog</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {metrics?.totalDependencies || 0} inter-service dependencies
          </div>
        </div>

        {/* Deployments in 24h */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Recent Deployments (24h)</span>
            <div className="p-2 rounded-xl bg-amber-950/70 border border-amber-800/50 text-amber-400">
              <Rocket className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics?.recentDeploymentsCount || 0}</span>
            <span className="text-xs font-medium text-slate-400">({metrics?.totalDeployments} all-time)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across Dev, Staging & Production
          </div>
        </div>
      </div>

      {/* Critical Attention Panel (if any services are degraded or down) */}
      {attentionServices && attentionServices.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-slate-900 border border-rose-800/50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h2 className="text-sm font-bold text-white">Services Requiring Attention ({attentionServices.length})</h2>
            </div>
            <Link to="/health" className="text-xs text-rose-300 hover:text-rose-200 font-medium flex items-center gap-1">
              <span>View Health Center</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {attentionServices.map((svc) => (
              <div
                key={svc._id}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 shadow-md"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link to={`/services/${svc._id}`} className="text-xs font-bold text-white hover:text-blue-400 truncate">
                      {svc.name}
                    </Link>
                    <StatusBadge status={svc.status} size="sm" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Team: <span className="text-slate-300">{svc.ownerTeam?.name}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickProbe(svc._id, svc.name)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1 border border-slate-700"
                >
                  <Activity className="w-3 h-3 text-blue-400" />
                  <span>Probe</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Service Status Breakdown (Pie Chart) */}
        <div className="lg:col-span-4 glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Service Health Breakdown</h3>
            <span className="text-xs font-mono text-slate-400">{metrics?.totalServices} Total</span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.servicesByStatus || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts?.servicesByStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80">
            {(charts?.servicesByStatus || []).map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400">{item.name}:</span>
                <span className="font-bold text-white font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deployments 7-Day Timeline (Area Chart) */}
        <div className="lg:col-span-8 glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Deployment Velocity (Last 7 Days)</h3>
              <p className="text-xs text-slate-400">Total deployments executed across all environments</p>
            </div>
            <Link to="/deployments" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              View Log
            </Link>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.deploymentsTimeline || []}>
                <defs>
                  <linearGradient id="deployGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(val) => val.slice(5)} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#deployGradient)" name="Deployments" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Services by Tech Stack (Bar Chart) */}
        <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Services by Technology</h3>
            <span className="text-xs text-slate-400 font-mono">Ecosystem diversity</span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.servicesByTech || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} name="Services" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Services by Team (Bar Chart) */}
        <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Services Ownership by Team</h3>
            <Link to="/teams" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              View Teams
            </Link>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.servicesByTeam || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickFormatter={(v) => v.replace(' Team', '')} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} name="Services Owned" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feeds Grid: Recent Activity & Recent Deployments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Platform Audit Activity */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Recent Catalog Changes</h3>
            </div>
            <Link to="/audit-logs" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              Full Audit Trail
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivity?.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No recent changes logged</div>
            ) : (
              recentActivity?.map((log) => (
                <div
                  key={log._id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 text-xs"
                >
                  <img
                    src={log.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${log.user?.name || 'User'}`}
                    alt="user"
                    className="w-6 h-6 rounded-full shrink-0 border border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-200">
                      <span className="font-semibold text-white">{log.user?.name || 'System'}</span>
                      <span className="text-slate-400"> performed </span>
                      <span className="font-mono text-blue-400">{log.action}</span>
                      <span className="text-slate-400"> on </span>
                      <span className="font-medium text-slate-300">{log.entityName || log.entity}</span>
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Deployments */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Live Deployments</h3>
            </div>
            <Link to="/deployments" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentDeployments?.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No deployments recorded</div>
            ) : (
              recentDeployments?.map((dep) => (
                <div
                  key={dep._id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{dep.service?.name}</div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                      <span className="text-blue-400">{dep.version}</span> · <span>{dep.environment}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={dep.status} size="sm" />
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      {new Date(dep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
