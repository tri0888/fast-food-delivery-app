# login.features.test

| ID | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| FE-LOGIN-001 | Người dùng đăng ký rồi đăng nhập ngay lập tức | Không | 1. Gọi `registerService.register` với email mới<br>2. Lưu token trả về<br>3. Gọi `loginService.login` với cùng email/password | Cả hai trả token; kết quả login có `role: 'user'` | Email `features-login+<ts>@example.com`, password `Password123!` | Tự động (Jest) |
| FE-LOGIN-002A | Bị từ chối khi thiếu cả email và mật khẩu | Không | 1. Gọi `loginService.login('  ', '  ')`<br>2. Bắt lỗi trả về | Promise reject `AppError` vì thiếu thông tin | Chuỗi whitespace | Tự động (Jest) |
| FE-LOGIN-002B | Email sai định dạng bị chặn | Không | 1. Gọi `loginService.login('invalid-email', 'Password123!')`<br>2. Bắt lỗi | Promise reject `AppError` vì email không hợp lệ | Email sai định dạng | Tự động (Jest) |
| FE-LOGIN-003A | Sai mật khẩu trả thông điệp `Incorrect Password` | Không | 1. Đăng ký user<br>2. Gọi `loginService.login` với mật khẩu sai | Nhận lỗi `Incorrect Password` | Email `features-login-wrong+<ts>@example.com` | Tự động (Jest) |
| FE-LOGIN-003B | Email không tồn tại trả `Incorrect Email` | Không | 1. Gọi `loginService.login('ghost@example.com', 'Password123!')` | Nhận lỗi `Incorrect Email` | Email không tồn tại | Tự động (Jest) |
