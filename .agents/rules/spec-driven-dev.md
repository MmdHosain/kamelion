# Mandatory Spec-Driven Development (SDD) & Regression Guard Rule

Whenever you are asked to implement, modify, or refactor any feature, or diagnose and fix any bug in this codebase:

1. **Invoke the Skill**:
   - You MUST announce and invoke the `spec-driven-dev` skill before proposing code changes or implementation plans.

2. **Always Consult Specs First**:
   - For frontend tasks: Read the corresponding PRD in [`docs/features/frontend/`](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/) via [`docs/features/frontend/README.md`](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/README.md).
   - For backend tasks: Read [`docs/architecture/backend.md`](file:///e:/GitHub%20Repo/kamelion/docs/architecture/backend.md), [`docs/architecture/api-endpoints.md`](file:///e:/GitHub%20Repo/kamelion/docs/architecture/api-endpoints.md), and [`docs/features/feature-status-back-end.md`](file:///e:/GitHub%20Repo/kamelion/docs/features/feature-status-back-end.md).

3. **Zero Unilateral Assumptions (Stop & Ask)**:
   - If any requirement, edge case, data field, UI detail, validation rule, or business logic is not fully defined, NEVER guess defaults.
   - You MUST pause and ask the user for clarification, even regarding fine details, before proceeding.

4. **Protect Dependent Features & Contracts**:
   - Do NOT modify, replace, or break contracts, schemas, or behaviors of dependent/adjacent features without explicit user authorization.
   - Verify all call sites across the codebase before altering shared methods or endpoints.

5. **Sync Documentation**:
   - Keep PRD files in `docs/features/frontend/`, `docs/features/feature-status-*.md`, and `docs/architecture/` updated whenever tasks are completed.

6. **Modular Architecture & Anti-Bloat (Create New Files)**:
   - When building or adding features, NEVER dump massive chunks of code into existing files.
   - Decompose into dedicated, modular files: sub-components, custom hooks (`src/hooks/`), API services (`src/api/`), and utility functions (`src/utils/`).
   - Keep files focused and lean (target under 200–300 lines) to avoid bloated, unmaintainable monolithic files.

