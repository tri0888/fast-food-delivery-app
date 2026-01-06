# Deploy frontend on GitHub Pages + Cloudflare Tunnel → localhost backend

Mục tiêu:

- **Frontend** (Vite/React) chạy trên **GitHub Pages**.
- **Backend** chạy **local** (localhost) nhưng được public ra internet bằng **Cloudflare Tunnel**.
- Frontend gọi API qua URL public của tunnel (HTTPS), không hardcode `localhost`.

> Lưu ý: Cách này phù hợp để demo/POC nhanh. Backend chạy trên máy cá nhân thì máy phải bật + mạng ổn định.

---

## 1) Frontend (GitHub Pages)

### 1.1 Bật GitHub Pages

Trong repo GitHub:

- **Settings → Pages**
- Source: **GitHub Actions**

Workflow deploy đã được thêm ở: `.github/workflows/frontend-gh-pages.yml`.

### 1.2 Biến môi trường cho build

Frontend đang đọc backend URL từ:

- `import.meta.env.VITE_API_URL` (xem `frontend/src/components/context/StoreContext.jsx`)

Trên GitHub repo, vào:

- **Settings → Secrets and variables → Actions → New repository secret**

Tạo:

- `VITE_API_URL` = `https://api.your-domain.com` (hostname của Cloudflare Tunnel)

Tuỳ chọn (nếu dùng redirect sang admin UI):

- `VITE_ADMIN_URL`

### 1.3 Base path cho GitHub Pages

Vì GitHub Pages project site chạy dưới dạng:

- `https://<user>.github.io/<repo>/`

nên Vite phải build với `base = '/<repo>/'`.

Workflow đã set:

- `BASE_URL: /${{ github.event.repository.name }}/`

và `frontend/vite.config.js` đã đọc `BASE_URL`.

### 1.4 SPA routing (BrowserRouter) trên GitHub Pages

GitHub Pages không có rewrite rule, nên refresh ở URL con (ví dụ `/cart`) sẽ trả 404.

Đã thêm:

- `frontend/public/404.html`
- đoạn script trong `frontend/index.html`

để tự redirect 404 về `index.html` và khôi phục route.

---

## 2) Backend local + Cloudflare Tunnel

Backend mặc định chạy cổng:

- `PORT=4000` (xem `backend/server.js`)

### 2.1 Cài cloudflared

Cài **cloudflared** theo hướng dẫn Cloudflare (Windows/macOS/Linux).

#### Windows (khuyến nghị: winget)

Trong **PowerShell** hoặc **Windows Terminal** (hoặc ngay trong Git Bash nếu có `winget`):

- Cài đặt:
   - `winget install --id Cloudflare.cloudflared -e`

Sau đó **đóng/mở lại terminal** để PATH cập nhật.

Kiểm tra:

- `cloudflared --version`

#### Nếu vẫn báo “command not found” trong Git Bash

Trong môi trường Git Bash của bạn, PATH đã có `C:\Users\<you>\bin` (ví dụ: `/c/Users/<you>/bin`).

Cách “chắc ăn”:

1) Tải binary Windows từ Cloudflare (file dạng `cloudflared-windows-amd64.exe`).
2) Đổi tên thành `cloudflared.exe`.
3) Copy vào:

- `C:\Users\<you>\bin\cloudflared.exe`

Mở terminal mới và chạy lại `cloudflared --version`.

#### Tuỳ chọn: tunnel tạm (không cần domain)

Nếu bạn chỉ cần demo nhanh, có thể chạy tunnel kiểu “quick”:

- `cloudflared tunnel --url http://localhost:4000`

Cloudflare sẽ cấp cho bạn một URL ngẫu nhiên (không ổn định). Bạn có thể dùng URL này làm `VITE_API_URL` để test nhanh.

### 2.2 Tạo tunnel và route DNS

Các bước tiêu chuẩn (thực hiện trên máy bạn):

1. Đăng nhập:
   - `cloudflared tunnel login`
2. Tạo tunnel:
   - `cloudflared tunnel create fast-food-backend`
3. Route hostname về tunnel (VD dùng domain bạn đang quản lý ở Cloudflare):
   - `cloudflared tunnel route dns fast-food-backend api.your-domain.com`

### 2.3 File config ingress

Tạo file (ví dụ):

- `~/.cloudflared/config.yml`

Nội dung mẫu:

```yaml
tunnel: <TUNNEL_ID_OR_NAME>
credentials-file: C:\Users\<you>\.cloudflared\<TUNNEL_ID>.json

ingress:
  - hostname: api.your-domain.com
    service: http://localhost:4000
  - service: http_status:404
```

Chạy tunnel:

- `cloudflared tunnel run fast-food-backend`

Kiểm tra:

- `https://api.your-domain.com/` phải trả về: `API working`

### 2.4 CORS (để browser gọi được API)

Backend đã được cập nhật để hỗ trợ allowlist bằng biến môi trường:

- `CORS_ORIGINS` (comma-separated)

Ví dụ:

- `CORS_ORIGINS=https://<user>.github.io,https://<user>.github.io/<repo>`

Nếu **không set** `CORS_ORIGINS`, backend sẽ **allow all origins** (phù hợp dev/demo).

---

## 3) Checklist nhanh

- [ ] Backend chạy local: `http://localhost:4000`
- [ ] Cloudflare Tunnel public URL hoạt động: `https://api.your-domain.com`
- [ ] GitHub Secrets `VITE_API_URL` trỏ đúng `https://api.your-domain.com`
- [ ] GitHub Pages bật Source = GitHub Actions
- [ ] Sau deploy, frontend gọi API OK (Network tab không bị CORS)
