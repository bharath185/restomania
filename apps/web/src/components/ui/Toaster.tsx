'use client';
import { useState, createContext, useContext, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  addToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const colors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={twMerge(
              'flex items-center gap-3 rounded-lg px-4 py-3 text-white shadow-lg min-w-64 max-w-sm',
              colors[toast.type],
            )}
          >
            <span className="flex-1 text-sm">{toast.message}</span>
            <button onClick={() => setToasts((p) => p.filter((t) => t.id !== toast.id))}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
