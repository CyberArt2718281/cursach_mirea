# Frontend Dockerfile - Multi-stage build

# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci

# Копирование исходного кода
COPY . .

# Сборка Angular приложения
RUN npm run build -- --configuration production

# Stage 2: Production
FROM nginx:alpine

# Копирование собранного приложения
COPY --from=build /app/dist/frontend /usr/share/nginx/html

# Копирование конфигурации nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открытие порта
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
