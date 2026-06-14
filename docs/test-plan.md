# Test Plan — CodePulse Blog Platform

**Document Version:** 1.0
**Date:** June 2026
**Author:** Md Navid Munshi
**Project:** CodePulse Blog Platform
**Environment:** Production — https://blog.munshinavid.me

---

## 1. Introduction

This test plan defines the testing approach, scope, objectives, and deliverables for the CodePulse Blog Platform — a production-deployed fullstack application consisting of an ASP.NET Core 8 Web API backend and an Angular 19 SPA frontend.

The platform supports two user roles (Admin and Reader) with distinct capabilities, JWT-based authentication via HttpOnly cookies, and a complete blog post lifecycle including soft-delete and restore.

---

## 2. Objectives

- Verify that all API endpoints behave according to their documented contracts
- Validate role-based access control (RBAC) enforcement across Admin and Reader roles
- Confirm that authentication and authorization mechanisms are correctly implemented
- Identify security vulnerabilities related to unauthenticated access and token handling
- Validate input validation and error handling for all major workflows
- Verify UI functionality and end-to-end user flows via browser automation
- Ensure API and UI remain consistent — data created via API appears correctly in UI

---

## 3. Scope

### 3.1 In Scope

| Area | Details |
|---|---|
| **Authentication** | Register, login, logout, JWT cookie issuance, token validation |
| **Authorization** | RBAC enforcement (Admin vs Reader), unauthenticated access, tampered token handling |
| **Blog Posts** | Full CRUD, soft-delete, restore, hard-delete, pagination, search, admin listing |
| **Categories** | Full CRUD, not-found handling |
| **Comments** | Add, delete by owner, delete by admin, unauthorized deletion, not-found |
| **Images** | Upload, listing, missing file handling |
| **Input Validation** | FluentValidation rules, DataAnnotation [Required], ASP.NET Identity password policy |
| **Error Handling** | Global exception handler behavior, HTTP status code correctness |
| **UI Flows** | Login, post browsing, admin dashboard, comment interaction, RBAC UI enforcement |
| **API + UI Integration** | Data created via API verified in UI; deletions via API verified removed in UI |

### 3.2 Out of Scope

| Area | Reason |
|---|---|
| Performance / Load Testing | Outside current phase |
| Cross-browser Testing (Firefox, Safari) | Chromium only for this phase |
| Mobile Responsiveness | UI mobile testing not in current scope |
| Email / Notification Testing | Feature not present in current application |
| Accessibility (a11y) Testing | Future phase |
| Database migration testing | Infrastructure concern, not application QA |

---

## 4. Test Environment

| Property | Value |
|---|---|
| **Application URL** | https://blog.munshinavid.me |
| **API Base URL** | https://api.blog.munshinavid.me |
| **Backend** | ASP.NET Core 8 Web API |
| **Frontend** | Angular 19 SPA |
| **Database** | PostgreSQL 16 (production) |
| **Deployment** | Docker Compose on Linux VPS |
| **OS (Test Machine)** | Windows 10 |
| **Node.js Version** | v22.19.0 |
| **Browser** | Chromium 148.0.7778.96 |

### Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@myblog.com | 1234 |
| Reader | Dynamically registered per test run | password123 |

---

## 5. Features to Be Tested

### 5.1 Authentication Module
- User registration with valid credentials
- Registration with duplicate email
- Registration with missing/invalid fields
- Login with valid Admin credentials
- Login with valid Reader credentials
- Login with invalid credentials
- JWT cookie issuance and HttpOnly flag enforcement
- GET /me endpoint with valid, invalid, and no authentication
- Logout and session termination

### 5.2 Blog Post Module
- Create post (Admin only) with all required fields
- Create post with missing/invalid fields (FluentValidation)
- Read posts — public paginated listing
- Read posts — admin listing (includes drafts and deleted)
- Search by keyword
- Soft-delete post (Admin only)
- Restore soft-deleted post (Admin only)
- Hard-delete post (Admin only)
- Dashboard statistics (Admin only)
- Not-found handling for invalid post IDs

### 5.3 Categories Module
- Create, read, update, delete categories
- Not-found handling

### 5.4 Comments Module
- Add comment as authenticated Reader
- Add comment without authentication
- Delete comment as owner
- Delete comment as Admin (not owner)
- Cross-user deletion (Reader deleting another's comment)
- Not-found handling

### 5.5 Images Module
- Upload image (multipart/form-data)
- Upload without file attachment
- List all uploaded images

### 5.6 Authorization & Security
- Reader accessing Admin-only endpoints (403)
- Unauthenticated access to protected endpoints (401)
- Tampered JWT token handling
- Cross-user resource ownership enforcement

---

## 6. Features NOT to Be Tested

- WeatherForecast controller (scaffolding artifact, not production feature)
- pgAdmin interface
- Docker container internals
- GitHub Actions pipeline internals

---

## 7. Test Deliverables

| Deliverable | Location |
|---|---|
| Test Plan (this document) | `docs/test-plan.md` |
| Test Strategy | `docs/test-strategy.md` |
| Test Cases (50 TCs) | `CodePulse_QA_Portfolio.xlsx` → Test Cases sheet |
| Bug Reports (6 bugs) | `CodePulse_QA_Portfolio.xlsx` → Bug Reports sheet |
| Postman Collection | `postman/CodePulse_API_Test_Suite.postman_collection.json` |
| Newman HTML Report | `postman/reports/test-report.html` |
| Playwright Test Suite | `playwright/tests/` |
| Playwright Execution Report | `PLAYWRIGHT_REPORT.md` |

---

## 8. Entry and Exit Criteria

### Entry Criteria
- Application is deployed and accessible at production URL
- Test accounts (Admin, Reader) are available
- Postman collection and Playwright suite are configured with correct base URL
- All test dependencies (Newman, Playwright, Chromium) are installed

### Exit Criteria
- All 50 test cases have been executed
- All discovered bugs are documented with reproduction steps
- Newman run completed with results reported
- Playwright suite executed with HTML report generated
- All Critical and High severity bugs are reported to developer

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Live API downtime during test run | Low | High | Re-run after confirming API health |
| Test data collision between runs | Medium | Medium | Unique timestamps used in all created data |
| JWT cookie expiry mid-run (15 min) | Low | Medium | Newman delay is 200ms; full run completes in ~31s |
| Angular route guards changed | Low | High | Update Playwright selectors and assertions accordingly |
| Production data modified by admin tests | Medium | Low | Cleanup handled within test (create → delete cycle) |

---

## 10. Roles and Responsibilities

| Role | Responsibility |
|---|---|
| **QA Engineer (Navid Munshi)** | Test planning, test case design, automation, bug reporting |
| **Developer** | Bug fixes, API documentation, environment availability |
