# CodePulse Blog Platform — Playwright Automation Report

## Summary Table

| Metric         | Value   |
| -------------- | ------- |
| Total Tests    | 21      |
| Passed         | 21      |
| Failed         | 0       |
| Skipped        | 0       |
| Pass Rate      | 100.0%  |
| Total Duration | 1m 18s  |

---

## Test Results by Spec File

### `auth.spec.ts` — Authentication

| # | Test Name                                      | Status | Duration |
|---|------------------------------------------------|--------|----------|
| 1 | Valid admin login → dashboard visible           | ✅     | 2.5s     |
| 2 | Valid reader login → home page visible           | ✅     | 3.0s     |
| 3 | Invalid credentials → error message visible      | ✅     | 1.8s     |
| 4 | Logout → login page shown                        | ✅     | 2.7s     |

---

### `posts.spec.ts` — Posts

| # | Test Name                                                    | Status | Duration |
|---|--------------------------------------------------------------|--------|----------|
| 1 | Home page loads post list (at least 1 post visible)          | ✅     | 1.6s     |
| 2 | Click post → detail page opens with title and content        | ✅     | 2.1s     |
| 3 | Search by keyword "Angular" → filtered results shown         | ✅     | 1.5s     |
| 4 | Pagination → page 2 loads different posts                    | ✅     | 501ms    |

---

### `admin.spec.ts` — Admin

| # | Test Name                                                    | Status | Duration |
|---|--------------------------------------------------------------|--------|----------|
| 1 | Login as admin → admin dashboard stats visible               | ✅     | 4.1s     |
| 2 | Create post with unique title → appears in post list         | ✅     | 4.4s     |
| 3 | Soft-delete created post → disappears from public view       | ✅     | 7.7s     |
| 4 | Restore deleted post → reappears in public view              | ✅     | 11.1s    |

---

### `comments.spec.ts` — Comments

| # | Test Name                                                        | Status | Duration |
|---|------------------------------------------------------------------|--------|----------|
| 1 | Login as reader → add comment on first post → comment appears    | ✅     | 5.5s     |
| 2 | Delete own comment → comment removed from list                   | ✅     | 3.5s     |
| 3 | Unauthenticated user → comment submit blocked                    | ✅     | 1.8s     |

---

### `rbac.spec.ts` — Role-Based Access Control

| # | Test Name                                           | Status | Duration |
|---|-----------------------------------------------------|--------|----------|
| 1 | Reader navigates to /admin → redirected or blocked  | ✅     | 3.3s     |
| 2 | Reader cannot see Create Post button                 | ✅     | 2.5s     |
| 3 | Reader cannot access dashboard stats page            | ✅     | 4.0s     |

---

### `api-ui.spec.ts` — API ↔ UI Integration

| # | Test Name                                                         | Status | Duration |
|---|-------------------------------------------------------------------|--------|----------|
| 1 | Create post via API → verify title appears in UI home page        | ✅     | 2.4s     |
| 2 | Delete post via API → verify post removed from UI                 | ✅     | 2.7s     |
| 3 | Create comment via API → verify comment count increases in UI     | ✅     | 5.3s     |

---

## Bug / Failure Details

No failures. All 21 tests passed.

---

## Coverage Summary

| Module      | Tests | Type                                                                 |
| ----------- | ----- | -------------------------------------------------------------------- |
| Auth        | 4     | Admin login, reader login, invalid credentials, logout               |
| Posts       | 4     | Post listing, detail navigation, search filtering, pagination        |
| Admin       | 4     | Dashboard stats, create post, soft-delete, restore                   |
| Comments    | 3     | Add comment, delete own comment, unauthenticated block               |
| RBAC        | 3     | Admin route guard, UI element visibility, API endpoint protection    |
| API + UI    | 3     | API create → UI verify, API delete → UI verify, API comment → UI    |

---

## Tools & Environment

| Property          | Value                                |
| ----------------- | ------------------------------------ |
| Tool              | Playwright 1.60.0 + TypeScript       |
| Browser           | Chromium 148.0.7778.96               |
| Base URL          | https://blog.munshinavid.me          |
| API URL           | https://api.blog.munshinavid.me      |
| Run Date          | 2026-06-14                           |
| Node Version      | v22.19.0                             |
| OS                | Windows                              |
| Workers           | 1 (sequential)                       |
| Headless          | true                                 |
| Reporter          | html, list                           |
| Screenshot Policy | only-on-failure                      |
| Video Policy      | retain-on-failure                    |

---

## Architecture

```
playwright/
├── playwright.config.ts          # Chromium-only config, baseURL, reporters
├── package.json                  # Dependencies & test scripts
├── tsconfig.json                 # TypeScript configuration
├── pages/                        # Page Object Model
│   ├── LoginPage.ts              # Login form, admin/reader login helpers
│   ├── HomePage.ts               # Post list, navbar auth state, search
│   ├── AdminPage.ts              # Dashboard stats, create/delete/restore posts
│   └── PostPage.ts               # Post detail, comment CRUD
└── tests/                        # Test specs
    ├── auth.spec.ts              # 4 authentication tests
    ├── posts.spec.ts             # 4 post browsing tests
    ├── admin.spec.ts             # 4 admin workflow tests
    ├── comments.spec.ts          # 3 comment interaction tests
    ├── rbac.spec.ts              # 3 role-based access tests
    └── api-ui.spec.ts            # 3 API↔UI integration tests
```

---

## Key Highlights

- **API + UI Hybrid Testing**: The `api-ui.spec.ts` suite creates and deletes posts via direct API calls (`page.request`), then verifies the changes are reflected in the live Angular UI — ensuring full-stack consistency.
- **Role-Based Access Control Validation**: RBAC tests register fresh reader accounts, then verify they cannot access admin routes (`/admin/dashboard`), see admin-only UI elements (Create Post, Admin Panel), or call protected API endpoints (`/api/BlogPosts/stats`).
- **Data Isolation via Unique Timestamps**: Every test that creates data uses `Date.now()` in titles and emails (e.g., `Playwright Test 1781387374758`), ensuring complete test independence and idempotency across parallel or repeated runs.
- **No Shared State**: Each test performs its own login via the UI — no `storageState` or shared authentication cookies. Tests are fully self-contained and can run in any order.
- **Full CRUD Lifecycle Coverage**: The admin suite exercises the complete post lifecycle: create → verify in list → soft-delete → verify removed from public → restore → verify reappears publicly.
