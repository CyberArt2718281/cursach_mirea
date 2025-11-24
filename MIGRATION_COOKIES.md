# Миграция на cookies-based аутентификацию

## Что изменилось

### Backend

1. **Добавлен cookie-parser** - для работы с cookies
2. **CORS настроен на credentials** - позволяет передавать cookies между доменами
3. **Access и Refresh токены** - токены теперь хранятся в httpOnly cookies
   - Access token: 15 минут
   - Refresh token: 7 дней
4. **Автоматическое обновление токенов** - middleware проверяет refresh token при истечении access token
5. **Новые эндпоинты**:
   - `POST /api/users/logout` - выход с очисткой cookies
   - `POST /api/users/refresh` - обновление access token через refresh token

### Frontend

1. **Исправлена циклическая зависимость** - AuthService больше не вызывает HTTP в конструкторе
2. **Убрано использование localStorage** - все токены в cookies
3. **AuthInterceptor упрощен** - убрана зависимость от AuthService
4. **Добавлен withCredentials** - ко всем HTTP запросам к API
5. **Инициализация в AppComponent** - AuthService.init() проверяет авторизацию при запуске

## Преимущества

✅ **Безопасность** - httpOnly cookies защищены от XSS атак
✅ **Автоматическое обновление** - токены обновляются прозрачно для пользователя
✅ **Нет циклических зависимостей** - чистая архитектура Angular
✅ **Работа при обновлении страницы** - пользователь остается авторизованным

## Как это работает

1. При логине/регистрации сервер устанавливает 2 cookies:

   - `accessToken` (15 мин) - для авторизации запросов
   - `refreshToken` (7 дней) - для обновления access token

2. При каждом запросе:

   - Браузер автоматически отправляет cookies (благодаря withCredentials: true)
   - Backend проверяет accessToken
   - Если истек - автоматически обновляет через refreshToken

3. При обновлении страницы:
   - AppComponent.ngOnInit() вызывает AuthService.init()
   - Отправляется запрос на /api/users/profile
   - Если есть валидные cookies - пользователь авторизован

## Запуск после обновления

```bash
# Backend
cd backend
npm install  # установит cookie-parser
npm run dev

# Frontend
cd frontend
ng serve
```

## Тестирование

1. Откройте http://localhost:4200
2. Войдите в систему
3. Обновите страницу (F5) - вы должны остаться авторизованными
4. Откройте DevTools → Application → Cookies:
   - Должны быть видны accessToken и refreshToken
   - Оба помечены как HttpOnly

## Важно

- Cookies работают только на одном домене (localhost:4200 → localhost:5000)
- В production нужно настроить CORS на реальный домен фронтенда
- HttpOnly cookies не доступны через JavaScript (безопасность)
