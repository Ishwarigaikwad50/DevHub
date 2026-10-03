import React from 'react';
import { ShieldAlert, Shield, ShieldCheck } from 'lucide-react';

export const CriticalityBadge = ({ criticality = 'Tier 2 - High', size = 'md' }) => {
  const c = (criticality || '').toLowerCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = Shield;

  if (c.includes('tier 1') || c.includes('critical')) {
    styles = 'bg-rose-950/70 text-rose-300 border-rose-800/60';
    Icon = ShieldAlert;
  } else if (c.includes('tier 2') || c.includes('high')) {
    styles = 'bg-purple-950/70 text-purple-300 border-purple-800/60';
    Icon = ShieldAlert;
  } else if (c.includes('tier 3') || c.includes('medium')) {
    styles = 'bg-blue-950/70 text-blue-300 border-blue-800/60';
    Icon = ShieldCheck;
  } else {
    styles = 'bg-slate-900/80 text-slate-400 border-slate-700/60';
    Icon = Shield;
  }

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${styles} ${sizeClasses}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{criticality}</span>
    </span>
  );
};

export default CriticalityBadge;
