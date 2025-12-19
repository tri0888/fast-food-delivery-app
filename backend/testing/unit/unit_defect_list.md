# Unit Defect List

> Purpose: Track defects found by **unit tests** (`backend/testing/unit`).

## Defect log

| Defect ID | Defect Description & Steps to reproduce | Actual Result | Expected Result | Priority | Serverity | Testcase ID |
|---|---|---|---|---|---|---|
| #1 | **[Cart Controller] getCart không convert null → {}**<br><br>1. Mock service `getCart` trả `{ cartData: null, isCartLocked:false }`<br>2. Gọi controller `getCart` với request có `userId`<br>3. Kiểm tra JSON response | Test FAIL: response không đúng `{ cartData: {} }` như contract. | `{ success:true, cartData:{}, isCartLocked:false }`. | Medium | Medium | `UNI_CART_UNIT_03 / UNI_CART_UNIT_04` |
| #2 | **[Food Repository] findAll không truyền đúng filter vào foodModel.find**<br><br>1. Spy `foodModel.find`<br>2. Gọi `findAll({ category:'Burger', name:/Pizza/i })`<br>3. Kiểm tra tham số spy | Test FAIL: `foodModel.find` nhận filter khác với kỳ vọng. | `foodModel.find` được gọi đúng filter object. | Medium | Medium | `UNI_FOOD_UNIT_03 / UNI_FOOD_UNIT_04` |
| #3 | **[Food Service] removeFoodService không chặn xóa món có open orders**<br><br>1. Mock repo `findById` trả `hasOpenOrders:true`<br>2. Gọi `removeFoodService.deleteFood`<br>3. Đảm bảo reject và `deleteById` không bị gọi | Test FAIL: service không reject/hoặc vẫn gọi `deleteById`. | Service ném lỗi và không xóa file/record. | Medium | Serious | `UNI_FOOD_UNIT_05 / UNI_FOOD_UNIT_06` |
| #4 | **[Order Service] placeOrderService không rollback stock khi createOrder fail**<br><br>1. Mock `createOrder` ném lỗi<br>2. Gọi `placeOrderService.placeOrder`<br>3. Kỳ vọng gọi `restoreStock` cho items đã reserve | Test FAIL: không gọi `restoreStock` khi createOrder thất bại. | Khi `createOrder` thất bại, service gọi `restoreStock`. | High | Serious | `UNI_ORDE_UNIT_01 / UNI_ORDE_UNIT_02` |
| #5 | **[Order Service] updateStatusService cho phép nhảy status sai luồng**<br><br>1. Mock order `status:'Pending'`<br>2. Gọi `updateOrderStatus(orderId,'Delivered')`<br>3. Kỳ vọng reject và không gọi `updateStatus` | Test FAIL: không reject theo rule, hoặc vẫn gọi `updateStatus`. | Service từ chối và không gọi `updateStatus`. | High | Serious | `UNI_ORDE_UNIT_03 / UNI_ORDE_UNIT_04` |
| #6 | **[Order Service] verifyOrderService không validate OTP trước khi Paid**<br><br>1. Mock order có `otp:'123456'`<br>2. Gọi `verifyOrder(orderId,'true','000000')` (OTP sai)<br>3. Kỳ vọng reject và không gọi `updatePaymentStatus` | Test FAIL: không reject OTP sai và/hoặc vẫn update payment. | OTP sai bị từ chối và không cập nhật payment. | High | Serious | `UNI_ORDE_UNIT_05 / UNI_ORDE_UNIT_06` |
| #7 | **[User Service] registerService không wrap lỗi repo thành AppError**<br><br>1. Mock repo `create` ném lỗi<br>2. Gọi `registerService.register`<br>3. Kỳ vọng reject `AppError` với message thân thiện | Test FAIL: không ném `AppError` (hoặc message không thân thiện). | Khi `create` lỗi, service ném `AppError` có thông báo thân thiện. | Medium | Medium | `UNI_USER_UNIT_03 / UNI_USER_UNIT_04` |

### Notes

- Unit defects should include **function name**, **inputs**, and **expected output**.

