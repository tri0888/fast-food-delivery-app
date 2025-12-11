# cart.features.test

| ID | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| FE-CART-001 | Thêm cùng món hai lần sẽ tăng số lượng | Không | 1. Tạo user và food mẫu<br>2. Gọi `addToCartService.createCart` hai lần với cùng `foodId`<br>3. Đọc `cartData` của user | `cartData[foodId]` của user bằng `2` | Food stock 10, cart rỗng | Tự động (Jest) |
| FE-CART-002 | Giảm số lượng đến 0 thì xoá entry | Không | 1. Seed user với `cartData = { foodId: 2 }`<br>2. Gọi `removeFromCartService` (removeSingle) hai lần<br>3. Kiểm tra cart sau mỗi lần | Lần đầu còn `1`, lần hai key bị xoá | `cartData = { foodId: 2 }` | Tự động (Jest) |
| FE-CART-003 | Cờ remove-all xoá item bất kể số lượng | Không | 1. Seed user với cart chứa item bất kỳ<br>2. Gọi `removeFromCartService(userId, foodId, true)` | Item biến mất khỏi cart | `cartData = { foodId: 3 }` | Tự động (Jest) |
| FE-CART-004 | Lấy giỏ trả cả dữ liệu và trạng thái khoá | Không | 1. Tạo user có cart và `isCartLock = true`<br>2. Gọi `getCartService.getCart(userId)` | Kết quả chứa map cart + `isCartLocked: true` | Cart 1 item, lock true | Tự động (Jest) |
| FE-CART-005A | User không tồn tại ném AppError khi thêm giỏ | Không | 1. Gọi `addToCartService.createCart('000..', foodId)`<br>2. Bắt lỗi | Promise bị reject với `AppError` | UserId giả `000...` | Tự động (Jest) |
| FE-CART-005B | Food không tồn tại ném AppError khi thêm giỏ | Không | 1. Tạo user hợp lệ<br>2. Gọi `addToCartService.createCart(userId, '000..')` | Promise bị reject với `AppError` | FoodId giả `000...` | Tự động (Jest) |
