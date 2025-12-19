# API Defect List

> Purpose: Track defects found by **API test suite** (`backend/testing/api`).

## Defect log

| Defect ID | Defect Description & Steps to reproduce | Actual Result | Expected Result | Priority | Serverity | Testcase ID |
|---|---|---|---|---|---|---|
| #1 | **[Cart] GetCart totalAmount tính sai**<br><br>1. Seed cart với 2 item (giá 15 và 4)<br>2. `GET /api/cart/get` bằng token user<br>3. Đối chiếu `totalAmount` với $\Sigma price\times qty$ | API trả `200` nhưng `totalAmount` không khớp tổng tiền (test FAIL). | HTTP `200`, `totalAmount = Σ price * qty`. | High | Serious | `API_CART_04` |
| #2 | **[Cart] AddToCart chấp nhận quantity âm**<br><br>1. Đăng nhập user<br>2. `POST /api/cart/add` với `quantity = -3`<br>3. Quan sát response | API không trả `400` như kỳ vọng (test FAIL) và/hoặc vẫn cập nhật giỏ. | HTTP `400 Bad Request`, message báo số lượng phải dương. | High | Serious | `API_CART_05` |
| #3 | **[Cart] IDOR: User B xem được cart của User A**<br><br>1. Seed cart cho User A<br>2. Đăng nhập User B<br>3. Gọi `GET /api/cart/get` (spoof ID A nếu có) | Backend trả cart của User A cho User B (test FAIL). | API phải trả `403` hoặc cart rỗng cho user không sở hữu. | High | Fatal | `API_CART_07` |
| #4 | **[Cart] Không enforce MAX_ITEM_QTY**<br><br>1. Set env `MAX_ITEM_QTY = 2`<br>2. `POST /api/cart/add` tới đủ limit<br>3. Add lần nữa vượt limit | Backend chưa chặn vượt limit (test FAIL). | HTTP `400`, message `Max quantity reached`. | Medium | Serious | `API_CART_08` |
| #5 | **[Orders] PlaceOrder trả status/message sai**<br><br>1. Seed user có cart + food còn stock<br>2. `POST /api/order/place` với token user + payload items/amount/address<br>3. Đối chiếu status + body + DB order | Backend đang trả `200`/`Food Processing` (test FAIL), không đúng hợp đồng API. | HTTP `201`, `success:true`, order status `Pending`, trả `session_url`. | High | Serious | `API_ORDE_01` |
| #6 | **[Orders] Cho phép đặt hàng với giỏ rỗng**<br><br>1. `POST /api/order/place` với `items=[]`<br>2. Quan sát mã lỗi/message | Backend không trả `400` như kỳ vọng (test FAIL). | HTTP `400`, message yêu cầu ít nhất 1 item. | High | Serious | `API_ORDE_02` |
| #7 | **[Orders] Không update được Pending → Confirmed**<br><br>1. Đảm bảo order `Pending`<br>2. Admin `PATCH /api/order/status` với `{ status:'Confirmed' }`<br>3. Đọc lại order | Backend reject vì whitelist trạng thái (test FAIL). | HTTP `200`, order chuyển sang `Confirmed`. | Medium | Serious | `API_ORDE_05` |
| #8 | **[Orders] Cho phép nhảy trạng thái Pending → Delivered**<br><br>1. Đảm bảo order `Pending`<br>2. Admin `PATCH /api/order/status` với `{ status:'Delivered' }`<br>3. Kiểm tra phản hồi | Backend cho phép nhảy trạng thái (test FAIL). | HTTP `400`, message yêu cầu qua `Confirmed` trước. | High | Serious | `API_ORDE_06` |
| #9 | **[Orders] Trả lỗi không đúng khi Cancel lúc đang giao**<br><br>1. Seed order trạng thái `Out for delivery`<br>2. Admin `PATCH /api/order/status` thành `Cancelled`<br>3. Quan sát message | API trả `Invalid status` (test FAIL), thiếu luồng cancel phù hợp. | HTTP `400`, message nêu rõ không thể hủy khi đang giao. | Medium | Medium | `API_ORDE_07` |
| #10 | **[Food] Add Food trả status code sai**<br><br>1. Admin login lấy token<br>2. `POST /api/food/add` (form-data đầy đủ + ảnh)<br>3. Đối chiếu status + body + DB record | Backend hiện trả `200` (test FAIL). | HTTP `201`, `{ success:true, data.name='Matrix Pho' }`. | Medium | Medium | `API_FOOD_01` |
| #11 | **[Food] Không chặn giá quá lớn khi thêm món**<br><br>1. `POST /api/food/add` với `price = 9,999,999,999`<br>2. Quan sát response | Backend chấp nhận giá quá lớn (test FAIL). | HTTP `400` hoặc server từ chối giá vượt ngưỡng. | Medium | Serious | `API_FOOD_04` |
| #12 | **[Food] /api/food/list?q=Pizza không filter theo tên**<br><br>1. Seed nhiều món có chứa chuỗi `Pizza` và món khác<br>2. `GET /api/food/list?q=Pizza`<br>3. Đối chiếu data | Endpoint trả toàn bộ danh sách (test FAIL). | HTTP `200`, data chỉ gồm món khớp từ khóa. | Medium | Serious | `API_FOOD_07` |
| #13 | **[Food] /api/food/list?q=XYZ123 không trả rỗng**<br><br>1. Seed món không chứa `XYZ123`<br>2. `GET /api/food/list?q=XYZ123`<br>3. Kiểm tra `data` | Backend vẫn trả toàn bộ (test FAIL). | HTTP `200`, `data=[]`. | Low | Medium | `API_FOOD_08` |
| #14 | **[Food] Upload ảnh sai định dạng không bị từ chối**<br><br>1. `POST /api/food/add` với `image=invalid.txt`<br>2. Quan sát response | Backend chưa validate MIME/extension (test FAIL). | HTTP `400`, `{ status:'fail' }` và không tạo món. | Medium | Serious | `API_FOOD_09` |
| #15 | **[Users] Register trả status code sai (201 vs 200)**<br><br>1. `POST /api/user/register` với payload hợp lệ<br>2. Đối chiếu status + body | Backend đang trả `200` (test FAIL). | HTTP `201`, `{ success:true, token }`. | Low | Medium | `API_USER_01` |
| #16 | **[Users] Register email trùng trả sai status (409 vs 400)**<br><br>1. Register lần 1<br>2. Register lần 2 cùng email<br>3. Đối chiếu status | Backend hiện trả `400` (test FAIL). | HTTP `409 Conflict`, message báo trùng email. | Medium | Medium | `API_USER_04` |
| #17 | **[Users] User bị khóa vẫn login được**<br><br>1. Khóa user (toggle cart lock/lock flag theo test suite)<br>2. `POST /api/user/login` với user bị khóa<br>3. Đối chiếu status | Backend vẫn cho login (test FAIL). | HTTP `403`, message báo user bị khóa. | High | Serious | `API_USER_09` |

### Notes

- Keep **Defect ID** unique (you can follow `API-DEF-###` internally, but this table keeps `#0/#1` style as requested).
- For API defects, always capture: **endpoint, method, headers/auth, payload, status code, response body**.

