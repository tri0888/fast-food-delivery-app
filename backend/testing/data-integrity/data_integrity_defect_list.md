# Data Integrity Defect List

> Purpose: Track defects found by **data-integrity test suite** (`backend/testing/data-integrity`).

## Defect log

| Defect ID | Defect Description & Steps to reproduce | Actual Result | Expected Result | Priority | Serverity | Testcase ID |
|---|---|---|---|---|---|---|
| #1 | **[Food Model] Không chặn name > 255 ký tự khi insert**<br><br>1. Tạo `name` dài 300 ký tự<br>2. `Food.create({ name, ... })`<br>3. Quan sát validate | Test FAIL: schema không reject (hoặc reject sai) khi name quá dài. | Hệ thống chặn và báo lỗi độ dài (name ≤ 255). | Medium | Serious | `DAT_FOOD_DI_02` |
| #2 | **[Food Model] Không chặn name > 255 ký tự khi update**<br><br>1. Seed food hợp lệ<br>2. `findByIdAndUpdate` với name 400 ký tự (`runValidators=true`)<br>3. Quan sát lỗi | Test FAIL: update không bị từ chối dù vượt chiều dài. | Update bị từ chối do vượt chiều dài. | Medium | Serious | `DAT_FOOD_DI_04` |
| #3 | **[Order Service] Không reject khi amount không khớp tổng items**<br><br>1. Items có tổng = 20<br>2. Gọi `placeOrderService` với `amount=999`<br>3. Quan sát phản hồi | Test FAIL: service không reject khi amount mismatch. | Service reject vì `amount` không khớp sum. | High | Serious | `DAT_ORDE_DI_03` |
| #4 | **[Order Model] Cho phép items tham chiếu foodId không tồn tại**<br><br>1. `Order.create` với `items` chứa `_id` không tồn tại<br>2. Theo dõi kết quả lưu | Test FAIL: schema không chặn phantom food reference. | Schema từ chối vì vi phạm ràng buộc. | High | Serious | `DAT_ORDE_DI_05` |
| #5 | **[Order Model] Cho phép amount lệch tổng items (DB)**<br><br>1. `Order.create` với `amount=50` nhưng sum items = 10<br>2. Theo dõi validation/outcome | Test FAIL: insert không bị từ chối dù amount mismatch. | Schema từ chối insert khi `amount` lệch tổng item. | High | Serious | `DAT_ORDE_DI_06` |

### Notes

- Data-integrity defects should include **schema/rules**, **DB state**, and **exact document sample** needed to reproduce.

