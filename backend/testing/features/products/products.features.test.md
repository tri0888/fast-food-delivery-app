# products.features.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FE-PROD-001 | System | Service tạo món mới với default và tên file ảnh | Không | 1. Chuẩn bị payload hợp lệ và file giả<br>2. Gọi `addFoodService.createFood`<br>3. Đọc kết quả trả về | DTO chứa đủ field, `isAvailable: true`, trường `image` là tên file, kiểm tra Jest pass | `TD-FEAT-PRODUCTS-PAYLOAD`, `TD-FEAT-PRODUCTS-FILES` | PASS |
| FE-PROD-002 | System | Name rỗng bị từ chối | Không | 1. Chuẩn bị payload với `name: ''` + file<br>2. Gọi `addFoodService.createFood`<br>3. Bắt lỗi | Promise reject `AppError('Food name is required')` | `TD-FEAT-PRODUCTS-PAYLOAD` | PASS |
| FE-PROD-003 | System | Price âm bị từ chối | Không | 1. Tạo payload với `price: -1`<br>2. Gọi service tạo món<br>3. Theo dõi lỗi | Promise reject `AppError('Price must be positive')` | `TD-FEAT-PRODUCTS-PAYLOAD` | PASS |
| FE-PROD-004 | System | Stock âm bị từ chối | Không | 1. Tạo payload với `stock: -5`<br>2. Gọi service tạo món<br>3. Theo dõi lỗi | Promise reject `AppError('Stock must be positive')` | `TD-FEAT-PRODUCTS-PAYLOAD` | PASS |
| FE-PROD-005 | System | Service cập nhật thông tin món và thay ảnh | Không | 1. Seed Food ban đầu<br>2. Gọi `editFoodService.updateFood` với data mới + file<br>3. Đọc kết quả | Trả về product với các trường đã đổi và đường dẫn ảnh mới | `TD-FEAT-PRODUCTS-PAYLOAD`, `TD-FEAT-PRODUCTS-FILES` | PASS |
| FE-PROD-006 | System | listFood trả đầy đủ danh sách cho UI | Không | 1. Seed 2 món mẫu với tên khác nhau<br>2. Gọi `listFoodService.getAllFoods()`<br>3. So sánh danh sách trả về với dữ liệu seed | Trả mảng 2 phần tử có tên tương ứng, Jest snapshot khớp | `TD-FEAT-PRODUCTS-PAYLOAD` | PASS |
| FE-PROD-007 | System | Xoá món sẽ unlink file trên đĩa | Không | 1. Spy `fs.unlink` và seed Food với ảnh<br>2. Gọi `removeFoodService.deleteFood(foodId)`<br>3. Kiểm tra promise và spy | Promise resolve, bản ghi xoá khỏi DB, `fs.unlink` được gọi với path ảnh | `TD-FEAT-PRODUCTS-PAYLOAD`, `TD-FEAT-PRODUCTS-FILES` | PASS |
