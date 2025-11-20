FROM node:22-alpine

WORKDIR /app

# Accept build arguments
ARG VITE_API_URL=http://3.25.79.221:4000
ARG VITE_ADMIN_URL=http://3.25.79.221:5174

# Set as environment variables for build time
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ADMIN_URL=$VITE_ADMIN_URL

COPY package*.json ./
RUN npm ci

COPY . .

# Build the app with env variables baked in
RUN npm run build

# Install serve to run the built app
RUN npm install -g serve

EXPOSE 5173

# Serve the built app on port 5173
CMD ["serve", "-s", "dist", "-l", "5173"]