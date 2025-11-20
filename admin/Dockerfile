FROM node:22-alpine

WORKDIR /app

# Set build arguments
ARG VITE_API_URL=http://3.25.79.221:4000
ARG VITE_FRONTEND_URL=http://3.25.79.221:5173

# Set as environment variables
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build
RUN npm install -g serve

EXPOSE 5174

CMD ["serve", "-s", "dist", "-l", "5174"]