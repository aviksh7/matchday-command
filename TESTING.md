# Testing Plan & Guidelines

This document outlines the testing workflow for **Matchday Command**, addressing the **Testing (MEDIUM impact)** and **Code Quality (HIGH impact)** evaluation criteria.

---

## Automated Testing Suite

We use **Vitest** + **React Testing Library** for high-speed, non-watch DOM testing.

### Commands

#### Run Unit & Integration Tests
Runs the test suite once (non-interactive):
```bash
npm run test
```

#### Perform Production Compile Check
Runs the TypeScript type-checker (`tsc`) and Vite bundler to verify zero syntax, type, or asset compile errors:
```bash
npm run build
```

---

## Manual Verification Checklist

Before submission, the following verification checklist must be followed:

1. **Routing & Navigation:**
   - [ ] Verify that clicking each tab in the navigation bar displays the correct section.
   - [ ] Confirm the active tab receives the correct highlighted CSS styling.
2. **Disclaimer Banner:**
   - [ ] Verify that the simulated prototype banner renders clearly on all pages.
   - [ ] Ensure the disclaimer is readable and contains appropriate warnings.
3. **Data Rendering:**
   - [ ] Confirm mock incidents, gate pressures, and transit wait times display correctly.

---

## Accessibility Audit Checklist

Even though accessibility is labeled **LOW impact**, we target standard compliance:

- [ ] **Tab Navigation:** Ensure users can navigate between header, navigation tabs, and cards using the `Tab` key.
- [ ] **Focus Ring:** Visual outline must be present on active buttons/links.
- [ ] **Screen Readers:** All semantic sections should have proper roles (e.g., `<main>`, `<header>`, `role="alert"`).
- [ ] **Contrast Check:** Text elements must pass WCAG AA color contrast (at least 4.5:1 ratio).

---

## Browser Compatibility & Brave Browser Note

- Tests are designed to run in standard headless `jsdom` environments.
- During local manual verification, ensure the web app operates correctly in standard modern browsers.
- **Brave Browser Note:** If testing locally in Brave, please be aware that Brave's aggressive ad/tracker blocking ("Shields Up") may block local WebSocket sync connections or mock API calls. It is recommended to disable Shields for `localhost` during development or test using standard Chrome/Safari.
