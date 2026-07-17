# Build plan and development roadmap

This file preserves the project's incremental development history while recording the implemented result and work that changed or was postponed.

## Original roadmap history

### Milestone 0: Project foundation — completed

- [x] Scaffold React, Vite, and TypeScript.
- [x] Establish component, page, data, logic, style, and test structure.
- [x] Add base navigation, application shell, and simulation notice.
- [x] Configure Vitest and React Testing Library.
- [x] Create the initial evaluator documentation set.

### Milestone 1: Simulated data and dashboards — completed with scope changes

- [x] Add local simulated venue data for gates, zones, concessions, incidents, accessibility, transit pressure/status, and sustainability.
- [x] Implement Staff Command operational panels and priority calculations.
- [x] Implement Fan Assistant guidance categories and selected-venue views.
- [x] Build the Floodlit visual system and responsive layouts.
- [~] Original references to transit schedules and accessible toilet maps changed to simulated transit pressure/status and accessibility-ready gate guidance.

### Milestone 2: AI guidance and incident support — completed with explicit limits

- [x] Implement Fan Assistant quick prompts and custom queries.
- [x] Implement Incident Support selection, local scenario creation, and structured drafts.
- [x] Add Vertex AI through a Cloud Run Node.js API for two structured roles.
- [x] Add deterministic local fallback and visible source labels for both AI flows.
- [~] Multilingual work is a limited translation demonstration, not comprehensive localization.
- [~] Incident actions and announcements remain drafts; no dispatch or publication is performed.

### Milestone 3: Map, responsive behavior, and accessibility — partially completed

- [x] Implement the interactive schematic stadium map and selected-snapshot guidance.
- [x] Add responsive layouts, visible focus, map keyboard controls, status announcements, and reduced-motion support.
- [ ] **Postponed:** continuously changing simulation intervals. The implemented product intentionally presents a selected simulated venue snapshot.
- [ ] **Postponed:** real routing or external telemetry integration; these remain outside prototype scope.

### Milestone 4: Deployment preparation and optimization — completed

- [x] Configure Firebase Hosting and the same-origin `/api/**` Cloud Run rewrite.
- [x] Deploy the Node.js API to Cloud Run and use Vertex AI through ADC/IAM.
- [x] Add frontend and backend automated tests and full quality commands.
- [x] Configure Hosting workflows to run `npm run check` before deployment.
- [x] Reduce Cloud Run source upload through `server/.gcloudignore`.

## Attempt 2 history

### Milestone 1A: Tooling and deployment efficiency — completed

- [x] Pin Node 22.
- [x] Enable strict TypeScript checks.
- [x] Enforce zero-warning Oxlint.
- [x] Harden CI quality gates and deployment source packaging.
- [x] Verify the 74-frontend / 18-backend / 92-total test checkpoint.

### Milestone 1B: Documentation and evaluator visibility — completed

- [x] Reconcile product and Google Cloud claims against code, configuration, tests, and deployed architecture.
- [x] Establish README as the primary evaluator entry point.
- [x] Focus security, testing, accessibility, product, and submission documents by ownership.
- [x] Replace the internal Project Details checklist with a concise product-facing explanation.
- [x] Add dedicated Project Details coverage, bringing the verified result to 77 frontend and 18 backend tests (95 total).
- [x] Pass Node 22 lint, build, test, diff, stale-claim, and responsive inspection checks.

## Historical Attempt 2 follow-up status

- Final documentation counts were reverified during the later local final-attempt pass.
- Public smoke testing, deployment, and submission remain owner-controlled release activities outside the local verification contract.
- Any later evaluator feedback belongs in a separately approved milestone.

No later milestone should be described as complete before its implementation and verification evidence exists.
