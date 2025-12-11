# users.features.test

| ID | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| FE-USR-001 | Tạo admin sẽ hash mật khẩu và lưu role | Không | 1. Gọi `addUserService.addUser` với payload admin<br>2. Kiểm tra DTO trả về<br>3. Truy vấn DB xác thực role/password | DTO trả về không lộ password; DB lưu role `admin`, password đã hash | `{ name: 'Ops Admin', email: 'ops.admin@example.com', password: 'Password123!', role: 'admin' }` | Tự động (Jest) |
| FE-USR-002 | Yêu cầu tạo admin trùng email bị từ chối | Không | 1. Gọi addUser với email `dup@example.com`<br>2. Gọi lại lần hai<br>3. Bắt lỗi | Lần hai reject `AppError` | Email `dup@example.com` | Tự động (Jest) |
| FE-USR-003 | Toggle khoá giỏ chuyển trạng thái qua lại | Không | 1. Seed user `isCartLock: false`<br>2. Gọi `toggleCartLockService` lần 1<br>3. Gọi lần 2 và so sánh | Lần đầu trả `true`, lần sau trả `false` | User `_id` | Tự động (Jest) |
| FE-USR-004A | Update role hợp lệ chuyển user thành admin | Không | 1. Seed user role `user`<br>2. Gọi `editUserService.editUser` với `{ role: 'admin', password: 'NewPassword456!' }`<br>3. Kiểm tra kết quả | Cập nhật hợp lệ trả `role: 'admin'` | Payload `{ role: 'admin', password: 'NewPassword456!' }` | Tự động (Jest) |
| FE-USR-004B | Role ngoài enum bị từ chối | Không | 1. Gọi `editUserService.editUser` với `{ role: 'super-admin' }`<br>2. Bắt lỗi | Promise reject `AppError` | Payload role không hợp lệ | Tự động (Jest) |
| FE-USR-004C | Mật khẩu yếu bị từ chối khi chỉnh sửa | Không | 1. Gọi `editUserService.editUser` với `{ password: '123' }`<br>2. Bắt lỗi | Promise reject `AppError` | Payload password yếu | Tự động (Jest) |
| FE-USR-005 | getAllUsers liệt kê mọi tài khoản | Không | 1. Seed 2 user bất kỳ<br>2. Gọi `getAllUsersService.getAllUsers()`<br>3. So sánh danh sách email trả về | Mảng trả về length 2 chứa đúng email đã seed | Hai bản ghi User `list-1/2@example.com` | Tự động (Jest) |
