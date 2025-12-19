# frontend.usability.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| USABILITY-FE-001 | Acceptance | Điều hướng cơ bản rõ ràng: Home/Cart nhìn thấy và click được | Không | 1. Mở frontend `/`.\n2. Quan sát navbar.\n3. Click link Home và icon/cart link. | Navbar hiển thị rõ; link/CTA click được; không có yếu tố UI bị che khuất. | N/A | PASS |
| USABILITY-FE-002 | Acceptance | Explore menu/category có phản hồi khi click (active state) | Không | 1. Ở `/`, scroll tới `Explore Our Menu`.\n2. Click 1 category (vd: Salad).\n3. Click lại cùng category để toggle về `All`. | Category có trạng thái active rõ; thao tác toggle hoạt động; người dùng hiểu filter đang áp dụng. | N/A | PASS |
| USABILITY-FE-003 | Acceptance | Add-to-cart có phản hồi trực quan (counter/badge) | Không | 1. Ở danh sách món, bấm nút add (+).\n2. Quan sát counter tại card món hoặc navbar cart. | Counter/badge tăng; người dùng nhận ra hành động đã được ghi nhận. | N/A | PASS |
