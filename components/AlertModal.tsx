'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type AlertType = 'error' | 'success' | 'info' | 'warning';

interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  onConfirm?: () => void;
}

const iconMap = {
  error: AlertCircle,
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  error: {
    bg: 'bg-red-50',
    icon: 'text-red-500',
    button: 'bg-red-500 hover:bg-red-600',
  },
  success: {
    bg: 'bg-green-50',
    icon: 'text-green-500',
    button: 'bg-green-500 hover:bg-green-600',
  },
  info: {
    bg: 'bg-blue-50',
    icon: 'text-blue-500',
    button: 'bg-blue-500 hover:bg-blue-600',
  },
  warning: {
    bg: 'bg-amber-50',
    icon: 'text-amber-500',
    button: 'bg-amber-500 hover:bg-amber-600',
  },
};

export function AlertModal({
  open,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Tamam',
  onConfirm,
}: AlertModalProps) {
  const Icon = iconMap[type];
  const colors = colorMap[type];

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="alert-title"
            aria-describedby="alert-message"
          >
            <div className="rounded-2xl border border-[#e8e6e3] bg-white shadow-2xl overflow-hidden">
              {/* Header */}
              <div className={`${colors.bg} px-6 py-4 flex items-center gap-3`}>
                <div className={`flex-shrink-0 ${colors.icon}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 id="alert-title" className="flex-1 font-medium text-[#1a1a1a]">
                  {title || (type === 'error' ? 'Hata' : type === 'success' ? 'Başarılı' : type === 'warning' ? 'Uyarı' : 'Bilgi')}
                </h2>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 rounded-full p-1 text-[#666] hover:bg-white/50 hover:text-[#1a1a1a] transition-colors"
                  aria-label="Kapat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                <p id="alert-message" className="text-[#666] text-sm leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 pb-5">
                <button
                  onClick={handleConfirm}
                  className={`w-full rounded-xl ${colors.button} px-4 py-3 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f3f44]`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for easy usage
import { useState, useCallback } from 'react';

interface AlertState {
  open: boolean;
  title?: string;
  message: string;
  type: AlertType;
  onConfirm?: () => void;
}

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    type: 'info',
  });

  const showAlert = useCallback((
    message: string,
    type: AlertType = 'info',
    title?: string,
    onConfirm?: () => void
  ) => {
    setAlertState({ open: true, message, type, title, onConfirm });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, open: false }));
  }, []);

  const AlertComponent = useCallback(() => (
    <AlertModal
      open={alertState.open}
      onClose={hideAlert}
      title={alertState.title}
      message={alertState.message}
      type={alertState.type}
      onConfirm={alertState.onConfirm}
    />
  ), [alertState, hideAlert]);

  return {
    showAlert,
    hideAlert,
    AlertComponent,
    // Convenience methods
    showError: useCallback((message: string, title?: string) => showAlert(message, 'error', title), [showAlert]),
    showSuccess: useCallback((message: string, title?: string) => showAlert(message, 'success', title), [showAlert]),
    showWarning: useCallback((message: string, title?: string) => showAlert(message, 'warning', title), [showAlert]),
    showInfo: useCallback((message: string, title?: string) => showAlert(message, 'info', title), [showAlert]),
  };
}
