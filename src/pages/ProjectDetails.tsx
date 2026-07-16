import React from 'react';
import FeedChip from '../components/FeedChip';
import Icon from '../components/Icon';

const LIVE_APPLICATION_URL = 'https://matchday-command-2026.web.app';
const REPOSITORY_URL = 'https://github.com/aviksh7/matchday-command';

export const ProjectDetails: React.FC = () => {
  return (
    <div className="page-container project-details-page">
      <section className="project-details-hero" aria-labelledby="project-details-title">
        <div className="project-details-hero__copy">
          <FeedChip tone="cyan" icon="info">Product / architecture / evidence</FeedChip>
          <h2 id="project-details-title">One simulated venue snapshot. Two ways to make it understandable.</h2>
          <p>
            Matchday Command explores how grounded AI guidance and deterministic local logic can help fans
            and operations teams interpret the same high-pressure matchday scenario.
          </p>
          <div className="project-details-links" aria-label="Project links">
            <a href={LIVE_APPLICATION_URL} target="_blank" rel="noreferrer">
              <Icon name="venue" size={17} />
              <span>Open the live Matchday Command application</span>
              <Icon name="arrow-right" size={16} />
            </a>
            <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">
              <Icon name="info" size={17} />
              <span>View the public Matchday Command repository</span>
              <Icon name="arrow-right" size={16} />
            </a>
          </div>
        </div>
        <aside className="project-details-hero__notice" aria-label="Prototype limitation">
          <span>Independent prototype</span>
          <strong>Selected simulated venue snapshot</strong>
          <p>No official tournament, venue, ticketing, transit, municipal, or emergency systems are connected.</p>
        </aside>
      </section>

      <section className="project-details-section" aria-labelledby="project-modes-title">
        <header className="project-details-section__header">
          <span>01 / Product modes</span>
          <h3 id="project-modes-title">Shared context, different decisions</h3>
        </header>
        <div className="project-mode-grid">
          <article className="project-mode-card project-mode-card--fan">
            <Icon name="assistant" size={26} />
            <div>
              <span>Fan Mode</span>
              <h4>Readable guidance for moving through the scenario.</h4>
              <p>Explore simulated gate pressure, service waits, accessibility-ready entrances, transit pressure/status, sustainability tips, and a limited translation demonstration.</p>
            </div>
          </article>
          <article className="project-mode-card project-mode-card--ops">
            <Icon name="operations" size={26} />
            <div>
              <span>Operations Mode</span>
              <h4>Prototype intelligence for reviewing venue pressure.</h4>
              <p>Inspect simulated crowd, staffing, accessibility, and incident context, then review response-planning and announcement drafts that require human approval.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="project-details-section" aria-labelledby="project-architecture-title">
        <header className="project-details-section__header">
          <span>02 / Deployed architecture</span>
          <h3 id="project-architecture-title">A small, explicit Google Cloud path</h3>
        </header>
        <ol className="project-architecture-flow" aria-label="Deployed application architecture">
          <li><span>01</span><Icon name="venue" size={20} /><strong>Firebase Hosting</strong><small>Serves the React frontend</small></li>
          <li><span>02</span><Icon name="route" size={20} /><strong>Same-origin /api/**</strong><small>Routes requests to Cloud Run</small></li>
          <li><span>03</span><Icon name="cloud" size={20} /><strong>Cloud Run</strong><small>Runs the Node.js API</small></li>
          <li><span>04</span><Icon name="spark" size={20} /><strong>Vertex AI</strong><small>Uses attached service account + ADC</small></li>
        </ol>
      </section>

      <section className="project-ai-panel" aria-labelledby="project-ai-title">
        <div className="project-ai-panel__intro">
          <FeedChip tone="green" icon="spark">Two implemented AI roles</FeedChip>
          <h3 id="project-ai-title">Structured guidance with a visible safety net.</h3>
          <p>Cloud responses are grounded in the selected simulated context and must match a defined response structure.</p>
        </div>
        <div className="project-ai-roles">
          <article>
            <span>01</span>
            <h4>Fan Assistant</h4>
            <p>Structured summary, recommended action, simulated data used, and limitations.</p>
          </article>
          <article>
            <span>02</span>
            <h4>Incident Support</h4>
            <p>Structured decision-support, briefing, accessibility, crowd/transit, and announcement drafts.</p>
          </article>
        </div>
        <div className="project-fallback-note">
          <Icon name="fallback" size={22} />
          <div>
            <strong>Deterministic local fallback</strong>
            <p>A failed, timed-out, non-successful, or invalid AI response switches the browser to local deterministic logic. Results visibly identify either <b>Vertex AI via Cloud Run</b> or <b>Local deterministic fallback</b>.</p>
          </div>
        </div>
      </section>

      <section className="project-floodlit" aria-labelledby="project-floodlit-title">
        <div className="project-floodlit__night" aria-hidden="true"><span>Night</span></div>
        <div className="project-floodlit__copy">
          <span>03 / Floodlit design concept</span>
          <h3 id="project-floodlit-title">Operate on Night. Read on Paper.</h3>
          <p>Night creates spatial focus and operational energy. Paper gives dense guidance, drafts, and evidence a calm editorial surface. Both share the same type, color, focus, spacing, and motion system.</p>
        </div>
        <div className="project-floodlit__paper" aria-hidden="true"><span>Paper</span></div>
      </section>

      <section className="project-details-section" aria-labelledby="project-evidence-title">
        <header className="project-details-section__header">
          <span>04 / Build evidence</span>
          <h3 id="project-evidence-title">Verified in the repository</h3>
        </header>
        <dl className="project-evidence-grid">
          <div><dt>Runtime</dt><dd>Node 22</dd></div>
          <div><dt>Types</dt><dd>Strict TypeScript</dd></div>
          <div><dt>Lint</dt><dd>Zero-warning Oxlint</dd></div>
          <div><dt>Automated tests</dt><dd>95 verified</dd></div>
        </dl>
      </section>

      <aside className="project-limitations" aria-labelledby="project-limitations-title">
        <Icon name="warning" size={24} />
        <div>
          <span>Prototype boundary</span>
          <h3 id="project-limitations-title">Clear limitations are part of the product.</h3>
          <p>All venue, route, crowd, incident, transit, and wait-time information is simulated. The map is schematic; transportation is pressure/status information; multilingual support is a limited demonstration; outputs are drafts requiring human review. Do not submit personal, confidential, medical, or emergency information.</p>
          <p>Matchday Command is an independent prototype and is not affiliated with FIFA or venue operators.</p>
        </div>
      </aside>
    </div>
  );
};

export default ProjectDetails;
