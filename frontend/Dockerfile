# --- Stage 1: Build (Dùng Node để đóng gói) ---
FROM node:22-alpine as builder
WORKDIR /app

# 1. Khai báo ARG để nhận biến từ GitHub Action
ARG VITE_API_URL
ARG VITE_ADMIN_URL

# 2. Gán vào ENV để Vite nhận được lúc build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ADMIN_URL=$VITE_ADMIN_URL

COPY package*.json ./
# Dùng npm ci nhanh hơn npm install
RUN npm ci 

COPY . .
RUN npm run build

# --- Stage 2: Serve (Dùng Nginx siêu nhẹ) ---
FROM nginx:alpine

# Copy kết quả build (thư mục dist) sang Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# (Tùy chọn) Tạo file nginx.conf để fix lỗi React Router 404 khi reload
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]