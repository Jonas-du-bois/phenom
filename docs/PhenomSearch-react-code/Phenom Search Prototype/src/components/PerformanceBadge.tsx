import { Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface PerformanceBadgeProps {
  message?: string;
  className?: string;
}

export default function PerformanceBadge({ 
  message = "Optimized with caching", 
  className = "" 
}: PerformanceBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#00F0FF]/10 to-[#00F0FF]/5 border border-[#00F0FF]/20 backdrop-blur-sm ${className}`}
    >
      <Zap size={12} className="text-[#00F0FF]" />
      <span className="text-[#00F0FF] uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
        {message}
      </span>
    </motion.div>
  );
}
