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
- **Status:** Completed
- **Details:**
  - Replaced arbitrary hex colors in component classNames across all components.
  - Replaced `[#2F5D50]` with `primary`.
  - Replaced `[#264C42]` with `primaryLight`.
  - Replaced `[#E6C5CC]` with `secondary`.
  - Replaced `[#1a2522]` with `dark`.
  - Replaced `[#FAFAF8]` with `lightText`.
  - Replaced `[#6B6E6C]` with `mutedText`.
  - Updated `index.css` to use `theme('colors.primary')` for `.rdp-custom` styles.
