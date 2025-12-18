# Data-Integrity Test Data Catalog

| ID | Data | Notes |
| --- | --- | --- |
| TD-DI-USERS-BUILD | name: `Integrity User`<br>email: `integrity+{timestamp}@example.com`<br>password: `Password123!` | User mẫu cho kiểm thử dữ liệu (email duy nhất nhờ timestamp). |
| TD-DI-FOODS-BASE | `{ name: 'Integrity Pho', description: 'CSV-mapped baseline row', price: 25, image: 'pho.jpg', category: 'Pho' }` | Bản ghi món ăn chuẩn để so sánh CRUD. |
| TD-DI-FOODS-LONG-NAME | Chuỗi `'X'` lặp `length` lần | Dữ liệu biên kiểm thử validation tên quá dài (mặc định `length = 256`). |
| TD-DI-CARTS-PAYLOAD | `{ phantomFood: 2, 'item-{timestamp}': 1 }` | Payload giỏ chứa key ảo để phát hiện cột không hợp lệ. |
| TD-DI-ORDERS-FRONTEND | `http://localhost:4173` | Nguồn frontend chuẩn để kiểm tra CORS/order origin. |
| TD-DI-ORDERS-ADDRESS | `{ firstName: 'Data', lastName: 'Integrity', phone: '+84 900 000 000', city: 'Ho Chi Minh', state: '1', zipcode: '700000', country: 'Vietnam' }` | Địa chỉ giao nhận phục vụ các ca mismatch/truy vết. |
| TD-DI-ORDERS-GHOST-FOOD | `{ _id: '000000000000000000000000', name: 'Ghost Food', price: 15, quantity: 1 }` | Món ăn ma dùng để test reference không tồn tại. |
| TD-DI-ORDERS-PHANTOM-ITEM | `{ _id: 'fake-food', name: 'Phantom Item', price: 20, quantity: 1 }` | Item không có thật để kích hoạt lỗi xác thực. |
| TD-DI-ORDERS-MISMATCH-LIST | `[{ _id: 'food-a', name: 'A', price: 5, quantity: 1 }, { _id: 'food-b', name: 'B', price: 5, quantity: 1 }]` | Danh sách 2 món dùng để so sánh lệch tổng/chi tiết. |
