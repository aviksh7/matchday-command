# Product specification: Matchday Command

**GenAI stadium operations and fan guidance for high-pressure tournament match days.**

This specification defines implemented behavior, architecture boundaries, and scope. The primary evaluator overview and full feature-evidence matrix live in [README.md](README.md).

## Product model

Matchday Command presents local simulated venue snapshots through two product modes:

### Fan Mode

- Queries about lower-pressure open gates and lower-wait simulated services.
- Accessibility-ready gate and support-point guidance.
- Simulated transit pressure/status comparisons and egress cautions.
- Simulated sustainability indicators and tips.
- A limited translation demonstration with a fixed Spanish/French local fallback sample.
- A visible source label and limitations notice on generated responses.

Fan guidance is not real routing, verified accessibility information, a transit schedule, or official venue advice.

### Operations Mode

- Simulated gate pressure, crowd density, locally derived service-queue pressure, volunteer coverage, accessibility-request, transit-pressure, and sustainability panels.
- A locally calculated priority queue and deterministic recommendations.
- A local incident list with in-memory status changes.
- Existing-incident selection and a custom prototype scenario builder.
- Vertex AI or deterministic local response-planning drafts for incidents.

Operational actions, briefings, and announcement text are drafts requiring qualified human review. The application does not dispatch staff, notify fans, control signage, publish announcements, or contact emergency services.

## Architecture boundary

1. Firebase Hosting serves the React frontend.
2. Firebase Hosting rewrites same-origin `/api/**` requests to the Cloud Run Node.js API.
3. Cloud Run validates requests and calls Vertex AI using its attached service account and ADC.
4. The browser validates structured responses and displays the source.
5. Failed, timed-out, non-successful, or invalid responses use deterministic local browser logic.

`GOOGLE_CLOUD_PROJECT` is supplied through deployment configuration; ADC supplies authentication credentials. The local fallback is frontend code, not a cloud service.

## Implemented AI contracts

| Flow | Cloud output | Local fallback |
| --- | --- | --- |
| Fan Assistant | Summary, recommended action, simulated data used, limitations | Deterministic response selected from the prompt category and current venue snapshot |
| Incident Support | Situation summary, priority, actions, briefing, announcement draft, accessibility note, crowd/transit note, simulated data used, limitations | Deterministic incident summary and draft outputs grounded in the current local snapshot |

Both paths preserve simulation wording. The UI identifies `Vertex AI via Cloud Run` or `Local deterministic fallback`, and Incident Support renders the returned or local limitations alongside every draft.

## Data and state boundaries

- Three local demo venues provide fictional capacities, gates, zones, concessions, incidents, accessibility requests, transit pressure/status, and sustainability values.
- Venue selection and incident status changes are browser state and are not persisted.
- The application has no user authentication or application database.
- Cloud AI queries are processed by Cloud Run and Vertex AI; the application does not intentionally write queries or generated responses to an application database.

## Scope status

| Capability | Status |
| --- | --- |
| Selected simulated venue snapshots | Implemented |
| Schematic keyboard-operable stadium map | Implemented |
| Fan guidance and operations calculations | Implemented from local data |
| Vertex AI Fan Assistant and Incident Support | Implemented through Cloud Run |
| Deterministic local fallback for both AI flows | Implemented |
| Source and limitation labels | Implemented |
| Limited translation demonstration | Implemented with explicit limitations |
| Responsive and reduced-motion behavior | Implemented |
| Persisted incidents, accounts, or history | Not implemented |
| Continuously updating or official telemetry | Not implemented |
| Real routing, transit feeds, or departure information | Not implemented |
| Dispatch, notification, signage, PA, or emergency integration | Not implemented |
| Comprehensive localization | Postponed |

## Safety and independence

All map, venue, crowd, incident, transit, route, queue, and wait-time content is simulated prototype data. Matchday Command has no access to official FIFA, tournament, stadium, ticketing, public-address, transit, emergency, or municipal systems. It is an independent prototype and is not affiliated with FIFA or venue operators.
