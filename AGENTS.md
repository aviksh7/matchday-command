# Workspace Rules & Agent Instructions

Welcome, agent! You are working on **Matchday Command**. Follow these workspace rules at all times.

---

## 1. Project Context & Constraints
- **Project Name:** Matchday Command
- **Tagline:** GenAI stadium operations and fan guidance for high-pressure tournament match days.
- **Safety / IP Rules:**
  - **No official branding:** Do NOT use or reference official FIFA logos, emblems, mascots, trophies, or official brand assets.
  - **No live systems:** Do NOT connect to or claim access to real tournament databases, municipal transit APIs, or emergency services. All features must rely on local simulated crowd telemetry and venue status data.
  - **Simulated Data:** All maps, incidents, routes, wait times, gate pressures, and transit estimates must be clearly labeled as simulated mockup/prototype data.
  - **No Frontend Secrets:** The Gemini API key must stay strictly server-side (Google Cloud Run env variables). No secrets in frontend code.

---

## 2. Product Modes
1. **Fan Mode:** Multilingual AI guidance, smart accessibility routing, sustainability tips, public transit estimates.
2. **Staff/Ops Mode:** Live gate pressure telemetry, concession/bathroom wait times, incident dispatch queue, AI-generated action plans.

---

## 3. Workflow Protocol
- **Plan First:** Before implementing any complex change, research the codebase and outline a clean proposal.
- **Milestone Increments:** Complete one milestone or feature set at a time. Do not attempt multi-milestone edits at once.
- **Pre-Completion Checks:**
  1. Compile check: `npm run build`
  2. Test suite check: `npm run test`
  3. Version control check: `git status`
- **Zero Auto-Commits:** Stop and wait for user review before committing any code changes.
