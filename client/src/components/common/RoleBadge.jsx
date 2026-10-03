import React from 'react';
import { Crown, Shield, Code, Eye } from 'lucide-react';

export const RoleBadge = ({ role = 'DEVELOPER', size = 'md' }) => {
  const r = (role || 'DEVELOPER').toUpperCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = Code;

  if (r === 'ADMIN') {
    styles = 'bg-rose-950/70 text-rose-300 border-rose-800/60';
    Icon = Crown;
  } else if (r === 'TEAM_ADMIN') {
    styles = 'bg-purple-950/70 text-purple-300 border-purple-800/60';
    Icon = Shield;
  } else if (r === 'DEVELOPER') {
    styles = 'bg-blue-950/70 text-blue-300 border-blue-800/60';
    Icon = Code;
  } else if (r === 'VIEWER') {
    styles = 'bg-slate-900/80 text-slate-400 border-slate-700/60';
    Icon = Eye;
  }

  const sizeClasses = size === 'sm'
    ? 'text-[11px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border ${styles} ${sizeClasses}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{r}</span>
    </span>
  );
};

export default RoleBadge;
