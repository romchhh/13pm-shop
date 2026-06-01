# Catalog API — 13pm tactic

Захищені ендпоінти для додавання та оновлення **товарів** і **категорій** тактичного одягу через Postman, скрипти або CRM.

**Базовий URL:** `https://ВАШ_ДОМЕН` (локально: `http://localhost:3000`)

**Сід каталогу:** `npm run seed-tactic-categories` / `npm run seed-tactic-products`

---

## Авторизація

Усі маршрути під `/api/admin/*` вимагають cookie `admin_auth`.

### Крок 1 — логін

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "ADMIN_USER з .env",
  "password": "ADMIN_PASS з .env"
}
```

У відповіді встановлюється cookie `admin_auth` (httpOnly). У Postman увімкніть збереження cookies між запитами.

### Альтернатива (curl)

```
Cookie: admin_auth=<base64("логін:пароль")>
```

Значення — `Buffer.from("login:password").toString("base64")` (як у `/api/auth/login`).

---

## Товари (одяг)

### `POST /api/admin/catalog/products`

Створення товару з полями БД + медіа.

#### Варіант A — JSON

```http
POST /api/admin/catalog/products
Content-Type: application/json
Cookie: admin_auth=...

{
  "name": "Футболка тактична ALPHA",
  "subtitle": "Лінійка ALPHA",
  "short_description": "Бавовняна футболка з посиленими плечима.",
  "description": "Повний опис (Markdown/HTML).",
  "fabric_composition": "95% бавовна, 5% еластан",
  "has_lining": false,
  "lining_description": null,
  "price": 890,
  "old_price": 990,
  "discount_percentage": 10,
  "in_stock": true,
  "stock": 0,
  "is_new": true,
  "is_hit": false,
  "is_promo": false,
  "top_sale": false,
  "limited_edition": false,
  "priority": 10,
  "category_id": 2,
  "category_ids": [2],
  "subcategory_ids": [],
  "color_options": [
    { "hex": "#1a1a1a", "name": "Чорний" },
    { "hex": "#4a5d3f", "name": "Олива" }
  ],
  "white_color_surcharge_enabled": false,
  "size_variants": [
    { "label": "S", "stock": 5 },
    { "label": "M", "stock": 8 },
    { "label": "L", "stock": 6 },
    { "label": "XL", "stock": 4 }
  ],
  "bought_together_ids": [12, 15],
  "color_linked_ids": [20, 21],
  "gift_product_id": null,
  "media": [{ "type": "photo", "url": "abc.webp" }]
}
```

#### Поля для 13pm tactic

| Поле | Опис |
|------|------|
| `fabric_composition` | Склад тканини (текст) |
| `has_lining` | Чи є підкладка |
| `lining_description` | Опис підкладки |
| `color_options` | `[{ hex, name }]` — кольори варіанту |
| `size_variants` | `[{ label, stock }]` — розміри S/M/L/XL та залишок |
| `is_hit` | Хіт / блок BESTSELLERS на головній |
| `is_new` | Новинка |
| `is_promo` | Акція |
| `top_sale` | Позначка бестселера в каталозі |
| `limited_edition` | Лімітована серія |

#### Зв’язки між товарами

| Поле в запиті | Зберігається як | Призначення |
|---------------|-----------------|-------------|
| `bought_together_ids` | `bought_together_ids` | «Купують разом» |
| `color_linked_ids` | `pair_together_ids` | Інші кольори того ж товару |
| `related_product_ids` | аліас `bought_together_ids` | |
| `pair_together_ids` / `paired_product_ids` | аліас `color_linked_ids` | |

> **Схожі товари** на картці (`YouMightLike`) підбираються автоматично за підкатегорією → категорією, окремого поля в API немає.

#### Розмірні групи (рідко)

| Поле | Дія |
|------|-----|
| `size_group_ordered_ids` | Синхронізує `size_variants` у всіх товарів групи |
| `size_linked_ids` | Legacy-зв’язки окремих карток за id |

#### Legacy (не використовується на вітрині одягу)

Поля з попереднього домену (БАДи/рамки) все ще приймаються API, але для tactic їх можна не передавати: `release_form`, `course`, `main_action`, `season`, `dietitian_approved` тощо.

#### Варіант B — multipart (фото)

| Поле | Тип | Опис |
|------|-----|------|
| `data` | string (JSON) | Поля товару (без `media` або з уже завантаженими url) |
| `images` | file[] | jpg, png, webp → webp; mp4 → video |

```bash
curl -X POST "$BASE/api/admin/catalog/products" \
  -H "Cookie: admin_auth=..." \
  -F 'data={"name":"Штани BRAVO","price":2190,"category_ids":[5],"size_variants":[{"label":"M","stock":3}]}' \
  -F "images=@photo1.jpg"
```

**Відповідь `201`:** `{ success, id, product, note_similar_products }`

---

### `GET /api/admin/catalog/products/:id`

Повний товар: `media`, `fabric_composition`, `size_variants`, `pair_together_ids` (колірні зв’язки), `bought_together_ids`, прапорці `is_hit` / `is_new` / `is_promo` тощо.

---

### `PUT /api/admin/catalog/products/:id`

Оновлення. Ті самі формати, що й POST.

- `media` у JSON — **повний** список медіа після змін.
- Нові файли в multipart додаються до `media`.

---

### `DELETE /api/admin/catalog/products/:id`

Видалення товару та його медіа-файлів.

---

## Категорії

Типові категорії після сіду: **Комплекти**, **Футболки**, **Флісова кофта**, **UBACS**, **Штани**, **Головні убори**, **Аксесуари** (slug: `komplekty`, `futbolky`, `flisova-kofta`, `ubacs`, `shtany`, …).

### `POST /api/admin/catalog/categories`

#### JSON

```json
{
  "name": "Футболки",
  "priority": 65,
  "description": "Тактичні футболки 13pm tactic",
  "mediaType": "photo",
  "mediaUrl": "category-cover.webp"
}
```

#### multipart

- `data` — JSON категорії  
- `image` — обкладинка  

Файли: `product-images/`, URL — `/api/images/{filename}`.

> Без `mediaUrl` на головній підставиться фото **першого товару** категорії (`lib/categoryMediaFallback.ts`).

---

### `GET /api/admin/catalog/categories/:slug`

Категорія за slug (наприклад `futbolky`, `shtany`).

---

### `PUT /api/admin/catalog/categories/:slug`

Оновлення назви, пріоритету, опису, медіа (JSON або multipart + `image`).

---

## Підкатегорії

### `POST /api/admin/catalog/subcategories`

```json
{
  "name": "Лінійка ALPHA",
  "category_id": 2
}
```

---

## Завантаження медіа окремо

```http
POST /api/images
Cookie: admin_auth=...
Content-Type: multipart/form-data

images: (файли)
```

Відповідь: `{ "media": [{ "type": "photo", "url": "....webp" }] }` — ці `url` додайте в `media` товару.

---

## Публічні ендпоінти (без auth)

| Метод | Шлях | Опис |
|-------|------|------|
| GET | `/api/categories` | Категорії з fallback-фото |
| GET | `/api/products/catalog` | Вітрина каталогу (`?limit=&offset=`) |
| GET | `/api/products/top-sale` | BESTSELLERS (`top_sale`) |
| GET | `/api/products/category?category=` | Товари за slug категорії |
| GET | `/api/products/subcategory?subcategory=` | За slug підкатегорії |
| GET | `/api/products/limited-edition` | Лімітовані |
| GET | `/api/products/related-colors` | Колірні зв’язки |
| POST | `/api/products/check-stock` | Перевірка залишку розміру |
| GET | `/api/products` | Legacy-список |
| POST | `/api/products` | Legacy-створення (без auth) |

Для інтеграцій і адміністрування використовуйте **`/api/admin/catalog/*`**.

---

## Postman

Колекція: [`docs/postman/13pm-tactic-Catalog-API.postman_collection.json`](./postman/13pm-tactic-Catalog-API.postman_collection.json)

| Змінна | Приклад |
|--------|---------|
| `baseUrl` | `http://localhost:3000` |
| `adminUser` / `adminPass` | з `.env` |
| `categorySlug` | `futbolky` |
| `productId` | id після створення товару |

Порядок: **Admin Login** → запити **Products** / **Categories**.
