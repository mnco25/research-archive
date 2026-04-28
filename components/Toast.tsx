'use client';

import { useCallback, useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastItem;
  onClose: (id: string) => void;
  duration?: number;
}

function ToastNode({ toast, onClose, duration = 3500 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enter = setTimeout(() => setVisible(true), 10);
    const exit = setTimeout(() => setVisible(false), duration);
    const remove = setTimeout(() => onClose(toast.id), duration + 200);
    return () => {
      clearTimeout(enter);
      clearTimeout(exit);
      clearTimeout(remove);
    };
  }, [duration, onClose, toast.id]);

  const colors = {
    success: 'bg-[var(--success)] border-[var(--success)]',
    error: 'bg-[var(--error)] border-[var(--error)]',
    info: 'bg-[var(--text-primary)] border-[var(--text-primary)]',
  }[toast.type];

  return (
    <div
      role="status"
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] text-white text-[13px] font-medium transition-all duration-200 border ${colors} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const ToastContainer = useCallback(
    () => (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastNode toast={toast} onClose={removeToast} />
          </div>
        ))}
      </div>
    ),
    [toasts, removeToast]
  );

  return { addToast, ToastContainer };
}
