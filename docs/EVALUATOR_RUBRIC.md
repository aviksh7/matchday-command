# Evaluator Rubric & Compliance Matrix

This document outlines the judging criteria for the Build with AI 2026 Challenge and how **Matchday Command** addresses them.

---

## 1. Judging Priorities

| Priority Area | Impact Level | Implementation Guidelines |
| :--- | :--- | :--- |
| **Google Service Usage** | **VERY HIGH** | - Use Google Antigravity for AI-assisted development.<br>- Deploy static frontend using Firebase Hosting.<br>- Run backend routing/API server on Google Cloud Run.<br>- Integrate Gemini API for operations/query intelligence. |
| **Problem Alignment** | **HIGH** | - Target real congestion, accessibility, and multilingual operational issues on match days. |
| **Code Quality** | **HIGH** | - Clean, type-safe React + TypeScript components.<br>- No hacky casting workarounds (avoid `as any` in configurations).<br>- Clean modular structure. |
| **Security** | **MEDIUM** | - Zero client-side API keys.<br>- Server-side mediation for Gemini API.<br>- Read-only simulated data. |
| **Efficiency** | **MEDIUM** | - Repository footprint must remain strictly **under 10 MB**.<br>- Single git branch only.<br>- Light client bundle footprint. |
| **Testing** | **MEDIUM** | - Complete test suite with Vitest + React Testing Library.<br>- Non-watch run mode for automated compliance validation. |
| **Accessibility** | **LOW** | - Semantic landmarks (`<main>`, `<nav>`, `<header>`).<br>- Keyboard-navigable page controls and clear focus indicators. |

---

## 2. Safety & Compliance Rules

To prevent disqualification:
- **Zero Trademark Infringement:** Do not use official tournament logos, trophies, mascots, emblems, or trademarked visual assets.
- **Simulated Labeling:** All venue maps, queues, wait times, gate pressures, and transit metrics must be explicitly documented and visually labeled as simulated prototype data.
- **No Access Claims:** Never claim access to live ticketing, stadium management, emergency response, or live municipal transit networks.
