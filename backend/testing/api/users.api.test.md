# users.api.test

| ID | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| API-USR-001 | API đăng ký trả token khi thành công | Không | 1. Chuẩn bị payload name/email/password hợp lệ<br>2. Gửi `POST /api/user/register` | HTTP `200` cùng `{ success: true, token: <jwt> }` | Body `{ name: 'API User', email: 'api+<ts>@example.com', password: 'ApiPass123!' }` | Tự động (Jest) |
| API-USR-002 | API đăng nhập trả về role của user hiện có | Không | 1. Seed admin trong DB<br>2. Gửi `POST /api/user/login` với email/password<br>3. Đọc `role` từ response | HTTP `200` với `{ role: 'admin' }` | User role `admin`, password `ApiPass123!` | Tự động (Jest) |
