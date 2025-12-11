# orders.data-integrity.test

| ID | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| DI-ORD-001 | Đơn hàng mới mặc định `Food Processing` và chưa thanh toán | Không | 1. Chuẩn bị payload order tối thiểu<br>2. Gọi `Order.create`<br>3. Đọc document kết quả | Lưu `status = 'Food Processing'`, `payment = false`, `date` là Date | `{ userId: 'user-1', items: [{ _id: 'food-1', name: 'Pho', price: 10, quantity: 1 }], amount: 10, address: <buildAddress()> }` | Tự động (Jest) |
| DI-ORD-002A | Thiếu `userId` khi tạo Order | Không | 1. Sao chép payload mẫu<br>2. Xoá `userId`<br>3. Gọi `Order.create` | Nhận lỗi validate thiếu `userId` | Payload thiếu `userId` | Tự động (Jest) |
| DI-ORD-002B | Thiếu `items` khi tạo Order | Không | 1. Xoá trường `items` khỏi payload<br>2. Gọi `Order.create` | Lỗi yêu cầu danh sách items | Payload thiếu `items` | Tự động (Jest) |
| DI-ORD-002C | Thiếu `amount` khi tạo Order | Không | 1. Xoá `amount` khỏi payload<br>2. Gọi `Order.create` | Lỗi validate thiếu amount | Payload thiếu `amount` | Tự động (Jest) |
| DI-ORD-002D | Thiếu `address` khi tạo Order | Không | 1. Xoá `address` khỏi payload<br>2. Gọi `Order.create` | Lỗi validate thiếu address | Payload thiếu `address` | Tự động (Jest) |
| DI-ORD-003 | Thanh toán thất bại phải hoàn kho và xoá đơn | Không | 1. Tạo Food stock 0 và order quantity 2<br>2. Gọi `verifyOrderService.verifyOrder(orderId, 'false')`<br>3. Kiểm tra order bị xoá và stock hồi | Service trả `{ success: false, message: 'Not Paid' }`, order bị xoá, stock được hồi | Food `Integrity Pizza` (stock 0), order quantity 2 | Tự động (Jest) |
| DI-ORD-004 | Verify thiếu `orderId` ném AppError | Không | 1. Gọi `verifyOrderService.verifyOrder(undefined, 'true')`<br>2. Bắt lỗi trả về | Promise reject với `AppError` | `orderId = undefined` | Tự động (Jest) |
