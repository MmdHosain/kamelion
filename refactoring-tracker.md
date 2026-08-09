# Frontend Refactoring Tracker

This document tracks the execution of the CSS refactoring plan.

## Phase 1: Configuration Updates
- **Status:** Completed
- **Details:** 
  - Centralized colors (`primary`, `primaryLight`, `secondary`, `dark`, `lightText`, `mutedText`) into `tailwind.config.js`.
  - Added custom `keyframes` and `animation` definitions for `fadeSlide` and `messageIn` to `tailwind.config.js`.

## Phase 2: CSS File Consolidation & Cleanup
- **Status:** Completed
- **Details:**
  - Deleted unused/redundant boilerplate stylesheet: `front-end/src/App.css`.
  - Deleted scattered stylesheet: `front-end/src/tailwind.css` (since its animations were migrated to tailwind configuration).
  - Consolidated React Day Picker inline overrides (`.rdp-custom`) from `AppointmentModal.jsx` into `front-end/src/index.css`.
  - Consolidated custom scrollbar inline styles (`.custom-scroll`) from `PatientDetailModal.jsx` into `front-end/src/index.css`.
  - Removed obsolete `@keyframes messageIn` and `.chat-message` styling from `index.css`, transitioning components (e.g. `MessageRenderer.jsx`) to use the new `animate-messageIn` tailwind utility class.

## Phase 3: Project-Wide Search & Replace (Tailwind Classes)
- **Status:** Pending
- **Details:**
  - Will replace arbitrary hex colors in component classNames (e.g., `bg-[#2F5D50]`, `text-[#E6C5CC]`) with semantic utility classes (`bg-primary`, `text-secondary`, etc.).
