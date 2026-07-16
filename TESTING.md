# Testing and verification

This document records the automated and manual verification workflow for Matchday Command. Product scope and the full evaluator evidence matrix live in [README.md](README.md).

## Verified inventory

Milestone 1B began from the verified checkpoint below:

| Suite | Test files | Tests |
| --- | ---: | ---: |
| Frontend | 14 | 74 |
| Backend | 1 | 18 |
| **Checkpoint total** | **15** | **92** |

Dedicated Project Details coverage was added during Milestone 1B. The table below records the post-implementation `npm run check` result rather than treating 92 as a permanent count.

Post-implementation Milestone 1B verification:

| Suite | Test files | Tests |
| --- | ---: | ---: |
| Frontend | 15 | 77 |
| Backend | 1 | 18 |
| **Current verified total** | **16** | **95** |

The final submission pass will re-run the suites and update these counts if later approved work changes them.

## Commands

```bash
npm run lint        # Oxlint with warnings denied
npm run build       # strict TypeScript project build and Vite production bundle
npm run test        # frontend Vitest suite
npm run test:server # backend Vitest/Supertest suite
npm run test:all    # frontend and backend suites
npm run check       # lint, build, and all tests
```

## Major automated behaviors covered

- application navigation and persistent simulation messaging;
- simulated venue-data invariants;
- gate pressure, crowd density, accessibility, staffing, and priority calculations;
- pointer and keyboard stadium-map interaction, including Enter, Space, and Escape;
- deterministic Fan Assistant and Incident Support outputs and safety language;
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

Both Firebase Hosting GitHub workflows use Node 22, install frontend and server dependencies with `npm ci`, and run `npm run check` before a live or preview Hosting deployment step. A failed lint, build, frontend test, or backend test prevents that workflow from reaching deployment.

## Manual production smoke-test checklist

Use the public application at <https://matchday-command-2026.web.app>:

1. Confirm the persistent simulated-prototype strip appears and the primary navigation works.
2. Select a venue on Home, open Crowd Map, and confirm the selected snapshot carries through.
3. On Crowd Map, Tab to a feature, select with Enter and Space, and clear with Escape.
4. In Fan Assistant, submit a quick prompt and confirm the result shows a source label plus a simulation/limitation notice.
5. Review Staff Command gate, crowd, transit-pressure, sustainability, accessibility, and incident panels as simulated snapshot information.
6. In Incident Support, select an incident and confirm the output is labeled as Vertex AI or local fallback and described as a draft.
7. Open Project Details and verify the product links, architecture flow, mode descriptions, Floodlit explanation, and limitations.
8. Inspect Project Details at approximately 390 px, 768 px, and a standard laptop width; confirm readable headings, usable links, visible focus, and no horizontal page overflow.
9. Confirm no page claims official access, continuously updating telemetry, real routing, transit departure information, automatic dispatch, or authorized announcements.
