# order-surface.security.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SEC_ORDE_SEC_01 | Integration | IDOR: User A override body `userId` để lấy order của User B. | None | 1. Đăng nhập với token của User A.<br>2. Gọi `POST /api/order/userorders` nhưng set `userId` trong body = User B.<br>3. Quan sát status/response. | API trả `403 Forbidden` và không trả dữ liệu của User B. | `TD-SEC-ORDERS-EMAIL`, `TD-SEC-ORDERS-VICTIM-FIRST`, `TD-SEC-ORDERS-ADDRESS` | FAIL |
| SEC_ORDE_SEC_02 | Integration | IDOR: User A gọi endpoint list với tham số `orderId` của B. | None | 1. Đăng nhập với token User A (role user).<br>2. Gọi `GET /api/order/list?orderId=<order của B>`.<br>3. Kiểm tra phản hồi. | Yêu cầu bị từ chối với `403`, không lộ dữ liệu nạn nhân. | `TD-SEC-ORDERS-EMAIL`, `TD-SEC-ORDERS-VICTIM-SECOND`, `TD-SEC-ORDERS-ADDRESS` | FAIL |
