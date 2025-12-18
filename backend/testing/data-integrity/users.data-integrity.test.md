# users.data-integrity.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DAT_USER_DI_01 | Integration | Email unique constraint khi dùng `User.create`. | None | 1. Gọi `User.create` với email `unique@example.com`.<br>2. Gọi lại `User.create` với cùng email.<br>3. Bắt lỗi trả về. | Lần thứ hai bắn duplicate key error. | `TD-DI-USERS-BUILD` | PASS |
| DAT_USER_DI_02 | Integration | Password lưu dạng hash sau register. | None | 1. Gọi register service tạo user mới.<br>2. Truy vấn `User.findOne` lấy field password.<br>3. So sánh với plaintext gửi lên. | Password trong DB là chuỗi bcrypt, khác plaintext. | `TD-DI-USERS-BUILD` | PASS |
| DAT_USER_DI_03 | Integration | Email unique kiểm tra bằng raw insert. | None | 1. `User.collection.insertOne` với email `raw@example.com`.<br>2. Insert thêm bản ghi cùng email.<br>3. Theo dõi lỗi. | Insert lần 2 thất bại vì duplicate key. | `TD-DI-USERS-BUILD` | PASS |
| DAT_USER_DI_04 | Integration | Kiểm tra mẫu password hash khi query hàng loạt. | DAT_USER_DI_02 | 1. Sử dụng `User.find` đọc nhiều document.<br>2. Duyệt từng password và so với regex bcrypt.<br>3. Đảm bảo không có plaintext. | Tất cả password khớp regex bcrypt, không rò plain text. | `TD-DI-USERS-BUILD` | PASS |
