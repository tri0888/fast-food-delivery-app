# foods.data-integrity.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DAT_FOOD_DI_01 | Integration | Giá tiền không được để trống/null khi insert. | None | 1. Chuẩn bị payload thiếu `price`.<br>2. Gọi `Food.create(payload)`.<br>3. Bắt lỗi validate trả về. | Mongoose báo lỗi `price required`. | `TD-DI-FOODS-BASE` | PASS |
| DAT_FOOD_DI_02 | Integration | Tên món <= 255 ký tự khi insert. | None | 1. Tạo chuỗi name 300 ký tự.<br>2. Gọi `Food.create` với name đó.<br>3. Quan sát validate. | Hệ thống chặn và báo lỗi độ dài. | `TD-DI-FOODS-LONG-NAME` | FAIL |
| DAT_FOOD_DI_03 | Integration | Giá tiền không nhận `null`. | None | 1. Gọi `Food.create` với `price = null`.<br>2. Ghi nhận lỗi. | Schema từ chối vì `price` null. | `TD-DI-FOODS-BASE` | PASS |
| DAT_FOOD_DI_04 | Integration | Tên món <= 255 ký tự khi update. | None | 1. Seed food hợp lệ.<br>2. Gọi `findByIdAndUpdate` với name 400 ký tự (`runValidators=true`).<br>3. Quan sát lỗi. | Update bị từ chối do vượt chiều dài. | `TD-DI-FOODS-BASE`, `TD-DI-FOODS-LONG-NAME` | FAIL |
