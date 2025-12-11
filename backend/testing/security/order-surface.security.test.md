# order-surface.security.test

| ID | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| SEC-ORD-001 | Từ chối xem danh sách đơn đặc quyền khi thiếu token | Không | 1. Chuẩn bị request `GET /api/order/list` không header<br>2. Gửi request | HTTP `200` với `{ success: false, message: 'Not Authorized' }` | Không có token header | Tự động (Jest) |
| SEC-ORD-002 | Phát hiện token giả ký bằng secret sai | Không | 1. Tạo admin thật và lấy `_id`<br>2. Ký JWT bằng secret sai<br>3. Gọi `/api/order/list` với token giả | Nhận `{ success: false }`, thông điệp lỗi chữ ký JWT | Dữ liệu admin, token giả | Tự động (Jest) |
| SEC-ORD-003 | Ngăn user thường cập nhật trạng thái đơn | Không | 1. Seed user role `user` và order<br>2. Gọi `PATCH /api/order/status` với token user<br>3. Đọc lại order | Phản hồi `success: false`, lỗi permission; trạng thái DB giữ nguyên | Order `_id`, payload status `Delivered` | Tự động (Jest) |
