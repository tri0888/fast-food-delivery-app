# admin.usability.test

| ID | Test level | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| USABILITY-ADMIN-001 | Acceptance | Sidebar dễ tìm và có trạng thái active rõ ràng | Không | 1. Mở Admin app (preview/dev).\n2. Quan sát sidebar.\n3. Click lần lượt `Users`, `Orders`, `List Items`, `Add Items`. | Sidebar luôn hiển thị; mục đang chọn có highlight (active) rõ ràng; người dùng không bị “lạc”. | N/A | PASS |
| USABILITY-ADMIN-002 | Acceptance | Form Add Items có label/placeholder rõ ràng và thao tác bàn phím được | Không | 1. Vào `/add`.\n2. Dùng phím Tab đi qua các input/textarea.\n3. Nhập thử Name/Price/Description/Stock. | Tab order hợp lý; focus outline rõ; nhập liệu bình thường; không bị mất focus bất thường. | N/A | PASS |
| USABILITY-ADMIN-003 | Acceptance | Thông báo lỗi/validation (nếu có) dễ hiểu, không “silent fail” | USABILITY-ADMIN-002 | 1. Ở `/add`, để trống trường bắt buộc.\n2. Bấm submit (hoặc hành động tương đương).\n3. Quan sát thông báo. | Có feedback cho người dùng (toast/inline error); thông điệp cụ thể, hướng dẫn cách sửa. | N/A | PASS |
