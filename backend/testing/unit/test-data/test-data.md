# Unit Test Data Catalog

| ID | Data | Notes |
| --- | --- | --- |
| TD-UNIT-CART-USER-NO-ITEM | `{ _id: 'user-1', cartData: {} }` | Người dùng chưa có món trong giỏ (happy path thêm mới). |
| TD-UNIT-CART-USER-EXISTING | `{ _id: 'user-2', cartData: { 'food-10': 2 } }` | Người dùng đã chứa `food-10` với số lượng 2. |
| TD-UNIT-CART-FOOD-FRESH | `{ _id: 'food-9' }` | Food document dùng khi cart chưa có món tương ứng. |
| TD-UNIT-CART-FOOD-EXISTING | `{ _id: 'food-10' }` | Food document khớp với entry đang tồn tại. |
| TD-UNIT-CART-RESPONSE | `{ success: true, cartData: {}, isCartLocked: false }` | DTO kỳ vọng sau khi chuẩn hoá giỏ rỗng. |
| TD-UNIT-FOOD-MISSING-NAME | `{ name: '', description: 'Missing name fails', price: 10, category: 'Soup', stock: 1 }` | Payload tạo món thiếu tên để test validation. |
| TD-UNIT-FOOD-LIST-FILTERS | `{ category: 'Burger', name: /Pizza/i }` | Bộ filter truy vấn danh sách món. |
| TD-UNIT-FOOD-PROTECTED | `{ _id: 'food-protected', image: 'protected.png', hasOpenOrders: true }` | Món không thể xoá vì đang có đơn mở. |
| TD-UNIT-ORDER-ROLLBACK-USER | `{ _id: 'user-rollback' }` | UserId dùng khi hoàn tác đặt món. |
| TD-UNIT-ORDER-ROLLBACK-FOOD | `{ _id: 'food-rb', stock: 5 }` | Tồn kho dùng để thử restore số lượng. |
| TD-UNIT-ORDER-ROLLBACK-ITEMS | `[{ _id: 'food-rb', name: 'Rollback Pho', price: 10, quantity: 2 }]` | Danh sách item đã reserve cho bước rollback. |
| TD-UNIT-ORDER-ADDRESS | `{ street: 'Rollback', city: 'HN', country: 'VN' }` | Địa chỉ giao hàng giả lập. |
| TD-UNIT-ORDER-CHECKOUT | `http://localhost:4173` | Origin frontend chuyển vào checkout session. |
| TD-UNIT-ORDER-SEQUENTIAL | `{ _id: 'order-flow', status: 'Pending' }` | Đơn hàng dùng test chuyển trạng thái sai thứ tự. |
| TD-UNIT-ORDER-OTP | `{ _id: 'order-otp', otp: '123456', items: [] }` | Đơn hàng chứa OTP để verify. |
| TD-UNIT-USER-LOGIN | `{ email: 'user@login.test', plaintext: 'PlainSecret1!', hashedDigest: 'hashed-secret' }` | Bộ dữ liệu đăng nhập (plain vs hash). |
| TD-UNIT-USER-REGISTER | `{ name: 'Unit User', email: 'unit@register.test', password: 'StrongPass1!' }` | Payload chuẩn khi đăng ký user mới. |
| TD-UNIT-USER-TOGGLE-REQUEST | `{ body: { userId: 'user-lock' } }` | Request body cho API bật/tắt khoá giỏ. |
| TD-UNIT-USER-TOGGLE-RESPONSE | `{ userId: 'user-lock', isCartLock: true }` | DTO phản hồi mong đợi từ toggle service. |
