import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  ArrowUpDown,
  RefreshCw,
  Activity,
  Layers,
  Code2,
  GitFork,
  ExternalLink
} from 'lucide-react';
import api from '../api/client';
import ServiceCard from '../components/services/ServiceCard';
import StatusBadge from '../components/common/StatusBadge';
import CriticalityBadge from '../components/common/CriticalityBadge';
import CreateServiceModal from '../components/services/CreateServiceModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ServiceCatalog = () => {
  const [services, setServices] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCriticality, setSelectedCriticality] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { isViewer } = useAuth();
  const { success, error } = useToast();

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedTeam) params.append('team', selectedTeam);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedCriticality) params.append('criticality', selectedCriticality);
      if (selectedType) params.append('serviceType', selectedType);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', page);
      params.append('limit', 24);

      const [servicesRes, teamsRes] = await Promise.all([
        api.get(`/services?${params.toString()}`),
        api.get('/teams')
      ]);

      setServices(servicesRes.data.services || []);
      setTotalPages(servicesRes.data.totalPages || 1);
      setTotalCount(servicesRes.data.total || 0);
      setTeams(teamsRes.data.teams || []);
    } catch (err) {
      console.error('Failed to load services:', err);
      error('Load Error', 'Could not load service catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [search, selectedTeam, selectedStatus, selectedCriticality, selectedType, sortBy, sortOrder, page]);

  const handleQuickProbe = async (serviceId) => {
    try {
      const res = await api.post(`/health/check/${serviceId}`);
      success('Health Probe Executed', `Service status: ${res.data.serviceStatus} (${res.data.check.responseTimeMs}ms)`);
      fetchCatalog();
    } catch (err) {
      error('Probe Error', 'Could not execute health check.');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedTeam('');
    setSelectedStatus('');
    setSelectedCriticality('');
    setSelectedType('');
    setSortBy('name');
    setSortOrder('asc');
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Catalog Title and Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Server className="w-6 h-6 text-blue-500" />
            <span>Service Catalog</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              {totalCount} registered
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Central repository of all microservices, backend apps, and scheduled workers
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {!isViewer && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Service</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800/80 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search text input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by service name, key, description, tech stack..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => {
              setSelectedTeam(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Teams</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Healthy">Healthy</option>
            <option value="Degraded">Degraded</option>
            <option value="Down">Down</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Unknown">Unknown</option>
          </select>

          {/* Criticality Tier Filter */}
          <select
            value={selectedCriticality}
            onChange={(e) => {
              setSelectedCriticality(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Criticality</option>
            <option value="Tier 1 - Critical">Tier 1 - Critical</option>
            <option value="Tier 2 - High">Tier 2 - High</option>
            <option value="Tier 3 - Medium">Tier 3 - Medium</option>
            <option value="Tier 4 - Low">Tier 4 - Low</option>
          </select>

          {/* Service Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="Backend Service">Backend Service</option>
            <option value="Frontend Application">Frontend Application</option>
            <option value="Mobile Application">Mobile Application</option>
            <option value="API">API</option>
            <option value="Worker">Worker</option>
            <option value="Scheduled Job">Scheduled Job</option>
            <option value="Database">Database</option>
            <option value="External Integration">External Integration</option>
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="recentlyUpdated">Recently Updated</option>
            <option value="criticality">Criticality</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Active filter pills & Reset button */}
        {(search || selectedTeam || selectedStatus || selectedCriticality || selectedType) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-slate-500">Active filters:</span>
            {search && <span className="px-2 py-0.5 rounded-md bg-blue-950 border border-blue-800 text-blue-300">Search: {search}</span>}
            {selectedStatus && <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">Status: {selectedStatus}</span>}
            {selectedCriticality && <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">Tier: {selectedCriticality}</span>}
            {selectedType && <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">Type: {selectedType}</span>}
            <button
              onClick={handleClearFilters}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium ml-auto"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Catalog Content */}
      {loading ? (
        <LoadingSpinner text="Fetching services catalog..." size="lg" />
      ) : services.length === 0 ? (
        <EmptyState
          icon={Server}
          title="No services match your filters"
          description="Try modifying search keywords or clearing filter criteria."
          actionLabel={!isViewer ? 'Register Service' : undefined}
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {services.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              onQuickCheck={handleQuickProbe}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Service</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Criticality</th>
                  <th className="px-4 py-3.5">Owner Team</th>
                  <th className="px-4 py-3.5">Tech & Language</th>
                  <th className="px-4 py-3.5 text-center">APIs</th>
                  <th className="px-4 py-3.5 text-center">Dependencies</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {services.map((svc) => (
                  <tr key={svc._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link to={`/services/${svc._id}`} className="font-bold text-white hover:text-blue-400 flex items-center gap-1.5">
                        <span>{svc.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </Link>
                      <div className="text-[11px] font-mono text-slate-400">{svc.key}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={svc.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5">
                      <CriticalityBadge criticality={svc.criticality} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 font-medium">
                      {svc.ownerTeam?.name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {svc.technologies?.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-slate-300">
                      {svc.stats?.apiCount ?? 0}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-slate-300">
                      {(svc.stats?.upstreamCount || 0) + (svc.stats?.downstreamCount || 0)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleQuickProbe(svc._id)}
                          title="Run health probe"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/services/${svc._id}`}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[11px] font-medium"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <div>
            Page <span className="font-semibold text-white">{page}</span> of{' '}
            <span className="font-semibold text-white">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Register Service Modal */}
      <CreateServiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => fetchCatalog()}
      />
    </div>
  );
};

export default ServiceCatalog;
