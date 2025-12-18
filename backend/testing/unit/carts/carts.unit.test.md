# carts.unit.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UNI_CART_UNIT_01 / UNI_CART_UNIT_02 | Unit | `addToCartService.createCart` thêm mới qty=1 và tăng số lượng nếu đã tồn tại. | None | 1. Mock repository trả user + cartData tương ứng và food hợp lệ.<br>2. Gọi `createCart` với `itemId` mong muốn hai lần.<br>3. Kiểm tra tham số truyền vào `cartRepository.create`. | Payload gửi vào repository chứa item mới hoặc qty tăng thêm 1. | `TD-UNIT-CART-USER-NO-ITEM`, `TD-UNIT-CART-USER-EXISTING`, `TD-UNIT-CART-FOOD-FRESH`, `TD-UNIT-CART-FOOD-EXISTING` | PASS |
| UNI_CART_UNIT_03 / UNI_CART_UNIT_04 | Unit | Controller `getCart` phải convert giá trị null thành `{}` khi trả response. | None | 1. Mock service `getCart` trả `{ cartData: null, isCartLocked: false }`.<br>2. Gọi controller với request có `userId`.<br>3. Xác thực JSON response dựng lại cartData rỗng. | Response chuẩn: `{ success: true, cartData: {}, isCartLocked: false }`. | `TD-UNIT-CART-RESPONSE` | FAIL |
