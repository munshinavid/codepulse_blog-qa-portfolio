# CodePulse Blog Platform — QA Portfolio

![API Tests](https://img.shields.io/badge/API%20Tests-106%20Passed-brightgreen) ![UI Tests](https://img.shields.io/badge/UI%20Tests-21%20Passed-brightgreen) ![Bugs Found](https://img.shields.io/badge/Bugs%20Found-6-red) ![Tools](https://img.shields.io/badge/Tools-Postman%20%7C%20Newman%20%7C%20Playwright-blue)

A complete QA portfolio for the **CodePulse Blog Platform**, a production-deployed fullstack application built with ASP.NET Core 8 Web API, Angular 19, and PostgreSQL.

This repository demonstrates structured manual testing, automated API testing, UI automation, API+UI hybrid testing, and professional bug reporting — all on a real production system.

**Live Application:** [blog.munshinavid.me](https://blog.munshinavid.me)
**Live API:** [api.blog.munshinavid.me](https://api.blog.munshinavid.me)
**Source Code:** [github.com/munshinavid/blog-platform](https://github.com/munshinavid/blog-platform)

---

## 📁 Repository Contents

```
codepulse-qa-portfolio/
├── .github/
│   └── workflows/
│       ├── api-tests.yml                                  ← Newman CI workflow
│       └── ui-tests.yml                                   ← Playwright CI workflow
│
├── docs/
│   ├── test-plan.md                                       ← Scope, objectives, risk assessment
│   └── test-strategy.md                                   ← Tools, techniques, architecture
│
├── postman/
│   ├── CodePulse_API_Test_Suite.postman_collection.json   ← 79 requests, 112 assertions
│   ├── CodePulse.postman_environment.json                 ← Environment variables
│   └── reports/
│       └── test-report.html                               ← Newman HTML execution report
│
├── playwright/
│   ├── pages/
│   │   ├── LoginPage.ts
│   │   ├── HomePage.ts
│   │   ├── AdminPage.ts
│   │   └── PostPage.ts
│   ├── tests/
│   │   ├── auth.spec.ts
│   │   ├── posts.spec.ts
│   │   ├── admin.spec.ts
│   │   ├── comments.spec.ts
│   │   ├── rbac.spec.ts
│   │   └── api-ui.spec.ts
│   ├── playwright.config.ts
│   └── package.json
│
├── CodePulse_QA_Portfolio.xlsx                            ← 50 TCs + 6 Bug Reports + Summary
├── PLAYWRIGHT_REPORT.md                                   ← Playwright execution report
└── README.md
```

---

## 🏗️ Application Overview

CodePulse is a production-deployed blog platform with the following key features:

- **Authentication:** JWT stored in HttpOnly cookies, ASP.NET Core Identity
- **Authorization:** Role-Based Access Control (Admin / Reader)
- **Blog Posts:** Full CRUD, soft-delete, restore, hard-delete, server-side pagination
- **Comments:** Authenticated commenting with ownership-based deletion
- **Categories:** Full CRUD
- **Images:** File upload pipeline with PostgreSQL metadata storage
- **Deployment:** Docker Compose on Linux VPS with GitHub Actions CI/CD

---

## 🧪 Testing Scope

### API Testing (Postman + Newman)

| Module | Test Cases | Automated Requests |
|---|---|---|
| Auth | 12 | 7 |
| Categories | 7 | 7 |
| Posts | 16 | 12 |
| Images | 2 | 3 |
| Comments | 9 | 8 |
| Authorization & Role Tests | — | 14 |
| Negative & Validation Tests | — | 23 |
| **Total** | **50** | **79** |

### UI Automation (Playwright + TypeScript)

| Spec File | Tests | Coverage |
|---|---|---|
| `auth.spec.ts` | 4 | Login, register, logout, invalid credentials |
| `posts.spec.ts` | 4 | Post listing, detail, search, pagination |
| `admin.spec.ts` | 4 | Dashboard, create, soft-delete, restore |
| `comments.spec.ts` | 3 | Add, delete own, unauthenticated block |
| `rbac.spec.ts` | 3 | Admin route guard, UI visibility, API protection |
| `api-ui.spec.ts` | 3 | API create → UI verify, API delete → UI verify, API comment → UI |
| **Total** | **21** | |

### Test Types

- ✅ Functional Testing
- ✅ Negative Testing
- ✅ Boundary Value Testing
- ✅ Security / Authorization Testing
- ✅ API Contract Testing
- ✅ UI End-to-End Testing
- ✅ API + UI Hybrid Testing
- ✅ Regression Testing (via GitHub Actions CI)

---

## 🔧 Tools Used

| Tool | Purpose |
|---|---|
| **Postman** | API request building, manual test execution |
| **Newman** | CLI-based automated API collection runner |
| **newman-reporter-htmlextra** | HTML test execution report generation |
| **Playwright 1.60.0** | UI & E2E automation (TypeScript) |
| **GitHub Actions** | CI/CD — auto-run Newman + Playwright on every push to main |
| **Excel / openpyxl** | Test case documentation and bug reporting |

---

## ⚙️ CI/CD (GitHub Actions)

Both test suites run automatically on every push to `main` and can be triggered manually via the Actions tab.

| Workflow | File | Trigger | Report |
|---|---|---|---|
| API Tests (Newman) | `.github/workflows/api-tests.yml` | push to main / manual | HTML artifact |
| UI Tests (Playwright) | `.github/workflows/ui-tests.yml` | push to main / manual | HTML artifact |

> Reports are available as downloadable artifacts under the **Actions** tab after each run (retained 30 days).

---

## ▶️ Running Locally

### API Tests (Newman)

```bash
npm install -g newman newman-reporter-htmlextra

newman run postman/CodePulse_API_Test_Suite.postman_collection.json \
  --env-var "base_url=https://api.blog.munshinavid.me" \
  --delay-request 200 \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export ./postman/reports/test-report.html
```

> **Note:** Run requests in top-to-bottom order. Some requests depend on variables (e.g., `{{post_id}}`, `{{category_id}}`) set by earlier requests.

### UI Tests (Playwright)

```bash
cd playwright
npm install
npx playwright install chromium

# Run all tests
npx playwright test

# Run with HTML report
npx playwright test --reporter=html
npx playwright show-report

# Run specific spec
npx playwright test tests/api-ui.spec.ts
```

---

## 📊 Test Execution Results

### API Tests (Newman)

| Metric | Result |
|---|---|
| Total Requests | 79 |
| Total Assertions | 112 |
| Passed | 106 |
| Failed | 6 (confirmed bugs) |
| Pass Rate | 94.6% |
| Avg Response Time | 104ms |
| Run Duration | 31.2s |

### UI Tests (Playwright)

| Metric | Result |
|---|---|
| Total Tests | 21 |
| Passed | 21 |
| Failed | 0 |
| Pass Rate | 100% |
| Run Duration | 1m 18s |
| Browser | Chromium 148.0.7778.96 |

---

## 🐛 Bugs Found

| Bug ID | Title | Severity | Status |
|---|---|---|---|
| BUG-001 | `GET /me` accessible without authentication | High | Open |
| BUG-002 | `POST /Comments` allows unauthenticated comment creation | High | Open |
| BUG-003 | Tampered JWT token accepted by `/me` endpoint | Critical | Open |
| BUG-004 | Reader can delete comments belonging to other users | High | Open |
| BUG-005 | Missing `BlogPostId` in comment body returns 500 instead of 400 | Medium | Open |
| BUG-006 | `GET /BlogPosts/{id}` returns 500 instead of 404 for missing post | Low | Open |

Full bug reports with steps to reproduce, expected vs actual results, and Newman evidence are in `CodePulse_QA_Portfolio.xlsx` → **Bug Reports** sheet.

---

## 🔐 Authentication Model

This API uses **JWT stored in HttpOnly cookies** — not the `Authorization: Bearer` header.

```
POST /api/Auth/login
→ Set-Cookie: jwtToken=<token>; HttpOnly; Secure; SameSite=None
```

The Postman collection handles this via:
1. **Cookie jar** (automatic in Postman desktop app)
2. **Fallback `Cookie` header** — test scripts extract token from `Set-Cookie` and store as collection variable

The Playwright suite handles this via:
- UI-based login in each test (no shared storageState)
- Cookies automatically managed by Playwright's browser context

---

## 📋 Documentation

| Document | Location | Description |
|---|---|---|
| Test Plan | `docs/test-plan.md` | Scope, objectives, environment, risk assessment |
| Test Strategy | `docs/test-strategy.md` | Tools, techniques, POM architecture, CI model |
| Test Cases | `CodePulse_QA_Portfolio.xlsx` → Sheet 2 | 50 structured test cases |
| Bug Reports | `CodePulse_QA_Portfolio.xlsx` → Sheet 1 | 6 bugs with full reproduction steps |
| Summary Dashboard | `CodePulse_QA_Portfolio.xlsx` → Sheet 3 | Metrics and bug summary |
| Playwright Report | `PLAYWRIGHT_REPORT.md` | Full UI test execution results |

---

## 👤 Author

**Md Navid Munshi**
CSE Graduate — American International University Bangladesh (AIUB) | CGPA 3.80/4.00
Backend Developer & QA Tester

- 📧 navidmunshi24@gmail.com
- 🔗 [linkedin.com/in/munshinavid](https://linkedin.com/in/munshinavid)
- 💻 [github.com/munshinavid](https://github.com/munshinavid)
