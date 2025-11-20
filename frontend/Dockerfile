FROM node:22-alpine

WORKDIR /app

# Accept build arguments
ARG VITE_API_URL
ARG VITE_ADMIN_URL

# Set as environment variables
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ADMIN_URL=$VITE_ADMIN_URL

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "run", "dev"]