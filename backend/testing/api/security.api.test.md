# security.api.test

| ID | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| API-SEC-001 | Chặn payload đăng nhập chèn toán tử Mongo | Không | 1. Seed user hợp lệ<br>2. Gửi `POST /api/user/login` với `{ email: { $gt: '' }, password: { $gt: '' } }` | HTTP `400` với `{ status: 'fail', message: 'Provide email' }` | Payload đăng nhập chứa object injection | Tự động (Jest) |
| API-SEC-002 | Ngăn thêm giỏ khi không có token | Không | 1. Chuẩn bị request `POST /api/cart/add` không header token<br>2. Gửi request với body `{ itemId: 'food-1' }` | HTTP `200` với `{ success: false, message: 'Not Authorized' }` | Body `{ itemId: 'food-1' }` | Tự động (Jest) |
