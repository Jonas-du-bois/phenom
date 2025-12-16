import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import RadialSymbol from './RadialSymbol';

interface FAQItem {
  question: string;
  answer: string;
}

export default function Help() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'How is the Credibility Score calculated?',
      answer: 'The Credibility Score (0-15) evaluates cases based on multiple factors: witness credentials (military/aviation professionals score higher), number of independent witnesses, physical evidence, radar confirmation, photographic documentation, and official investigation records. Cases with multiple high-quality sources receive the highest scores.',
    },
    {
      question: 'What does the Strangeness Index measure?',
      answer: 'The Strangeness Index (0-10) quantifies how unusual the reported phenomena are compared to known aircraft, atmospheric phenomena, or astronomical objects. Higher scores indicate behavior or characteristics that deviate significantly from conventional explanations, such as impossible acceleration, silent hovering, or instantaneous directional changes.',
    },
    {
      question: 'How can I export data from Phenom Search?',
      answer: 'You can export observation data in CSV or JSON format from any collection or search results page. Look for the "Export Data" button in the top right. CSV format is ideal for spreadsheet analysis, while JSON is perfect for developers and researchers who need programmatic access. All exports include full observation details, coordinates, and metadata.',
    },
    {
      question: 'How can I filter and search observations?',
      answer: 'Use the Browse page to access advanced filters. You can filter by date range, location, credibility score, strangeness level, witness type (military, civilian, pilot), physical evidence presence, and shape classification. Multiple filters can be combined for precise searches.',
    },
    {
      question: 'What are Physical Traces?',
      answer: 'Physical Traces refer to tangible evidence left at sighting locations, including ground impressions or landing marks, burnt or damaged vegetation, radiation anomalies, electromagnetic effects, material samples, or soil composition changes. These cases are of particular scientific interest.',
    },
    {
      question: 'Where does the data come from?',
      answer: 'Our archive draws from official government sources including Project Blue Book, military incident reports, FAA records, international aviation databases, and declassified documents. Each entry includes source attribution and reference numbers for verification.',
    },
    {
      question: 'Can I contribute new cases or corrections?',
      answer: 'We welcome submissions from researchers and witnesses. New cases must include date, location, detailed description, and supporting documentation. Corrections to existing entries should include the case ID and reference materials. Contact our research team for submission guidelines.',
    },
    {
      question: 'What do the different Collections represent?',
      answer: 'Collections organize cases by key characteristics: High Credibility contains the most thoroughly documented cases, Physical Traces includes cases with material evidence, Pilot Encounters focuses on aviation professional reports, and Shape categories classify objects by reported geometry and appearance.',
    },
    {
      question: 'How often is the archive updated?',
      answer: 'The archive is continuously updated as new documents are declassified, historical cases are digitized, or additional corroborating evidence emerges for existing cases. Major updates typically occur quarterly with ongoing minor corrections and additions.',
    },
    {
      question: 'Why are searches and filters so fast?',
      answer: 'Phenom Search uses advanced caching technology to store recent searches and filter results in memory. This means when you revisit a search or adjust filters, the results appear instantly without needing to reload from the server. The cache automatically refreshes to ensure you always have access to the latest data.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <Header showBack backTo="/" backLabel="Back to Home" />
      
      <div className="px-20 py-16 pt-32">
        <div className="max-w-[900px] mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="mb-4 tracking-tight lowercase" style={{ fontSize: '3.5rem', fontWeight: '400', letterSpacing: '-0.02em' }}>
                Help & FAQ
              </h1>
              <p className="text-white/50 uppercase tracking-wider" style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}>
                Find answers to common questions
              </p>
            </div>
            <RadialSymbol size={100} className="text-white opacity-10" rays={20} />
          </div>

          <div className="space-y-4 mb-16">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 overflow-hidden transition-all hover:bg-white/10"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-10 py-6 flex items-center justify-between text-left"
                >
                  <span className="tracking-tight uppercase" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                    {faq.question}
                  </span>
                  <div className="text-white">
                    {openIndex === index ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </button>
                
                {openIndex === index && (
                  <div className="px-10 pb-8">
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-white/60" style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="bg-white/5 border-l-2 border-white p-10">
            <h2 className="mb-4 tracking-tight uppercase" style={{ fontSize: '1.25rem', letterSpacing: '0.05em' }}>
              Still have questions?
            </h2>
            <p className="text-white/60 mb-6" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
              If you can't find the answer you're looking for, our support team is here to help.
            </p>
            <a
              href="mailto:support@phenomsearch.org"
              className="inline-block px-8 py-3 bg-white text-black uppercase tracking-wider hover:bg-white/90 transition-colors"
              style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}