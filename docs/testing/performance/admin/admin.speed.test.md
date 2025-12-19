# admin.speed.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SPEED-ADMIN-001 | Acceptance | Trang `/users` load trong budget (Navigation Timing) | Không | 1. Set `PLAYWRIGHT_SPEED_BUDGET_MS` (mặc định 15000)<br>2. Inject token admin vào `sessionStorage`<br>3. Stub `/api/**` trả 200 để giảm noise<br>4. `goto('/users', waitUntil='load')` và đọc `performance.getEntriesByType('navigation')`<br>5. Assert `loadEventEnd < budgetMs` | `loadEventEnd` nhỏ hơn budget; attach `speed-metrics` vào report | Budget ms, token `'playwright-admin'` | PASS |
| SPEED-ADMIN-002 | Acceptance | Trang `/list` load trong budget (Navigation Timing) | SPEED-ADMIN-001 | 1. Mở `/list` với cùng điều kiện stub API + token<br>2. Đọc navigation timings<br>3. Assert budget | Không vượt budget, không crash khi render list | Budget ms | PASS |
| SPEED-ADMIN-003 | Acceptance | Trang `/orders` load trong budget (Navigation Timing) | SPEED-ADMIN-001 | 1. Mở `/orders` với stub API + token<br>2. Đọc navigation timings<br>3. Assert budget | Không vượt budget, UI render ổn định | Budget ms | PASS |
| SPEED-ADMIN-004 | Acceptance | Budget thấp (5s) vẫn pass trên máy local (guardrail) | SPEED-ADMIN-001 | 1. Set `PLAYWRIGHT_SPEED_BUDGET_MS=5000`<br>2. Chạy lại test `/users` với stub API<br>3. Quan sát kết quả | Nếu máy đủ nhanh, test pass; nếu fail thì là tín hiệu perf regression / env chậm | Budget ms = 5000 | NOT RUN |
