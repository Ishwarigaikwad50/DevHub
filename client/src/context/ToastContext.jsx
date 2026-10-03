import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((title, message) => addToast({ title, message, type: 'success' }), [addToast]);
  const error = useCallback((title, message) => addToast({ title, message, type: 'error' }), [addToast]);
  const info = useCallback((title, message) => addToast({ title, message, type: 'info' }), [addToast]);
  const warning = useCallback((title, message) => addToast({ title, message, type: 'warning' }), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, warning, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-0 backdrop-blur-md ${
              t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-800/60 text-emerald-200'
                : t.type === 'error'
                ? 'bg-rose-950/90 border-rose-800/60 text-rose-200'
                : t.type === 'warning'
                ? 'bg-amber-950/90 border-amber-800/60 text-amber-200'
                : 'bg-slate-900/90 border-slate-700/60 text-slate-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="flex-1 text-sm">
              {t.title && <div className="font-semibold text-white">{t.title}</div>}
              {t.message && <div className="mt-0.5 text-xs opacity-90">{t.message}</div>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
