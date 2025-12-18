# Security Test Data Catalog

| ID | Data | Notes |
| --- | --- | --- |
| TD-SEC-COMMON-EMAIL | Định dạng: `{tag}+{timestamp}@security.test`<br>Ví dụ: `attack+1734222222222@security.test` | Email duy nhất cho từng persona tấn công/phòng thủ. |
| TD-SEC-COMMON-PASSWORDS | `strong`: `Password123!`<br>`wrong`: `WrongPass123!` | Bộ mật khẩu chuẩn cho các ca brute-force/bypass. |
| TD-SEC-COMMON-SQLI | `' OR '1'='1` | Chuỗi SQLi cơ bản để chèn vào input đăng nhập. |
| TD-SEC-COMMON-FORGED-HEADER | `{ alg: 'none', typ: 'JWT' }` | Header JWT giả mạo dùng tạo token unsigned. |
| TD-SEC-COMMON-XSS | `scriptTag`: `<script>alert(1)</script>`<br>`imageOnError`: `<img src=x onerror="alert(1)">` | Payload XSS lưu trữ và DOM-based. |
| TD-SEC-COMMON-ADDRESS | `{ firstName: 'Security', lastName: 'Suite', phone: '+84 900 000 000', city: 'Ho Chi Minh', state: 'District 1', zipcode: '700000', country: 'Vietnam' }` | Địa chỉ nạn nhân dùng trong kịch bản IDOR/order. |
| TD-SEC-COMMON-ORDER-ITEMS | `victimBase()` → `{ _id: 'food-victim', name: 'Victim Meal', price: 9, quantity: 1 }`<br>`victimBase('2')` → `{ _id: 'food2', name: 'Victim Meal 2', price: 11, quantity: 1 }` | Item chuẩn để tái hiện chi tiết đơn nạn nhân (suffix điều chỉnh id/giá). |
| TD-SEC-COMMON-FOOD-ASSET | Buffer từ chuỗi `'security-food-image'` | Dữ liệu nhị phân ~21 bytes mô phỏng ảnh upload bảo mật. |
| TD-SEC-USERS-LEGIT | `{ email: 'legit@example.com', password: 'Password123!' }` | Tài khoản thật để so sánh hành vi xấu. |
| TD-SEC-USERS-SQLI | `{ email: "' OR '1'='1", password: 'whatever' }` | Payload đăng nhập chứa SQLi và mật khẩu đệm. |
| TD-SEC-USERS-BRUTE | `wrongPassword`: `WrongPass123!`<br>`maxAttempts`: `10`<br>`seedPassword`: `Password123!` | Ngưỡng khoá tài khoản và mật khẩu dùng trong brute-force. |
| TD-SEC-USERS-ADMIN-ENDPOINT | `/api/user/list` | Endpoint cần quyền admin; dùng test IDOR. |
| TD-SEC-USERS-FORGED-TOKEN | Header `{ alg: 'none', typ: 'JWT' }` + payload mẫu `{ id: '<userId>' }` | Thành phần để ráp JWT unsigned. |
| TD-SEC-USERS-ROLE | `role: 'user'` | Quyền xuất phát trước khi thử leo thang. |
| TD-SEC-ORDERS-ADDRESS | `{ firstName: 'Security', lastName: 'Suite', phone: '+84 900 000 000', city: 'Ho Chi Minh', state: 'District 1', zipcode: '700000', country: 'Vietnam' }` | Địa chỉ giao hàng của nạn nhân (clone từ template chung). |
| TD-SEC-ORDERS-ATTACKER | `role: 'user'`, `accountPassword: 'Test1234!'` | Hồ sơ attacker mặc định + mật khẩu tài khoản. |
| TD-SEC-ORDERS-EMAIL | Định dạng: `{tag}+{timestamp}@security.test` | Email tạo attacker/victim riêng biệt. |
| TD-SEC-ORDERS-VICTIM-FIRST | `[{ _id: 'food-victim', name: 'Victim Meal', price: 9, quantity: 1 }]` | Chi tiết món trong đơn nạn nhân #1. |
| TD-SEC-ORDERS-VICTIM-SECOND | `[{ _id: 'food2', name: 'Victim Meal 2', price: 11, quantity: 1 }]` | Chi tiết món trong đơn nạn nhân #2. |
| TD-SEC-FOODS-ADMIN | `{ name: 'Security Admin', email: 'sec-admin+{timestamp}@security.test', password: 'Password123!', role: 'admin' }` | Tài khoản admin phục vụ kiểm thử endpoint an toàn. |
| TD-SEC-FOODS-PAYLOAD-SCRIPT | `<script>alert(1)</script>` | Mô tả món chứa script để test sanitize. |
| TD-SEC-FOODS-PAYLOAD-IMAGE | `<img src=x onerror="alert(1)">` | Payload XSS dạng ảnh lỗi. |
| TD-SEC-FOODS-METADATA | `{ nameScript: 'XSS Pho', nameSanitized: 'Sanitized Banh Mi' }` | Tên món trước/sau khi sanitize dùng để assert. |
| TD-SEC-FOODS-ATTACHMENT | `{ buffer: Buffer('security-food-image'), filename: 'security.png' }` | Tập tin upload giả lập gồm buffer dữ liệu + tên file. |
