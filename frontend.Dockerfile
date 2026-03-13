# Stage 1: Build Vite app
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/frontend/package*.json ./
RUN npm ci
COPY frontend/frontend/ .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80