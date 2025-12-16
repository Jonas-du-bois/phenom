import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose,
  duration = 4000 
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  };

  const colors = {
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/50',
      text: 'text-green-500',
      icon: 'text-green-500'
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/50',
      text: 'text-red-500',
      icon: 'text-red-500'
    },
    info: {
      bg: 'bg-[#00F0FF]/10',
      border: 'border-[#00F0FF]/50',
      text: 'text-[#00F0FF]',
      icon: 'text-[#00F0FF]'
    }
  };

  const Icon = icons[type];
  const colorScheme = colors[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-24 right-8 z-[100] max-w-md"
        >
          <div className={`${colorScheme.bg} ${colorScheme.border} border backdrop-blur-md p-4 shadow-2xl flex items-start gap-4`}>
            <Icon className={`w-5 h-5 ${colorScheme.icon} flex-shrink-0 mt-0.5`} />
            <p className={`${colorScheme.text} flex-1`} style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
              {message}
            </p>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
