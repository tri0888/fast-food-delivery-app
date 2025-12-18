# cart.features.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FE-CART-001 | System | Thêm cùng món hai lần sẽ tăng số lượng | Không | 1. Tạo user và food mẫu<br>2. Gọi `addToCartService.createCart` hai lần với cùng `foodId`<br>3. Đọc `cartData` của user | `cartData[foodId]` tăng lên `2`, log Jest xác nhận service cộng dồn | `TD-FEAT-CART-USER`, `TD-FEAT-CART-FOOD` | PASS |
| FE-CART-002 | System | Giảm số lượng đến 0 thì xoá entry | Không | 1. Seed user với `cartData = { foodId: 2 }`<br>2. Gọi `removeFromCartService` (removeSingle) hai lần<br>3. Kiểm tra cart sau mỗi lần | Lần đầu cart còn `1`, lần hai key bị xoá, test Jest pass | `TD-FEAT-CART-USER`, `TD-FEAT-CART-FOOD` | PASS |
| FE-CART-003 | System | Cờ remove-all xoá item bất kể số lượng | Không | 1. Seed user với cart chứa item bất kỳ<br>2. Gọi `removeFromCartService(userId, foodId, true)`<br>3. Đọc cart sau thao tác | Item biến mất khỏi cart, biến mock được gọi đúng tham số | `TD-FEAT-CART-USER`, `TD-FEAT-CART-FOOD` | PASS |
| FE-CART-004 | System | Lấy giỏ trả cả dữ liệu và trạng thái khoá | Không | 1. Tạo user có cart và `isCartLock = true`<br>2. Gọi `getCartService.getCart(userId)`<br>3. Đối chiếu DTO trả về | DTO chứa map cart + `isCartLocked: true` | `TD-FEAT-CART-USER`, `TD-FEAT-CART-FOOD` | PASS |
| FE-CART-005 | System | User không tồn tại ném AppError khi thêm giỏ | Không | 1. Gọi `addToCartService.createCart('000..', foodId)`<br>2. Bắt lỗi trả về | Promise bị reject với `AppError('User not found')` | `TD-FEAT-COMMON-NULL-ID` | PASS |
| FE-CART-006 | System | Food không tồn tại ném AppError khi thêm giỏ | Không | 1. Tạo user hợp lệ<br>2. Gọi `addToCartService.createCart(userId, '000..')` | Promise bị reject với `AppError('Food not found')` | `TD-FEAT-CART-USER`, `TD-FEAT-COMMON-NULL-ID` | PASS |
