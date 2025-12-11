# products.features.test

| ID | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| FE-PROD-001 | Service tạo món mới với default và tên file ảnh | Không | 1. Chuẩn bị payload hợp lệ và file giả<br>2. Gọi `addFoodService.createFood`<br>3. Đọc kết quả trả về | Kết quả có đủ field, `isAvailable: true`, `image` là chuỗi | Payload `{ name: 'Spec Salad', price: 9, stock: 5 }`, file `{ filename: 'spec-salad.jpg' }` | Tự động (Jest) |
| FE-PROD-002A | Name rỗng bị từ chối | Không | 1. Chuẩn bị payload với `name: ''` + file<br>2. Gọi `addFoodService.createFood` | Promise reject `AppError` | Payload `{ name: '' , ... }` | Tự động (Jest) |
| FE-PROD-002B | Price âm bị từ chối | Không | 1. Payload với `price: -1`<br>2. Gọi service tạo món | Promise reject `AppError` | Payload `price: -1` | Tự động (Jest) |
| FE-PROD-002C | Stock âm bị từ chối | Không | 1. Payload với `stock: -5`<br>2. Gọi service tạo món | Promise reject `AppError` | Payload `stock: -5` | Tự động (Jest) |
| FE-PROD-003 | Service cập nhật thông tin món và thay ảnh | Không | 1. Seed Food ban đầu<br>2. Gọi `editFoodService.updateFood` với data mới + file<br>3. Đọc kết quả | Trả về product với giá trị đã đổi | Food `_id`, payload `name: 'Updated Spec', price: 11`... | Tự động (Jest) |
| FE-PROD-004 | Xoá món sẽ unlink file trên đĩa | Không | 1. Spy `fs.unlink` và seed Food với ảnh<br>2. Gọi `removeFoodService.deleteFood(foodId)`<br>3. Kiểm tra promise và spy | Promise resolve, bản ghi xoá, unlink được gọi | Food `image: 'removable.jpg'` | Tự động (Jest) |
| FE-PROD-005 | listFood trả đầy đủ danh sách cho UI | Không | 1. Seed 2 món mẫu với tên khác nhau<br>2. Gọi `listFoodService.getAllFoods()`<br>3. So sánh danh sách trả về với dữ liệu seed | Trả mảng 2 phần tử có tên tương ứng | Hai bản ghi Food (`List Salad A/B`) | Tự động (Jest) |
