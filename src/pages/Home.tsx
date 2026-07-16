import React, { useState } from 'react';
import { SIMULATED_VENUES } from '../data/mockData';
import type { PageId } from '../types';
import {
  calculateAverageGatePressure,
  getHighestPriorityIncidents,
  getOverallVenueStatus,
  summarizeAccessibilityRequests,
} from '../logic/operations';
import Button from '../components/Button';
import FeedChip from '../components/FeedChip';
import Icon from '../components/Icon';
import SectionHeader from '../components/SectionHeader';
import TelemetryRibbon, { type TelemetryItem } from '../components/TelemetryRibbon';
import VenueTicket from '../components/VenueTicket';

interface HomeProps {
  setCurrentPage: (page: PageId) => void;
  openCrowdMap: (venueId?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setCurrentPage, openCrowdMap }) => {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(SIMULATED_VENUES[0].id);
  const selectedVenue = SIMULATED_VENUES.find(venue => venue.id === selectedVenueId) ?? SIMULATED_VENUES[0];

  const averageGatePressure = calculateAverageGatePressure(selectedVenue);
  const priorityIncidents = getHighestPriorityIncidents(selectedVenue);
  const overallStatus = getOverallVenueStatus(selectedVenue);
  const { pendingCount } = summarizeAccessibilityRequests(selectedVenue);
  const openGateCount = selectedVenue.gates.filter(gate => gate.isOpen).length;
  const highestTransitPressure = Math.max(...selectedVenue.transitStatus.map(transit => transit.crowdPressurePercentage));

  const telemetryItems: TelemetryItem[] = [
    {
      label: 'Gate intake',
      value: `${averageGatePressure}%`,
      detail: `${openGateCount}/${selectedVenue.gates.length} gates open`,
      icon: 'venue',
      tone: averageGatePressure >= 80 ? 'red' : averageGatePressure >= 50 ? 'amber' : 'green',
    },
    {
      label: 'Active incidents',
      value: String(priorityIncidents.length).padStart(2, '0'),
      detail: priorityIncidents[0] ? `${priorityIncidents[0].severity} priority leads` : 'No unresolved reports',
      icon: 'incident',
      tone: priorityIncidents.some(incident => incident.severity === 'High') ? 'red' : 'amber',
    },
    {
      label: 'Transit pressure',
      value: `${highestTransitPressure}%`,
      detail: 'Peak simulated node load',
      icon: 'train',
      tone: highestTransitPressure >= 80 ? 'red' : highestTransitPressure >= 50 ? 'amber' : 'green',
    },
    {
      label: 'Access support',
      value: String(pendingCount).padStart(2, '0'),
      detail: 'Pending assistance requests',
      icon: 'accessibility',
      tone: pendingCount > 0 ? 'amber' : 'green',
    },
  ];

  return (
    <div className="page-container home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero__floodlight" aria-hidden="true" />
        <svg className="home-hero__stadium" viewBox="0 0 760 520" aria-hidden="true">
          <path d="M150 90 C270 25 490 25 610 90 C690 135 710 390 610 435 C490 500 270 500 150 435 C50 390 70 135 150 90Z" />
          <path d="M205 130 C300 82 460 82 555 130 C625 170 640 350 555 395 C460 443 300 443 205 395 C120 350 135 170 205 130Z" />
          <path d="M265 175 C330 145 430 145 495 175 C540 205 550 315 495 350 C430 380 330 380 265 350 C210 315 220 205 265 175Z" />
          <rect x="315" y="210" width="130" height="95" rx="4" />
          <line x1="380" y1="210" x2="380" y2="305" />
          <circle cx="380" cy="257.5" r="17" />
          <path d="M150 90 98 52M610 90l52-38M150 435l-52 38M610 435l52 38" />
        </svg>

        <div className="home-hero__copy">
          <FeedChip tone="cyan" icon="spark">Floodlit operations / Paper guidance</FeedChip>
          <h2 id="home-hero-title">See the whole matchday.<br /><span className="home-hero__second-line">Move before <em>pressure</em> builds.</span></h2>
          <p>GenAI stadium operations and fan guidance for high-pressure tournament match days—grounded in local simulated telemetry and designed for fast decisions.</p>
          <div className="home-hero__actions">
            <Button icon="map" trailingIcon="arrow-right" onClick={() => openCrowdMap()}>Open Crowd Map</Button>
            <Button variant="secondary" icon="assistant" onClick={() => setCurrentPage('fan-assistant')}>Ask Fan Assistant</Button>
          </div>
        </div>

        <div className="home-hero__caption">
          <span>Operations surface 01</span>
          <strong>Local simulation snapshot</strong>
        </div>
      </section>

      <TelemetryRibbon items={telemetryItems} />

      <VenueTicket
        venue={selectedVenue}
        venues={SIMULATED_VENUES}
        status={overallStatus}
        onVenueChange={setSelectedVenueId}
        onOpenMap={() => openCrowdMap(selectedVenue.id)}
      />

      <p className="home-page__venue-disclaimer"><strong>Selected venue notice:</strong> {selectedVenue.simulationDisclaimer}</p>

      <section className="mode-split" aria-labelledby="mode-split-title">
        <div className="mode-split__intro">
          <SectionHeader
            eyebrow="Two operating perspectives"
            title="One venue snapshot, built for the people moving through it."
            description="Use the Paper surface for calm, readable fan guidance. Switch to Night when operational pressure and incident context need priority."
          />
        </div>
        <article className="mode-panel mode-panel--fan">
          <div className="mode-panel__number">01 / FAN</div>
          <Icon name="assistant" size={28} />
          <h3>Guidance that reads clearly under pressure.</h3>
          <p>Ask about gates, accessibility, lower-wait services, transit and sustainability using the existing Vertex AI / local fallback flow.</p>
          <Button variant="paper" trailingIcon="arrow-right" onClick={() => setCurrentPage('fan-assistant')}>Launch Fan Mode</Button>
        </article>
        <article className="mode-panel mode-panel--ops">
          <div className="mode-panel__number">02 / OPERATIONS</div>
          <Icon name="operations" size={28} />
          <h3>Pressure, incidents and movement in one command view.</h3>
          <p>Review simulated gate loads, crowd density, staffing coverage and local incident decisions without connecting to external systems.</p>
          <Button variant="secondary" trailingIcon="arrow-right" onClick={() => setCurrentPage('staff-command')}>Launch Staff/Ops Mode</Button>
        </article>
      </section>

      <section className="service-pipeline" aria-label="Application service pipeline">
        <div className="service-pipeline__intro">
          <FeedChip tone="green" icon="cloud">Google service path</FeedChip>
          <h3>Prototype delivery and intelligence</h3>
        </div>
        <div className="service-pipeline__steps">
          <div><span>01</span><Icon name="venue" size={20} /><strong>Firebase Hosting</strong><small>Static React frontend</small></div>
          <i aria-hidden="true">→</i>
          <div><span>02</span><Icon name="route" size={20} /><strong>Cloud Run</strong><small>Server-side API mediation</small></div>
          <i aria-hidden="true">→</i>
          <div><span>03</span><Icon name="spark" size={20} /><strong>Vertex AI</strong><small>Grounded text guidance</small></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
