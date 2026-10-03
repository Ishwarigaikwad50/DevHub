import React from 'react';
import { Link } from 'react-router-dom';
import { ServerOff, Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-slate-400">
        <ServerOff className="w-12 h-12 text-blue-400" />
      </div>
      <h1 className="text-3xl font-black text-white">404 - Endpoint Not Found</h1>
      <p className="text-sm text-slate-400 max-w-md">
        The catalog route or service resource you are looking for has been moved or does not exist.
      </p>
      <div className="pt-2 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Go to Dashboard</span>
        </Link>
        <Link
          to="/services"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Service Catalog</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
