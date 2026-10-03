import React from 'react';

export const MethodBadge = ({ method = 'GET', size = 'md' }) => {
  const m = (method || 'GET').toUpperCase();

  const colorMap = {
    GET: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    POST: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
    PUT: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    PATCH: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
    DELETE: 'bg-rose-950/80 text-rose-300 border-rose-800/60'
  };

  const style = colorMap[m] || 'bg-slate-800 text-slate-300 border-slate-700';

  const sizeClasses = size === 'sm'
    ? 'text-[10px] font-mono px-1.5 py-0.5'
    : 'text-xs font-mono font-bold px-2 py-0.5';

  return (
    <span className={`inline-flex items-center justify-center rounded border tracking-wide uppercase ${style} ${sizeClasses}`}>
      {m}
    </span>
  );
};

export default MethodBadge;
