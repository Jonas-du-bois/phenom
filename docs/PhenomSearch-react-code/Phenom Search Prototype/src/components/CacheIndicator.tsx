import { Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CacheIndicatorProps {
  isFromCache: boolean;
  show: boolean;
}

export default function CacheIndicator({ isFromCache, show }: CacheIndicatorProps) {
  if (!show || !isFromCache) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded"
      >
        <Database size={14} className="text-[#00F0FF]" />
        <span className="text-[#00F0FF] text-xs uppercase tracking-wider">
          Cached
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
