# Git Branching Strategy & Documentation

## 1. Objective
This document defines the clear Git branching strategy for the project. The goal is to ensure that both Backend and Frontend teams follow a unified, structured workflow and branch naming convention.

---

## 2. Branch Types & Responsibilities

The repository consists of **Permanent Branches** and **Temporary Working Branches**.

### 2.1 Permanent Branches
These branches are permanent and must never be deleted. 

* **`main` (Production Branch)**
  * Represents the stable/production state of the application.
  * Direct pushes to `main` are **strictly prohibited**.
  * Changes can *only* be introduced through Merge Requests.
  * **Crucial Rule:** `main` can **ONLY** receive changes from the `develop` branch. No other branch can be merged directly into `main`.

* **`develop` (Integration Branch)**
  * Serves as the shared integration branch for both Backend and Frontend teams.
  * Represents the latest delivered development changes for the next release.
  * Direct pushes to `develop` are **strictly prohibited**.
  * Changes must be introduced through Merge Requests from working branches.
  * All Feature, Bugfix, and Hotfix branches are created from `develop` and merged back into `develop`.

### 2.2 Temporary Working Branches
All other branches are considered temporary and are used for specific tasks (features, bug fixes, or hot fixes).
* Every working branch must be associated with a specific **Issue**.
* The **Issue ID** must be included in the branch name.
* Working branches must **not** be used as permanent branches.

---

## 3. Branch Naming Convention

Working branches must follow a strict naming convention based on the type of work and the platform.

### Standard Patterns
* **Backend Features:** `feature/backend/<issue-id>-<description>`
* **Frontend Features:** `feature/frontend/<issue-id>-<description>`
* **Backend Bugfixes:** `bugfix/backend/<issue-id>-<description>`
* **Frontend Bugfixes:** `bugfix/frontend/<issue-id>-<description>`
* **Hotfixes:** `hotfix/<issue-id>-<description>`

### Examples:
* `feature/backend/42-user-authentication`
* `feature/frontend/42-login-page`
* `bugfix/backend/57-token-expiration`
* `bugfix/frontend/57-login-validation`
* `hotfix/61-production-error`

---

## 4. Frontend and Backend Workflow

A single shared `develop` branch is used by both teams. The workflow adapts based on the dependency between the teams:

* **Independent Work (Separated Branches):**
  When Backend and Frontend work are independent, separate branches should be created and merged individually.
  * *Example:* `feature/backend/42-reservation-api` and `feature/frontend/42-reservation-page`

* **Tightly Coupled Work (Shared Branch):**
  When Backend and Frontend changes are tightly coupled and intentionally developed together, a single shared working branch can be used. In this case, the platform prefix (`backend/` or `frontend/`) is removed.
  * *Example:* `feature/42-reservation-feature`

---

## 5. Merge Request (MR) Workflow

All changes must go through a Merge Request. Code reviews are mandatory before merging.

### 5.1 Standard Issue-to-Branch Workflow (Features, Bugfixes, Hotfixes)
1. **Issue:** Pick an Issue from the backlog.
2. **Create Branch:** Create a working branch from `develop` following the naming convention.
3. **Implement:** Commit and push your changes to the working branch.
4. **Create MR:** Open a Merge Request against the `develop` branch.
5. **Review:** Wait for code review and approvals.
6. **Merge:** Merge the working branch into `develop`.
7. **Delete:** Delete the source working branch immediately after the merge.

*(Note: Even Hotfixes must follow this flow and merge into `develop` first, ensuring `develop` always has the fix before it goes to production).*

### 5.2 Production Release Workflow
When `develop` is ready to be released to production (or a hotfix needs to be deployed):
1. **Create MR:** Open a Merge Request from `develop` targeting `main`.
2. **Review & Approve:** Ensure all CI/CD checks pass and approvals are met.
3. **Merge:** Merge `develop` into `main`.

---

## 6. Branch Lifecycle & Deletion Policy

To keep the repository clean and manageable:
* **Deletion upon Merge:** A working branch **must** be deleted immediately after its Merge Request is successfully merged.
* **No Stale Branches:** No unused or abandoned working branches should remain in the repository. Developers are responsible for cleaning up their unmerged branches if an approach is discarded.