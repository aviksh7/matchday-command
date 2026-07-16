# Challenge submission overview

## Public links

- [Open the live Matchday Command application](https://matchday-command-2026.web.app)
- [View the public Matchday Command repository](https://github.com/aviksh7/matchday-command)

## Project

- **Name:** Matchday Command
- **Tagline:** GenAI stadium operations and fan guidance for high-pressure tournament match days.
- **Challenge vertical:** Stadium operations, fan navigation, accessibility, and crowd management.
- **Problem:** High-pressure match days require clear fan guidance and coordinated operational decisions across crowd movement, accessibility needs, queues, transit pressure, volunteer coverage, and incident response.

## Implemented solution

Fan Mode provides guidance grounded in a selected simulated venue snapshot. Operations Mode presents simulated operational panels and incident decision-support drafts. Two Vertex AI flows run through a Cloud Run Node.js API: Fan Assistant structured guidance and Incident Support structured drafts. Failed, timed-out, or invalid cloud responses use deterministic local browser logic, and the interface displays the response source.

Firebase Hosting serves the frontend and routes same-origin `/api/**` requests to Cloud Run. Cloud Run authenticates to Vertex AI with its attached service account and Application Default Credentials. The frontend contains no AI credential.

The full architecture, challenge mapping, evidence, setup, and limitations are maintained in [README.md](README.md).

## Assumptions and limitations

- All venue, crowd, incident, route, transit-pressure, and wait-time information is simulated.
- The selected venue is a snapshot, not a continuously updating operational feed.
- The map is schematic; transportation content is pressure/status information rather than travel or departure information.
- Multilingual support is a limited demonstration; language coverage and translation accuracy are not guaranteed.
- Operational recommendations, volunteer briefings, and announcement text are drafts requiring qualified human review; they do not dispatch staff or publish announcements.
- There is no user authentication, application database, persistent incident state, dispatch, notification, or external operational integration.
- Users must not submit personal, confidential, medical, or emergency information to AI features.
- Matchday Command is an independent prototype and is not affiliated with FIFA, tournament organizers, venue operators, transit agencies, municipalities, or emergency services.

## Evaluator smoke test

1. Open the live application and confirm the persistent simulated-prototype notice.
2. Select a venue on Home and open its Crowd Map.
3. Select map features with a pointer and keyboard; use Escape to clear.
4. Run a Fan Assistant prompt and inspect the source and limitations labels.
5. Review Staff Command as a selected simulated venue snapshot, including the locally derived service-queue pressure panel.
6. Select an Incident Support item and inspect the structured draft, source label, and visible limitations.
7. Open Project Details for the concise product, architecture, resilience, design, evidence, and limitation summary.

Automated verification instructions and the latest test inventory are in [TESTING.md](TESTING.md). Security and privacy details are in [SECURITY.md](SECURITY.md).
