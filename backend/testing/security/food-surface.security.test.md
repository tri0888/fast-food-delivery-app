# Food Surface Security Test Notes

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SEC_FOOD_SEC_01 | Integration | XSS: Script tag trong mô tả món ăn bị chặn khi gọi `POST /api/food/add`. | None | 1. Khởi tạo admin và token.<br>2. Gửi request `/api/food/add` với `description` chứa `<script>alert(1)</script>`.<br>3. Quan sát status/code trả về. | API phản hồi `400` cùng thông báo từ chối script và không tạo món. | `TD-SEC-FOODS-ADMIN`, `TD-SEC-FOODS-PAYLOAD-SCRIPT` | FAIL |
| SEC_FOOD_SEC_02 | Integration | XSS: Dữ liệu lưu trong Mongo phải được sanitize, không giữ lại thuộc tính sự kiện. | None | 1. Khởi tạo admin và token.<br>2. Gửi request `/api/food/add` chứa `<img src=x onerror="alert(1)">`.<br>3. Truy vấn DB để đọc lại trường `description`. | Bản ghi lưu với nội dung đã loại bỏ `<script>`/`onerror`. | `TD-SEC-FOODS-ADMIN`, `TD-SEC-FOODS-PAYLOAD-IMAGE`, `TD-SEC-FOODS-METADATA` | FAIL |
