import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Server, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CriticalityBadge from '../common/CriticalityBadge';

export const ServiceNode = memo(({ data, selected }) => {
  const { name, key, status, criticality, teamName, language, technologies, id } = data;

  return (
    <div
      className={`min-w-[260px] max-w-[300px] rounded-2xl bg-slate-900/95 border backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer overflow-hidden ${
        selected
          ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-blue-500/20'
          : 'border-slate-800 hover:border-slate-600'
      }`}
    >
      {/* Input Handle (Upstream Calls) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-slate-950 !rounded-full -top-1.5"
      />

      {/* Header */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-950/70 border border-blue-800/60 text-blue-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-snug">{name}</h4>
              <p className="text-[10px] font-mono text-slate-400">{key}</p>
            </div>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>
      </div>

      {/* Body Details */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Team</span>
          <span className="text-slate-200 font-medium">{teamName}</span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Criticality</span>
          <CriticalityBadge criticality={criticality} size="sm" />
        </div>

        {technologies && technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {technologies.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
              >
                {tech}
              </span>
            ))}
            {technologies.length > 3 && (
              <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-400">
                +{technologies.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Output Handle (Downstream Dependencies) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-slate-950 !rounded-full -bottom-1.5"
      />
    </div>
  );
});

ServiceNode.displayName = 'ServiceNode';
export default ServiceNode;
