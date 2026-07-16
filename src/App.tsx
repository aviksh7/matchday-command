import React, { lazy, Suspense, useState } from 'react';
import Home from './pages/Home';
import type { PageId } from './types';
import AppShell from './components/AppShell';
import { PageLoadBoundary, PageLoadingState } from './components/PageLoadBoundary';
import { loadPageModule } from './logic/pageLoader';
import './App.css';

const CrowdMap = lazy(() => loadPageModule(import('./pages/CrowdMap')));
const FanAssistant = lazy(() => loadPageModule(import('./pages/FanAssistant')));
const StaffCommand = lazy(() => loadPageModule(import('./pages/StaffCommand')));
const IncidentSupport = lazy(() => loadPageModule(import('./pages/IncidentSupport')));
const ProjectDetails = lazy(() => loadPageModule(import('./pages/ProjectDetails')));

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [crowdMapInitialVenueId, setCrowdMapInitialVenueId] = useState<string | undefined>();

  const navigate = (page: PageId) => {
    if (page === 'crowd-map') {
      setCrowdMapInitialVenueId(undefined);
    }
    setCurrentPage(page);
  };

  const openCrowdMapForVenue = (venueId?: string) => {
    setCrowdMapInitialVenueId(venueId);
    setCurrentPage('crowd-map');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} openCrowdMap={openCrowdMapForVenue} />;
      case 'fan-assistant':
        return <FanAssistant />;
      case 'staff-command':
        return <StaffCommand />;
      case 'crowd-map':
        return (
          <CrowdMap
            initialVenueId={crowdMapInitialVenueId}
            onOpenIncidentSupport={() => setCurrentPage('incident-support')}
          />
        );
      case 'incident-support':
        return <IncidentSupport />;
      case 'project-details':
        return <ProjectDetails />;
      default:
        return <Home setCurrentPage={setCurrentPage} openCrowdMap={openCrowdMapForVenue} />;
    }
  };

  return (
    <AppShell currentPage={currentPage} onNavigate={navigate}>
      <PageLoadBoundary key={currentPage}>
        <Suspense fallback={<PageLoadingState />}>
          {renderPage()}
        </Suspense>
      </PageLoadBoundary>
    </AppShell>
  );
};

export default App;
