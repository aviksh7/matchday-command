import React, { useState } from 'react';
import Home from './pages/Home';
import FanAssistant from './pages/FanAssistant';
import StaffCommand from './pages/StaffCommand';
import CrowdMap from './pages/CrowdMap';
import IncidentSupport from './pages/IncidentSupport';
import ProjectDetails from './pages/ProjectDetails';
import type { PageId } from './types';
import AppShell from './components/AppShell';
import './App.css';

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
      {renderPage()}
    </AppShell>
  );
};

export default App;
