import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Search, Filter, RefreshCw, ChevronDown, ChevronUp, User, Clock } from 'lucide-react';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedEntity) params.append('entity', selectedEntity);
      params.append('page', page);
      params.append('limit', 30);

      const res = await api.get(`/audit-logs?${params.toString()}`);
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, selectedEntity, page]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-blue-400" />
            <span>Audit Trail & Activity Log</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of service registrations, role changes, deployments, and dependency edits
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search action or entity name..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={selectedEntity}
          onChange={(e) => {
            setSelectedEntity(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500 w-full sm:w-48"
        >
          <option value="">All Entities</option>
          <option value="Service">Service</option>
          <option value="Team">Team</option>
          <option value="API">API</option>
          <option value="Dependency">Dependency</option>
          <option value="Deployment">Deployment</option>
          <option value="User">User</option>
          <option value="Auth">Auth</option>
        </select>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <LoadingSpinner text="Fetching immutable audit records..." size="lg" />
      ) : logs.length === 0 ? (
        <EmptyState icon={FileSpreadsheet} title="No audit logs found" description="No actions recorded matching your query." />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Entity</th>
                <th className="px-4 py-3.5">Target Name</th>
                <th className="px-4 py-3.5 font-mono">IP Address</th>
                <th className="px-4 py-3.5 text-right">Timestamp</th>
                <th className="px-4 py-3.5 text-center">Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => {
                const isExpanded = expandedLogId === log._id;
                const hasDiff = Boolean(log.oldValue || log.newValue);

                return (
                  <React.Fragment key={log._id}>
                    <tr
                      onClick={() => hasDiff && setExpandedLogId(isExpanded ? null : log._id)}
                      className={`hover:bg-slate-900/40 transition-colors ${hasDiff ? 'cursor-pointer' : ''}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={log.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${log.user?.name || 'Actor'}`}
                            alt="avatar"
                            className="w-5 h-5 rounded-full border border-slate-700"
                          />
                          <span className="font-semibold text-white">{log.user?.name || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-blue-400">{log.action}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                          {log.entity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-200 max-w-xs truncate">
                        {log.entityName || log.entityId || '—'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px]">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {hasDiff && (
                          <button className="p-1 rounded text-slate-400 hover:text-white">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Old vs New Value JSON Diff */}
                    {isExpanded && hasDiff && (
                      <tr className="bg-slate-950/90">
                        <td colSpan={7} className="p-4 border-b border-slate-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px]">
                            {log.oldValue && (
                              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300">
                                <div className="text-[10px] text-rose-500 font-bold mb-1">PREVIOUS STATE</div>
                                <pre className="overflow-x-auto">{JSON.stringify(log.oldValue, null, 2)}</pre>
                              </div>
                            )}
                            {log.newValue && (
                              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-300">
                                <div className="text-[10px] text-emerald-500 font-bold mb-1">UPDATED STATE</div>
                                <pre className="overflow-x-auto">{JSON.stringify(log.newValue, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
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
    </div>
  );
};

export default AuditLogs;
