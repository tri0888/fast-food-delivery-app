# --- Stage 1: Build (Dùng Node để đóng gói) ---
FROM node:22-alpine as builder
WORKDIR /app

# 1. Khai báo ARG để nhận biến từ GitHub Action
ARG VITE_API_URL
ARG VITE_FRONTEND_URL

# 2. Gán vào ENV để Vite nhận được lúc build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL

COPY package*.json ./
# Dùng npm ci nhanh hơn npm install
RUN npm ci 

COPY . .
RUN npm run build

# --- Stage 2: Serve (Dùng Nginx siêu nhẹ) ---
FROM nginx:alpine

# Copy kết quả build (thư mục dist) sang Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx.conf từ builder stage (COPY . . đã copy file này vào /app)
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Verify nginx config
RUN nginx -t

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]