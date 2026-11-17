# Telegram-бот Адвоката Цибульської Ганни Валеріївни

Офіційний Telegram-бот для ознайомлення з напрямами діяльності, послугами, вартістю та запису на консультацію.

## Деплой на Railway

### 1. Завантажте код у приватний GitHub-репозиторій
Переконайтеся, що файли `.env`, `token.md`, `node_modules/`, `dist/`, `data/` ігноруються через `.gitignore` і не потрапили в Git.

```bash
git init
git add .
git commit -m "Initial commit: lawyer telegram bot"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Створіть проєкт у Railway
1. Перейдіть на [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Оберіть ваш приватний репозиторій.
3. Railway автоматично підхопить конфігурацію з `railway.json` (`npm run build` → `npm start`).

### 3. Налаштуйте змінні оточення (Variables)
У сервісі перейдіть у вкладку **Variables** і додайте:
- `BOT_TOKEN` — токен бота з `@BotFather`
- `ADMIN_CHAT_ID` — Telegram Chat ID для отримання заявок (дізнатися можна командою `/myid` у боті)
- `LAWYER_PHONE` — `+380 63 259 13 92`

Після збереження змінних Railway автоматично перезапустить бота.

### 4. (Опціонально) Збереження файлу заявок `data/leads.json`
За замовчуванням усі заявки миттєво надсилаються в Telegram на `ADMIN_CHAT_ID`. Якщо потрібно, щоб файл `data/leads.json` зберігався між деплоями:
- у сервісі Railway натисніть **Add Volume** і вкажіть Mount Path: `/app/data`.

### 5. Передача доступу замовнику
- **У Railway:** вкладка **Project Settings → Members** → запросити замовника за email.
- **У Telegram (`@BotFather`):** `/mybots` → обрати бота → **Transfer Ownership** (потрібна увімкнена 2FA на вашому акаунті мінімум 7 днів, і замовник має хоча б раз запустити бота через `/start`).

## Локальний запуск
```bash
npm install
cp .env.example .env   # заповніть BOT_TOKEN та ADMIN_CHAT_ID
npm run dev            # режим розробки
# або
npm run build && npm start
```
