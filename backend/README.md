# Backend - Платформа управления событиями

Backend на Express.js с MongoDB для управления событиями и регистрациями.

## Требования

- Node.js 16+
- MongoDB 7+

## Установка

```bash
npm install
```

## Настройка

Создайте файл `.env` со следующими параметрами:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/events_management
JWT_SECRET=ваш_секретный_ключ
NODE_ENV=development
```

## Запуск

Режим разработки:

```bash
npm run dev
```

Продакшн:

```bash
npm start
```

## API Endpoints

### События

- `GET /api/events` - Получить все события
- `GET /api/events/:id` - Получить событие по ID
- `POST /api/events` - Создать событие
- `PUT /api/events/:id` - Обновить событие
- `DELETE /api/events/:id` - Удалить событие
- `GET /api/events/:id/stats` - Статистика по событию

### Регистрации

- `GET /api/registrations` - Получить все регистрации
- `GET /api/registrations/:id` - Получить регистрацию по ID
- `GET /api/registrations/number/:registrationNumber` - Получить по номеру
- `POST /api/registrations` - Создать регистрацию
- `PUT /api/registrations/:id` - Обновить регистрацию
- `PATCH /api/registrations/:id/attend` - Отметить посещение
- `DELETE /api/registrations/:id` - Отменить регистрацию

### Пользователи

- `POST /api/users/register` - Регистрация
- `POST /api/users/login` - Вход
- `GET /api/users/profile` - Профиль (требуется токен)
- `PUT /api/users/profile` - Обновить профиль (требуется токен)
- `GET /api/users` - Все пользователи (только admin)

## Модели данных

### Event (Событие)

- title, description, date, endDate
- location, category, capacity, availableSeats
- price, imageUrl, status
- organizer (name, email, phone)
- registrationDeadline, tags

### Registration (Регистрация)

- event (ссылка на Event)
- participant (firstName, lastName, email, phone, organization, position)
- status, registrationNumber, paymentStatus
- notes, attended, attendedAt

### User (Пользователь)

- username, email, password (хешированный)
- role (admin/organizer/user)
- profile (firstName, lastName, phone, organization, position, avatar)
- isActive, lastLogin
