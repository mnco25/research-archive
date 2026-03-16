'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'bg-[var(--success)]',
    error: 'bg-[var(--error)]',
    info: 'bg-[var(--text-primary)]',
  }[type];

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3
        rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] text-white text-[13px] font-medium
        transition-all duration-200
        ${colors}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
      role="alert"
    >
      <span>{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 200); }}
        className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastItem['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast, i) => (
        <div key={toast.id} style={{ transform: `translateY(-${i * 56}px)` }}>
          <Toast message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );

  return { addToast, ToastContainer };
}
