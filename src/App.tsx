import React, { useState } from 'react';
import Home from './pages/Home';
import FanAssistant from './pages/FanAssistant';
import StaffCommand from './pages/StaffCommand';
import CrowdMap from './pages/CrowdMap';
import IncidentSupport from './pages/IncidentSupport';
import ProjectDetails from './pages/ProjectDetails';
import type { PageId } from './types';
import './App.css';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'fan-assistant':
        return <FanAssistant />;
      case 'staff-command':
        return <StaffCommand />;
      case 'crowd-map':
        return <CrowdMap />;
      case 'incident-support':
        return <IncidentSupport />;
      case 'project-details':
        return <ProjectDetails />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="app-container">
      <header>
        <div>
          <h1>Matchday Command</h1>
          <p className="tagline">GenAI stadium operations and fan guidance for high-pressure tournament match days.</p>
        </div>
      </header>

      <nav>
        <button 
          className={currentPage === 'home' ? 'active' : ''} 
          onClick={() => setCurrentPage('home')}
        >
          Home
        </button>
        <button 
          className={currentPage === 'fan-assistant' ? 'active' : ''} 
          onClick={() => setCurrentPage('fan-assistant')}
        >
          Fan Assistant
        </button>
        <button 
          className={currentPage === 'staff-command' ? 'active' : ''} 
          onClick={() => setCurrentPage('staff-command')}
        >
          Staff Command
        </button>
        <button 
          className={currentPage === 'crowd-map' ? 'active' : ''} 
          onClick={() => setCurrentPage('crowd-map')}
        >
          Crowd Map
        </button>
        <button 
          className={currentPage === 'incident-support' ? 'active' : ''} 
          onClick={() => setCurrentPage('incident-support')}
        >
          Incident Support
        </button>
        <button 
          className={currentPage === 'project-details' ? 'active' : ''} 
          onClick={() => setCurrentPage('project-details')}
        >
          Project Details
        </button>
      </nav>

      <main>
        <div className="disclaimer-banner" role="alert">
          <strong>Important Notice:</strong> This application is a simulated prototype demo for the Build with AI 2026 Challenge. All map, crowd, routing, wait time, incident, and operations data shown are simulated prototype data. It does not access external tournament systems.
        </div>
        {renderPage()}
      </main>

      <footer>
        <p>&copy; 2026 Matchday Command - Simulated operations prototype. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
