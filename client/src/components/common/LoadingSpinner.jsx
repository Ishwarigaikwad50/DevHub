import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading data...', size = 'md' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
      <Loader2 className={`${size === 'lg' ? 'w-10 h-10' : size === 'sm' ? 'w-5 h-5' : 'w-7 h-7'} animate-spin text-blue-500 mb-3`} />
      {text && <span className="text-sm font-medium text-slate-300">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
