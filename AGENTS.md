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
  - **No Frontend Secrets:** Vertex AI authentication must stay strictly server-side through the Cloud Run service's attached identity and Application Default Credentials. No API keys or other secrets in frontend code.

---

## 2. Product Modes
1. **Fan Mode:** Limited multilingual AI guidance, simulated accessibility guidance, sustainability tips, and simulated transit pressure/status.
2. **Staff/Ops Mode:** Simulated gate and service-queue pressure, accessibility and volunteer context, incident review, and AI-generated decision-support drafts.

---

## 3. Workflow Protocol
- **Plan First:** Before implementing any complex change, research the codebase and outline a clean proposal.
- **Milestone Increments:** Complete one milestone or feature set at a time. Do not attempt multi-milestone edits at once.
- **Pre-Completion Checks:**
  1. Compile check: `npm run build`
  2. Test suite check: `npm run test`
  3. Version control check: `git status`
- **Zero Auto-Commits:** Stop and wait for user review before committing any code changes.
