# users.features.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FE-USR-001 | System | Tạo admin sẽ hash mật khẩu và lưu role | Không | 1. Gọi `addUserService.addUser` với payload admin<br>2. Kiểm tra DTO trả về<br>3. Truy vấn DB xác thực role/password | DTO trả về không lộ password; DB lưu role `admin`, password đã hash (verified via Jest mocks) | `TD-FEAT-USERS-ADMIN` | PASS |
| FE-USR-002 | System | Yêu cầu tạo admin trùng email bị từ chối | Không | 1. Gọi addUser với email `dup@example.com`<br>2. Gọi lại lần hai<br>3. Bắt lỗi | Lần hai reject `AppError('Email already exists')` | `TD-FEAT-USERS-DUPLICATE` | PASS |
| FE-USR-003 | System | Toggle khoá giỏ chuyển trạng thái qua lại | Không | 1. Seed user `isCartLock: false`<br>2. Gọi `toggleCartLockService` lần 1<br>3. Gọi lần 2 và so sánh | Lần đầu trả `true`, lần sau trả `false`, trường `isCartLock` DB cập nhật tương ứng | `TD-FEAT-USERS-CART-LOCK` | PASS |
| FE-USR-004 | System | Update role hợp lệ chuyển user thành admin | Không | 1. Seed user role `user`<br>2. Gọi `editUserService.editUser` với `{ role: 'admin', password: 'NewPassword456!' }`<br>3. Kiểm tra kết quả DTO và DB | Kết quả trả `role: 'admin'`, password mới đã hash | `TD-FEAT-USERS-ROLE`, `TD-FEAT-COMMON-PASSWORDS` | PASS |
| FE-USR-005 | System | Role ngoài enum bị từ chối | Không | 1. Gọi `editUserService.editUser` với `{ role: 'super-admin' }`<br>2. Bắt lỗi | Promise reject `AppError('Invalid role')` | `TD-FEAT-USERS-ROLE` | PASS |
| FE-USR-006 | System | Mật khẩu yếu bị từ chối khi chỉnh sửa | Không | 1. Gọi `editUserService.editUser` với `{ password: '123' }`<br>2. Bắt lỗi | Promise reject `AppError('Password too weak')` | `TD-FEAT-COMMON-PASSWORDS` | PASS |
| FE-USR-007 | System | getAllUsers liệt kê mọi tài khoản | Không | 1. Seed 2 user bất kỳ<br>2. Gọi `getAllUsersService.getAllUsers()`<br>3. So sánh danh sách email trả về | Mảng trả về length 2 chứa đúng email đã seed | `TD-FEAT-USERS-LIST` | PASS |
