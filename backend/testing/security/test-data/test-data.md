# Security Test Data Catalog

| ID | Data | Notes |
| --- | --- | --- |
| TD-SEC-USERS-SQLI | `{ email: "' OR '1'='1", password: 'whatever' }` | Payload đăng nhập chứa SQLi và mật khẩu đệm. |
| TD-SEC-USERS-BRUTE | `wrongPassword`: `WrongPass123!`<br>`maxAttempts`: `10`<br>`seedPassword`: `Password123!` | Ngưỡng khoá tài khoản và mật khẩu dùng trong brute-force. |
| TD-SEC-USERS-ADMIN-ENDPOINT | `/api/user/list` | Endpoint cần quyền admin; dùng test IDOR. |
| TD-SEC-USERS-FORGED-TOKEN | Header `{ alg: 'none', typ: 'JWT' }` + payload mẫu `{ id: '<userId>' }` | Thành phần để ráp JWT unsigned. |
| TD-SEC-USERS-ROLE | `role: 'user'` | Quyền xuất phát trước khi thử leo thang. |
| TD-SEC-ORDERS-ADDRESS | `{ firstName: 'Security', lastName: 'Suite', phone: '+84 900 000 000', city: 'Ho Chi Minh', state: 'District 1', zipcode: '700000', country: 'Vietnam' }` | Địa chỉ giao hàng của nạn nhân (clone từ template chung). |
| TD-SEC-ORDERS-EMAIL | Định dạng: `{tag}+{timestamp}@security.test` | Email tạo attacker/victim riêng biệt. |
| TD-SEC-ORDERS-VICTIM-FIRST | `[{ _id: 'food-victim', name: 'Victim Meal', price: 9, quantity: 1 }]` | Chi tiết món trong đơn nạn nhân #1. |
| TD-SEC-ORDERS-VICTIM-SECOND | `[{ _id: 'food2', name: 'Victim Meal 2', price: 11, quantity: 1 }]` | Chi tiết món trong đơn nạn nhân #2. |
| TD-SEC-FOODS-ADMIN | `{ name: 'Security Admin', email: 'sec-admin+{timestamp}@security.test', password: 'Password123!', role: 'admin' }` | Tài khoản admin phục vụ kiểm thử endpoint an toàn. |
| TD-SEC-FOODS-PAYLOAD-SCRIPT | `<script>alert(1)</script>` | Mô tả món chứa script để test sanitize. |
| TD-SEC-FOODS-PAYLOAD-IMAGE | `<img src=x onerror="alert(1)">` | Payload XSS dạng ảnh lỗi. |
| TD-SEC-FOODS-METADATA | `{ nameScript: 'XSS Pho', nameSanitized: 'Sanitized Banh Mi' }` | Tên món trước/sau khi sanitize dùng để assert. |
