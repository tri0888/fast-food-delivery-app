# users.unit.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UNI_USER_UNIT_01 / UNI_USER_UNIT_02 | Unit | `loginService` so khớp mật khẩu plaintext với bcrypt hash trước khi cấp token. | None | 1. Spy `bcrypt.compare` và mock repository trả user với hash.<br>2. Gọi `loginService.login` với email/password hợp lệ.<br>3. Quan sát lời gọi `compare` và token trả về. | `bcrypt.compare` được gọi với `(plain, hash)` và service trả token + role. | `TD-UNIT-USER-LOGIN` | PASS |
| UNI_USER_UNIT_03 / UNI_USER_UNIT_04 | Unit | `registerService` phải bắt lỗi repository và ném `AppError`. | None | 1. Mock repo `findByEmail` trả `null` và `create` ném lỗi.<br>2. Spy `bcrypt` để bypass hash.<br>3. Gọi `registerService.register` và ghi nhận reject. | Khi `create` lỗi, service ném `AppError` có thông báo thân thiện. | `TD-UNIT-USER-REGISTER` | FAIL |
| UNI_USER_UNIT_05 / UNI_USER_UNIT_06 | Unit | Controller `toggleCartLock` trả trạng thái mới. | None | 1. Mock service trả `{ userId, isCartLock: true }`.<br>2. Gọi controller với request body chứa `userId`.<br>3. Kiểm tra response JSON. | Response gồm `{ success: true, message, data: { userId, isCartLock } }`. | `TD-UNIT-USER-TOGGLE-REQUEST`, `TD-UNIT-USER-TOGGLE-RESPONSE` | PASS |
