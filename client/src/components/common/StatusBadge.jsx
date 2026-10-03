import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Wrench, HelpCircle } from 'lucide-react';

export const StatusBadge = ({ status, size = 'md', showIcon = true }) => {
  const norm = (status || 'Unknown').toLowerCase();

  let styles = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  let dotColor = 'bg-slate-400';
  let Icon = HelpCircle;

  if (norm === 'healthy' || norm === 'active' || norm === 'successful') {
    styles = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50 shadow-emerald-950/20';
    dotColor = 'bg-emerald-400';
    Icon = CheckCircle2;
  } else if (norm === 'degraded' || norm === 'running' || norm === 'pending') {
    styles = 'bg-amber-950/60 text-amber-300 border-amber-800/50 shadow-amber-950/20';
    dotColor = 'bg-amber-400';
    Icon = AlertTriangle;
  } else if (norm === 'down' || norm === 'failed') {
    styles = 'bg-rose-950/60 text-rose-300 border-rose-800/50 shadow-rose-950/20';
    dotColor = 'bg-rose-400';
    Icon = XCircle;
  } else if (norm === 'maintenance' || norm === 'rolled back' || norm === 'deprecated') {
    styles = 'bg-slate-900/80 text-slate-400 border-slate-700/60';
    dotColor = 'bg-slate-400';
    Icon = Wrench;
  }

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5 gap-1.5'
    : size === 'lg'
    ? 'text-sm px-3.5 py-1.5 gap-2'
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-sm ${styles} ${sizeClasses}`}
      title={`Status: ${status}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${norm === 'healthy' || norm === 'degraded' ? 'pulse-dot' : ''}`} />
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{status || 'Unknown'}</span>
    </span>
  );
};

export default StatusBadge;
