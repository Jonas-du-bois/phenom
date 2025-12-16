import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner@2.0.3';
import { APIProvider } from './contexts/APIContext';
import GlobalLoader from './components/GlobalLoader';
import HomePage from './components/HomePage';
import CollectionsHub from './components/CollectionsHub';
import SightingsList from './components/SightingsList';
import ObservationDetail from './components/ObservationDetail';
import About from './components/About';
import Help from './components/Help';
import Browse from './components/Browse';
import Timeline from './components/Timeline';
import MapWithRealAPI from './components/MapWithRealAPI';
import Stats from './components/Stats';
import DataExport from './components/DataExport';
import NotFound from './components/NotFound';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <APIProvider>
      <Router>
        <GlobalLoader />
        <ScrollToTop />
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: '#12151C',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collections" element={<CollectionsHub />} />
          <Route path="/collections/:id" element={<SightingsList />} />
          <Route path="/observation/:id" element={<ObservationDetail />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/map" element={<MapWithRealAPI />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/data-export" element={<DataExport />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </APIProvider>
  );
}