# Local Miniapp Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the WeChat miniapp and Spring Boot backend reliable for local-only development and demonstrations.

**Architecture:** Keep the main local runtime centered on `chuanzhifron` and `chuanzhiback/demo`. Add a small root-level smoke script for repeatable backend verification, keep local miniapp configuration test-covered, and document the next implementation phases before deeper feature work.

**Tech Stack:** WeChat miniapp JavaScript, Jest, Spring Boot, Maven wrapper, MySQL, Redis, Bash, curl.

---

### Task 1: Guard Local Runtime Defaults

**Files:**
- Create: `chuanzhifron/__tests__/local-runtime-config.test.js`
- Modify: none
- Test: `chuanzhifron/__tests__/local-runtime-config.test.js`

- [x] **Step 1: Write the local runtime configuration test**

```js
const env = require('../utils/env.js')
const config = require('../utils/config.js')

describe('local runtime config', () => {
  test('development defaults use the local backend without mock data', () => {
    expect(env.APP_ENV).toBe('development')
    expect(env.useMockApi()).toBe(false)
    expect(config.getBaseUrl()).toBe('http://localhost:8001')
    expect(config.buildApiUrl('/home/debug-info')).toBe('http://localhost:8001/api/home/debug-info')
  })
})
```

- [x] **Step 2: Run the focused test**

Run:

```bash
cd chuanzhifron
npm test -- --runTestsByPath __tests__/local-runtime-config.test.js
```

Expected: PASS while current defaults stay suitable for local development.

### Task 2: Add Local Backend Smoke Check

**Files:**
- Create: `scripts/local-smoke.sh`
- Modify: `chuanzhifron/package.json`
- Test: `scripts/local-smoke.sh`

- [x] **Step 1: Create the smoke script**

```bash
#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8001}"

check_get() {
  local path="$1"
  local label="$2"
  local url="${BASE_URL}${path}"

  printf 'checking %-28s %s\n' "${label}" "${url}"
  curl --fail --silent --show-error --max-time 8 "${url}" >/dev/null
}

check_get "/actuator/health" "backend health"
check_get "/api/home/debug-info" "home debug"
check_get "/api/home/data" "home data"
check_get "/api/news/recent" "recent news"
check_get "/api/heritage/recommended" "recommended heritage"
check_get "/api/banners" "banners"
check_get "/api/ar/projects" "ar projects"

printf 'local smoke passed for %s\n' "${BASE_URL}"
```

- [x] **Step 2: Make the script executable**

Run:

```bash
chmod +x scripts/local-smoke.sh
```

- [x] **Step 3: Add an npm wrapper**

Update `chuanzhifron/package.json` scripts:

```json
"smoke:local": "../scripts/local-smoke.sh"
```

- [x] **Step 4: Verify the command path**

Run while backend is not started:

```bash
cd chuanzhifron
npm run smoke:local
```

Expected in the current environment: command starts and fails with curl connection refused on `localhost:8001`, proving the wrapper resolves the root smoke script and the backend is not running.

### Task 3: Document the Local-Only Improvement Path

**Files:**
- Create: `doc/internal/local-dev/本地小程序完善计划.md`
- Modify: none
- Test: manual review

- [x] **Step 1: Write the local development plan**

The document must cover:

- Project boundaries: `chuanzhifron`, `chuanzhiback/demo`, optional `chuanzhiback/ruoyi-admin`
- Local startup steps
- Local smoke commands
- Demonstration seed data requirements
- Miniapp main workflow priorities
- Backend API contract priorities
- Quality checks

- [x] **Step 2: Review for placeholders**

Run:

```bash
rg -n 'T''BD|TO''DO|implement lat''er|fill i''n' doc/internal/local-dev/本地小程序完善计划.md
```

Expected: no matches.

### Task 4: Next Functional Pass

**Files:**
- Modify after approval: miniapp page files under `chuanzhifron/pages/*`
- Modify after approval: backend controllers/services under `chuanzhiback/demo/src/main/java/com/example/demo/*`
- Test after approval: focused Jest tests, Maven tests, and `scripts/local-smoke.sh`

- [ ] **Step 1: Choose the first business chain**

Recommended first chain:

```text
login/register -> home -> heritage detail -> collection -> personal center collection summary
```

- [ ] **Step 2: Write focused tests before behavior changes**

For miniapp utilities and page-state helpers, add Jest tests under `chuanzhifron/__tests__/`.

For backend controller/service behavior, add Spring Boot tests under `chuanzhiback/demo/src/test/java/com/example/demo/`.

- [ ] **Step 3: Implement the selected chain**

Use existing request helpers:

```js
const { request } = require('../../utils/util.js')
const { buildStaticUrl } = require('../../utils/config.js')
```

Keep all API calls under `/api` and avoid page-level `localhost` hardcoding.

- [ ] **Step 4: Verify**

Run:

```bash
cd chuanzhifron
npm test
npm run lint
```

Run:

```bash
cd chuanzhiback/demo
./mvnw test
```

With backend running, run:

```bash
./scripts/local-smoke.sh
```

Expected: all checks pass.
