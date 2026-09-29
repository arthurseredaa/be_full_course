# План: access + refresh токени

Зараз `/register` і `/login` видають один JWT на 24h (`src/routes/auth.js`). Мета — короткий access token + довгий
refresh token з rotation і можливістю відкликати.

## 1. Схема БД (`src/db/index.js`)

Нова таблиця `refresh_tokens`:

- `id` INTEGER PK
- `user_id` INTEGER FK → users
- `token_hash` TEXT UNIQUE — зберігати не сам токен, а його hash (sha256 достатньо, bcrypt тут не потрібен)
- `expires_at` INTEGER — unix timestamp
- `revoked_at` INTEGER NULL
- `created_at` INTEGER

Питання собі: чому hash, а не сам токен? (підказка: витік дампу БД)

## 2. Видача токенів (`src/routes/auth.js`)

Винести в `src/lib/issue-tokens.js` функцію, яку викликають і `/register`, і `/login`:

- access: `jwt.sign(...)`, `expiresIn: '15m'`
- refresh: випадковий рядок через `crypto.randomBytes(32).toString('hex')` — НЕ JWT
- refresh зберегти в БД (hash + expiry ~30d), повернути клієнту
- відповідь: `{ accessToken, refreshToken }`

Питання собі: чому refresh не обов'язково робити JWT?

## 3. `POST /auth/refresh`

- приймає `refreshToken` з body
- шукає hash у БД, перевіряє `expires_at` і `revoked_at`
- якщо ок: помічає старий як revoked (rotation), видає нову пару access + refresh
- якщо не знайдено / протух / вже revoked → 401

Бонус (reuse detection): якщо прийшов вже revoked токен — це ознака крадіжки, відкликати ВСІ refresh-токени цього юзера.

## 4. `POST /auth/logout`

- revoke конкретний refresh token
- варіант «logout everywhere»: revoke всі токени користувача

## 5. Middleware (`src/middleware/auth.js`)

Майже не міняється — перевіряє тільки access. Але при `TokenExpiredError`
варто повертати окремий код/повідомлення, щоб клієнт знав що треба йти на `/refresh`.

## 6. Перевірка через `todo-app.rest`

Сценарій:

1. login → отримати пару
2. запит до todos з access → 200
3. почекати/поставити `expiresIn: '10s'` для тесту → 401 expired
4. `/refresh` зі старим refresh → нова пара
5. повторити `/refresh` з тим самим старим refresh → 401 (rotation спрацювала)
6. logout → refresh більше не працює

## 7. Куди класти refresh на клієнті (для роздумів, не для коду)

- httpOnly + Secure + SameSite cookie — захист від XSS
- або body/localStorage — простіше, але вразливіше
- у нас поки Bearer в header, cookie можна додати пізніше (пакет `cookie-parser`)

## Почитати

- OAuth 2.0 refresh token rotation: https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation
- RFC 6749 §1.5 Refresh Token
- `node:crypto` → `randomBytes`, `createHash('sha256')`
