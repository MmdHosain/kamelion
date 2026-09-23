# Workspace Agent Rules: Kamelion Healthcare Platform

These rules are ALWAYS active for the entire repository and MUST be strictly enforced on every user request.

---

## 🛑 Rule 1: Mandatory Spec-Driven Development (SDD) & Pre-Implementation Stop Gate

Whenever you are asked to build, implement, enhance, or refactor any feature, or diagnose and fix any bug in this codebase:

1. **Mandatory Skill Invocation**:
   - You MUST immediately announce: `Using spec-driven-development to ...` and invoke the `spec-driven-development` skill BEFORE proposing or modifying any code.

2. **Read Specifications First (Doc-First)**:
   - For any frontend feature/bug: You MUST consult the relevant PRD in [`docs/features/frontend/`](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/) and check [`docs/features/frontend/README.md`](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/README.md).
   - For any backend feature/bug: You MUST consult [`docs/architecture/backend.md`](file:///e:/GitHub%20Repo/kamelion/docs/architecture/backend.md), [`docs/architecture/api-endpoints.md`](file:///e:/GitHub%20Repo/kamelion/docs/architecture/api-endpoints.md), and [`docs/features/feature-status-back-end.md`](file:///e:/GitHub%20Repo/kamelion/docs/features/feature-status-back-end.md).

3. **Zero Unilateral Assumptions (Stop & Ask Rule)**:
   - NEVER make "smart", "logical", or "standard" default assumptions when a requirement, validation rule, error message, UI detail, permission, or database nullability is not 100% specified.
   - You MUST STOP and ask the user for clarification, even regarding the smallest details, before writing any code.

4. **Protect Dependent Features & Contracts**:
   - Never modify, rename, or break existing contracts, schemas, models, or behaviors of dependent features without explicit user authorization.
   - Run a search across all call sites (`grep_search`) to prove backward compatibility before editing shared abstractions.

5. **Sync Documentation on Completion**:
   - Keep the corresponding PRDs in `docs/features/` and architecture docs in `docs/architecture/` up to date whenever changes are finalized.

---

## 🧩 Rule 2: Modular Architecture & Anti-Bloat Rule (Create New Files for Features)

When implementing, building, or adding any new feature, view, or sub-component:

1. **Strictly Prohibit Monolithic Code (Anti-Bloat)**:
   - Do NOT dump new features, large modals, complex forms, or entire sections into an existing file, which leads to bloated, unmaintainable "God Files".
2. **Mandatory Decomposition into Dedicated Files**:
   - **Sub-components & Views**: Create new dedicated files for modals, cards, table rows, and dialogue panels inside appropriate component directories.
   - **Custom Hooks**: Extract complex state machines, validation rules, timers, and multi-step workflows into dedicated files in `src/hooks/`.
   - **Services & APIs**: Keep all network calls and Axios requests in dedicated modules in `src/api/` or `src/services/` rather than writing inline API requests.
   - **Utilities**: Place date transformations, regex helpers, and formatters in `src/utils/`.
3. **File Size & Single Responsibility**:
   - Keep files lean and single-responsibility (target under 200–300 lines). Whenever a file grows excessively, proactively extract modular sub-components into new files.

