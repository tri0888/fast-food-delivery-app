# foods.data-integrity.test

| ID | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| DI-FOOD-001 | Schema Food áp giá trị mặc định | Không | 1. Chuẩn bị payload tối thiểu hợp lệ<br>2. Gọi `Food.create`<br>3. Đọc document trả về | Bản ghi có `isAvailable: true`, `stock: 0`, timestamp đầy đủ | `{ name: 'Data Burger', description: 'Integrity slice', price: 15, image: 'data-burger.jpg', category: 'Burger' }` | Tự động (Jest) |
| DI-FOOD-002 | Giá trị override được giữ nguyên | Không | 1. Chuẩn bị payload với `stock: 7`, `isAvailable: false`<br>2. Gọi `Food.create`<br>3. Kiểm tra giá trị lưu | Document lưu y nguyên override | Payload cơ bản + override | Tự động (Jest) |
| DI-FOOD-003A | Thiếu trường `name` khi tạo Food | Không | 1. Sao chép payload mẫu<br>2. Xoá thuộc tính `name`<br>3. Gọi `Food.create` | Promise reject với lỗi thiếu name | Payload thiếu `name` | Tự động (Jest) |
| DI-FOOD-003B | Thiếu trường `description` khi tạo Food | Không | 1. Sao chép payload mẫu<br>2. Xoá `description`<br>3. Gọi `Food.create` | Promise reject lỗi thiếu description | Payload thiếu `description` | Tự động (Jest) |
| DI-FOOD-003C | Thiếu trường `price` khi tạo Food | Không | 1. Xoá `price` khỏi payload<br>2. Gọi `Food.create` | Promise reject lỗi thiếu price | Payload thiếu `price` | Tự động (Jest) |
| DI-FOOD-003D | Thiếu trường `image` khi tạo Food | Không | 1. Xoá `image` khỏi payload<br>2. Gọi `Food.create` | Promise reject lỗi thiếu image | Payload thiếu `image` | Tự động (Jest) |
| DI-FOOD-003E | Thiếu trường `category` khi tạo Food | Không | 1. Xoá `category` khỏi payload<br>2. Gọi `Food.create` | Promise reject lỗi thiếu category | Payload thiếu `category` | Tự động (Jest) |
| DI-FOOD-004A | Trường `name` rỗng bị từ chối | Không | 1. Tạo payload với `name: ''`<br>2. Gọi `Food.create` và bắt lỗi | Lỗi validate nêu `name` | Payload `name: ''` | Tự động (Jest) |
| DI-FOOD-004B | Trường `description` rỗng bị từ chối | Không | 1. Tạo payload với `description: ''`<br>2. Gọi `Food.create` | Lỗi validate nêu `description` | Payload `description: ''` | Tự động (Jest) |
