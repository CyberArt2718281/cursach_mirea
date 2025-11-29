# Docker Deployment Guide

## Требования

- Docker Desktop (или Docker Engine + Docker Compose)
- 4GB+ свободной оперативной памяти
- 10GB+ свободного места на диске

## Быстрый старт

### 1. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите ваши настройки:

- `JWT_SECRET` - секретный ключ для JWT токенов
- `EMAIL_USER` - email для отправки уведомлений
- `EMAIL_PASS` - пароль приложения для email

### 2. Сборка и запуск

```bash
# Сборка всех образов и запуск контейнеров
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 3. Доступ к приложению

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### 4. Инициализация данных (опционально)

Если нужно заполнить БД тестовыми данными:

```bash
docker-compose exec backend node seed.js
```

## Управление контейнерами

### Остановка всех сервисов

```bash
docker-compose down
```

### Остановка с удалением volumes (БД будет очищена)

```bash
docker-compose down -v
```

### Перезапуск конкретного сервиса

```bash
docker-compose restart backend
docker-compose restart frontend
```

### Пересборка после изменений в коде

```bash
# Пересборка backend
docker-compose up -d --build backend

# Пересборка frontend
docker-compose up -d --build frontend

# Пересборка всего
docker-compose up -d --build
```

### Просмотр статуса контейнеров

```bash
docker-compose ps
```

### Проверка использования ресурсов

```bash
docker stats
```

## Работа с MongoDB

### Подключение к MongoDB через mongosh

```bash
docker-compose exec mongodb mongosh events_management
```

### Бэкап базы данных

```bash
docker-compose exec -T mongodb mongodump --db events_management --archive > backup.archive
```

### Восстановление из бэкапа

```bash
docker-compose exec -T mongodb mongorestore --db events_management --archive < backup.archive
```

## Отладка

### Проверка логов backend

```bash
docker-compose logs -f backend
```

### Проверка логов frontend

```bash
docker-compose logs -f frontend
```

### Войти в контейнер для отладки

```bash
# Backend
docker-compose exec backend sh

# MongoDB
docker-compose exec mongodb mongosh
```

### Проверка сетевого взаимодействия

```bash
# Проверка доступности MongoDB из backend
docker-compose exec backend ping mongodb

# Проверка доступности backend из frontend
docker-compose exec frontend wget -O- http://backend:5000/api/health
```

## Production deployment

Для продакшн-окружения:

1. Измените `CORS_ORIGIN` на ваш реальный домен
2. Используйте надежный `JWT_SECRET`
3. Настройте SSL сертификаты для nginx
4. Используйте внешнюю MongoDB с репликацией
5. Настройте регулярные бэкапы
6. Добавьте мониторинг и алерты

### Пример production docker-compose

Создайте `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://your-production-mongo-uri
      CORS_ORIGIN: https://yourdomain.com
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 512M

  frontend:
    environment:
      NODE_ENV: production
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

Запуск в production:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Очистка

### Удаление неиспользуемых образов

```bash
docker image prune -a
```

### Полная очистка Docker

```bash
docker system prune -a --volumes
```

## Troubleshooting

### Проблема: Порт уже занят

```bash
# Найти процесс на порту
netstat -ano | findstr :4200
netstat -ano | findstr :5000
netstat -ano | findstr :27017

# Или измените порты в docker-compose.yml
```

### Проблема: Недостаточно памяти

```bash
# Увеличьте лимиты в Docker Desktop Settings
# Или уменьшите количество запущенных контейнеров
```

### Проблема: Backend не может подключиться к MongoDB

```bash
# Проверьте, что MongoDB запущен и healthy
docker-compose ps
docker-compose logs mongodb

# Убедитесь, что используется правильный URI
docker-compose exec backend env | grep MONGODB_URI
```

### Проблема: Frontend не собирается

```bash
# Очистите node_modules и пересоберите
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

## Мониторинг

Для мониторинга в production рекомендуется использовать:

- **Prometheus + Grafana** для метрик
- **ELK Stack** для логов
- **Portainer** для управления Docker

## Автоматизация

### GitHub Actions пример для CI/CD

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build Backend
        run: docker build -t events-backend:latest ./backend

      - name: Build Frontend
        run: docker build -t events-frontend:latest ./frontend

      - name: Push to Registry
        run: |
          docker push events-backend:latest
          docker push events-frontend:latest
```
