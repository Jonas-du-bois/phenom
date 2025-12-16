import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { exportToCSV, exportToJSON, formatSightingForExport } from '../utils/exportData';
import { toast } from 'sonner@2.0.3';

interface ExportButtonProps {
  data: any[];
  filename?: string;
  label?: string;
}

export default function ExportButton({ data, filename = 'phenom-search-export', label = 'Export Data' }: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = (format: 'csv' | 'json') => {
    try {
      if (data.length === 0) {
        toast.error('No data to export');
        return;
      }

      const formattedData = data.map(formatSightingForExport);
      
      if (format === 'csv') {
        exportToCSV(formattedData, filename);
        toast.success(`Successfully exported ${data.length} records as CSV`);
      } else {
        exportToJSON(formattedData, filename);
        toast.success(`Successfully exported ${data.length} records as JSON`);
      }

      setShowMenu(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        disabled={data.length === 0}
      >
        <Download size={16} className="text-[#00F0FF]" />
        <span className="uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
          {label}
        </span>
        <ChevronDown 
          size={14} 
          className={`text-white/40 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop to close menu */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            
            {/* Dropdown menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-64 bg-[#12151C] border border-white/10 shadow-2xl z-50"
            >
              <button
                onClick={() => handleExport('csv')}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors text-left border-b border-white/5"
              >
                <FileSpreadsheet size={18} className="text-[#00F0FF]" />
                <div>
                  <div className="text-white" style={{ fontSize: '0.875rem' }}>
                    Export as CSV
                  </div>
                  <div className="text-white/40" style={{ fontSize: '0.7rem' }}>
                    Spreadsheet format
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExport('json')}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors text-left"
              >
                <FileJson size={18} className="text-[#00F0FF]" />
                <div>
                  <div className="text-white" style={{ fontSize: '0.875rem' }}>
                    Export as JSON
                  </div>
                  <div className="text-white/40" style={{ fontSize: '0.7rem' }}>
                    Developer format
                  </div>
                </div>
              </button>

              <div className="px-6 py-3 bg-white/5 border-t border-white/10">
                <p className="text-white/40" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                  {data.length.toLocaleString()} record{data.length !== 1 ? 's' : ''} will be exported
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
