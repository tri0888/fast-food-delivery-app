# API Test Data Catalog

| ID | Data | Notes |
| --- | --- | --- |
| TD-API-COMMON-NULL-ID | `000000000000000000000000` | ObjectId 24 ký tự toàn số 0 để kiểm tra lỗi không tìm thấy. |
| TD-API-COMMON-PASSWORDS | `strong`: `Password123!`<br>`weak`: `12345`<br>`wrong`: `WrongPass999!` | Bộ mật khẩu chuẩn cho ca đăng ký/đăng nhập (đúng, yếu, sai). |
| TD-API-CART-USER-EMAIL | Định dạng: `csv-cart-{tag}-{timestamp}-{hex}@example.com`<br>Ví dụ: `csv-cart-user-1734222222222-bc09ef@example.com` | Email khách hàng chuyên dùng cho Cart API, bảo đảm duy nhất theo tag. |
| TD-API-CART-FOOD-NAMES | `starter`: `API Cart Starter`<br>`increment`: `API Cart Increment`<br>`remove`: `API Cart Remove`<br>`totalEntree`: `Cart Entree`<br>`totalDrink`: `Cart Drink`<br>`negative`: `API Cart Negative`<br>`autoRemove`: `API Cart Auto Remove`<br>`privacy`: `API Cart Privacy`<br>`limit`: `API Cart Limit` | Danh sách tên món cố định cho từng ca thêm/bớt/tính tiền trong giỏ. |
| TD-API-CART-PRICING | `entree`: `15`<br>`drink`: `4` | Giá chuẩn để tính tổng hóa đơn giỏ hàng (món chính + nước). |
| TD-API-CART-LIMITS | `invalidQuantity`: `-3`<br>`quantityLimit`: `2` | Biên giá trị số lượng (âm để thử lỗi, 2 để thử giới hạn tối đa). |
| TD-API-ORDERS-USER-EMAIL | Định dạng: `csv-orders-{tag}-{timestamp}-{hex}@example.com`<br>Ví dụ: `csv-orders-user-1734222222222-ca7810@example.com` | Email khách đặt hàng nhằm phân tách mỗi test Order API. |
| TD-API-ORDERS-MENU-ITEMS | `combo`: `{ name: 'Order Matrix Combo', price: 20 }`<br>`ownerMeal`: `{ name: 'Owner Meal', price: 12 }`<br>`otherMeal`: `{ name: 'Other Meal', price: 9 }`<br>`pending`: `{ name: 'Matrix Pending', price: 15 }`<br>`skip`: `{ name: 'Matrix Skip', price: 18 }`<br>`delivery`: `{ name: 'Matrix Delivery', price: 22 }`<br>`verify`: `{ name: 'Matrix Verify', price: 30 }` | Danh mục món cố định (giá USD giả định) cho Order API. |
| TD-API-ORDERS-ADDRESS | street: `CSV Matrix St`<br>city: `Ho Chi Minh`<br>state: `SG`<br>zipcode: `700000`<br>country: `Vietnam` | Địa chỉ giao hàng (clone từ template chung) dùng cho Order API. |
| TD-API-PRODUCTS-BASE-PAYLOAD | name: `Matrix Pho`<br>description: `CSV baseline food`<br>price: `12`<br>category: `Pho`<br>stock: `5` | Payload mặc định khi tạo sản phẩm mới (có thể override từng field). |
| TD-API-PRODUCTS-FILES | `sampleImageBuffer`: Buffer từ chuỗi `'fast-food-matrix-image'`<br>`defaultImageName`: `matrix.png`<br>`invalidImageName`: `invalid.txt` | Buffer mẫu ~22 bytes + tên file hợp lệ/sai để test upload. |
| TD-API-USERS-REGISTER-PAYLOAD | name: `CSV Matrix User`<br>email: `csv-register-{tag}-{timestamp}-{hex}@example.com`<br>password: `Password123!`<br>Ví dụ email: `csv-register-user-1734222222222-de34fa@example.com` | Payload đăng ký người dùng chuẩn, cho phép override field khi cần. |
| TD-API-USERS-UNIQUE-EMAIL | Định dạng: `csv-user-{tag}-{timestamp}-{hex}@example.com`<br>Ví dụ email: `csv-user-admin-1734222222222-91ab34@example.com` | Email duy nhất cho từng test user API (login/profile). |
| TD-API-USERS-INVALID-EMAIL | `invalid-email` | Chuỗi email sai format để test lỗi validate. |
| TD-API-USERS-WRONG-PASSWORD | `WrongPass999!` | Mật khẩu sai dùng cho ca đăng nhập thất bại. |
