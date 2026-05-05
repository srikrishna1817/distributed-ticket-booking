import React, { useState, useEffect, useCallback } from 'react';

let toastId = 0;

function ToastContainer() {
  return null; // rendered via portal pattern inside App
}

// Standalone hook + component approach
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', title = null) => {
    const id = ++toastId;
    const defaultTitles = { success: 'Success', error: 'Error', warning: 'Warning' };
    setToasts(prev => [...prev, {
      id,
      message,
      type,
      title: title || defaultTitles[type],
      exiting: false
    }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 3000);
  }, []);

  const icons = { success: '✅', error: '❌', warning: '⚠️' };

  const ToastRenderer = () => (
    <div className="toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast-item toast-${t.type} ${t.exiting ? 'toast-exit' : ''}`}
        >
          <span className="toast-icon">{icons[t.type]}</span>
          <div className="toast-body">
            <div className="toast-title">{t.title}</div>
            <div className="toast-msg">{t.message}</div>
          </div>
        </div>
      ))}
    </div>
  );

  return { addToast, ToastRenderer };
}

export default ToastContainer;
