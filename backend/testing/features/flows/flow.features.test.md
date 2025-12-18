# flows.features.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FEA_FLOW_FEAT_01 | System | User Register -> Login -> Search Food -> Add Cart -> Checkout | None | Gọi lần lượt service register, login, listFood, addToCart, placeOrder | Order tạo thành công, Stripe trả session URL, cart user rỗng | `TD-FEAT-FLOWS-USERS`, `TD-FEAT-FLOWS-FOODS`, `TD-FEAT-FLOWS-CHECKOUT` | FAIL |
| FEA_FLOW_FEAT_02 | System | Admin Login -> Add Food -> Verify User sees new food | None | Tạo admin, login, dùng addFoodService, rồi listFood | Sản phẩm vừa thêm xuất hiện trong catalog cho user | `TD-FEAT-USERS-ADMIN`, `TD-FEAT-PRODUCTS-PAYLOAD`, `TD-FEAT-PRODUCTS-FILES` | FAIL |
| FEA_FLOW_FEAT_03 | System | Cancel Order: User cancel -> Admin sees status 'Cancelled' | None | Seed order Pending, yêu cầu cập nhật trạng thái Cancelled | Admin nhìn thấy trạng thái đơn đã đổi sang Cancelled | `TD-FEAT-FLOWS-USERS`, `TD-FEAT-FLOWS-CHECKOUT` | FAIL |
| FEA_FLOW_FEAT_04 | System | User Register -> Login -> Search Food -> Add Cart -> Checkout | None | Lặp lại luồng full user checkout ở bộ dữ liệu khác | Đơn hàng mới được tạo, session URL hợp lệ | `TD-FEAT-FLOWS-USERS`, `TD-FEAT-FLOWS-FOODS`, `TD-FEAT-FLOWS-CHECKOUT` | FAIL |
| FEA_FLOW_FEAT_05 | System | Admin Login -> Add Food -> Verify User sees new food | None | Tạo sản phẩm mới lần 2 rồi list | Người dùng thấy món mới ngay lập tức | `TD-FEAT-USERS-ADMIN`, `TD-FEAT-PRODUCTS-PAYLOAD`, `TD-FEAT-PRODUCTS-FILES` | FAIL |
| FEA_FLOW_FEAT_06 | System | Cancel Order: User cancel -> Admin sees status 'Cancelled' | None | Người dùng gửi yêu cầu hủy, admin kiểm trạng thái | Trạng thái đồng bộ về 'Cancelled' ở dashboard admin | `TD-FEAT-FLOWS-USERS`, `TD-FEAT-FLOWS-CHECKOUT` | FAIL |
