# ui.feature.spec

| ID | Mô tả test case | Inter-test case Dependence | Quy trình kiểm thử | Kết quả mong đợi | Dữ liệu kiểm thử | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| FEA_UI_FEAT_02 | Verify Responsive: Giao diện Mobile hiển thị đúng danh sách món | None | Thu nhỏ viewport xuống 375x720, load trang chủ, kiểm tra grid món ăn | UI vẫn hiển thị đủ danh sách món, không xuất hiện thanh cuộn ngang | User Action | |
| FEA_UI_FEAT_03 | Verify hiển thị ảnh món ăn (Broken image fallback) | None | Mock API ảnh trả 404 rồi mở trang chủ | Hình ảnh fallback/placeholder hiển thị thay cho ảnh lỗi | User Action | |
| FEA_UI_FEAT_04 | Verify Search Box: Kết quả hiển thị realtime hoặc sau Enter | None | Gõ từ khóa "pho" trong bộ lọc và Apply | Danh sách món thu hẹp theo từ khóa đã nhập | User Action | |
| FEA_UI_FEAT_06 | Verify Cart Icon: Badge số lượng cập nhật đúng | None | Đăng nhập giả, click nút thêm món bất kỳ | Badge hiển thị dấu chấm/đếm số lượng tăng | User Action | |
| FEA_UI_FEAT_07 | Verify Pagination: Click Next page load data mới | None | Nhấn nút Next của pagination trên trang chủ | Danh sách món chuyển sang dữ liệu trang tiếp theo | User Action | |
| FEA_UI_FEAT_09 | Verify Error Message: Hiển thị Toast đỏ khi lỗi server | None | Cho API /api/food/list trả 500 rồi load trang | Xuất hiện Toast cảnh báo màu đỏ mô tả lỗi server | User Action | |
| FEA_UI_FEAT_10 | Verify Logout: Redirect về Login page | None | Hover avatar, chọn Logout | Người dùng bị đăng xuất và chuyển về màn hình Login/Sign in | User Action | |
| FEA_UI_FEAT_12 | Verify Responsive: Giao diện Mobile hiển thị đúng danh sách món | None | Lặp lại kịch bản responsive ở viewport mobile khác | UI thích ứng tương tự, đủ món | User Action | |
| FEA_UI_FEAT_13 | Verify hiển thị ảnh món ăn (Broken image fallback) | None | Cho ảnh món trả lỗi và quan sát placeholder | Placeholder hiển thị thay thế | User Action | |
| FEA_UI_FEAT_14 | Verify Search Box: Kết quả hiển thị realtime hoặc sau Enter | None | Tìm kiếm với từ khóa khác và Apply | List cập nhật theo từ khóa | User Action | |
| FEA_UI_FEAT_16 | Verify Cart Icon: Badge số lượng cập nhật đúng | None | Tăng số lượng nhiều lần, kiểm tra badge | Badge phản ánh tổng số món sau mỗi lần thêm | User Action | |
| FEA_UI_FEAT_17 | Verify Pagination: Click Next page load data mới | None | Nhấn Next lần nữa | Data chuyển sang trang mới | User Action | |
| FEA_UI_FEAT_19 | Verify Error Message: Hiển thị Toast đỏ khi lỗi server | None | Mô phỏng lỗi mạng/server khi load list | Xuất hiện Toast đỏ mô tả lỗi | User Action | |
| FEA_UI_FEAT_20 | Verify Logout: Redirect về Login page | None | Click Logout ở hồ sơ | Quay về Login với nút Sign in | User Action | |
