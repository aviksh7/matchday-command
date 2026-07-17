# Testing and verification

This document records the automated and manual verification workflow for Matchday Command. Product scope and the full evaluator evidence matrix live in [README.md](README.md).

## Verified inventory

Attempt 2 began from the verified checkpoint below:

| Suite | Test files | Tests |
| --- | ---: | ---: |
| Frontend | 16 | 80 |
| Backend | 1 | 18 |
| **Checkpoint total** | **17** | **98** |

The table below records the final locally verified submission-candidate result.

Submission-candidate verification:

| Suite | Test files | Tests |
| --- | ---: | ---: |
| Frontend | 17 | 139 |
| Backend | 2 | 79 |
| **Current verified total** | **19** | **218** |

These tests run locally with cloud clients mocked; they are not evidence of a production-system call.

Final V8 coverage also clears the configured fail-under thresholds:

| Suite | Statements | Branches | Functions | Lines | Enforced minimums |
| --- | ---: | ---: | ---: | ---: | --- |
| Frontend | **92.17%** | **78.68%** | **94.07%** | **94.90%** | 90 / 76 / 92 / 94 |
| Server | **92.40%** | **94.92%** | **96.42%** | **92.15%** | 86 / 88 / 85 / 87 |

## Commands

```bash
npm run lint        # Oxlint with warnings denied
npm run build       # strict TypeScript project build and Vite production bundle
npm run test        # frontend Vitest suite
npm run test:server # backend Vitest/Supertest suite
npm run test:all    # frontend and backend suites
npm run check       # lint, build, and all tests
npm run check:coverage # frontend and server V8 coverage thresholds
```

## Major automated behaviors covered

- application navigation and persistent simulation messaging;
- simulated venue-data invariants;
- gate pressure, crowd density, service-queue pressure, accessibility, staffing, volunteer grounding, and priority calculations;
- pointer and keyboard stadium-map interaction, including Enter, Space, and Escape;
- validated local map-incident handoff into Incident Support, including invalid-context rejection, same-page reset, and absence of an automatic request;
- deterministic Fan Assistant and Incident Support outputs and safety language;
- request-grounded Fan accessibility guidance plus Staff accessibility-request details and human-review/no-dispatch boundaries;
- cloud-success, timeout/network/server failure, malformed response, invalid schema, loading, disabled-state, and stale-request paths;
- visible `Vertex AI via Cloud Run` and `Local deterministic fallback` source labels;
- API client payload compaction, request limits, timeout handling, and response validation;
- backend client initialization, health endpoint, CORS allowlist, field validation, body limit, prompt-injection rejection, rate limiting, structured output, and controlled failures;
- Firebase Hosting rewrite order and cache rules;
- Project Details product, architecture, links, build evidence, and limitation content.

## External-service mocking

Automated tests do not call Firebase Hosting, Cloud Run, Vertex AI, or any other external cloud service.

- Frontend API tests replace `fetch` with Vitest mocks or exercise deterministic failure behavior locally.
- Backend tests replace `@google/genai` at the module boundary and inject generator functions into the Express application.
- Backend HTTP behavior is exercised in process with Supertest.

Real Vertex AI testing is a separate, manual activity requiring local ADC and explicit project configuration. It is not part of the automated suite.

## Continuous integration gates

Both Firebase Hosting GitHub workflows use Node 22, install frontend and server dependencies with `npm ci`, and run `npm run check` plus `npm run check:coverage` before a live or preview Hosting deployment step. A failed lint, build, test, or coverage threshold prevents that workflow from reaching deployment.

## Manual production smoke-test checklist

Use the public application at <https://matchday-command-2026.web.app>:

1. Confirm the persistent simulated-prototype strip appears and the primary navigation works.
2. Select a venue on Home, open Crowd Map, and confirm the selected snapshot carries through.
3. On Crowd Map, Tab to an incident, select with Enter or Space, open Incident Support, and confirm the exact simulated venue/incident context is preselected; use Escape to clear a map selection.
4. In Fan Assistant, request accessibility guidance and confirm the result uses local request locations/statuses plus a source and limitation notice.
5. Review Staff Command gate, crowd, service-queue, transit-pressure, sustainability, accessibility-request, and incident panels; confirm the request and recommendation review boundaries are adjacent and explicit.
6. In Incident Support, confirm the selected or newly chosen incident output is labeled as Vertex AI or local fallback, described as a draft, and accompanied by visible limitations.
7. Open Project Details and verify the product links, architecture flow, mode descriptions, Floodlit explanation, and limitations.
8. Inspect Project Details at approximately 390 px, 768 px, and a standard laptop width; confirm readable headings, usable links, visible focus, and no horizontal page overflow.
9. Confirm no page claims official access, continuously updating telemetry, real routing, transit departure information, automatic dispatch, or authorized announcements.
