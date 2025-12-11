# orders.features.test

| ID | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| FE-ORD-001 | Đặt đơn trả Stripe checkout URL và cập nhật kho/cart | Không | 1. Mock Stripe adapter trả URL<br>2. Seed user có cart và food có stock 5<br>3. Gọi `placeOrderService.placeOrder` với items quantity 2<br>4. Đọc lại order, food, cart | Response chứa `session_url`; order được lưu; stock giảm; cart trống | Items quantity 2, frontend URL `http://localhost:4173` | Tự động (Jest) |
| FE-ORD-002 | Checkout bị chặn khi vượt quá tồn kho | Không | 1. Tạo food `stock: 0` và user<br>2. Gọi `placeOrderService.placeOrder` với quantity 1<br>3. Quan sát promise reject | Promise reject `AppError`; stripe adapter không bị gọi | Food stock 0 | Tự động (Jest) |
| FE-ORD-003 | Verify thành công đánh dấu order đã thanh toán | Không | 1. Seed order chưa thanh toán<br>2. Gọi `verifyOrderService.verifyOrder(orderId, 'true')`<br>3. Đọc Order từ DB | Trả `{ success: true, message: 'Paid' }`; `payment` chuyển true | Order amount 10 | Tự động (Jest) |
| FE-ORD-004 | Admin chỉ chấp nhận trạng thái hợp lệ | Không | 1. Tạo order trạng thái `Food Processing`<br>2. Gọi `updateStatusService(orderId, 'Delivered')`<br>3. Gọi lại với `INVALID` | Lần đầu cập nhật thành `Delivered`; lần hai reject `AppError` | Order `_id`, danh sách status | Tự động (Jest) |
| FE-ORD-005 | listOrders trả toàn bộ đơn cho admin | Không | 1. Seed 2 đơn với `userId` khác nhau<br>2. Gọi `listOrdersService.getAllOrders()`<br>3. Đếm và so sánh giá trị amount | Mảng length 2 với amount `10`, `20` | Hai bản ghi Order | Tự động (Jest) |
| FE-ORD-006 | userOrders trả đúng đơn theo userId | Không | 1. Seed 2 user với đơn riêng<br>2. Gọi `userOrdersService.getUserOrders(userId)`<br>3. Gọi thêm với user giả để bắt lỗi | Mảng trả về 1 đơn đúng user; gọi với user giả ném `AppError` | Hai user, mỗi user một order | Tự động (Jest) |
