import React from 'react';
import { Link } from 'react-router-dom';
import { Server, Users, Code2, GitFork, ArrowUpRight, Activity } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CriticalityBadge from '../common/CriticalityBadge';

export const ServiceCard = ({ service, onQuickCheck }) => {
  return (
    <div className="glass-card rounded-2xl p-5 hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between group shadow-lg">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-blue-950/70 border border-blue-800/50 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <Link
                to={`/services/${service._id}`}
                className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5 truncate"
              >
                <span>{service.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <div className="text-xs font-mono text-slate-400 truncate">{service.key}</div>
            </div>
          </div>
          <StatusBadge status={service.status} size="sm" />
        </div>

        {/* Description */}
        <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {service.description}
        </p>

        {/* Badges */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <CriticalityBadge criticality={service.criticality} size="sm" />
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">
            {service.serviceType || 'Backend'}
          </span>
          {service.language && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
              {service.language}
            </span>
          )}
        </div>
      </div>

      {/* Footer Info & Stats */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-medium text-slate-300 truncate max-w-[120px]">
          <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{service.ownerTeam?.name || 'Unassigned'}</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1" title="APIs Exposed">
            <Code2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{service.stats?.apiCount ?? '-'}</span>
          </span>
          <span className="flex items-center gap-1" title="Dependencies">
            <GitFork className="w-3.5 h-3.5 text-slate-500" />
            <span>{(service.stats?.upstreamCount || 0) + (service.stats?.downstreamCount || 0)}</span>
          </span>
          {onQuickCheck && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickCheck(service._id);
              }}
              title="Run instant health probe"
              className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
