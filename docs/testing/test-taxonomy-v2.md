# Unified Test Taxonomy (API · Data Integrity · Features · Security · Screen · Stress)

## 1. Scope Realignment

| Category        | Purpose                                                                 | Current Sources / Action                                                                                      |
|-----------------|-------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| **API**         | Contract & behavior of REST endpoints (status codes, payloads, auth).    | Keep `backend/testing/api`. Re-tag tests per feature area (login, orders, cart, products, users).             |
| **Data Integrity** | Schema defaults, migrations, data rules (formerly `database`).          | Move suites from `backend/testing/database` here. Extend to cover cross-collection invariants (orders + stock).|
| **Features**    | End-to-end business capabilities at service level (replaces integration/system/regression/unit). | Consolidate `backend/testing/integration`, `system`, `regression`, `unit` into feature-focused folders (login, orders, cart, products, users).|
| **Security**    | Hardening and abuse-prevention tests (auth bypass, injection, privilege checks). | Keep `backend/testing/security` but expand per feature.                                                        |
| **Screen**      | UI/UX validations via Playwright for both customer and admin surfaces.   | Relocate `frontend/e2e` and `admin/e2e` under a shared `tests/screen/{frontend,admin}` wrapper (logical mapping).|
| **Stress**      | Throughput & resilience (k6).                                            | Keep `backend/testing/stress`.                                                                                |

> All other legacy categories (unit/system/integration/regression) will be sunset once their suites are migrated into the Feature folders.

## 2. Feature Coverage Matrix

The following matrix enumerates every scenario that must exist across **API**, **Data Integrity**, **Features**, **Security**, and **Screen**. Each bullet represents an individual test case (or small group) to ensure exhaustive coverage.

### 2.0 Vì sao phân loại Valid/Invalid?

- Các **Valid case** mô tả hành trình lý tưởng mà hệ thống cam kết cung cấp. Khi những bước này pass, ta biết rằng yêu cầu nghiệp vụ chính (đặt món, thanh toán, cập nhật tồn kho, thao tác quản trị, v.v.) vẫn hoạt động xuyên suốt qua mọi lớp (service, controller, UI).
- Các **Invalid case** mô tả những điểm thất bại phổ biến nhất (dữ liệu rỗng, tham số sai định dạng, truy cập sai quyền, kho không đủ, payload độc hại). Việc ghi rõ giúp đồng bộ giữa đội phát triển và QA về việc “chặn” hành vi nào, đồng thời gom đủ dữ liệu để viết test bảo vệ những ràng buộc này.
- Với mỗi capability ở bên dưới, chúng ta chú thích lý do vì sao các trường hợp được chọn và cung cấp trạng thái cover thực tế của từng methodology (White-box/Black-box/Stress/Screen) để trả lời câu hỏi “áp dụng phương pháp đó đã phủ đủ chưa”.

### 2.1 Chức năng đăng nhập (Login)

**Vì sao các Valid case này?**
- API: happy path cho user/admin và khả năng “remember session” → xác nhận hai vai trò chính đều lấy được token để truy cập các route còn lại.
- Security: token replay/giả mạo chữ ký/brute-force lockout → bảo vệ cổng vào duy nhất của backend, tránh việc một tài khoản bị chiếm dụng rồi quét toàn hệ thống.
- Features: login + redirect + session persistence nhiều tab → đảm bảo service layer giữ nguyên thông tin người dùng và state đồng nhất giữa browser contexts.
- Screen: UI hiển thị lỗi inline/loading/toast → giúp người dùng thật nhận phản hồi kịp thời, giảm ticket hỗ trợ.

**Vì sao các Invalid case này?**
- Thiếu email/password → trường hợp form phổ biến nhất mà khách hàng gặp do nhập thiếu.
- Email sai định dạng (`foo@`) → bẫy validator để tránh lưu dữ liệu rác/khó liên hệ.
- Sai mật khẩu vs người dùng tồn tại (401 `Incorrect Password`) → bảo vệ trải nghiệm khi người dùng quên pass.
- Email không tồn tại (401 `Incorrect Email`) → tránh lộ thông tin nội bộ và đảm bảo thông báo chung chung.
- Payload NoSQL/JSON injection → phòng thử nghiệm bảo mật dùng các payload này đầu tiên, nên test cần cover để tránh bypass.
- Tài khoản bị khóa/vô hiệu → phục vụ quy trình khóa thủ công bởi CS/Compliance.

**Coverage status (07/12/2025)**

| Methodology | Test suite(s) | Status | Ghi chú |
|-------------|---------------|--------|---------|
| White-box · Features | `backend/testing/features/login/login.features.test.js` | Covered | Kiểm tra đăng ký → đăng nhập và toàn bộ validator dịch vụ.
| Black-box · API | `backend/testing/api/users.api.test.js` | Covered | Đảm bảo `/api/user/register` và `/api/user/login` trả token/role đúng.
| Black-box · Security Hardening | `backend/testing/api/security.api.test.js` | Partial | Đã chặn injection vào payload login; token replay & brute-force sẽ bổ sung ở đợt kế tiếp.
| Screen · Frontend/Admin | _Chưa có_ | Gap | Chưa viết Playwright spec cho màn hình login.

### 2.2 Chức năng quản lý đơn hàng (Order Management – Customer + Admin)

**Vì sao các Valid case này?**
- Đặt đơn + giữ hàng + trả Stripe URL → bảo đảm chuỗi “Add to cart → Checkout → Redirect thanh toán” hoàn tất và không gây thất thoát tồn kho.
- Verify thành công cập nhật `payment`/timeline → chứng minh webhook/tín hiệu Stripe được phản ứng đúng và người dùng nhìn thấy trạng thái mới.
- Admin cập nhật trạng thái theo luồng Processing → Delivering → Delivered kèm audit → đáp ứng SLA giao nhận và báo cáo nội bộ.
- Screen: lịch sử đơn khách + dashboard admin → xác nhận UI hiển thị cùng dữ liệu với backend sau các mutation.

**Vì sao các Invalid case này?**
- Checkout với giỏ trống / item sai / thiếu stock → ràng buộc cơ bản để tránh đơn ghost.
- Verify sai orderId hoặc thất bại thanh toán → đảm bảo hoàn hàng & trả stock nhằm tránh âm kho.
- Admin cập nhật trạng thái thiếu token/sai quyền/sai payload → bảo vệ đặc quyền quản trị, giảm rủi ro insider.
- Orphan order / stock âm → giữ nhất quán giữa `orders` và `foods` collections.

**Coverage status (07/12/2025)**

| Methodology | Test suite(s) | Status | Ghi chú |
|-------------|---------------|--------|---------|
| White-box · Features | `backend/testing/features/orders/orders.features.test.js` | Covered | Thực thi end-to-end place/verify/update ngay tại service layer.
| White-box · Data Integrity | `backend/testing/data-integrity/orders.data-integrity.test.js` | Covered | Kiểm tra default, yêu cầu trường bắt buộc và hoàn kho khi verify thất bại.
| Black-box · API | `backend/testing/api/orders.api.test.js` | Covered | Đảm bảo `/api/order/*` tuân thủ RBAC và trả lỗi đúng.
| Black-box · Security | `backend/testing/security/order-surface.security.test.js` | Covered | Kiểm thử token giả mạo và user thường cố chỉnh trạng thái.
| Black-box · Screen | _Chưa có_ | Gap | Chưa có Playwright spec cho lịch sử đơn khách/admin.
| Stress · k6 | `backend/testing/stress/k6-orders.js` | Covered | Chạy tải đồng thời để đo throughput và phát hiện race đặt đơn.

### 2.3 Chức năng giỏ hàng (Cart)

**Vì sao các Valid case này?**
- Thêm món mới hoặc tăng số lượng món cũ → chứng minh logic cộng dồn trong `cartData` không mất dữ liệu.
- Điều chỉnh bằng nút +/- đến khi xóa → bảo đảm business rule “0 thì xóa” vận hành đúng.
- Remove toàn bộ & clear cart khi checkout → tránh trường hợp khách bị trừ tiền nhưng cart không trống.
- Screen: huy hiệu, tổng tiền, empty state → giữ trải nghiệm đồng nhất với trạng thái thực tế.

**Vì sao các Invalid case này?**
- Thêm khi thiếu token/food không tồn tại/cart bị lock → chống nhập sai quyền hoặc sản phẩm đã ngưng bán.
- Remove khi item không tồn tại/giảm âm số lượng → ngăn tham số bá đạo làm hỏng cart của user khác.
- Race condition add/remove đồng thời → dễ phát sinh khi nhiều tab/máy cùng thao tác, nên cần stress thử.

**Coverage status (07/12/2025)**

| Methodology | Test suite(s) | Status | Ghi chú |
|-------------|---------------|--------|---------|
| White-box · Features | `backend/testing/features/cart/cart.features.test.js` | Covered | Kiểm tra create/remove/get cart trực tiếp ở service.
| Black-box · API | `backend/testing/api/cart.api.test.js` | Covered | Đảm bảo endpoint yêu cầu token và xử lý foodId hợp lệ.
| White-box · Data Integrity | `backend/testing/data-integrity/users.data-integrity.test.js` | Covered | Xác minh `cartData` mặc định rỗng nhưng vẫn tồn tại khi đọc lại.
| Black-box · Security | `backend/testing/api/security.api.test.js` | Partial | Đã có case “không token không add”; cần thêm test cart lock / token giả trong security suite.
| Screen · Frontend | `frontend/e2e/specs/cart/*.spec.ts` | Covered | Playwright mô phỏng add/update/remove trên UI khách hàng.
| Stress · Race micro-test | _Chưa có riêng_ | Gap | Chưa dựng test mô phỏng add/remove đồng thời (dự kiến bổ sung chung với stress k6).

### 2.4 Chức năng quản lý sản phẩm (Product Management)

**Vì sao các Valid case này?**
- Admin tạo mới đầy đủ payload + upload ảnh + chỉnh sửa/xóa → đảm bảo vòng đời sản phẩm (CRUD) hoạt động xuyên suốt backend.
- Bộ lọc danh sách + điều chỉnh stock đổ ra menu → tránh mismatch giữa dữ liệu quản trị và menu khách xem.
- Screen: luồng list/edit/add cùng toast → xác nhận người vận hành nhìn thấy phản hồi tức thì khi quản trị menu.

**Vì sao các Invalid case này?**
- Thiếu trường, giá <= 0, stock < 0, thiếu ảnh → bảo vệ ràng buộc kinh doanh và dữ liệu hiển thị.
- Người không phải admin hoặc thiếu token → tránh người dùng thường tự thêm món.
- Tính toàn vẹn: tên trùng, stock không phải số → đảm bảo báo cáo tồn kho chính xác.

**Coverage status (07/12/2025)**

| Methodology | Test suite(s) | Status | Ghi chú |
|-------------|---------------|--------|---------|
| White-box · Features | `backend/testing/features/products/products.features.test.js` | Covered | Test service add/edit/remove, bao gồm xoá file ảnh.
| Black-box · API | `backend/testing/api/products.api.test.js` | Covered | Gửi multipart, kiểm tra quyền admin, payload invalid.
| White-box · Data Integrity | `backend/testing/data-integrity/foods.data-integrity.test.js` | Covered | Kiểm tra default schema + yêu cầu trường bắt buộc.
| Screen · Admin | `admin/e2e/specs/foods/*.spec.ts` | Covered | Playwright bao phủ thêm/sửa/xóa sản phẩm trên UI quản trị.
| Screen · Storefront | _Chưa có_ | Gap | Cần thêm spec để đảm bảo khách nhìn thấy danh sách/menu mới ngay sau CRUD.

### 2.5 Chức năng quản lý người dùng (User Management)

**Vì sao các Valid case này?**
- Admin tạo user/sửa role/lock cart/reset password → đây là những thao tác vận hành thường nhật của bộ phận CS.
- API trả danh sách phân trang + filter → phục vụ dashboard admin và báo cáo.
- Screen: bảng người dùng, pop-up xác nhận → tránh thao tác nhầm, cần phản hồi rõ ràng.

**Vì sao các Invalid case này?**
- Email trùng, password yếu, role ngoài enum → giữ tuân thủ bảo mật, tránh tạo tài khoản rác.
- Truy cập trái phép hoặc tự nâng quyền → ngăn lạm dụng quyền admin.
- `cartData` phải tồn tại cả khi rỗng → các service khác phụ thuộc vào key này để không crash.

**Coverage status (07/12/2025)**

| Methodology | Test suite(s) | Status | Ghi chú |
|-------------|---------------|--------|---------|
| White-box · Features | `backend/testing/features/users/users.features.test.js` | Covered | Thực thi create/edit/lock ở service layer, bao gồm validator chi tiết.
| White-box · Data Integrity | `backend/testing/data-integrity/users.data-integrity.test.js` | Covered | Kiểm tra default role/cartData + unique email index.
| Black-box · API | _Chưa đủ_ | Gap | `backend/testing/api/users.api.test.js` mới cover register/login; cần thêm case list/edit/delete.
| Black-box · Security | `backend/testing/security/user-surface.security.test.js` | Covered | Khẳng định chỉ admin đọc được `/api/user/list`.
| Screen · Admin | _Chưa có_ | Gap | Chưa viết Playwright spec cho bảng người dùng (CRUD, lock cart, reset password).

> *Order management was listed twice in the request; the matrix above treats customer + admin responsibilities within a single capability.*

## 3. Folder Blueprint

```
backend/testing/
├── api/
│   ├── login/
│   ├── orders/
│   ├── cart/
│   ├── products/
│   └── users/
├── data-integrity/
│   ├── schemas/
│   └── invariants/
├── features/
│   ├── login/
│   ├── orders/
│   ├── cart/
│   ├── products/
│   └── users/
├── security/
│   ├── auth/
│   ├── orders/
│   ├── cart/
│   └── admin/
├── screen/ (logical pointer for UI projects)
└── stress/
```

```
tests/screen/
├── frontend/
│   ├── playwright.config.ts
│   └── specs/
└── admin/
    ├── playwright.config.ts
    └── specs/
```

- `frontend/e2e` and `admin/e2e` will be referenced from `tests/screen/*` via npm scripts (no immediate physical move required, but documentation will call them "Screen tests").
- Legacy folders (`unit`, `system`, `integration`, `regression`) will be removed once their specs are ported into `features/`.

## 4. Migration Checklist

1. **Create new directories** (`data-integrity`, `features`) and copy existing suites into the appropriate feature subfolders.
2. **Update Jest configs** to point at the new glob patterns (one config per category or a single dynamic config with CLI args).
3. **Review helpers** (`fixtures`, `setup`, `utils`) and ensure shared utilities remain accessible.
4. **Extend Playwright documentation** noting that these are the official "Screen" tests.
5. **Delete deprecated folders** only after verifying equivalent coverage exists in the new locations.
6. **Update README/docs** to describe how to run each category (`npm run test:api`, `npm run test:data-integrity`, etc.).

## 5. Next Steps

1. Execute the physical file moves/renames following the blueprint.
2. Flesh out any missing scenarios per the matrix above (especially user management & cart edge cases).
3. Align CI pipelines to trigger the five primary categories plus stress.
4. Remove obsolete scripts and badges referencing the old taxonomy.

---

This document is the baseline for implementing the requested restructuring. Once approved, we can begin moving/deleting files and updating configurations accordingly.

## 6. Test Commands (Implemented)

| Category          | Command                                                                                                           |
|-------------------|-------------------------------------------------------------------------------------------------------------------|
| API               | `npm run test:api --prefix backend`                                                                               |
| Data Integrity    | `npm run test:data-integrity --prefix backend`                                                                    |
| Features          | `npm run test:features --prefix backend`                                                                          |
| Security          | `npm run test:security --prefix backend`                                                                          |
| Screen (frontend) | `npm run test:screen --prefix frontend` (headed/report variants also available)                                   |
| Screen (admin)    | `npm run test:screen --prefix admin`                                                                              |
| Stress            | `npm run test:stress --prefix backend`                                                                            |

Each category now lives under the paths described earlier (for example, `backend/testing/features/<capability>` and `tests/screen/*`). The commands above are the ones exercised locally and in CI to cover the complete taxonomy.

## 7. Coverage confirmation (07/12/2025)

Áp dụng bộ phương pháp (white-box cho service/schema, black-box cho API/security/screen, stress cho tải) mang lại bức tranh dưới đây:

| Capability | White-box suites | Black-box / Screen / Stress suites | Overall status | Việc cần làm |
|------------|------------------|------------------------------------|----------------|--------------|
| Login | `backend/testing/features/login/login.features.test.js` | `backend/testing/api/users.api.test.js`, `backend/testing/api/security.api.test.js` | Partial | Bổ sung security test cho token replay/brute-force và Playwright login spec.
| Orders | `backend/testing/features/orders/orders.features.test.js`, `backend/testing/data-integrity/orders.data-integrity.test.js` | `backend/testing/api/orders.api.test.js`, `backend/testing/security/order-surface.security.test.js`, `backend/testing/stress/k6-orders.js` | Partial | Thiếu screen test cho lịch sử đơn/admin dashboard.
| Cart | `backend/testing/features/cart/cart.features.test.js`, `backend/testing/data-integrity/users.data-integrity.test.js` | `backend/testing/api/cart.api.test.js`, `backend/testing/api/security.api.test.js`, `frontend/e2e/specs/cart/*.spec.ts` | Partial | Cần thêm security case cho cart lock và stress race-condition.
| Products | `backend/testing/features/products/products.features.test.js`, `backend/testing/data-integrity/foods.data-integrity.test.js` | `backend/testing/api/products.api.test.js`, `admin/e2e/specs/foods/*.spec.ts` | Partial | Thêm screen coverage cho storefront menu để hoàn tất.
| Users | `backend/testing/features/users/users.features.test.js`, `backend/testing/data-integrity/users.data-integrity.test.js` | `backend/testing/security/user-surface.security.test.js` | Partial | Viết thêm API test cho list/edit/delete và Playwright spec cho bảng quản trị.
| Stress (Orders) | _N/A (white-box không áp dụng)_ | `backend/testing/stress/k6-orders.js` | Covered | Tiếp tục monitor threshold trong CI.

Tóm lại: phần lớn valid/invalid case đã được cover bằng các suite hiện hữu; các ô “Gap/Partial” phía trên trả lời chính xác phần việc còn thiếu khi đối chiếu với từng methodology.
