# Security Defect List

> Purpose: Track defects found by **security tests** (`backend/testing/security`).

## Defect log

| Defect ID | Defect Description & Steps to reproduce | Actual Result | Expected Result | Priority | Serverity | Testcase ID |
|---|---|---|---|---|---|---|
| #1 | **[Food] XSS script tag không bị chặn khi add food**<br><br>1. Admin token<br>2. `POST /api/food/add` với `description` chứa `<script>alert(1)</script>`<br>3. Quan sát status/body | Test FAIL: API không trả `400` và/hoặc vẫn tạo món với payload độc hại. | API trả `400` và từ chối script, không tạo món. | High | Fatal | `SEC_FOOD_SEC_01` |
| #2 | **[Food] Không sanitize payload, lưu onerror vào DB**<br><br>1. Admin token<br>2. `POST /api/food/add` với `<img src=x onerror="alert(1)">`<br>3. Query DB đọc lại `description` | Test FAIL: Dữ liệu lưu trong DB vẫn chứa `onerror`/nội dung không sanitize. | DB chỉ lưu nội dung đã loại bỏ `<script>`/`onerror`. | High | Fatal | `SEC_FOOD_SEC_02` |
| #3 | **[Orders] IDOR: override body userId để xem orders người khác**<br><br>1. Login User A<br>2. `POST /api/order/userorders` nhưng set `userId` = User B<br>3. Kiểm tra response | Test FAIL: API không chặn đúng và có nguy cơ lộ dữ liệu nạn nhân. | API trả `403 Forbidden` và không trả dữ liệu của User B. | High | Fatal | `SEC_ORDE_SEC_01` |
| #4 | **[Orders] IDOR: query orderId của người khác trong /api/order/list**<br><br>1. Login User A<br>2. `GET /api/order/list?orderId=<order của B>`<br>3. Kiểm tra response | Test FAIL: API không từ chối đúng và có nguy cơ lộ dữ liệu. | API trả `403 Forbidden`, không lộ dữ liệu. | High | Fatal | `SEC_ORDE_SEC_02` |
| #5 | **[Auth] Brute force login không lockout sau 10 lần**<br><br>1. Chọn user hợp lệ<br>2. Gửi 10 request login password sai<br>3. Quan sát response thứ 10 | Test FAIL: Không trả `429`/không lockout theo yêu cầu. | Hệ thống trả `429` hoặc trigger lockout. | High | Serious | `SEC_USER_SEC_02` |
| #6 | **[AuthZ] Admin endpoint không yêu cầu token**<br><br>1. `GET /api/user/list` không gửi header `token`<br>2. Quan sát status/body | Test FAIL: Không trả `401 Unauthorized` như kỳ vọng. | API trả `401 Unauthorized`. | High | Fatal | `SEC_USER_SEC_03` |
| #7 | **[JWT] Chấp nhận token forged với `alg: none`**<br><br>1. Tạo token header `{ alg:'none' }` + payload hợp lệ<br>2. Gọi `/api/user/list` với token giả<br>3. Quan sát status | Test FAIL: Middleware không từ chối token giả mạo. | Middleware từ chối với `401`. | High | Fatal | `SEC_USER_SEC_04` |
| #8 | **[AuthZ] User role truy cập được admin API /api/user/list**<br><br>1. Login user thường<br>2. Gọi `/api/user/list`<br>3. Quan sát response | Test FAIL: API không trả `403 Forbidden` như kỳ vọng. | API trả `403 Forbidden`. | High | Fatal | `SEC_USER_SEC_05` |
| #9 | **[Auth] Brute force (case lặp) vẫn không lockout**<br><br>1. Lặp lại flow brute force (user khác/hoặc sau reset)<br>2. Theo dõi phản hồi khóa account | Test FAIL: Không khóa sau 10 lần như yêu cầu. | Vẫn phải khóa sau 10 lần. | Medium | Serious | `SEC_USER_SEC_07` |
| #10 | **[AuthZ] Missing token (case lặp) không trả 401**<br><br>1. Lặp lại case không gửi token cho `/api/user/list`<br>2. Quan sát status | Test FAIL: Kết quả không nhất quán, không trả `401`. | Luôn trả `401`. | Medium | Serious | `SEC_USER_SEC_08` |
| #11 | **[JWT] none-alg (case lặp) không bị chặn**<br><br>1. Lặp lại forged token `alg:none` với token khác<br>2. Gọi `/api/user/list`<br>3. So sánh phản hồi | Test FAIL: Không đảm bảo luôn từ chối forged token. | Luôn trả `401`. | Medium | Fatal | `SEC_USER_SEC_09` |
| #12 | **[AuthZ] Privilege escalation (case lặp) vẫn xảy ra**<br><br>1. Lặp lại case user thường gọi admin endpoint<br>2. Quan sát status | Test FAIL: Không đảm bảo luôn trả `403`. | Luôn trả `403`. | Medium | Fatal | `SEC_USER_SEC_10` |

### Notes

- Security defects should include **attack surface**, **exploit steps**, and **impact**.

