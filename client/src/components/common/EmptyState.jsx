import React from 'react';
import { Inbox, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 mb-4 text-slate-400">
        <Icon className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-lg shadow-blue-600/20 transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
