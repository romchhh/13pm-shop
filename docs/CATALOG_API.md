# Catalog API (адмін)

Захищені ендпоінти для додавання та оновлення **товарів** і **категорій** через зовнішні інтеграції (Postman, скрипти, CRM).

**Базовий URL:** `https://ВАШ_ДОМЕН` (локально: `http://localhost:3000`)

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

У відповіді встановлюється cookie `admin_auth` (httpOnly). У Postman увімкніть **Automatically follow redirects** і зберігайте cookies між запитами.

### Альтернатива (Postman / curl)

Після логіну можна передати cookie вручну:

```
Cookie: admin_auth=<base64("логін:пароль")>
```

де значення — `Buffer.from("login:password").toString("base64")` (те саме, що робить `/api/auth/login`).

---

## Товари

### `POST /api/admin/catalog/products`

Створення товару з усіма полями БД + кілька фото/відео.

#### Варіант A — JSON

```http
POST /api/admin/catalog/products
Content-Type: application/json
Cookie: admin_auth=...

{
  "name": "Рамка іменна",
  "subtitle": "30×40 см",
  "short_description": "Короткий опис",
  "description": "Повний опис HTML/текст",
  "price": 890,
  "old_price": 990,
  "discount_percentage": 10,
  "in_stock": true,
  "stock": 100,
  "is_new": true,
  "is_hit": false,
  "priority": 5,
  "category_id": 1,
  "subcategory_id": 3,
  "category_ids": [1, 2],
  "subcategory_ids": [3],
  "bought_together_ids": [12, 15],
  "pair_together_ids": [20, 21],
  "related_product_ids": [12, 15],
  "gift_product_id": null,
  "color_options": [{ "hex": "#8B5E3F", "name": "Дуб" }],
  "size_variants": [],
  "size_group_ordered_ids": [0, 101, 102],
  "season": ["весна", "літо"],
  "media": [
    { "type": "photo", "url": "abc.webp" }
  ]
}
```

> **Схожі товари** на сайті (`YouMightLike`) **не зберігаються в БД** — підбираються автоматично за підкатегорією → категорією. Для зв’язків використовуйте `bought_together_ids` / `pair_together_ids` (або аліаси `related_product_ids` / `paired_product_ids`).

#### Варіант B — multipart (рекомендовано для фото)

| Поле | Тип | Опис |
|------|-----|------|
| `data` | string (JSON) | Усі поля товару, як у JSON-прикладі (без `media` або з уже завантаженими url) |
| `images` | file[] | Кілька файлів (jpg, png, webp → конвертація в webp; mp4 тощо — video) |

```bash
curl -X POST "$BASE/api/admin/catalog/products" \
  -H "Cookie: admin_auth=..." \
  -F 'data={"name":"Товар","price":500,"category_ids":[1]}' \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg"
```

**Відповідь `201`:** `{ success, id, product, note_similar_products }`

---

### `GET /api/admin/catalog/products/:id`

Повний товар (усі поля + `media`, `bought_together_ids`, `pair_together_ids`, `size_variants`, …).

---

### `PUT /api/admin/catalog/products/:id`

Оновлення. Ті самі формати, що й POST.

- `media` у JSON — **повний** список медіа після змін (як у адмінці).
- Нові файли в multipart додаються до списку `media`.

Поля розмірної групи:

| Поле | Дія |
|------|-----|
| `size_group_ordered_ids` | Синхронізує `size_variants` у всіх товарів групи |
| `size_linked_ids` | Legacy: `[id, ...linked]` |

---

### `DELETE /api/admin/catalog/products/:id`

Видалення товару та його медіа-файлів.

---

## Категорії

### `POST /api/admin/catalog/categories`

#### JSON

```json
{
  "name": "Рамки",
  "priority": 10,
  "description": "Опис категорії",
  "mediaType": "photo",
  "mediaUrl": "category-cover.webp"
}
```

#### multipart

- `data` — JSON категорії  
- `image` — один файл обкладинки  

Файли зберігаються в `product-images/` і віддаються через `/api/images/{filename}`.

> Якщо **не** вказати `mediaUrl`, на головній сторінці підставиться **фото першого товару** цієї категорії (логіка в `lib/categoryMediaFallback.ts`).

---

### `GET /api/admin/catalog/categories/:slug`

Категорія за slug (з fallback-фото, якщо немає власного).

---

### `PUT /api/admin/catalog/categories/:slug`

Оновлення назви, пріоритету, опису, медіа (JSON або multipart + `image`).

---

## Підкатегорії

### `POST /api/admin/catalog/subcategories`

```json
{
  "name": "Іменні рамки",
  "category_id": 1
}
```

---

## Додатково: завантаження медіа окремо

```http
POST /api/images
Cookie: admin_auth=...
Content-Type: multipart/form-data

images: (файли)
```

Відповідь: `{ "media": [{ "type": "photo", "url": "....webp" }] }` — ці `url` передавайте в `media` при створенні/оновленні товару.

---

## Публічні ендпоінти (без auth)

| Метод | Шлях | Опис |
|-------|------|------|
| GET | `/api/products` | Список товарів |
| POST | `/api/products` | Створення (legacy, без auth) |
| GET | `/api/categories` | Категорії (з fallback-фото) |

Для інтеграцій краще використовувати **`/api/admin/catalog/*`**.

---

## Postman

Колекція: [`docs/postman/Plywood-Present-Catalog-API.postman_collection.json`](./postman/Plywood-Present-Catalog-API.postman_collection.json) (файл Postman; назва колекції — 13pm tactic)

Змінні колекції:

| Змінна | Значення |
|--------|----------|
| `baseUrl` | `http://localhost:3000` |
| `adminUser` | з `.env` |
| `adminPass` | з `.env` |

Порядок: **1. Admin Login** → далі запити каталогу.
