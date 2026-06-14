# Test Strategy — CodePulse Blog Platform

**Document Version:** 1.0
**Date:** June 2026
**Author:** Md Navid Munshi
**Project:** CodePulse Blog Platform

---

## 1. Overview

This document defines the overall testing strategy for the CodePulse Blog Platform — covering the testing approach, tool selection rationale, automation architecture, test design techniques, and CI/CD integration model.

The strategy is designed to achieve maximum coverage of a production-deployed ASP.NET Core + Angular application using a layered testing approach: structured manual test cases → automated API testing → automated UI testing → API+UI hybrid integration testing.

---

## 2. Testing Approach

### 2.1 Layered Testing Model

```
Layer 4 │ API + UI Hybrid Tests (api-ui.spec.ts)
        │  → Create via API, verify in UI; delete via API, verify removed
────────┼──────────────────────────────────────────────────
Layer 3 │ UI Automation (Playwright)
        │  → End-to-end user flows in real browser (Chromium)
────────┼──────────────────────────────────────────────────
Layer 2 │ API Automation (Newman)
        │  → All endpoints, auth flows, validation rules, RBAC
────────┼──────────────────────────────────────────────────
Layer 1 │ Manual Test Cases (Excel)
        │  → Structured test case document with expected vs actual
```

Each layer builds on the one below it. API tests validate backend correctness; UI tests validate user-facing behavior; hybrid tests validate full-stack consistency.

### 2.2 Testing Types

| Type | Tool | Purpose |
|---|---|---|
| **Functional Testing** | Postman, Playwright | Verify features work as expected |
| **Negative Testing** | Postman (Newman) | Validate rejection of invalid inputs |
| **Boundary Testing** | Postman (Newman) | Test limits — pagination max, empty bodies, zero GUIDs |
| **Security Testing** | Postman (Newman) | Unauthenticated access, tampered tokens, cross-user actions |
| **API Contract Testing** | Postman (Newman) | Verify response schemas, status codes, field presence |
| **UI E2E Testing** | Playwright | Verify complete user flows in browser |
| **Regression Testing** | Newman + Playwright via CI | Auto-run on every push to main |

---

## 3. Tool Selection Rationale

### 3.1 Postman + Newman

**Why Postman:**
- Industry-standard API testing tool
- Supports `pm.test()` JavaScript assertions
- Cookie jar handles HttpOnly JWT cookies automatically
- Collection variables enable chained requests (login → save token → use in next request)
- Swagger/OpenAPI comparison available for contract validation

**Why Newman (CLI runner):**
- Enables headless execution in CI/CD pipelines
- `newman-reporter-htmlextra` generates rich HTML reports with request/response details
- `--suppress-exit-code` allows pipeline to continue even when known bugs cause assertion failures

### 3.2 Playwright + TypeScript

**Why Playwright over Selenium:**
- Built-in auto-wait eliminates flaky tests from timing issues
- TypeScript support is first-class (same language as Angular frontend)
- `page.request` API enables direct API calls within UI tests (used in api-ui.spec.ts)
- HTML reporter generates visual reports with screenshots and traces on failure
- Faster execution than Selenium WebDriver
- Growing industry adoption — more relevant for modern QA roles

**Why TypeScript:**
- Already familiar from Angular development
- Type safety reduces selector errors and test maintenance cost
- Better IDE support and autocomplete for page objects

---

## 4. Test Design Techniques

### 4.1 Equivalence Partitioning
Input fields are divided into valid and invalid partitions:
- **Valid partition:** correct email format, password ≥ 6 chars, non-empty required fields
- **Invalid partition:** empty fields, wrong types, duplicate values, non-existent IDs

### 4.2 Boundary Value Analysis
- Pagination: page=1 (first), last page, page beyond total (empty results)
- Password: 5 chars (fail), 6 chars (pass)
- GUID: valid GUID (pass), all-zero GUID (not found), non-GUID string (400/404)

### 4.3 Decision Table Testing (RBAC)
All combinations of role × endpoint × HTTP method tested:

| Role | Endpoint | Method | Expected |
|---|---|---|---|
| Admin | /api/BlogPosts | POST | 200 |
| Reader | /api/BlogPosts | POST | 403 |
| No Auth | /api/BlogPosts | POST | 403 |
| Admin | /api/BlogPosts/stats | GET | 200 |
| Reader | /api/BlogPosts/stats | GET | 403 |
| Admin | /api/Comments | POST | 200 |
| Reader | /api/Comments | POST | 200 |
| No Auth | /api/Comments | POST | 401 (BUG: returns 200) |

### 4.4 Error Guessing
Based on code review of the application, targeted tests for:
- GlobalExceptionHandler behavior (throws generic `Exception` → returns 500 instead of 404)
- Missing `[Authorize]` attribute on `/api/Auth/me` and `/api/Comments`
- Missing ownership check in comment deletion logic

---

## 5. Automation Architecture

### 5.1 Page Object Model (Playwright)

All UI interactions are encapsulated in page classes:

```
playwright/pages/
├── LoginPage.ts     → login(), loginAsAdmin(), loginAsReader()
├── HomePage.ts      → getPostList(), search(), clickPost(), isLoggedIn()
├── AdminPage.ts     → createPost(), softDelete(), restore(), getStats()
└── PostPage.ts      → addComment(), deleteComment(), getCommentList()
```

Benefits:
- Single point of change when selectors change
- Tests read as plain English business logic
- Reusable login helpers reduce duplication

### 5.2 Data Isolation

Every test that creates data uses `Date.now()` for uniqueness:

```typescript
const title = `Playwright Test ${Date.now()}`;
const email = `reader_${Date.now()}@munshinavid.me`;
```

This ensures:
- No test depends on data from another test
- Tests can run in any order
- Repeated CI runs do not pollute the database with duplicate entries
- No shared `storageState` — each test performs its own login

### 5.3 API + UI Hybrid Testing

`api-ui.spec.ts` uses Playwright's built-in `page.request` for direct API calls:

```typescript
// Create via API
const response = await page.request.post('/api/BlogPosts', { data: postData });
const postId = (await response.json()).id;

// Verify in UI
await page.goto('/');
await expect(page.getByText(title)).toBeVisible();
```

This pattern validates full-stack consistency — the API and UI are tested as an integrated system.

---

## 6. CI/CD Integration

### 6.1 Workflow Triggers

Both workflows trigger on:
- `push` to `main` branch
- Manual `workflow_dispatch` (run button in GitHub Actions UI)

### 6.2 Newman Workflow

```
Checkout → Setup Node → Install Newman → Run Collection → Upload HTML Report
```

`--suppress-exit-code` is used because 6 known API bugs cause assertion failures. The workflow must remain green to demonstrate CI integration; bugs are documented separately in the bug report.

### 6.3 Playwright Workflow

```
Checkout → Setup Node → npm install → Install Chromium → Run Tests → Upload Report
```

All 21 tests pass — no suppression needed.

### 6.4 Artifacts

Both workflows upload HTML reports as GitHub Actions artifacts (retained 30 days), downloadable from the Actions tab after each run.

---

## 7. Bug Reporting Process

When a defect is found during test execution:

1. **Reproduce** — confirm the bug is reproducible at least 2 times
2. **Isolate** — identify the specific endpoint, input, or UI action that triggers it
3. **Document** — record in `CodePulse_QA_Portfolio.xlsx` → Bug Reports sheet with:
   - Bug ID, Title, Module, Endpoint, HTTP Method
   - Steps to Reproduce (numbered, minimal)
   - Expected Result vs Actual Result
   - Severity and Priority
   - Evidence (Newman assertion error, screenshot, or curl output)
4. **Classify severity:**

| Severity | Criteria |
|---|---|
| **Critical** | Security vulnerability — authentication/authorization bypass |
| **High** | Core feature broken, data integrity risk |
| **Medium** | Incorrect error handling, wrong status codes |
| **Low** | Minor deviation from REST conventions |

---

## 8. Metrics and Reporting

| Metric | Target | Actual |
|---|---|---|
| API Test Pass Rate | > 90% | 94.6% (106/112 assertions) |
| UI Test Pass Rate | 100% | 100% (21/21 tests) |
| Bug Detection | ≥ 3 bugs | 6 bugs found |
| Critical Bugs | Documented | 1 Critical (BUG-003) |
| Test Coverage | All major modules | Auth, Posts, Categories, Comments, Images, RBAC |

---

## 9. Definition of Done

A feature is considered **tested and done** when:
- At least one positive test case passes
- At least one negative test case is executed
- Any RBAC restriction is validated for both allowed and denied roles
- All discovered bugs are documented with reproduction steps
- Automated tests (Newman + Playwright) cover the feature and pass (or failures are documented as bugs)
