import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Code2, Search, Filter, Lock, Unlock, ExternalLink, X, Copy, Check } from 'lucide-react';
import api from '../api/client';
import MethodBadge from '../components/common/MethodBadge';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export const ApiCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [apis, setApis] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [authFilter, setAuthFilter] = useState('');
  const [selectedApi, setSelectedApi] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchApis = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedMethod) params.append('method', selectedMethod);
      if (selectedService) params.append('service', selectedService);
      if (authFilter) params.append('authRequired', authFilter);

      const [apisRes, servicesRes] = await Promise.all([
        api.get(`/apis?${params.toString()}`),
        api.get('/services?limit=100')
      ]);

      setApis(apisRes.data.apis || []);
      setServices(servicesRes.data.services || []);

      // If id is in URL search param, open it
      const initialId = searchParams.get('id');
      if (initialId && apisRes.data.apis) {
        const match = apisRes.data.apis.find((a) => a._id === initialId);
        if (match) setSelectedApi(match);
      }
    } catch (err) {
      console.error('Failed to load APIs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApis();
  }, [search, selectedMethod, selectedService, authFilter]);

  const handleCopyEndpoint = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Code2 className="w-6 h-6 text-emerald-400" />
            <span>API Catalog & Explorer</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              {apis.length} endpoints
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organization-wide catalog of exposed REST endpoints, request schemas, and payloads
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search endpoint path, name, description..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>

          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Services</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={authFilter}
            onChange={(e) => setAuthFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Auth Types</option>
            <option value="true">Auth Required</option>
            <option value="false">Public</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* APIs Table/List */}
        <div className={selectedApi ? 'lg:col-span-7 space-y-3' : 'lg:col-span-12 space-y-3'}>
          {loading ? (
            <LoadingSpinner text="Loading API catalog..." size="lg" />
          ) : apis.length === 0 ? (
            <EmptyState icon={Code2} title="No APIs found" description="Try modifying your search or filters." />
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Method & Endpoint</th>
                    <th className="px-4 py-3.5">Owning Service</th>
                    <th className="px-4 py-3.5">Auth</th>
                    <th className="px-4 py-3.5">Version</th>
                    <th className="px-5 py-3.5 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {apis.map((item) => {
                    const isSelected = selectedApi?._id === item._id;
                    return (
                      <tr
                        key={item._id}
                        onClick={() => setSelectedApi(item)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-950/40 border-l-2 border-l-blue-500' : 'hover:bg-slate-900/40'
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <MethodBadge method={item.method} size="sm" />
                            <div>
                              <div className="font-bold text-white font-mono">{item.endpoint}</div>
                              <div className="text-[11px] text-slate-400">{item.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Link
                            to={`/services/${item.service?._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium text-slate-300 hover:text-blue-400 flex items-center gap-1"
                          >
                            <span>{item.service?.name || 'Unknown'}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </Link>
                        </td>
                        <td className="px-4 py-3.5">
                          {item.authRequired ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/60 font-mono">
                              <Lock className="w-3 h-3" />
                              <span>Bearer</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
                              <Unlock className="w-3 h-3" />
                              <span>Public</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-400">{item.version}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedApi(item)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] font-medium"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected API Details Panel */}
        {selectedApi && (
          <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-slate-800 space-y-4 animate-fadeIn sticky top-20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MethodBadge method={selectedApi.method} size="lg" />
                <div>
                  <h3 className="text-sm font-mono font-bold text-white">{selectedApi.endpoint}</h3>
                  <div className="text-xs text-slate-400">{selectedApi.name}</div>
                </div>
              </div>
              <button onClick={() => setSelectedApi(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedApi.description && (
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {selectedApi.description}
              </p>
            )}

            <div className="space-y-2 text-xs divide-y divide-slate-800/80">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Owning Service</span>
                <Link to={`/services/${selectedApi.service?._id}`} className="text-blue-400 hover:underline font-medium">
                  {selectedApi.service?.name}
                </Link>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Service Status</span>
                <StatusBadge status={selectedApi.service?.status} size="sm" />
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Authentication</span>
                <span className="text-white font-medium">{selectedApi.authRequired ? 'Required (JWT / API Key)' : 'Public API'}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">API Version</span>
                <span className="font-mono text-slate-200">{selectedApi.version}</span>
              </div>
            </div>

            {/* Request JSON Schema */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 font-mono">Request Payload</span>
                <button
                  onClick={() => handleCopyEndpoint(selectedApi.exampleRequest || '{}')}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 max-h-44 overflow-y-auto">
                {selectedApi.exampleRequest || '{}'}
              </pre>
            </div>

            {/* Response JSON Schema */}
            <div className="space-y-1.5 pt-2">
              <div className="text-xs text-slate-400 font-bold text-[11px] uppercase tracking-wider font-mono">
                Response Payload (200 OK)
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-blue-400 max-h-44 overflow-y-auto">
                {selectedApi.exampleResponse || '{}'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiCatalog;
