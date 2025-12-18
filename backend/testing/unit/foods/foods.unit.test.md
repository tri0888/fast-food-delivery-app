# foods.unit.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UNI_FOOD_UNIT_01 / UNI_FOOD_UNIT_02 | Unit | `addFoodService` phải validate `name` trước khi lưu. | None | 1. Tạo payload thiếu `name` (rỗng).<br>2. Gọi `addFoodService.createFood` với payload + file giả.<br>3. Theo dõi promise reject. | Service ném `AppError('Food information cannot be left blank')`. | `TD-UNIT-FOOD-MISSING-NAME` | PASS |
| UNI_FOOD_UNIT_03 / UNI_FOOD_UNIT_04 | Unit | Repository `findAll` phải truyền filter động vào `foodModel.find`. | None | 1. Spy `foodModel.find`.<br>2. Gọi `findAll({ category: 'Burger', name: /Pizza/i })`.<br>3. Kiểm tra tham số được truyền vào spy. | `foodModel.find` được gọi đúng filter object. | `TD-UNIT-FOOD-LIST-FILTERS` | FAIL |
| UNI_FOOD_UNIT_05 / UNI_FOOD_UNIT_06 | Unit | `removeFoodService` chặn xóa món thuộc đơn đang hoạt động. | None | 1. Mock repository `findById` trả food với `hasOpenOrders: true`.<br>2. Gọi `removeFoodService.deleteFood`.<br>3. Quan sát reject và đảm bảo `deleteById` không được gọi. | Service ném lỗi và không xóa file/record. | `TD-UNIT-FOOD-PROTECTED` | FAIL |
