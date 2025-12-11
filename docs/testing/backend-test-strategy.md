# Backend Test Strategy

## Goals
- Provide layered confidence for all critical backend flows (Auth, Orders, Foods, Carts, Payments) using primarily Jest so engineers have a single runner + report style.
- Ensure every deployment passes through the following disciplines: **Unit**, **System**, **Integration**, **Database**, **API**, **Regression**, and **Stress** testing. (Contract suites were retired in favor of richer API coverage.)
- Keep the strategy automation-first and CI-friendly, with fixtures/utilities that make tests deterministic.

## Environment & Tooling
- **Runtime**: Node.js 20 LTS.
- **Test runner**: Jest (with `ts-jest` if/when modules migrate to TypeScript).
- **HTTP client**: `supertest` for black-box calls into Express server.
- **Database**: `mongodb-memory-server` for fast, isolated MongoDB instances during all Jest suites.
- **Mocking**: Jest module mocks + manual adapters (Stripe, Drone service, Notification bus) so we can isolate external dependencies.
- **Stress tool**: `k6` (standalone). Jest is not ideal for high-concurrency benchmarking, so stress remains a separate CLI script but still documented under the same strategy.

## Directory Layout (current)
```
backend/
  testing/
    unit/
      modules/
        orders/
        foods/
        users/
    system/
      orders.system.test.js
      foods.system.test.js
      users.system.test.js
    integration/
      orderService.integration.test.js
      userService.integration.test.js
    database/
      orderModel.database.test.js
      foodModel.database.test.js
      userModel.database.test.js
    api/
      orders.api.test.js
      users.api.test.js
    regression/
      orders.regression.test.js
      foods.regression.test.js
    fixtures/
      db.js                 # spin up in-memory Mongo, seed helpers
      app.js                # start/stop Express app for tests
      dataFactory.js        # builders for users, restaurants, orders
  testing/stress/
    k6-orders.js           # load profile for place-order endpoint
    run-stress.js          # orchestrates local/Docker k6 execution
```

## Test Disciplines

### 1. System Tests
- **Scope**: full HTTP stack + real DB (in-memory Mongo). No mocks unless hitting third-party networks.
- **Examples**:
-  - Customer registers → logs in → sees available foods via `/api/food/list`.
-  - Admin health check for `/` endpoint.
- **Execution**: `npm run test:system` → `cross-env NODE_ENV=test node --experimental-vm-modules node_modules/jest/bin/jest.js --config=testing/config/jest.system.config.cjs`.
- **Fixtures**: start Express server once per suite; use data factories to pre-seed restaurants/drone fleets.

### 2. Integration Tests
- **Scope**: specific modules/services and their collaborators, but not the entire HTTP layer.
- **Examples**:
-  - `placeOrderService` orchestrating repositories + Stripe adapter stub.
-  - `registerService` hashing passwords and issuing JWT tokens.
- **Execution**: `npm run test:integration` (`testing/config/jest.integration.config.cjs`).
- **Mocks**: Replace adapters (Stripe, email, SMS) with Jest mocks to focus on service orchestration.

### 3. Database Tests
- **Scope**: schemas, hooks, aggregation pipelines, TTL indexes (e.g., transient notifications).
- **Examples**:
  - Validating order defaults (`status`, `payment`).
  - Ensuring food + user models set availability/cart defaults.
- **Execution**: `npm run test:db` (`testing/config/jest.database.config.cjs`).
- **Fixtures**: Reuse `mongodb-memory-server`; load sample JSON (from `backend/config/fast-food.*.json`).

### 4. API Tests
- **Scope**: Each REST endpoint’s behavior (status codes, auth guards, payload validation) with minimal business flow.
- **Examples**:
  - `POST /api/user/login` happy path + auth role coverage.
  - `GET /api/food/list` verifying that DB entries flow to responses.
- **Execution**: `npm run test:api` (`testing/config/jest.api.config.cjs`).

### 5. Regression Tests
- **Scope**: Cross-module flows covering the highest-risk business logic (e.g., order placement + stock handling, food inventory provisioning).
- **Examples**:
  - Placing an order reserves stock, clears carts, and persists checkout sessions.
  - Creating inventory items through the admin service exposes them via the list service.
- **Execution**: `npm run test:regression` (`testing/config/jest.regression.config.cjs`).

### 6. Security Tests
- **Scope**: Attack-inspired scenarios that ensure authentication/authorization layers and sensitive endpoints reject tampering (e.g., invalid JWTs, privilege escalation, NoSQL operator payloads).
- **Examples**:
  - Regular users attempting to patch `/api/order/status` and failing with no data mutation.
  - Requests supplying malformed or forged tokens being denied before reaching business logic.
  - Missing-token access to privileged listings returning authorization errors instead of silent success.
- **Execution**: `npm run test:security` (`testing/config/jest.security.config.cjs`).
- **Tooling**: Real Express app via Supertest + in-memory Mongo, so tests exercise full middleware stack without external dependencies.

### 7. Stress Tests (k6)
- **Scope**: concurrency, throughput, and latency validation for hotspots (place order, list orders, login).
- **Tool**: `k6` scripts stored under `backend/testing/stress/`.
- **Execution**: `npm run test:stress` → `node testing/stress/run-stress.js` (attempts local `k6` binary, then Docker fallback `grafana/k6`).
- **Reporting**: Export summary JSON so CI can upload results; optionally pipe to InfluxDB/Grafana for trend analysis.

## NPM Scripts (backend/package.json)
```
{
  "scripts": {
    "test:unit": "node --experimental-vm-modules node_modules/jest/bin/jest.js --config=testing/config/jest.unit.config.cjs",
    "test:system": "cross-env NODE_ENV=test node --experimental-vm-modules node_modules/jest/bin/jest.js --config=testing/config/jest.system.config.cjs",
    "test:integration": "cross-env NODE_ENV=test node --experimental-vm-modules node_modules/jest/bin/jest.js --config=testing/config/jest.integration.config.cjs",
    "test:db": "cross-env NODE_ENV=test node --experimental-vm-modules node_modules/jest/bin/jest.js --config=testing/config/jest.database.config.cjs",
    "test:api": "cross-env NODE_ENV=test node --experimental-vm-modules node_modules/jest/bin/jest.js --config=testing/config/jest.api.config.cjs",
    "test:regression": "cross-env NODE_ENV=test node --experimental-vm-modules node_modules/jest/bin/jest.js --config=testing/config/jest.regression.config.cjs",
    "test:security": "cross-env NODE_ENV=test node --experimental-vm-modules node_modules/jest/bin/jest.js --config=testing/config/jest.security.config.cjs",
    "test:stress": "node testing/stress/run-stress.js"
  }
}
```

## CI Strategy
- **Primary pipeline**: run `npm run lint && npm run test:db && npm run test:integration && npm run test:api` on every PR.
- **Nightly pipeline**: run `test:system` and `test:stress` (longer duration). Upload coverage + k6 summary.
- Gate merges on the fast suites (db + integration + api). System/stress runs inform but don’t block daily PRs unless failure rate spikes.

## Data & Seeding
- Implement `testing/fixtures/db.js` with helpers:
  - `connectInMemoryMongo()` / `disconnectMongo()`
  - `seedRestaurants(count)` / `seedUsers({ role })` / `seedOrders({ status })`
- Use factory functions to build consistent documents (reduces fixture duplication).
- Provide `resetDatabase()` exposed via test-only endpoint for system tests run via HTTP.

## Rollout Steps
1. Add `tests/fixtures` utilities (Mongo harness, Express bootstrap, data builders).
2. Migrate existing Jest tests into the new folder structure and configs.
3. Author initial suites per discipline (e.g., `orders.system.test.js`, `orders.api.test.js`).
4. Update `package.json` scripts and `.github/workflows/node.js.yml` to run the new commands.
5. Introduce k6 scripts and optional Docker image for stress testing.
6. Document how to run each suite locally (`docs/testing/backend-test-strategy.md` + README snippet).
