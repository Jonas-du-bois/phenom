import Header from './Header';
import Footer from './Footer';
import RadialSymbol from './RadialSymbol';
import DatabaseStats from './DatabaseStats';

export default function About() {
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <Header showBack backTo="/" backLabel="Back to Home" />
      
      <div className="px-20 py-16 pt-32">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h1 className="tracking-tight lowercase" style={{ fontSize: '4rem', fontWeight: '400', letterSpacing: '-0.02em' }}>
              About Phenom Search
            </h1>
            <RadialSymbol size={100} className="text-white opacity-10" rays={20} />
          </div>
          
          <div className="space-y-12">
            {/* Database Statistics */}
            <section>
              <h2 className="mb-8 tracking-tight uppercase text-white" style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>
                Database Overview
              </h2>
              <DatabaseStats />
            </section>
            {/* Mission Section */}
            <section className="bg-white/5 border border-white/10 p-12">
              <h2 className="mb-6 tracking-tight uppercase text-white" style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>
                Our Mission
              </h2>
              <p className="text-white/60 mb-4" style={{ lineHeight: '1.7', fontSize: '1rem' }}>
                Phenom Search is a scientific archive dedicated to cataloging and analyzing historical aerial phenomena sightings. 
                Our mission is to provide researchers, scientists, and the public with access to credible, well-documented cases.
              </p>
              <p className="text-white/60" style={{ lineHeight: '1.7', fontSize: '1rem' }}>
                We maintain strict standards for data quality, cross-referencing multiple sources and prioritizing cases with 
                physical evidence, multiple witnesses, and professional observer reports.
              </p>
            </section>

            {/* Methodology */}
            <section className="bg-white/5 border border-white/10 p-12">
              <h2 className="mb-6 tracking-tight uppercase text-white" style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>
                Methodology
              </h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="mb-3 text-white uppercase tracking-wider" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                    Credibility Scoring
                  </h3>
                  <p className="text-white/50" style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>
                    Each case is evaluated on a 15-point scale based on witness credentials, corroborating evidence, 
                    and documentation quality.
                  </p>
                </div>
                <div>
                  <h3 className="mb-3 text-white uppercase tracking-wider" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                    Strangeness Index
                  </h3>
                  <p className="text-white/50" style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>
                    A 10-point scale measuring how unusual the reported phenomena are compared to conventional 
                    aircraft and natural phenomena.
                  </p>
                </div>
                <div>
                  <h3 className="mb-3 text-white uppercase tracking-wider" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                    Source Verification
                  </h3>
                  <p className="text-white/50" style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>
                    All entries are cross-referenced with official archives including Project Blue Book, military reports, 
                    and government documents.
                  </p>
                </div>
                <div>
                  <h3 className="mb-3 text-white uppercase tracking-wider" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                    Physical Evidence
                  </h3>
                  <p className="text-white/50" style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>
                    Cases with documented physical traces, radar data, or photographic evidence receive 
                    special classification.
                  </p>
                </div>
              </div>
            </section>

            {/* API & Technology */}
            <section className="bg-white/5 border border-white/10 p-12">
              <h2 className="mb-6 tracking-tight uppercase text-white" style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>
                Technology & API
              </h2>
              <p className="text-white/60 mb-6" style={{ lineHeight: '1.7', fontSize: '1rem' }}>
                Phenom Search is powered by a comprehensive RESTful API providing programmatic access to our entire database 
                of 18,000+ UFO observations. The API supports advanced filtering, pagination, geocoding, and real-time statistics.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white/5 border border-white/10 p-6">
                  <h3 className="mb-3 text-[#00F0FF] uppercase tracking-wider" style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                    API Endpoint
                  </h3>
                  <code className="text-white/80 block mb-2" style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                    https://phenomsearch-api.onrender.com
                  </code>
                  <p className="text-white/40 text-sm">
                    Full access to observation data, filters, and statistics
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6">
                  <h3 className="mb-3 text-[#00F0FF] uppercase tracking-wider" style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                    Documentation
                  </h3>
                  <a 
                    href="https://phenomsearch-api.onrender.com/api-docs/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-[#00F0FF] transition-colors block mb-2" 
                    style={{ fontSize: '0.85rem' }}
                  >
                    View API Docs →
                  </a>
                  <p className="text-white/40 text-sm">
                    Interactive OpenAPI documentation with examples
                  </p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-white/5 border-l-2 border-white p-12">
              <h2 className="mb-4 tracking-tight uppercase" style={{ fontSize: '1.25rem', letterSpacing: '0.05em' }}>
                Research Inquiries
              </h2>
              <p className="text-white/60" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                For academic research access, data licensing, or to submit additional documentation for existing cases, 
                please contact our research team at <span className="text-white">research@phenomsearch.org</span>
              </p>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}