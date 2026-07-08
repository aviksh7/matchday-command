# Matchday Command

**GenAI stadium operations and fan guidance for high-pressure tournament match days.**

Matchday Command is a smart stadium command center and fan assistant prototype designed for high-pressure soccer tournament match days (e.g., FIFA World Cup 2026). It uses Generative AI to improve real-time navigation, crowd management, multilingual communication, and operational decision-making.

---

### ⚠️ Simulated Prototype Disclaimer
**This project is a simulated prototype built for demonstration and evaluation purposes (Build with AI 2026 Challenge).**
- All stadium, crowd density, queue wait times, incident alerts, transit, and routing data are entirely simulated mockups.
- This application does **not** connect to real tournament databases, live ticketing portals, venue cameras, or emergency dispatch services.
- No official FIFA tournament names, emblems, mascots, trophies, or official brand assets are used.

---

## Evaluator Evidence & Judging Priorities

Matchday Command is designed from the ground up around the Build with AI 2026 Challenge priorities:

| Judging Priority | Impact Level | How We Address It |
| :--- | :--- | :--- |
| **Google Service Usage** | **VERY HIGH** | Integrated development using Google Antigravity, planned deployment on Firebase Hosting, backend operations runner on Google Cloud Run, and Gemini API for intelligence. |
| **Problem Statement Alignment** | **HIGH** | Targets the real-world operational challenges of massive stadium tournaments (crowd flow, incident resolution, multilingual support). |
| **Code Quality** | **HIGH** | Strict React + TypeScript architecture, custom modular CSS design system, and clean state routing. |
| **Security** | **MEDIUM** | Zero client-side API keys; Gemini API requests are mediated via a secure server-side Cloud Run bridge. Simulated mock data only. |
| **Efficiency** | **MEDIUM** | Minimal bundle footprint, modern Vite build pipeline, and performant state rendering. |
| **Testing** | **MEDIUM** | Configured Vitest + React Testing Library suite for fast, automated unit and integration tests. |
| **Accessibility** | **LOW** | Follows W3C WCAG guidelines, utilizing semantic HTML, focus states, and keyboard navigation. |

---

## Challenge Vertical & Problem Alignment
During major tournaments, tens of thousands of fans arrive at massive stadiums simultaneously. This creates significant bottlenecks at security gates, concession stands, restrooms, and public transit nodes. Volunteers and stadium staff are often overwhelmed, leading to communication delays and slow incident response.
- **Vertical:** Stadium Operations, Fan Guidance, and Accessibility.
- **Problem Alignment:** Matchday Command resolves this by providing a unified interface that balances crowd distributions, translates announcements, coordinates volunteer response, and generates instant incident action plans.

---

## Core Users
1. **Fans:** Need real-time, multilingual assistance for routing, accessible facilities, transit departures, and sustainability guides.
2. **Operations Staff / Venue Organizers:** Require a central control room dashboard monitoring gate pressures, bathroom queue times, and safety incidents.
3. **Volunteers:** Receive clear instruction summaries and task assignments translated to their native languages.

---

## How the Solution Works
The application supports two modes:
### 1. Fan Mode
- **Multilingual AI Assistant:** Translates queries and matches users with nearby services in their preferred language.
- **Crowd-Aware Navigation:** Points fans away from high-density gates or long concession lines.
- **Accessibility & Transit Guidance:** Maps wheelchair-friendly routes and displays live transit estimates.

### 2. Staff/Ops Mode
- **Operations Dashboard:** Live tracking of gate throughput, restroom wait times, and incident locations.
- **AI-Generated Action Plans:** Instant instructions for responding to crowd bottlenecks or safety hazards.
- **Volunteer Coordinator:** Groups operational tasks and generates summaries for field staff.

---

## Google Services Plan
- **Google Antigravity:** Powering the AI-assisted pair programming and development workflows.
- **Firebase Hosting:** Selected for high-performance, edge-cached static distribution of the frontend React app.
- **Google Cloud Run:** Hosts the lightweight server-side Node/Go microservice bridge.
- **Gemini API:** Powers the backend text-to-text summaries, multilingual queries, and incident action plans. The API key remains strictly server-side inside Cloud Run environment secrets.

---

## Local Development Steps

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### Run Locally
Launch the Vite development server:
```bash
npm run dev
```

### Build for Production
Verify typescript compiles and assets package successfully:
```bash
npm run build
```

### Run Unit Tests
Execute the Vitest test suite:
```bash
npm run test
```
