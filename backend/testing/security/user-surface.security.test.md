# user-surface.security.test

| ID | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| SEC-USR-001 | Từ chối `/api/user/list` khi thiếu token | Không | 1. Chuẩn bị request GET không header<br>2. Gửi tới `/api/user/list` | Nhận `{ success: false, message: 'Not Authorized' }` | Không có token | Tự động (Jest) |
| SEC-USR-002 | User thường không được xem danh sách user | Không | 1. Tạo user role `user` và ký token<br>2. Gọi `/api/user/list` với token đó | `{ success: false, message: 'permission' }` | Thông tin user thường | Tự động (Jest) |
| SEC-USR-003 | Admin hợp lệ xem được danh sách người dùng | Không | 1. Tạo admin và token<br>2. Gọi `/api/user/list` với token admin | `{ success: true, data: [] }` (mảng) | Dữ liệu admin | Tự động (Jest) |
