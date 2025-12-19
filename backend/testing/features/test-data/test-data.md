# Features Test Data Catalog

| ID | Data | Notes |
| --- | --- | --- |
| TD-FEAT-COMMON-PASSWORDS | `strong`: `Password123!`<br>`weak`: `BadPassword!`<br>`whitespace`: `'  '` | Bộ mật khẩu tiêu chuẩn cho kịch bản đăng nhập/âm bản UI. |
| TD-FEAT-COMMON-NULL-ID | `000000000000000000000000` | ObjectId toàn số 0 dùng để ép lỗi không tìm thấy. |
| TD-FEAT-CART-USER | name: `Cart User`<br>email: `cart+{timestamp}-{hex}@example.com`<br>password: `Password123!`<br>cartData: `{}` | Người dùng mẫu cho tính năng giỏ hàng (có thể override cartData tuỳ case). |
| TD-FEAT-CART-FOOD | name: `Cart Food {timestamp}-{hex}`<br>description: `Cart spec food`<br>price: `7`<br>image: `cart-food.jpg`<br>category: `Sides`<br>stock: `10` | Món ăn chuẩn để thêm/xoá trong giỏ; tên luôn duy nhất để dễ truy vết. |
| TD-FEAT-FLOWS-FRONTEND | `http://localhost:4173` | URL frontend chạy Vite dùng cho flow e2e. |
| TD-FEAT-FLOWS-USERS | Email: `flow-{tag}+{timestamp}-{hex}@example.com`<br>`userPassword`: `FlowUser#123`<br>`adminPassword`: `AdminFlow#123` | Thông tin đăng nhập cho người dùng và admin trong flow test. |
| TD-FEAT-FLOWS-FOODS | `pho`: `{ name: 'Flow Pho Deluxe', price: 15 }`<br>`burger`: `{ name: 'Automation Burger', price: 14 }`<br>`adminSalad`: `{ name: 'Admin Flow Salad', price: 22 }` | Bộ món xuyên suốt flow frontend/admin (giá VND giả lập). |
| TD-FEAT-FLOWS-CHECKOUT | `checkoutAddress`: `{ street: '123 Flow', city: 'Hanoi', country: 'VN' }`<br>`checkoutSessionUrl`: `https://stripe.test/flow-order`<br>`cancelUser`: `{ name: 'Cancel Flow User', password: 'Password123!' }`<br>`cancelOrder`: `{ items: [{ name: 'Flow Food', price: 10, quantity: 1 }], amount: 10, address:{ street: 'Cancel', city: 'Flow City', country: 'VN' }, status: 'Pending' }` | Dữ liệu hoàn tất thanh toán và huỷ đơn được mô phỏng sẵn cho flow UI. |
| TD-FEAT-LOGIN-CREDS | `defaultName`: `Feature User`<br>`email`: `features-{tag}+{timestamp}-{hex}@example.com`<br>`strongPassword`: `Password123!`<br>`badPassword`: `BadPassword!`<br>`whitespace`: `'  '` | Đầu vào điền form đăng nhập (đầy đủ biến thể hợp lệ/sai). |
| TD-FEAT-ORDERS-ADDRESSES | `address`: `{ street: '123 Feature', city: 'Orders', country: 'VN' }`<br>`lowStockAddress`: `{ street: 'Low Stock', city: 'Orders', country: 'VN' }`<br>`paymentAddress`: `{ street: 'Pay', city: 'Orders' }`<br>`statusAddress`: `{ street: 'Status', city: 'Orders' }`<br>`listAddresses`: `[{ street: 'A' }, { street: 'B' }]`<br>`userAddress`: `{ street: 'User' }`<br>`otherAddress`: `{ street: 'Other' }` | Đa dạng địa chỉ dùng cho kiểm thử đơn hàng (đổi trạng thái, paginate, mismatch). |
| TD-FEAT-PAYMENT-ORDER | `_id`: `order-feature-1`<br>`items`: `[{ name: 'Feature Burger', price: 15, quantity: 2 }, { name: 'Feature Fries', price: 5, quantity: 1 }]` | Đơn hàng cố định để mô phỏng thanh toán thành công. |
| TD-FEAT-PAYMENT-CHECKOUT | `sessionUrl`: `https://stripe.test/session` | Session URL Stripe giả lập khi redirect checkout. |
| TD-FEAT-PAYMENT-WEBHOOK | `rawBody`: `raw-body`<br>`signature`: `sig_header`<br>`invalidRaw`: `raw`<br>`invalidSignature`: `sig` | Bộ dữ liệu mô phỏng webhook Stripe hợp lệ/sai để test xác minh chữ ký. |
| TD-FEAT-PRODUCTS-PAYLOAD | name: `Spec Salad`<br>description: `Feature-informed salad`<br>price: `9`<br>category: `Salad`<br>stock: `5`<br>isAvailable: `true` | Payload mặc định khi admin tạo/cập nhật sản phẩm trên UI. |
| TD-FEAT-PRODUCTS-FILES | Đối tượng file giả `{ filename: 'spec-salad.jpg' }` | Có thể thay đổi tên qua `fakeFile('name')` khi test upload/validation. |
| TD-FEAT-USERS-ADMIN | `{ name: 'Ops Admin', email: 'ops.admin@example.com', password: 'Password123!', role: 'admin' }` | Admin seed phục vụ kiểm thử RBAC phía giao diện. |
| TD-FEAT-USERS-DUPLICATE | `dup@example.com` | Email cố định để tạo tình huống trùng lặp. |
| TD-FEAT-USERS-CART-LOCK | `{ name: 'Cart Lock', email: 'cart.lock@example.com', password: 'Password123!' }` | Người dùng chuyên dụng cho feature bật/tắt khóa giỏ. |
| TD-FEAT-USERS-ROLE | `{ name: 'Role Target', email: 'role.target@example.com', password: 'Password123!' }` | User đóng vai trò mục tiêu thay đổi role. |
| TD-FEAT-USERS-LIST | `['list-1@example.com', 'list-2@example.com']` | Bộ email seed để test danh sách người dùng/phân trang. |
