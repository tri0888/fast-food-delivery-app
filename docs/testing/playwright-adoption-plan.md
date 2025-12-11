# Playwright Adoption Plan

## Objectives
- Gain full end-to-end UI confidence for both customer (frontend) and admin apps.
- Cover the most business-critical flows: browsing and placing orders, tracking drones, and managing orders/revenue in the admin portal.
- Integrate with CI for automated regression runs and artifact capture (HTML report, traces, screenshots).

## Folder & Config Layout
```
frontend/
  e2e/
    playwright.config.ts         # global config shared by all specs
    fixtures/
      auth.fixture.ts            # login helpers, session state reuse
      data.fixture.ts            # reusable builders + DB seeding helpers
      api.fixture.ts             # REST helpers for pre-conditioning tests
    pages/
      HomePage.ts
      CartPage.ts
      CheckoutPage.ts
      MyOrdersPage.ts
      AdminOrdersPage.ts
      LoginModal.ts
    specs/
      customer/
        checkout.spec.ts
        tracking-notifications.spec.ts
        auth.spec.ts
      admin/
        orders-filters.spec.ts
        drone-dispatch.spec.ts
        auth.spec.ts
```

### Config highlights (`e2e/playwright.config.ts`)
- `testDir: './e2e/specs'` with per-project browsers (Chromium, Firefox, WebKit).
- Global setup script seeds DB via backend test endpoint (`npm run resetdb` or dedicated REST call) and produces baseline data.
- `use.baseURL` points to the frontend dev server (or preview URL in CI).
- Enable `trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`.
- Default retries = 1 locally, 2 on CI; shard-friendly for scaling suites.

### Shared Fixtures
- **auth.fixture.ts**
  - Provides `customerContext` and `adminContext` fixtures that log in via UI once, persist storage state (`.auth/customer.json`, `.auth/admin.json`).
  - Supports parameterized roles (admin vs superadmin) using seeded credentials.
- **data.fixture.ts**
  - Helper to call backend factories (via REST or direct Mongo connection) to create restaurants, foods, carts, or orders required per spec.
  - Offers `withOrder` helper that seeds an order and tears it down automatically.
- **api.fixture.ts**
  - Lightweight HTTP client (Axios/fetch) using env-configured base URLs for cross-app setup (reset DB, seed drones, etc.).

### Page Objects
Each page object exposes semantic actions/assertions:
- `HomePage.addFoodToCart(foodName)`
- `CartPage.checkout()`
- `CheckoutPage.fillAddress(formData)`
- `MyOrdersPage.expectDroneProgressToast(step)`
- `AdminOrdersPage.applyMonthFilter(monthKey)`
- `AdminOrdersPage.expectRevenue(total)`

This keeps specs succinct, encourages reuse, and mirrors "enterprise" Playwright patterns.

## Targeted UI Flows
1. **Customer purchase**: browse menu → add to cart → checkout → verify order summary & payment status.
2. **Order tracking**: open "My Orders", expand tracking, and observe 1/3 & 2/3 notifications plus map updates.
3. **Authentication**: login/register + error handling for both portals.
4. **Admin orders dashboard**:
   - Month filter updates list + revenue cards.
   - Restaurant filter shown only for superadmin.
   - Purchase date rendered; totals accurate.
   - Superadmin view-only vs admin update rights (status dropdown disabled).
5. **Drone dispatch flow**: admin selects idle drone, confirms status change, ensures notification toasts appear.
6. **Regression smoke**: ensure nav, footer, and high-level routes remain accessible (fast gating suite).

## Tooling & Scripts
Add to `frontend/package.json`:
```json
{
  "scripts": {
    "test:ui": "playwright test --config=e2e/playwright.config.ts",
    "test:ui:headed": "playwright test --headed --config=e2e/playwright.config.ts",
    "test:ui:report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0"
  }
}
```

Optional helper scripts:
- `npm run test:ui:smoke` → tag-based run for checkout + admin filters.
- `npm run test:ui:ci` → `playwright test --reporter=line --config=e2e/playwright.config.ts` (used in CI).

## CI Integration
1. Extend `.github/workflows/node.js.yml` with a "frontend-ui-tests" job:
   - `runs-on: ubuntu-latest`.
   - Steps: checkout, `npm ci`, `npm run build`, `npx playwright install --with-deps`, `npm run test:ui -- --reporter=line`.
   - Upload artifacts: `playwright-report`, `test-results`, traces.
2. Optional nightly workflow triggers Playwright with retries and Slack/Teams notification on failure.

## Test Data & Environment
- Provide env vars via `.env.playwright` (API base URL, admin credentials, Stripe test keys, etc.).
- Use `npm run resetdb` before suites to ensure clean data.
- For CI, stand up backend/admin servers via docker-compose or start scripts before running tests.

## Rollout Steps
1. Install dependencies + scaffold directories/files as shown.
2. Implement global setup (DB reset, seeding base dataset, storage state capture).
3. Build first smoke suites (customer checkout + admin month filter) to validate wiring.
4. Expand coverage iteratively, tagging specs by feature to allow focused runs.
5. Monitor flake rate; add retries and diagnostics where needed.
