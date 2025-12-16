import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Code, Database, Info } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import RadialSymbol from './RadialSymbol';
import { useAPI } from '../contexts/APIContext';
import ExportButton from './ExportButton';

export default function DataExport() {
  const { statistics, loading } = useAPI();
  const [activeTab, setActiveTab] = useState<'overview' | 'formats' | 'api'>('overview');

  return (
    <div className="min-h-screen bg-[#080A0E] text-white">
      <Header showBack backTo="/" backLabel="Back to Home" />
      
      <div className="px-20 py-16 pt-32">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="mb-4 tracking-tight lowercase" style={{ fontSize: '3.5rem', fontWeight: '400', letterSpacing: '-0.02em' }}>
                Data Export Guide
              </h1>
              <p className="text-white/50 uppercase tracking-wider" style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}>
                Access and export observation data
              </p>
            </div>
            <RadialSymbol size={100} className="text-white opacity-10" rays={24} />
          </div>

          {/* Stats Overview */}
          {statistics && (
            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="bg-white/5 border border-white/10 p-8">
                <div className="text-white/40 uppercase tracking-wider mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                  Total Records
                </div>
                <div className="text-[#00F0FF]" style={{ fontSize: '2.5rem', fontWeight: '300' }}>
                  {statistics.totalSightings.toLocaleString()}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-8">
                <div className="text-white/40 uppercase tracking-wider mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                  Date Range
                </div>
                <div className="text-[#00F0FF]" style={{ fontSize: '2.5rem', fontWeight: '300' }}>
                  {statistics.dateRange.minYear} - {statistics.dateRange.maxYear}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-8">
                <div className="text-white/40 uppercase tracking-wider mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                  With Coordinates
                </div>
                <div className="text-[#00F0FF]" style={{ fontSize: '2.5rem', fontWeight: '300' }}>
                  {statistics.sightingsWithCoordinates.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-white/10">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 uppercase tracking-wider transition-all ${
                activeTab === 'overview'
                  ? 'text-[#00F0FF] border-b-2 border-[#00F0FF]'
                  : 'text-white/40 hover:text-white'
              }`}
              style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('formats')}
              className={`px-6 py-4 uppercase tracking-wider transition-all ${
                activeTab === 'formats'
                  ? 'text-[#00F0FF] border-b-2 border-[#00F0FF]'
                  : 'text-white/40 hover:text-white'
              }`}
              style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}
            >
              Export Formats
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-6 py-4 uppercase tracking-wider transition-all ${
                activeTab === 'api'
                  ? 'text-[#00F0FF] border-b-2 border-[#00F0FF]'
                  : 'text-white/40 hover:text-white'
              }`}
              style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}
            >
              API Access
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="bg-white/5 border border-white/10 p-10">
                  <div className="flex items-start gap-4 mb-6">
                    <Info size={24} className="text-[#00F0FF] mt-1" />
                    <div>
                      <h2 className="mb-3 tracking-tight uppercase" style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>
                        Export Options
                      </h2>
                      <p className="text-white/60 mb-6" style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>
                        Phenom Search allows you to export observation data in multiple formats for analysis, research, or integration with other tools. Exports can be generated from any collection or search results page.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/5 border-l-2 border-[#00F0FF] p-6">
                      <div className="flex items-start gap-4">
                        <FileSpreadsheet size={20} className="text-[#00F0FF] mt-1" />
                        <div>
                          <h3 className="mb-2 uppercase tracking-wider" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                            CSV Export
                          </h3>
                          <p className="text-white/60" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                            Perfect for spreadsheet applications like Excel, Google Sheets, or Numbers. Includes all observation details in a tabular format with proper escaping for special characters.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 border-l-2 border-[#00F0FF] p-6">
                      <div className="flex items-start gap-4">
                        <FileJson size={20} className="text-[#00F0FF] mt-1" />
                        <div>
                          <h3 className="mb-2 uppercase tracking-wider" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                            JSON Export
                          </h3>
                          <p className="text-white/60" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                            Ideal for developers and programmatic access. Includes structured data with metadata, timestamps, and proper data typing. Ready for integration with custom applications or data analysis tools.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-10">
                  <h3 className="mb-4 tracking-tight uppercase" style={{ fontSize: '1.25rem', letterSpacing: '0.05em' }}>
                    How to Export Data
                  </h3>
                  <ol className="space-y-4 text-white/60" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
                    <li className="flex gap-4">
                      <span className="text-[#00F0FF] font-mono">1.</span>
                      <span>Navigate to any Collection page or perform a search on the Browse page</span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-[#00F0FF] font-mono">2.</span>
                      <span>Click the "Export Data" button in the top right corner</span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-[#00F0FF] font-mono">3.</span>
                      <span>Choose your preferred format (CSV or JSON)</span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-[#00F0FF] font-mono">4.</span>
                      <span>The file will automatically download to your device</span>
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'formats' && (
              <div className="space-y-8">
                <div className="bg-white/5 border border-white/10 p-10">
                  <h2 className="mb-6 tracking-tight uppercase" style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>
                    CSV Format Specification
                  </h2>
                  <div className="bg-black/50 p-6 font-mono text-sm mb-6 overflow-x-auto">
                    <div className="text-[#00F0FF]"># CSV Column Headers</div>
                    <div className="text-white/60 mt-2">
                      ID, Date, Time, Location, Country, Location Type, Credibility,<br />
                      Strangeness, Duration (min), Coordinates, Witness Types,<br />
                      UFO Shapes, Phenomena, Description
                    </div>
                  </div>
                  <p className="text-white/60 mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
                    The CSV format includes all core observation data in comma-separated format. Fields containing commas, quotes, or newlines are properly escaped with double quotes.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/50 p-4">
                      <div className="text-[#00F0FF] mb-2 text-sm uppercase tracking-wider">Encoding</div>
                      <div className="text-white/80">UTF-8</div>
                    </div>
                    <div className="bg-black/50 p-4">
                      <div className="text-[#00F0FF] mb-2 text-sm uppercase tracking-wider">Delimiter</div>
                      <div className="text-white/80">Comma (,)</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-10">
                  <h2 className="mb-6 tracking-tight uppercase" style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>
                    JSON Format Specification
                  </h2>
                  <div className="bg-black/50 p-6 font-mono text-sm mb-6 overflow-x-auto">
                    <pre className="text-white/80">
{`{
  "exportDate": "2025-12-03T10:30:00.000Z",
  "totalRecords": 1234,
  "source": "Phenom Search - Hatch UFO Database",
  "data": [
    {
      "id": "19470624-001",
      "date": "1947-06-24",
      "time": "15:00",
      "location": "Mount Rainier, WA",
      "country": "USA",
      "credibility": 12,
      "strangeness": 8,
      ...
    }
  ]
}`}
                    </pre>
                  </div>
                  <p className="text-white/60" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
                    JSON exports include metadata about the export operation and are formatted for readability. All fields maintain proper data types (numbers, strings, arrays).
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-8">
                <div className="bg-white/5 border border-white/10 p-10">
                  <div className="flex items-start gap-4 mb-6">
                    <Database size={24} className="text-[#00F0FF] mt-1" />
                    <div>
                      <h2 className="mb-3 tracking-tight uppercase" style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>
                        Direct API Access
                      </h2>
                      <p className="text-white/60 mb-6" style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>
                        For advanced users and developers, you can access the Phenom Search API directly for programmatic data retrieval.
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/50 p-6 font-mono text-sm mb-6">
                    <div className="text-[#00F0FF] mb-2"># Base URL</div>
                    <div className="text-white/80">https://phenomsearch-api.onrender.com/api/v1</div>
                    <div className="text-[#00F0FF] mt-4 mb-2"># API Documentation</div>
                    <div className="text-white/80">https://phenomsearch-api.onrender.com/api-docs/</div>
                  </div>

                  <h3 className="mb-4 tracking-tight uppercase" style={{ fontSize: '1.25rem', letterSpacing: '0.05em' }}>
                    Example Endpoints
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-black/50 p-4 border-l-2 border-[#00F0FF]">
                      <div className="text-white/40 text-xs uppercase tracking-wider mb-2">GET Paginated Sightings</div>
                      <code className="text-[#00F0FF] text-sm">/api/v1/sightings/paginated?page=1&perPage=100</code>
                    </div>

                    <div className="bg-black/50 p-4 border-l-2 border-[#00F0FF]">
                      <div className="text-white/40 text-xs uppercase tracking-wider mb-2">GET Statistics</div>
                      <code className="text-[#00F0FF] text-sm">/api/v1/statistics</code>
                    </div>

                    <div className="bg-black/50 p-4 border-l-2 border-[#00F0FF]">
                      <div className="text-white/40 text-xs uppercase tracking-wider mb-2">GET Search with Filters</div>
                      <code className="text-[#00F0FF] text-sm">/api/v1/sightings?search=washington&startYear=1947&minCredibility=10</code>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-10">
                  <h3 className="mb-4 tracking-tight uppercase" style={{ fontSize: '1.25rem', letterSpacing: '0.05em' }}>
                    Rate Limits & Best Practices
                  </h3>
                  <ul className="space-y-3 text-white/60" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
                    <li className="flex gap-3">
                      <span className="text-[#00F0FF]">•</span>
                      <span>Use pagination with reasonable page sizes (max 500 records per request)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#00F0FF]">•</span>
                      <span>Implement caching on your end to reduce redundant requests</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#00F0FF]">•</span>
                      <span>Use specific filters to narrow results instead of fetching all data</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#00F0FF]">•</span>
                      <span>Include proper error handling for network issues</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
