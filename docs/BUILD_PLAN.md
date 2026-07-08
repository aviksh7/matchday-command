# Build Plan & Development Roadmap

This plan maps out the incremental milestones for **Matchday Command** to ensure a focused, modular delivery.

---

## Roadmap Milestones

### 🏁 Milestone 0: Project Foundation (Completed)
- [x] Scaffolding React + Vite + TypeScript.
- [x] Initializing directories (`src/components`, `src/pages`, `src/data`, `src/types`, `src/styles`, `src/test`).
- [x] Base routing navigation, layout skeleton, and simulated banner.
- [x] Unit testing rig setup via Vitest and React Testing Library.
- [x] Core documentation (README, SECURITY, TESTING, ACCESSIBILITY, SUBMISSION, PRODUCT_SPEC).

### 📊 Milestone 1: Simulated Data & Base Dashboards
- [ ] Integrate full simulated venue data (concession wait times, gate pressure telemetry, active incidents lists, and public transit schedules).
- [ ] Implement operations staff dashboard panels showing gate pressures and queue durations.
- [ ] Build Fan Mode view card components for route selection, accessible toilet guides, and transit departures.
- [ ] Style interfaces utilizing custom modern CSS theme variables.

### 🤖 Milestone 2: Multilingual AI Chat & Operations Action Plans
- [ ] Create the Fan Mode assistant chat window showing mock query suggestions and simulated replies.
- [ ] Implement the Incident Support queue detail drawer.
- [ ] Add the AI action plan button which simulates Gemini's crowd control or incident response instructions.
- [ ] Configure local translation simulations for volunteer guidelines.

### 🔄 Milestone 3: Live Crowd Simulation & Dynamic Telemetry
- [ ] Add simulation intervals (ticking logic) that mock real-time shifts in gate pressure and restroom queues.
- [ ] Trigger warning flags (e.g., Gate A bottlenecks) that update routes suggested to fans.
- [ ] Implement responsive UI overrides for mobile/desktop viewports.

### 🚀 Milestone 4: Deployment Preparation & Optimization
- [ ] Ensure the project is strictly **under 10 MB** (remove local cache assets, build files, etc.).
- [ ] Set up Firebase Hosting config (`firebase.json` placeholder).
- [ ] Document Google Cloud Run environment scripts.
- [ ] Run a final automated unit test run (`npm run test`) and production check (`npm run build`).
