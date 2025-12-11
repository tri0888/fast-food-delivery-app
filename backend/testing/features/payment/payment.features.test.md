# payment.features.test

| ID | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| FE-PAY-001 | Stripe adapter tạo checkout session có phí giao hàng | Không | 1. Mock Stripe SDK trả URL cố định<br>2. Gọi `stripeAdapter.createCheckoutSession(order, frontendUrl)` với 2 item<br>3. So sánh payload gửi vào Stripe | `line_items` gồm 3 phần tử (2 món + Delivery), success/cancel URL đúng orderId | Order `_id = order-feature-1`, 2 món mẫu, frontendUrl `http://localhost:4173` | Tự động (Jest) |
| FE-PAY-002 | Xác minh webhook sử dụng secret cấu hình | Không | 1. Mock `constructEvent` trả object giả<br>2. Gọi `stripeAdapter.verifyWebhook(raw, sig)` | Hàm trả về object mock, Stripe được gọi với secret `whsec_feature_module` | raw-body `'raw-body'`, signature `'sig_header'` | Tự động (Jest) |
| FE-PAY-003 | Thiếu webhook secret sẽ ném lỗi | FE-PAY-002 | 1. Tạm xoá `STRIPE_WEBHOOK_SECRET` khỏi env<br>2. Gọi `verifyWebhook` với dữ liệu bất kỳ | Ném lỗi `Stripe webhook secret not configured` | raw `'raw'`, signature `'sig'` | Tự động (Jest) |
