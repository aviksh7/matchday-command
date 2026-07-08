# Accessibility Compliance Guide (a11y)

This guide documents the design standards for **Matchday Command**, addressing the **Accessibility (LOW impact)** priority. We aim for WCAG 2.1 Level AA conformance to ensure stadium visitors and operations teams can use the software regardless of physical constraints.

---

## 1. Semantic HTML Structure

Avoid `div` soup. We structure our pages using HTML5 structural landmarks:
- `<header>`: Contains the application brand name and primary metadata.
- `<nav>`: Grouping tag for the core page navigation tabs.
- `<main>`: Wraps the core page content.
- `<section>`: Demarcates logical subunits (e.g., dashboard segments).
- `<footer>`: Application info and copyright.

---

## 2. Keyboard Navigation & Focus Ring

Users must be able to operate the application entirely via keyboard:
- **Interactive Elements:** Ensure all custom buttons, selectors, and form elements are focusable (`tabindex="0"` where appropriate or using standard `<button>` tags).
- **Focus Rings:** Active states must have high contrast outlines. Do not use CSS rules that suppress focus outlines without providing alternative clear visual focus states.
- **Alert Banner:** The disclaimer banner uses the `role="alert"` semantic attribute to ensure assistive technologies announce its presence immediately.

---

## 3. Color Contrast Standards

To ensure text remains legible for users with moderate low vision:
- **Body Text:** Main body text color (`--text-color: #3c4043`) against card backgrounds (`--card-bg: #ffffff`) achieves a contrast ratio greater than 4.5:1.
- **Incident Statuses:** Red/Yellow statuses should utilize high-contrast textual indicators alongside color coding (e.g. bold weights, warning icons, and descriptive text) to convey severity, ensuring color is not the sole conveyor of information.

---

## 4. Reduced Motion Support

For users with vestibular disorders or motion sensitivities:
- Animations and transitions must respect system settings:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-delay: -1ms !important;
      animation-duration: 1ms !important;
      animation-iteration-count: 1 !important;
      background-attachment: initial !important;
      scroll-behavior: auto !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }
  }
  ```
