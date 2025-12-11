# cart.api.test

| ID | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| API-CART-001 | Từ chối lấy giỏ hàng khi không có token xác thực | Không | 1. Chuẩn bị request `GET /api/cart/get` không header<br>2. Gửi request tới server | HTTP `200` với `{ success: false, message: "Not Authorized" }` | Yêu cầu HTTP không có header | Tự động (Jest) |
| API-CART-002A | POST `/api/cart/add` thêm món cho user đã đăng nhập | Không | 1. Tạo user và món ăn mẫu trong in-memory Mongo<br>2. Đăng nhập lấy token JWT<br>3. Gọi `POST /api/cart/add` với token và `itemId` món | HTTP `200` với `{ success: true }` và cartData chứa item vừa thêm | User `{ name: 'API Cart', email: 'api-cart@example.com' }`, Food `{ name: 'Cart Taco', price: 8 }` | Tự động (Jest) |
| API-CART-002B | GET `/api/cart/get` trả về giỏ vừa được cập nhật | API-CART-002A | 1. Seed user có `cartData` chứa item (từ bước trước hoặc ghi trực tiếp DB)<br>2. Đăng nhập lấy token<br>3. Gọi `GET /api/cart/get` với token | HTTP `200` với `{ success: true, cartData: { [foodId]: 1 } }` | User với `cartData` chứa foodId tương ứng | Tự động (Jest) |
| API-CART-003 | ID món ăn không hợp lệ bị từ chối | Không | 1. Tạo user và đăng nhập lấy token<br>2. Gọi `POST /api/cart/add` với `itemId = 000...000` | HTTP `404` với `{ status: 'fail', message: 'Food not found' }` | `itemId: '000000000000000000000000'` | Tự động (Jest) |
