# users.data-integrity.test

| ID | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| DI-USR-001 | Khi insert user, role/cart/lock nhận default | Không | 1. Chuẩn bị payload bắt buộc<br>2. Gọi `User.create`<br>3. Đọc kết quả | Document lưu `role: 'user'`, `cartData: {}`, `isCartLock: false` | `{ name: 'Integrity User', email: 'integrity+<ts>@example.com', password: 'Password123!' }` | Tự động (Jest) |
| DI-USR-002 | `cartData` rỗng vẫn tồn tại khi đọc lại | Không | 1. Tạo user như trên<br>2. Gọi `User.findById().lean()` | Kết quả vẫn chứa key `cartData: {}` | Cùng payload như trên | Tự động (Jest) |
| DI-USR-003 | Email phải duy nhất | Không | 1. Tạo user với email cố định<br>2. Gọi `User.create` lần hai cùng email | Lần insert thứ hai báo lỗi duplicate key | Email `unique@example.com` | Tự động (Jest) |
| DI-USR-004A | Thiếu `name` khi tạo user | Không | 1. Clone payload mẫu<br>2. Xoá `name`<br>3. Gọi `User.create` | Nhận lỗi `must have name` | Payload thiếu `name` | Tự động (Jest) |
| DI-USR-004B | Thiếu `email` khi tạo user | Không | 1. Xoá `email` khỏi payload<br>2. Gọi `User.create` | Nhận lỗi `must have email` | Payload thiếu `email` | Tự động (Jest) |
| DI-USR-004C | Thiếu `password` khi tạo user | Không | 1. Xoá `password` khỏi payload<br>2. Gọi `User.create` | Nhận lỗi `must have password` | Payload thiếu `password` | Tự động (Jest) |
