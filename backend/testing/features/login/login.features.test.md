# login.features.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FE-LOGIN-001 | System | Người dùng đăng ký rồi đăng nhập ngay lập tức | Không | 1. Gọi `registerService.register` với email mới<br>2. Lưu token trả về<br>3. Gọi `loginService.login` với cùng email/password | Cả hai trả token; kết quả login có `role: 'user'`, xác thực qua Jest | `TD-FEAT-LOGIN-CREDS`, `TD-FEAT-COMMON-PASSWORDS` | PASS |
| FE-LOGIN-002 | System | Bị từ chối khi thiếu cả email và mật khẩu | Không | 1. Gọi `loginService.login('  ', '  ')`<br>2. Bắt lỗi trả về | Promise reject `AppError` vì thiếu thông tin | `TD-FEAT-LOGIN-CREDS`, `TD-FEAT-COMMON-PASSWORDS` | PASS |
| FE-LOGIN-003 | System | Email sai định dạng bị chặn | Không | 1. Gọi `loginService.login('invalid-email', 'Password123!')`<br>2. Bắt lỗi | Promise reject `AppError` vì email không hợp lệ | `TD-FEAT-LOGIN-CREDS` | PASS |
| FE-LOGIN-004 | System | Email không tồn tại trả `Incorrect Email` | Không | 1. Gọi `loginService.login('ghost@example.com', 'Password123!')`<br>2. Đối chiếu thông báo lỗi | Nhận lỗi `Incorrect Email` | `TD-FEAT-LOGIN-CREDS` | PASS |
| FE-LOGIN-005 | System | Sai mật khẩu trả thông điệp `Incorrect Password` | Không | 1. Đăng ký user<br>2. Gọi `loginService.login` với mật khẩu sai<br>3. Đối chiếu thông báo lỗi | Nhận lỗi `Incorrect Password` | `TD-FEAT-LOGIN-CREDS`, `TD-FEAT-COMMON-PASSWORDS` | PASS |
