# Screen (E2E/UI) Defect List

> Purpose: Track defects found by **screen/UI test suites** (`tests/screen`).

## Defect log

| Defect ID | Defect Description & Steps to reproduce | Actual Result | Expected Result | Priority | Serverity | Testcase ID |
|---|---|---|---|---|---|---|
| #1 | **[Admin UI] Edit food từ /list không hoạt động đúng**<br><br>1. Inject token admin + stub `GET /api/food/list` có `Automation Pizza`<br>2. Stub `PATCH /api/food/edit` trả "Food Updated" và ghi payload<br>3. Vào `/list` → Edit → `/edit/food-001` → đổi tên/giá → `UPDATE` + confirm | Test FAIL: toast/điều hướng/payload/header token không đạt như kỳ vọng. | Toast "Food Updated", quay lại `/list`, payload `{ name:'Automation Pizza XL', price:25 }`, header có token admin. | Medium | Serious | `SCREEN-ADMIN-002` |
| #2 | **[Admin UI] Remove food từ /list không hiển thị toast/không gửi đúng payload**<br><br>1. Inject token admin + stub `GET /api/food/list` có `Temp Burger`<br>2. Stub `POST /api/food/remove` trả `{ success:true, message:'Food Removed' }` và ghi payload<br>3. Vào `/list` → bấm icon xoá → confirm "Xóa" | Test FAIL: toast "Food Removed" không hiển thị và/hoặc payload `_id` sai/không có token. | Toast "Food Removed", payload remove chứa `_id=food-101`, header có token admin. | Medium | Serious | `SCREEN-ADMIN-003` |
| #3 | **[Admin UI] Edit food validate lỗi nhưng vẫn điều hướng về list**<br><br>1. Stub `/api/food/edit` trả `{ success:false, message:'Food information cannot be left blank' }`<br>2. Từ `/list` mở edit `/edit/food-001`<br>3. Set name = `'  '` → submit + confirm | Test FAIL: không giữ nguyên URL `/edit/food-001` và/hoặc không show toast error như kỳ vọng. | Toast error hiển thị, URL vẫn `/edit/food-001`, không điều hướng về list. | Medium | Serious | `SCREEN-ADMIN-005` |

### Notes

- Always attach Playwright screenshot/video trace link when possible.

