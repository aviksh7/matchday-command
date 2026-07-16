# Evaluator evidence guide

This guide points evaluators to concrete implementation and verification evidence without assigning scores or predicting outcomes. The complete challenge-to-feature-to-evidence matrix is maintained in [../README.md](../README.md).

| Evaluation area | Implemented evidence | Verification evidence | Boundary |
| --- | --- | --- | --- |
| Google Cloud usage | Firebase Hosting frontend, `/api/**` Cloud Run rewrite, Node.js API, Vertex AI through attached service account and ADC | `firebase.json`, `server/client.js`, `server/index.js`, `server/app.js`, Firebase configuration tests | Local deterministic fallback runs in the browser and is not a cloud service |
| Problem alignment | Fan guidance, crowd map, operations dashboard, accessibility context, transit pressure/status, sustainability, incident drafts | Page, logic, and UI tests under `src/test/` | Selected simulated snapshots only; no external operational systems |
| Code quality | React + strict TypeScript frontend, modular logic, Node 22, Oxlint warnings denied | `tsconfig.app.json`, `tsconfig.node.json`, `.nvmrc`, `package.json`, `npm run check` | Backend implementation is Node.js, not Go |
| Security and privacy | Server-side Vertex AI authentication, no frontend AI credential, request limits, CORS allowlist, validation, rate limiting, controlled errors | Backend Supertest suite and [../SECURITY.md](../SECURITY.md) | No user authentication; rate limit is per container instance |
| Efficiency | Compact frontend payloads, cached hashed assets, same-origin API rewrite, reduced Cloud Run source context | `src/logic/apiClient.ts`, `firebase.json`, `server/.gcloudignore` | No unsupported performance, latency, or repository-size claim |
| Testing | Frontend unit/UI/API-client tests and backend API tests with cloud services mocked | [../TESTING.md](../TESTING.md), GitHub Hosting workflows | Automated tests do not call deployed services |
| Accessibility | Semantic shell, visible focus, keyboard map, status announcements, disabled states, reduced motion, responsive layouts | `src/components/AppShell.tsx`, `StadiumMap.tsx`, theme styles, UI tests, [../ACCESSIBILITY.md](../ACCESSIBILITY.md) | No formal WCAG certification claimed |

## Safety and claim discipline

- All operational information is identified as simulated prototype data.
- The product does not claim official access, continuously updating telemetry, real routing, transit departure information, automatic dispatch, or authorized announcement publication.
- Multilingual behavior is described as a limited demonstration.
- Operational and announcement outputs are drafts requiring qualified human review.
- Matchday Command is an independent prototype and is not affiliated with FIFA or venue operators.
