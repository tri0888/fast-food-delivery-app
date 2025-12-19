# Features Defect List

> Purpose: Track defects found by **feature tests** (`backend/testing/features`).

## Defect log

| Defect ID | Defect Description & Steps to reproduce | Actual Result | Expected Result | Priority | Serverity | Testcase ID |
|---|---|---|---|---|---|---|
| #1 | **[Flow] Register → Login → AddCart → Checkout end-to-end thất bại**<br><br>Gọi lần lượt service register, login, listFood, addToCart, placeOrder | Test FAIL: luồng không tạo order/không trả session URL/không clear cart như mong đợi. | Order tạo thành công, Stripe trả `session_url`, cart user rỗng. | High | Serious | `FEA_FLOW_FEAT_01` |
| #2 | **[Flow] Admin add food nhưng user không thấy món mới**<br><br>Tạo admin, login, addFoodService, sau đó listFood cho user | Test FAIL: món mới không xuất hiện trong catalog user hoặc addFood/listFood lỗi. | Sản phẩm vừa thêm xuất hiện trong catalog cho user. | Medium | Serious | `FEA_FLOW_FEAT_02` |
| #3 | **[Flow] Cancel order không đồng bộ trạng thái cho admin**<br><br>Seed order `Pending` rồi update status `Cancelled`, admin query lại | Test FAIL: admin không thấy status `Cancelled` như kỳ vọng. | Admin nhìn thấy trạng thái đơn đã đổi sang `Cancelled`. | High | Serious | `FEA_FLOW_FEAT_03` |
| #4 | **[Flow] Luồng checkout (dataset 2) thất bại**<br><br>Lặp lại luồng full user checkout với bộ dữ liệu khác | Test FAIL: không tạo được đơn hoặc session URL không hợp lệ. | Đơn hàng mới được tạo, session URL hợp lệ. | High | Serious | `FEA_FLOW_FEAT_04` |
| #5 | **[Flow] Admin add food lần 2 không phản ánh cho user**<br><br>Tạo sản phẩm mới lần 2 rồi list | Test FAIL: user không thấy món mới ngay lập tức. | Người dùng thấy món mới ngay lập tức. | Medium | Serious | `FEA_FLOW_FEAT_05` |
| #6 | **[Flow] Cancel order (case lặp) vẫn thất bại**<br><br>User gửi yêu cầu hủy, admin kiểm trạng thái | Test FAIL: trạng thái không đồng bộ về `Cancelled`. | Trạng thái đồng bộ về `Cancelled` ở dashboard admin. | High | Serious | `FEA_FLOW_FEAT_06` |

### Notes

- Feature defects should reference the **business rule** being violated and the user journey.

