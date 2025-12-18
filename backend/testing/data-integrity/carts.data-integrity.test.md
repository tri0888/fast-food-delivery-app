# carts.data-integrity.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DAT_CART_DI_01 | Integration | Verify Cascade Delete: Xóa User sẽ xóa Cart tương ứng. | None | 1. Seed user với `cartData` không rỗng.<br>2. Gọi `User.deleteOne({_id})`.<br>3. Truy vấn lại bảng user/cartData. | Không còn document nào chứa cartData cho user đã xóa. | `TD-DI-USERS-BUILD`, `TD-DI-CARTS-PAYLOAD` | PASS |
| DAT_CART_DI_02 | Integration | Verify Cascade Delete qua `findByIdAndDelete`. | None | 1. Seed user có cart.<br>2. Gọi `User.findByIdAndDelete` với `_id` đó.<br>3. Query lại cartData theo key. | Dữ liệu cart của user biến mất hoàn toàn. | `TD-DI-USERS-BUILD`, `TD-DI-CARTS-PAYLOAD` | PASS |
