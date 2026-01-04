# Быстрый старт на Timeweb Cloud

## Что нужно сделать (кратко)

### 1️⃣ Подготовка (один раз)

**Supabase:**
1. Создайте проект на [supabase.com](https://supabase.com)
2. SQL Editor → выполните `backend/supabase/schema.sql`
3. Settings → API → скопируйте:
   - Project URL
   - anon public key
   - service_role key

### 2️⃣ Деплой на Timeweb Cloud

1. **Панель Timeweb Cloud** → Приложения → Docker → Создать
2. **Репозиторий**: подключите ваш Git
3. **Переменные окружения** (добавьте 3 переменных):
   ```
   SUPABASE_URL=https://ваш-проект.supabase.co
   SUPABASE_ANON_KEY=ваш-anon-key
   SUPABASE_SERVICE_KEY=ваш-service-key
   ```
4. **Запустить** → дождитесь сборки (5-10 мин)

### 3️⃣ Проверка

- Откройте URL от Timeweb
- Зарегистрируйтесь → войдите
- Готово! ✅

## Структура проекта

```
/
├── docker-compose.yml       ← главный файл
├── Dockerfile.frontend      ← сборка React
├── Dockerfile.backend       ← сборка Express
├── .dockerignore
├── backend/
│   └── src/
└── frontend/
    └── src/
```

## Порты

- Frontend: **8080** (первый сервис, получит домен от Timeweb)
- Backend: **3003** (внутри Docker сети)

## Важно

✅ docker-compose.yml в корне
✅ Dockerfile.* в корне
✅ Порты НЕ 80/443
✅ Frontend - первый сервис
✅ Без volumes

## Полная документация

Смотрите [TIMEWEB_DEPLOYMENT.md](TIMEWEB_DEPLOYMENT.md)
