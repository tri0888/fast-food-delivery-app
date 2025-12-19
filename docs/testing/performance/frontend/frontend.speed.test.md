# frontend.speed.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SPEED-FE-001 | Acceptance | Homepage `/` load trong budget (Navigation Timing) | Không | 1. Set `PLAYWRIGHT_SPEED_BUDGET_MS` (default 15000)<br>2. Stub `GET /api/food/list`, `GET /api/cart/get`, và `/images/**` để giảm noise<br>3. `goto('/', waitUntil='load')` và lấy `performance.getEntriesByType('navigation')`<br>4. Assert `loadEventEnd < budgetMs` và attach metrics | `loadEventEnd` < budget; timings > 0; report có `speed-metrics` | Budget ms | PASS |
| SPEED-FE-002 | Acceptance | Trang `/cart` load trong budget (Navigation Timing) | SPEED-FE-001 | 1. Stub `GET /api/cart/get` trả cart rỗng<br>2. `goto('/cart', waitUntil='load')`<br>3. Assert budget | `/cart` render ổn và không vượt budget | Budget ms | PASS |
| SPEED-FE-003 | Acceptance | Budget thấp (5s) vẫn pass trên máy local (guardrail) | SPEED-FE-001 | 1. Set `PLAYWRIGHT_SPEED_BUDGET_MS=5000`<br>2. Chạy lại test homepage với stub API<br>3. Quan sát kết quả | Nếu fail -> cảnh báo perf regression hoặc env quá chậm | Budget ms = 5000 | NOT RUN |
