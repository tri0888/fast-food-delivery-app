# stress.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| STRESS-001 | System | Baseline load: GET `/api/food/list` dưới ngưỡng error rate và p95 | Không | 1. Start backend (hoặc để runner tự boot ephemeral)<br>2. Chạy `npm run test:stress --prefix backend`<br>3. Quan sát summary k6 (http_req_failed, p95) | `http_req_failed < 5%` và `p(95) < 500ms` theo thresholds trong k6 script | `API_BASE_URL` (default `http://localhost:4000`) | PASS |
