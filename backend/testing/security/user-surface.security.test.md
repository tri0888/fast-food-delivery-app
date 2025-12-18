# user-surface.security.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SEC_USER_SEC_01 | Integration | SQL Injection: Email login field. | None | 1. Chuẩn bị payload email `"' OR '1'='1"`.<br>2. Gọi `POST /api/user/login` với payload này.<br>3. Ghi nhận status/message. | API trả `400` và báo email không hợp lệ. | `TD-SEC-USERS-SQLI` | PASS |
| SEC_USER_SEC_02 | Integration | Brute Force: Login sai 10 lần phải bị khóa. | None | 1. Chọn user hợp lệ.<br>2. Gửi 10 request `POST /api/user/login` với password sai.<br>3. Theo dõi response thứ 10. | Hệ thống trả `429` / trigger lockout. | `TD-SEC-USERS-BRUTE` | FAIL |
| SEC_USER_SEC_03 | Integration | Broken Auth: Không gửi Bearer token lên admin API. | None | 1. Gọi `GET /api/user/list` mà không có header `token`.<br>2. Kiểm tra phản hồi. | API trả `401 Unauthorized`. | `TD-SEC-USERS-ADMIN-ENDPOINT` | FAIL |
| SEC_USER_SEC_04 | Integration | JWT Weakness: token `alg: none`. | None | 1. Rèn token với header `{ alg: 'none' }` và payload hợp lệ.<br>2. Gọi `/api/user/list` với token giả mạo.<br>3. Ghi nhận phản hồi. | Middleware từ chối với `401`. | `TD-SEC-USERS-FORGED-TOKEN` | FAIL |
| SEC_USER_SEC_05 | Integration | Privilege Escalation: User truy cập admin API. | None | 1. Đăng nhập bằng user role thường.<br>2. Gọi `/api/user/list` (chỉ admin).<br>3. Ghi nhận status/body. | API trả `403 Forbidden`. | `TD-SEC-USERS-ROLE` | FAIL |
| SEC_USER_SEC_06 | Integration | Lặp lại SQLi tại field email. | SEC_USER_SEC_01 | 1. Lặp lại các bước của SEC_USER_SEC_01 để xác nhận tính nhất quán.<br>2. So sánh phản hồi. | Hệ thống tiếp tục từ chối với `400`. | `TD-SEC-USERS-SQLI` | PASS |
| SEC_USER_SEC_07 | Integration | Brute Force duplicate scenario. | SEC_USER_SEC_02 | 1. Lặp lại quy trình SEC_USER_SEC_02 với user khác hoặc cùng user sau reset.<br>2. Kiểm tra thông điệp khóa account. | Vẫn phải khóa sau 10 lần. | `TD-SEC-USERS-BRUTE` | FAIL |
| SEC_USER_SEC_08 | Integration | Broken Auth duplicate. | SEC_USER_SEC_03 | 1. Thực hiện lại trường hợp SEC_USER_SEC_03 để xác nhận nhất quán.<br>2. Quan sát status. | Tiếp tục trả `401`. | `TD-SEC-USERS-ADMIN-ENDPOINT` | FAIL |
| SEC_USER_SEC_09 | Integration | Lặp lại kiểm tra JWT none alg. | SEC_USER_SEC_04 | 1. Lặp các bước của SEC_USER_SEC_04 cho token khác.<br>2. So sánh kết quả. | Liên tục trả `401`. | `TD-SEC-USERS-FORGED-TOKEN` | FAIL |
| SEC_USER_SEC_10 | Integration | Privilege Escalation duplicate. | SEC_USER_SEC_05 | 1. Lặp các bước SEC_USER_SEC_05 cho người dùng/endpoint khác.<br>2. Kiểm tra phản hồi. | API vẫn trả `403`. | `TD-SEC-USERS-ROLE` | FAIL |
