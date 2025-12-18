# payment.features.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FE-PAY-001 | System | Stripe adapter tạo checkout session có phí giao hàng | Không | 1. Mock Stripe SDK trả URL cố định<br>2. Gọi `stripeAdapter.createCheckoutSession(order, frontendUrl)` với 2 item<br>3. So sánh payload gửi vào Stripe | `line_items` gồm 3 phần tử (2 món + Delivery), success/cancel URL đúng orderId, verify qua Jest mock | `TD-FEAT-PAYMENT-ORDER`, `TD-FEAT-PAYMENT-CHECKOUT`, `TD-FEAT-FLOWS-FRONTEND` | PASS |
| FE-PAY-002 | System | Xác minh webhook sử dụng secret cấu hình | Không | 1. Mock `constructEvent` trả object giả<br>2. Gọi `stripeAdapter.verifyWebhook(raw, sig)`<br>3. Kiểm tra tham số truyền vào Stripe | Hàm trả về object mock, Stripe được gọi với secret `whsec_feature_module` | `TD-FEAT-PAYMENT-WEBHOOK` | PASS |
| FE-PAY-003 | System | Thiếu webhook secret sẽ ném lỗi | FE-PAY-002 | 1. Tạm xoá `STRIPE_WEBHOOK_SECRET` khỏi env<br>2. Gọi `verifyWebhook` với dữ liệu bất kỳ<br>3. Bắt lỗi | Ném lỗi `Stripe webhook secret not configured`, test Jest pass | `TD-FEAT-PAYMENT-WEBHOOK` | PASS |
