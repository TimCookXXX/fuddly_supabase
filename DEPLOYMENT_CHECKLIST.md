# Чеклист перед деплоем на Timeweb Cloud

## Подготовка репозитория

- [ ] Все файлы закоммичены
- [ ] Изменения запушены в main ветку
- [ ] docker-compose.yml в корне проекта
- [ ] Dockerfile.frontend в корне
- [ ] Dockerfile.backend в корне

## Проверка конфигурации

- [ ] docker-compose.yml: frontend - первый сервис
- [ ] Порты: 8080 (frontend), 3003 (backend)
- [ ] Нет volumes, privileged, devices
- [ ] Не используется network_mode: host

## Supabase

- [ ] Проект создан на supabase.com
- [ ] SQL схема применена (schema.sql)
- [ ] Проверены RLS политики
- [ ] Скопированы:
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_KEY

## Переменные окружения для Timeweb

Подготовьте эти переменные (будете вводить в панели):

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

## Тестирование после деплоя

После успешного развертывания проверьте:

- [ ] Frontend открывается по URL от Timeweb
- [ ] Страница регистрации доступна
- [ ] Можно создать аккаунт
- [ ] Можно войти в систему
- [ ] Health endpoint работает: `/health`
- [ ] API запросы проходят (проверьте Network в DevTools)

## Troubleshooting

Если что-то не работает:

1. **Проверьте логи** в панели Timeweb Cloud
2. **Backend логи**: ошибки подключения к Supabase?
3. **Frontend логи**: ошибки сборки?
4. **Network в браузере**: API запросы доходят?

## Контакты поддержки

Если проблемы с Timeweb Cloud:
- Техподдержка Timeweb
- Документация: https://timeweb.cloud/docs

Если проблемы с Supabase:
- Документация: https://supabase.com/docs
- Discord: https://discord.supabase.com
