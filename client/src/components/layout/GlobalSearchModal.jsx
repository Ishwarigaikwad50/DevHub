import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Layers, Server, Users, Code, ArrowRight, X } from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../common/StatusBadge';
import MethodBadge from '../common/MethodBadge';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ services: [], teams: [], apis: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ services: [], teams: [], apis: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length === 0) {
        setResults({ services: [], teams: [], apis: [] });
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.results);
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  const hasResults = results.services.length > 0 || results.teams.length > 0 || results.apis.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/70 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/90 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services, APIs, teams, technologies... (Press Esc to close)"
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {loading && (
            <div className="py-8 text-center text-sm text-slate-400">Searching catalog...</div>
          )}

          {!loading && query && !hasResults && (
            <div className="py-12 text-center text-sm text-slate-400">
              No results matching "<span className="text-white font-medium">{query}</span>"
            </div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center text-sm text-slate-500">
              Type to search across services, endpoints, and engineering teams.
            </div>
          )}

          {/* Services Group */}
          {results.services.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span>Services ({results.services.length})</span>
              </div>
              <div className="space-y-1">
                {results.services.map((svc) => (
                  <button
                    key={svc._id}
                    onClick={() => handleSelect(`/services/${svc._id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-950/50 border border-blue-900/50 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white flex items-center gap-2">
                          {svc.name}
                          <span className="text-xs text-slate-400 font-mono">({svc.key})</span>
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">{svc.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={svc.status} size="sm" />
                      <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* APIs Group */}
          {results.apis.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                <span>APIs ({results.apis.length})</span>
              </div>
              <div className="space-y-1">
                {results.apis.map((apiItem) => (
                  <button
                    key={apiItem._id}
                    onClick={() => handleSelect(`/apis?id=${apiItem._id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <MethodBadge method={apiItem.method} size="sm" />
                      <div>
                        <div className="text-sm font-mono text-white font-medium">{apiItem.endpoint}</div>
                        <div className="text-xs text-slate-400">{apiItem.name} · {apiItem.service?.name}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Teams Group */}
          {results.teams.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Teams ({results.teams.length})</span>
              </div>
              <div className="space-y-1">
                {results.teams.map((team) => (
                  <button
                    key={team._id}
                    onClick={() => handleSelect(`/teams/${team._id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-950/50 border border-purple-900/50 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{team.name}</div>
                        <div className="text-xs text-slate-400 line-clamp-1">{team.description}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
