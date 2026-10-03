import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Server,
  Code2,
  Globe2,
  GitFork,
  Rocket,
  Activity,
  History,
  ExternalLink,
  Edit3,
  Trash2,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Users,
  MessageSquare,
  Mail,
  Copy,
  Tag
} from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import CriticalityBadge from '../components/common/CriticalityBadge';
import MethodBadge from '../components/common/MethodBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import EditServiceModal from '../components/services/EditServiceModal';
import AddApiModal from '../components/services/AddApiModal';
import AddDependencyModal from '../components/services/AddDependencyModal';
import TriggerDeploymentModal from '../components/services/TriggerDeploymentModal';
import EditEnvironmentModal from '../components/services/EditEnvironmentModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isViewer } = useAuth();
  const { success, error } = useToast();

  const [service, setService] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [probing, setProbing] = useState(false);

  // Sub-resource states
  const [apis, setApis] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [dependencies, setDependencies] = useState({ upstream: [], downstream: [] });
  const [deployments, setDeployments] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddApiModalOpen, setIsAddApiModalOpen] = useState(false);
  const [isAddDepModalOpen, setIsAddDepModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState(null);
  const [selectedApiForModal, setSelectedApiForModal] = useState(null);

  const fetchServiceData = async () => {
    try {
      const res = await api.get(`/services/${id}`);
      setService(res.data.service);
      const svcId = res.data.service._id;

      // Parallel fetch sub-resources
      const [apisRes, envsRes, depsRes, deploysRes, healthRes, activityRes] = await Promise.all([
        api.get(`/services/${svcId}/apis`),
        api.get(`/services/${svcId}/environments`),
        api.get(`/services/${svcId}/dependencies`),
        api.get(`/services/${svcId}/deployments`),
        api.get(`/services/${svcId}/health`),
        api.get(`/services/${svcId}/activity`)
      ]);

      setApis(apisRes.data.apis || []);
      setEnvironments(envsRes.data.environments || []);
      setDependencies({
        upstream: depsRes.data.upstream || [],
        downstream: depsRes.data.downstream || []
      });
      setDeployments(deploysRes.data.deployments || []);
      setHealthChecks(healthRes.data.checks || []);
      setActivityLogs(activityRes.data.logs || []);
    } catch (err) {
      console.error('Failed to load service details:', err);
      error('Error', 'Service not found or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, [id]);

  const handleRunProbe = async () => {
    setProbing(true);
    try {
      const res = await api.post(`/health/check/${service._id}`);
      success('Probe Completed', `Status: ${res.data.serviceStatus} (${res.data.check.responseTimeMs}ms)`);
      fetchServiceData();
    } catch (err) {
      error('Probe Failed', err.response?.data?.message || 'Probe request timed out.');
    } finally {
      setProbing(false);
    }
  };

  const handleDeleteService = async () => {
    try {
      await api.delete(`/services/${service._id}`);
      success('Service Deleted', `${service.name} has been removed.`);
      navigate('/services');
    } catch (err) {
      error('Delete Failed', err.response?.data?.message || 'Could not delete service.');
    }
  };

  const handleDeleteApi = async (apiId) => {
    try {
      await api.delete(`/apis/${apiId}`);
      success('API Removed', 'Endpoint definition deleted.');
      fetchServiceData();
    } catch (err) {
      error('Delete Failed', err.response?.data?.message || 'Could not delete API.');
    }
  };

  const handleDeleteDependency = async (depId) => {
    try {
      await api.delete(`/dependencies/${depId}`);
      success('Dependency Removed', 'Service dependency link deleted.');
      fetchServiceData();
    } catch (err) {
      error('Delete Failed', err.response?.data?.message || 'Could not remove dependency.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading service architecture..." size="lg" />;
  }

  if (!service) {
    return (
      <EmptyState
        icon={Server}
        title="Service Not Found"
        description="The requested service does not exist or may have been removed."
        actionLabel="Back to Catalog"
        onAction={() => navigate('/services')}
      />
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Server },
    { id: 'apis', name: `APIs (${apis.length})`, icon: Code2 },
    { id: 'environments', name: `Environments (${environments.length})`, icon: Globe2 },
    { id: 'dependencies', name: `Dependencies (${dependencies.upstream.length + dependencies.downstream.length})`, icon: GitFork },
    { id: 'deployments', name: `Deployments (${deployments.length})`, icon: Rocket },
    { id: 'health', name: 'Health & Telemetry', icon: Activity },
    { id: 'activity', name: 'Activity Log', icon: History }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Server className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black text-white tracking-tight">{service.name}</h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                  {service.key}
                </span>
                <StatusBadge status={service.status} size="md" />
                <CriticalityBadge criticality={service.criticality} size="md" />
              </div>

              <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">{service.description}</p>

              {/* Quick links & metadata */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-medium text-slate-300">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Team: {service.ownerTeam?.name || 'Unassigned'}</span>
                </div>
                {service.primaryOwner && (
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <img
                      src={service.primaryOwner.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${service.primaryOwner.name}`}
                      alt="owner"
                      className="w-4 h-4 rounded-full border border-slate-700"
                    />
                    <span>Owner: {service.primaryOwner.name}</span>
                  </div>
                )}
                {service.repositoryUrl && (
                  <a
                    href={service.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                  >
                    <span>Repository</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {service.documentationUrl && (
                  <a
                    href={service.documentationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                  >
                    <span>Documentation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleRunProbe}
              disabled={probing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-slate-700 text-xs font-semibold transition-all"
            >
              <Activity className={`w-4 h-4 ${probing ? 'animate-spin text-emerald-400' : 'text-emerald-500'}`} />
              <span>{probing ? 'Probing...' : 'Run Probe'}</span>
            </button>

            {!isViewer && (
              <>
                <button
                  onClick={() => setIsDeployModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Deploy</span>
                </button>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </>
            )}

            {isAdmin && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-400 hover:bg-rose-900 hover:text-white transition-colors"
                title="Delete Service"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-t border-slate-800/80 pt-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Summary */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tech Stack & Architecture Card */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Technology & Stack</h3>
              <div className="flex flex-wrap gap-2">
                {service.technologies?.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 text-xs font-mono font-medium shadow-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {service.tags && service.tags.length > 0 && (
                <div className="pt-3 border-t border-slate-800/60">
                  <div className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    <span>Domain Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {service.tags.map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-md bg-blue-950/60 text-blue-300 border border-blue-900/60 text-[11px]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Environments Snapshot */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Environments Snapshot</h3>
                <button
                  onClick={() => setActiveTab('environments')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  Manage All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {environments.map((env) => (
                  <div key={env._id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{env.name}</span>
                      <StatusBadge status={env.deploymentStatus} size="sm" />
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate" title={env.baseUrl}>
                      {env.baseUrl || 'Not configured'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      v{env.version} · {new Date(env.lastDeployedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Dependency Graph Snapshot */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Service Topology</h3>
                <Link to="/dependencies" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                  Full Interactive Graph
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 mb-2">
                    Upstream Dependencies ({dependencies.upstream.length})
                  </div>
                  {dependencies.upstream.length === 0 ? (
                    <div className="text-xs text-slate-500">No outgoing dependencies</div>
                  ) : (
                    <div className="space-y-1.5">
                      {dependencies.upstream.map((dep) => (
                        <div key={dep._id} className="flex items-center justify-between text-xs">
                          <Link to={`/services/${dep.targetService?._id}`} className="text-blue-400 hover:underline">
                            {dep.targetService?.name}
                          </Link>
                          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                            {dep.dependencyType}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 mb-2">
                    Downstream Consumers ({dependencies.downstream.length})
                  </div>
                  {dependencies.downstream.length === 0 ? (
                    <div className="text-xs text-slate-500">No consumers calling this service</div>
                  ) : (
                    <div className="space-y-1.5">
                      {dependencies.downstream.map((dep) => (
                        <div key={dep._id} className="flex items-center justify-between text-xs">
                          <Link to={`/services/${dep.sourceService?._id}`} className="text-blue-400 hover:underline">
                            {dep.sourceService?.name}
                          </Link>
                          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                            {dep.dependencyType}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Info Rail */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Service Metadata</h3>

              <div className="space-y-3 text-xs divide-y divide-slate-800/80">
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-slate-400">Service Key</span>
                  <span className="text-slate-200 font-mono">{service.key}</span>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="text-slate-200">{service.serviceType}</span>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-slate-400">Owner Team</span>
                  <Link to={`/teams/${service.ownerTeam?._id}`} className="text-blue-400 hover:underline font-medium">
                    {service.ownerTeam?.name}
                  </Link>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-slate-400">Team Channel</span>
                  <span className="text-slate-200 font-mono">{service.ownerTeam?.slackChannel || '#dev-squad'}</span>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-slate-400">Team Contact</span>
                  <span className="text-slate-200">{service.ownerTeam?.contactEmail || 'eng@devhub.io'}</span>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-slate-400">Registered Date</span>
                  <span className="text-slate-200 font-mono">{new Date(service.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-slate-400">Last Modified</span>
                  <span className="text-slate-200 font-mono">{new Date(service.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. APIS TAB */}
      {activeTab === 'apis' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Exposed Endpoints ({apis.length})</h3>
            {!isViewer && (
              <button
                onClick={() => setIsAddApiModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add Endpoint</span>
              </button>
            )}
          </div>

          {apis.length === 0 ? (
            <EmptyState
              icon={Code2}
              title="No APIs registered yet"
              description="Document REST endpoints, parameters, and payloads for other developers."
              actionLabel={!isViewer ? 'Add Endpoint' : undefined}
              onAction={() => setIsAddApiModalOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {apis.map((apiItem) => (
                <div
                  key={apiItem._id}
                  className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-700/80 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <MethodBadge method={apiItem.method} size="md" />
                      <span className="text-sm font-mono font-bold text-white">{apiItem.endpoint}</span>
                      <span className="text-xs text-slate-400">({apiItem.name})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {apiItem.authRequired && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-900/60">
                          Auth Required
                        </span>
                      )}
                      {!isViewer && (
                        <button
                          onClick={() => handleDeleteApi(apiItem._id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete API"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {apiItem.description && (
                    <p className="text-xs text-slate-400">{apiItem.description}</p>
                  )}

                  {/* Schema Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="rounded-xl bg-slate-950 p-3 border border-slate-800/80 font-mono text-[11px]">
                      <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Request Payload</div>
                      <pre className="text-emerald-400 overflow-x-auto">{apiItem.exampleRequest || '{}'}</pre>
                    </div>

                    <div className="rounded-xl bg-slate-950 p-3 border border-slate-800/80 font-mono text-[11px]">
                      <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Response Payload</div>
                      <pre className="text-blue-400 overflow-x-auto">{apiItem.exampleResponse || '{}'}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. ENVIRONMENTS TAB */}
      {activeTab === 'environments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Target Environments</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {environments.map((env) => (
              <div key={env._id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white">{env.name}</h4>
                    <StatusBadge status={env.deploymentStatus} size="sm" />
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div>
                      <div className="text-slate-500 font-semibold text-[10px] uppercase">Base URL</div>
                      <div className="font-mono text-blue-400 truncate mt-0.5">{env.baseUrl || 'None'}</div>
                    </div>

                    <div>
                      <div className="text-slate-500 font-semibold text-[10px] uppercase">Health Check URL</div>
                      <div className="font-mono text-slate-300 truncate mt-0.5">{env.healthCheckUrl || 'None'}</div>
                    </div>

                    <div>
                      <div className="text-slate-500 font-semibold text-[10px] uppercase">Deployed Version</div>
                      <div className="font-mono text-white mt-0.5">v{env.version}</div>
                    </div>

                    <div>
                      <div className="text-slate-500 font-semibold text-[10px] uppercase">Last Deployed</div>
                      <div className="text-slate-400 mt-0.5">{new Date(env.lastDeployedAt).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {!isViewer && (
                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => setEditingEnv(env)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      Configure Environment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. DEPENDENCIES TAB */}
      {activeTab === 'dependencies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Service Dependencies</h3>
              <p className="text-xs text-slate-400">Manage upstream service calls and downstream consumers</p>
            </div>
            {!isViewer && (
              <button
                onClick={() => setIsAddDepModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add Dependency</span>
              </button>
            )}
          </div>

          {/* Upstream Section */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Upstream: Services this service depends on</span>
              <span className="text-xs font-mono text-slate-400">({dependencies.upstream.length})</span>
            </h4>

            {dependencies.upstream.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">No upstream dependencies declared.</div>
            ) : (
              <div className="space-y-2">
                {dependencies.upstream.map((dep) => (
                  <div
                    key={dep._id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-950 border border-purple-800 text-purple-400">
                        <GitFork className="w-4 h-4" />
                      </div>
                      <div>
                        <Link to={`/services/${dep.targetService?._id}`} className="text-xs font-bold text-white hover:text-blue-400">
                          {dep.targetService?.name}
                        </Link>
                        <div className="text-[11px] text-slate-400">{dep.description || 'No description provided'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                        {dep.dependencyType}
                      </span>
                      <StatusBadge status={dep.targetService?.status} size="sm" />
                      {!isViewer && (
                        <button
                          onClick={() => handleDeleteDependency(dep._id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove Dependency"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Downstream Section */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Downstream: Services that call this service</span>
              <span className="text-xs font-mono text-slate-400">({dependencies.downstream.length})</span>
            </h4>

            {dependencies.downstream.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">No downstream consumers calling this service.</div>
            ) : (
              <div className="space-y-2">
                {dependencies.downstream.map((dep) => (
                  <div
                    key={dep._id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <Link to={`/services/${dep.sourceService?._id}`} className="text-xs font-bold text-white hover:text-blue-400">
                          {dep.sourceService?.name}
                        </Link>
                        <div className="text-[11px] text-slate-400">{dep.description || 'Consumer integration'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                        {dep.dependencyType}
                      </span>
                      <StatusBadge status={dep.sourceService?.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. DEPLOYMENTS TAB */}
      {activeTab === 'deployments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Deployment Records ({deployments.length})</h3>
            {!isViewer && (
              <button
                onClick={() => setIsDeployModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/30"
              >
                <Rocket className="w-4 h-4" />
                <span>Trigger Deployment</span>
              </button>
            )}
          </div>

          {deployments.length === 0 ? (
            <EmptyState
              icon={Rocket}
              title="No deployment history"
              description="Trigger a deployment to record version releases."
              actionLabel={!isViewer ? 'Deploy Now' : undefined}
              onAction={() => setIsDeployModalOpen(true)}
            />
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Version & Commit</th>
                    <th className="px-4 py-3.5">Environment</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Deployed By</th>
                    <th className="px-4 py-3.5">Notes</th>
                    <th className="px-5 py-3.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deployments.map((dep) => (
                    <tr key={dep._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white font-mono">{dep.version}</div>
                        <div className="text-[10px] text-slate-500 font-mono">commit: {dep.commitHash}</div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-300">{dep.environment}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={dep.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">{dep.deployedBy?.name || 'Automated CI'}</td>
                      <td className="px-4 py-3.5 text-slate-400 max-w-xs truncate">{dep.notes || '—'}</td>
                      <td className="px-5 py-3.5 text-right text-slate-400 font-mono">
                        {new Date(dep.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. HEALTH TAB */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Health Probes & Telemetry</h3>
              <p className="text-xs text-slate-400">Automated uptime probes and latency metrics</p>
            </div>
            <button
              onClick={handleRunProbe}
              disabled={probing}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/30"
            >
              <Activity className={`w-4 h-4 ${probing ? 'animate-spin' : ''}`} />
              <span>{probing ? 'Checking...' : 'Ping Service Endpoint'}</span>
            </button>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Target URL</th>
                  <th className="px-4 py-3.5">HTTP Code</th>
                  <th className="px-4 py-3.5">Latency</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {healthChecks.map((hc) => (
                  <tr key={hc._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-300">
                      {new Date(hc.checkedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-400 truncate max-w-xs">{hc.url}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-white">{hc.httpStatus}</td>
                    <td className="px-4 py-3.5 font-mono text-blue-400">{hc.responseTimeMs} ms</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={hc.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {hc.errorMessage ? (
                        <span className="text-rose-400 text-[11px]">{hc.errorMessage}</span>
                      ) : (
                        <span className="text-emerald-400 text-[11px]">Healthy 200 OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. ACTIVITY TAB */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Audit History ({activityLogs.length})</h3>

          <div className="space-y-3">
            {activityLogs.length === 0 ? (
              <EmptyState icon={History} title="No activity recorded" description="Changes to this service will appear here." />
            ) : (
              activityLogs.map((log) => (
                <div key={log._id} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                      <span className="font-bold text-white">{log.user?.name || 'System Operator'}</span>
                      <span className="text-slate-400">performed</span>
                      <span className="font-mono text-blue-400 font-semibold">{log.action}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {(log.oldValue || log.newValue) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 pt-2 border-t border-slate-800/60 font-mono text-[11px]">
                      {log.oldValue && (
                        <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-300">
                          <div className="text-[10px] text-rose-500 font-bold mb-1">OLD VALUE</div>
                          <pre className="overflow-x-auto">{JSON.stringify(log.oldValue, null, 2)}</pre>
                        </div>
                      )}
                      {log.newValue && (
                        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-300">
                          <div className="text-[10px] text-emerald-500 font-bold mb-1">NEW VALUE</div>
                          <pre className="overflow-x-auto">{JSON.stringify(log.newValue, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <EditServiceModal
        isOpen={isEditModalOpen}
        service={service}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={() => fetchServiceData()}
      />

      <AddApiModal
        isOpen={isAddApiModalOpen}
        serviceId={service._id}
        onClose={() => setIsAddApiModalOpen(false)}
        onAdded={() => fetchServiceData()}
      />

      <AddDependencyModal
        isOpen={isAddDepModalOpen}
        currentServiceId={service._id}
        onClose={() => setIsAddDepModalOpen(false)}
        onAdded={() => fetchServiceData()}
      />

      <TriggerDeploymentModal
        isOpen={isDeployModalOpen}
        serviceId={service._id}
        serviceName={service.name}
        onClose={() => setIsDeployModalOpen(false)}
        onDeployed={() => fetchServiceData()}
      />

      <EditEnvironmentModal
        isOpen={Boolean(editingEnv)}
        environment={editingEnv}
        onClose={() => setEditingEnv(null)}
        onUpdated={() => fetchServiceData()}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={`Delete ${service.name}?`}
        message="This will permanently delete the service, its API definitions, dependencies, environments, and deployments. This action cannot be undone."
        confirmText="Delete Service"
        confirmVariant="danger"
        onConfirm={handleDeleteService}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default ServiceDetail;
