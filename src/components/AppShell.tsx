import React, { useEffect, useRef, useState } from 'react';
import type { PageId } from '../types';
import Icon, { type IconName } from './Icon';

interface AppShellProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  children: React.ReactNode;
}

const navItems: Array<{ id: PageId; label: string; icon: IconName }> = [
  { id: 'home', label: 'Home', icon: 'venue' },
  { id: 'crowd-map', label: 'Crowd Map', icon: 'map' },
  { id: 'fan-assistant', label: 'Fan Assistant', icon: 'assistant' },
  { id: 'staff-command', label: 'Staff Command', icon: 'operations' },
  { id: 'incident-support', label: 'Incident Support', icon: 'incident' },
  { id: 'project-details', label: 'Project Details', icon: 'info' },
];

const nightPages: PageId[] = ['home', 'crowd-map', 'fan-assistant'];

export const AppShell: React.FC<AppShellProps> = ({ currentPage, onNavigate, children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const previousPageRef = useRef(currentPage);

  useEffect(() => {
    const pageLabel = navItems.find(item => item.id === currentPage)?.label ?? 'Matchday Command';
    document.title = `${pageLabel} | Matchday Command`;

    if (previousPageRef.current !== currentPage) {
      mainRef.current?.focus();
    }
    previousPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    if (isMenuOpen) {
      navigationRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    }
  }, [isMenuOpen]);

  const navigate = (page: PageId) => {
    const isCurrentPage = page === currentPage;
    onNavigate(page);
    setIsMenuOpen(false);
    if (isCurrentPage) {
      mainRef.current?.focus();
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  return (
    <div className="app-container">
      <a
        className="skip-link"
        href="#main-content"
        onClick={() => mainRef.current?.focus()}
      >
        Skip to main content
      </a>
      <header className="command-bar">
        <h1 className="sr-only">Matchday Command</h1>
        <button className="command-bar__brand" onClick={() => navigate('home')} aria-label="Matchday Command home">
          <span className="command-bar__mark" aria-hidden="true"><Icon name="venue" size={22} /></span>
          <span>
            <span className="command-bar__title">Matchday Command</span>
            <span className="command-bar__tagline">Stadium operations / fan guidance</span>
          </span>
        </button>

        <button
          ref={menuButtonRef}
          className="command-bar__menu"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen(open => !open)}
        >
          <Icon name="menu" size={20} />
          <span>Menu</span>
        </button>

        <nav
          ref={navigationRef}
          id="primary-navigation"
          className={`command-nav ${isMenuOpen ? 'command-nav--open' : ''}`}
          aria-label="Primary navigation"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && isMenuOpen) {
              event.preventDefault();
              closeMenu();
            }
          }}
        >
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`command-nav__item ${currentPage === item.id ? 'command-nav__item--active' : ''}`}
              aria-current={currentPage === item.id ? 'page' : undefined}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <div className="simulation-strip" role="status">
        <Icon name="info" size={15} />
        <span>SIMULATED PROTOTYPE — venue, crowd, transit and incident data are simulated. No external operational systems are connected.</span>
      </div>

      <main
        ref={mainRef}
        id="main-content"
        className={`app-main ${nightPages.includes(currentPage) ? 'app-main--night' : 'app-main--paper'}`}
        tabIndex={-1}
      >
        <div className="app-main__content">{children}</div>
      </main>

      <footer className="site-footer">
        <div>
          <span className="site-footer__brand">Matchday Command</span>
          <span>Simulated operations prototype</span>
        </div>
        <div className="site-footer__services" role="group" aria-label="Google service architecture">
          <span>Firebase Hosting</span><span aria-hidden="true">→</span>
          <span>Cloud Run</span><span aria-hidden="true">→</span>
          <span>Vertex AI</span>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
