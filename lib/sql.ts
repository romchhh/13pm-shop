import { Pool } from "pg";
import { unlink } from "fs/promises";
import path from "path";

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : false,
});

// Debug: Log the actual DATABASE_URL being used
console.log("🔍 DATABASE_URL:", process.env.DATABASE_URL);

// Create a template literal function that mimics Neon's API
export const sql = Object.assign(
  async (strings: TemplateStringsArray, ...values: unknown[]) => {
    let query = strings[0];
    for (let i = 0; i < values.length; i++) {
      query += `$${i + 1}` + strings[i + 1];
    }
    const result = await pool.query(query, values);
    return result.rows;
  },
  {
    query: async (strings: TemplateStringsArray, ...values: unknown[]) => {
      let query = strings[0];
      for (let i = 0; i < values.length; i++) {
        query += `$${i + 1}` + strings[i + 1];
      }
      const result = await pool.query(query, values);
      return result.rows;
    },
  }
);

// =====================
// 👕 PRODUCTS
// =====================

// Get all products with sizes & media
export async function sqlGetAllProducts() {
  return await sql`
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.top_sale,
      p.limited_edition,
      p.season,
      p.category_id,
      p.subcategory_id,
      p.color,
      p.fabric_composition,
      p.has_lining,
      c.name AS category_name,
      sc.name AS subcategory_name,
      p.created_at,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('size', s.size, 'stock', s.stock))
        FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) AS sizes,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('type', m.type, 'url', m.url))
        FILTER (WHERE m.id IS NOT NULL),
        '[]'
      ) AS media,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('label', pc.label, 'hex', pc.hex))
        FILTER (WHERE pc.id IS NOT NULL),
        '[]'
      ) AS colors
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    LEFT JOIN product_sizes s ON p.id = s.product_id
    LEFT JOIN product_media m ON p.id = m.product_id
    LEFT JOIN product_colors pc ON p.id = pc.product_id
    GROUP BY p.id, c.name, sc.name
    ORDER BY p.id DESC;
  `;
}

// Get one product by ID with sizes & media
export async function sqlGetProduct(id: number) {
  return await sql`
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.top_sale,
      p.limited_edition,
      p.season,
      p.color,
      p.category_id,
      p.subcategory_id,
      p.fabric_composition,
      p.has_lining,
      c.name AS category_name,
      sc.name AS subcategory_name,
      COALESCE(s.sizes, '[]') AS sizes,
      COALESCE(m.media, '[]') AS media,
      COALESCE(pc.colors, '[]') AS colors
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    LEFT JOIN LATERAL (
      SELECT JSON_AGG(
        JSONB_BUILD_OBJECT('size', s.size, 'stock', s.stock)
      ) AS sizes
      FROM product_sizes s
      WHERE s.product_id = p.id
    ) s ON true
    LEFT JOIN LATERAL (
      SELECT JSON_AGG(
        JSONB_BUILD_OBJECT('type', m.type, 'url', m.url)
      ) AS media
      FROM product_media m
      WHERE m.product_id = p.id
    ) m ON true
    LEFT JOIN LATERAL (
      SELECT JSON_AGG(
        JSONB_BUILD_OBJECT('label', pc.label, 'hex', pc.hex)
      ) AS colors
      FROM product_colors pc
      WHERE pc.product_id = p.id
    ) pc ON true
    WHERE p.id = ${id};
  `;
}

export async function sqlGetProductsByCategory(categoryName: string) {
  return await sql`
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.top_sale,
      p.limited_edition,
      p.season,
      p.color,
      p.category_id,
      c.name AS category_name,
      p.created_at,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('size', s.size, 'stock', s.stock))
        FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) AS sizes,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('type', m.type, 'url', m.url))
        FILTER (WHERE m.id IS NOT NULL),
        '[]'
      ) AS media,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('label', pc.label, 'hex', pc.hex))
        FILTER (WHERE pc.id IS NOT NULL),
        '[]'
      ) AS colors
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_sizes s ON p.id = s.product_id
    LEFT JOIN product_media m ON p.id = m.product_id
    LEFT JOIN product_colors pc ON p.id = pc.product_id
    WHERE c.name = ${categoryName}
    GROUP BY p.id, c.name
    ORDER BY p.id DESC;
  `;
}

export async function sqlGetProductsBySubcategoryName(name: string) {
  return await sql`
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.top_sale,
      p.limited_edition,
      p.season,
      p.color,
      p.category_id,
      p.subcategory_id,
      c.name AS category_name,
      sc.name AS subcategory_name,
      p.created_at,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('size', s.size, 'stock', s.stock))
        FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) AS sizes,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('type', m.type, 'url', m.url))
        FILTER (WHERE m.id IS NOT NULL),
        '[]'
      ) AS media,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('label', pc.label, 'hex', pc.hex))
        FILTER (WHERE pc.id IS NOT NULL),
        '[]'
      ) AS colors
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    LEFT JOIN product_sizes s ON p.id = s.product_id
    LEFT JOIN product_media m ON p.id = m.product_id
    LEFT JOIN product_colors pc ON p.id = pc.product_id
    WHERE LOWER(sc.name) = LOWER(${name})
    GROUP BY p.id, c.name, sc.name
    ORDER BY p.id DESC;
  `;
}

export async function sqlGetProductsBySeason(season: string) {
  return await sql`
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.top_sale,
      p.limited_edition,
      p.season,
      p.color,
      p.category_id,
      c.name AS category_name,
      p.created_at,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('size', s.size, 'stock', s.stock))
        FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) AS sizes,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('type', m.type, 'url', m.url))
        FILTER (WHERE m.id IS NOT NULL),
        '[]'
      ) AS media,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('label', pc.label, 'hex', pc.hex))
        FILTER (WHERE pc.id IS NOT NULL),
        '[]'
      ) AS colors
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_sizes s ON p.id = s.product_id
    LEFT JOIN product_media m ON p.id = m.product_id
    LEFT JOIN product_colors pc ON p.id = pc.product_id
    WHERE p.season = ${season}
    GROUP BY p.id, c.name
    ORDER BY p.id DESC;
  `;
}

// Fetch all distinct colors from the database
export async function sqlGetAllColors() {
  const dbColors = await sql`
    SELECT DISTINCT color
    FROM products
    WHERE color IS NOT NULL
    ORDER BY color;
  `;

  // Standard palette with hex suggestions
  const standardPalette: Record<string, string> = {
    Чорний: "#000000",
    Білий: "#FFFFFF",
    Сірий: "#808080",
    "Світло-сірий": "#C0C0C0",
    "Темно-сірий": "#4B4B4B",
    Бежевий: "#F5F5DC",
    Кремовий: "#FFFDD0",
    Коричневий: "#8B4513",
    Червоний: "#FF0000",
    Малиновий: "#DC143C",
    Кораловий: "#FF7F50",
    Рожевий: "#FFC0CB",
    Помаранчевий: "#FFA500",
    Жовтий: "#FFD700",
    Зелений: "#008000",
    Хаки: "#78866B",
    Блакитний: "#87CEEB",
    Синій: "#0000FF",
    "Темно-синій": "#00008B",
    Фіолетовий: "#800080",
  };

  const names = new Set<string>([...Object.keys(standardPalette)]);
  for (const row of dbColors) {
    if (row.color) names.add(row.color as string);
  }

  return Array.from(names)
    .sort()
    .map((name) => ({ color: name, hex: standardPalette[name] }));
}

// Create new product
export async function sqlPostProduct(product: {
  name: string;
  description?: string;
  price: number;
  old_price?: number | null;
  discount_percentage?: number | null;
  priority?: number;
  top_sale?: boolean;
  limited_edition?: boolean;
  season?: string;
  color?: string;
  category_id?: number | null;
  subcategory_id?: number | null; // ✅ NEW
  fabric_composition?: string;
  has_lining?: boolean;
  sizes?: { size: string; stock: number }[];
  media?: { type: string; url: string }[];
  colors?: { label: string; hex?: string | null }[];
}) {
  const inserted = await sql`
    INSERT INTO products (
      name, description, price, old_price, discount_percentage, priority,
      top_sale, limited_edition, season, color,
      category_id, subcategory_id, fabric_composition, has_lining
    )
    VALUES (
      ${product.name},
      ${product.description || null},
      ${product.price},
      ${product.old_price || null},
      ${product.discount_percentage || null},
      ${product.priority || 0},
      ${product.top_sale || false},
      ${product.limited_edition || false},
      ${product.season || null},
      ${product.color || null},
      ${product.category_id || null},
      ${product.subcategory_id || null},
      ${product.fabric_composition || null},
      ${product.has_lining || false}
    )
    RETURNING id;
  `;

  const productId = inserted[0].id;

  if (product.sizes?.length) {
    for (const size of product.sizes) {
      await sql`
        INSERT INTO product_sizes (product_id, size, stock)
        VALUES (${productId}, ${size.size}, ${size.stock});
      `;
    }
  }

  if (product.media?.length) {
    for (const media of product.media) {
      await sql`
        INSERT INTO product_media (product_id, type, url)
        VALUES (${productId}, ${media.type}, ${media.url});
      `;
    }
  }

  if (product.colors?.length) {
    for (const color of product.colors) {
      await sql`
        INSERT INTO product_colors (product_id, label, hex)
        VALUES (${productId}, ${color.label}, ${color.hex || null});
      `;
    }
  }

  return { id: productId };
}

// Update existing product
export async function sqlPutProduct(
  id: number,
  update: {
    name: string;
    description?: string;
    price: number;
    old_price?: number | null;
    discount_percentage?: number | null;
    priority?: number;
    top_sale?: boolean;
    limited_edition?: boolean;
    season?: string;
    color?: string;
    category_id?: number | null;
    subcategory_id?: number | null; // ✅ NEW
    fabric_composition?: string;
    has_lining?: boolean;
    sizes?: { size: string; stock: number }[];
    media?: { type: string; url: string }[];
    colors?: { label: string; hex?: string | null }[];
  }
) {
  // Step 1: Update main product fields
  await sql`
    UPDATE products
    SET 
      name = ${update.name},
      description = ${update.description || null},
      price = ${update.price},
      old_price = ${update.old_price || null},
      discount_percentage = ${update.discount_percentage || null},
      priority = ${update.priority || 0},
      top_sale = ${update.top_sale || false},
      limited_edition = ${update.limited_edition || false},
      season = ${update.season || null},
      color = ${update.color || null},
      category_id = ${update.category_id || null},
      subcategory_id = ${update.subcategory_id || null}, -- ✅ NEW
      fabric_composition = ${update.fabric_composition || null},
      has_lining = ${update.has_lining || false}
    WHERE id = ${id};
  `;

  // Step 2: Fetch old media URLs before deleting from DB
  const oldMedia = await sql`
    SELECT url FROM product_media WHERE product_id = ${id};
  `;

  // Step 3: Clear old sizes, media, colors
  await sql`DELETE FROM product_sizes WHERE product_id = ${id};`;
  await sql`DELETE FROM product_media WHERE product_id = ${id};`;
  await sql`DELETE FROM product_colors WHERE product_id = ${id};`;

  // Step 4: Delete old image files from disk
  for (const { url } of oldMedia) {
    const filePath = path.join(process.cwd(), "product-images", url);
    try {
      await unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete image: ${filePath}`, error);
    }
  }

  // Step 5: Re-insert new sizes
  if (update.sizes?.length) {
    for (const size of update.sizes) {
      await sql`
        INSERT INTO product_sizes (product_id, size, stock)
        VALUES (${id}, ${size.size}, ${size.stock});
      `;
    }
  }

  // Step 6: Re-insert new media
  if (update.media?.length) {
    for (const media of update.media) {
      await sql`
        INSERT INTO product_media (product_id, type, url)
        VALUES (${id}, ${media.type}, ${media.url});
      `;
    }
  }

  // Step 7: Re-insert new colors
  if (update.colors?.length) {
    for (const color of update.colors) {
      await sql`
        INSERT INTO product_colors (product_id, label, hex)
        VALUES (${id}, ${color.label}, ${color.hex || null});
      `;
    }
  }

  return { updated: true };
}

export async function sqlDeleteProduct(id: number) {
  // Step 1: Get media URLs
  const media = await sql`
    SELECT url FROM product_media WHERE product_id = ${id};
  `;

  // Step 2: Delete the product (cascade removes sizes/media)
  await sql`DELETE FROM products WHERE id = ${id};`;

  // Step 3: Delete files from disk
  for (const { url } of media) {
    const filePath = path.join(process.cwd(), "product-images", url);
    try {
      await unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete image: ${filePath}`, error);
    }
  }

  return { deleted: true };
}

// =====================
// 📬 ORDERS
// =====================

// Get all orders (without items for performance)
export async function sqlGetAllOrders() {
  return await sql`
    SELECT *
    FROM orders
    ORDER BY created_at DESC;
  `;
}

// Get order with items
export async function sqlGetOrder(id: number) {
  const order = await sql`
    SELECT * FROM orders WHERE id = ${id};
  `;

  const items = await sql`
    SELECT oi.*, p.name AS product_name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ${id};
  `;

  return {
    ...order[0],
    items,
  };
}

type OrderInput = {
  customer_name: string;
  phone_number: string;
  email?: string;
  delivery_method: string;
  city: string;
  post_office: string;
  comment?: string;
  payment_type: "prepay" | "full";
  invoice_id: string;
  payment_status: "pending" | "paid" | "canceled";
  items: {
    product_id: number;
    size: string;
    quantity: number;
    price: number;
    color?: string | null;
  }[];
};

export async function sqlPostOrder(order: OrderInput) {
  // ⬇️ Insert into "orders" table
  const inserted = await sql`
    INSERT INTO orders (
      customer_name, phone_number, email,
      delivery_method, city, post_office,
      comment, payment_type, invoice_id, payment_status
    )
    VALUES (
      ${order.customer_name}, ${order.phone_number}, ${order.email || null},
      ${order.delivery_method}, ${order.city}, ${order.post_office},
      ${order.comment || null}, ${order.payment_type}, ${order.invoice_id}, ${
    order.payment_status
  }
    )
    RETURNING id;
  `;

  const orderId = inserted[0].id;

  // ⬇️ Insert each item into "order_items"
  for (const item of order.items) {
    await sql`
      INSERT INTO order_items (
        order_id, product_id, size, quantity, price, color
      ) VALUES (
        ${orderId}, ${item.product_id}, ${item.size}, ${item.quantity}, ${
      item.price
    }, ${item.color || null}
      );
    `;
  }

  return { orderId };
}

// Update an order (e.g., status change)
export async function sqlPutOrder(id: number, update: { status: string }) {
  await sql`
    UPDATE orders
    SET status = ${update.status}
    WHERE id = ${id};
  `;
  return { updated: true };
}

// ❌ Delete an order (auto-deletes items via ON DELETE CASCADE)
export async function sqlDeleteOrder(id: number) {
  await sql`DELETE FROM orders WHERE id = ${id};`;
  return { deleted: true };
}

// 🔍 Get all order items for a specific order
export async function sqlGetOrderItems(orderId: number) {
  return await sql`
    SELECT oi.*, p.name AS product_name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ${orderId}
    ORDER BY oi.id ASC;
  `;
}

// ➕ Create a single order item
export async function sqlPostOrderItem(item: {
  order_id: number;
  product_id: number;
  size: string;
  quantity: number;
  price: number;
}) {
  const result = await sql`
    INSERT INTO order_items (order_id, product_id, size, quantity, price)
    VALUES (${item.order_id}, ${item.product_id}, ${item.size}, ${item.quantity}, ${item.price})
    RETURNING *;
  `;
  return result[0];
}

// ✏️ Update (edit) an order item
export async function sqlPutOrderItem(
  id: number,
  update: {
    product_id?: number;
    size?: string;
    quantity?: number;
    price?: number;
  }
) {
  // Optional updates using COALESCE
  return await sql`
    UPDATE order_items
    SET
      product_id = COALESCE(${update.product_id}, product_id),
      size = COALESCE(${update.size}, size),
      quantity = COALESCE(${update.quantity}, quantity),
      price = COALESCE(${update.price}, price)
    WHERE id = ${id}
    RETURNING *;
  `;
}

// ❌ Delete order item
export async function sqlDeleteOrderItem(id: number) {
  await sql`DELETE FROM order_items WHERE id = ${id};`;
  return { deleted: true };
}

export async function sqlUpdatePaymentStatus(
  invoiceId: string,
  status: string
) {
  await sql`
    UPDATE orders
    SET payment_status = ${status}
    WHERE invoice_id = ${invoiceId};
  `;
}

// Get order by invoice ID for webhook processing
export async function sqlGetOrderByInvoiceId(invoiceId: string) {
  const result = await sql`
    SELECT 
      o.id,
      o.customer_name,
      o.phone_number,
      o.email,
      o.delivery_method,
      o.city,
      o.post_office,
      o.comment,
      o.payment_type,
      o.payment_status,
      o.created_at,
      COALESCE(
        JSON_AGG(
          JSONB_BUILD_OBJECT(
            'product_name', p.name,
            'size', oi.size,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) AS items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.invoice_id = ${invoiceId}
    GROUP BY o.id;
  `;
  return result[0];
}

// =====================
// 📦 CATEGORIES
// =====================

// Get all categories
export async function sqlGetAllCategories() {
  return await sql`
    SELECT * FROM categories
    ORDER BY id;
  `;
}

// Get a single category by ID
export async function sqlGetCategory(id: number) {
  return await sql`
    SELECT * FROM categories
    WHERE id = ${id};
  `;
}

// Create a new category
export async function sqlPostCategory(name: string) {
  const result = await sql`
    INSERT INTO categories (name)
    VALUES (${name})
    RETURNING *;
  `;
  return result[0];
}

// Update a category by ID
export async function sqlPutCategory(id: number, name: string) {
  const result = await sql`
    UPDATE categories
    SET name = ${name}
    WHERE id = ${id}
    RETURNING *;
  `;
  return result[0];
}

// Delete a category by ID
export async function sqlDeleteCategory(id: number) {
  await sql`
    DELETE FROM categories
    WHERE id = ${id};
  `;
  return { deleted: true };
}

// =====================
// 📦 SUBCATEGORIES
// =====================

// Get all subcategories
export async function sqlGetAllSubcategories() {
  return await sql`
    SELECT * FROM subcategories
    ORDER BY id;
  `;
}

// Get all subcategories for a specific category
export async function sqlGetSubcategoriesByCategory(categoryId: number) {
  return await sql`
    SELECT * FROM subcategories
    WHERE category_id = ${categoryId}
    ORDER BY id;
  `;
}

// Get a single subcategory by ID
export async function sqlGetSubcategory(id: number) {
  return await sql`
    SELECT * FROM subcategories
    WHERE id = ${id};
  `;
}

// Create a new subcategory
export async function sqlPostSubcategory(name: string, categoryId: number) {
  const result = await sql`
    INSERT INTO subcategories (name, category_id)
    VALUES (${name}, ${categoryId})
    RETURNING *;
  `;
  return result[0];
}

// Update a subcategory by ID
export async function sqlPutSubcategory(
  id: number,
  name: string,
  categoryId: number
) {
  const result = await sql`
    UPDATE subcategories
    SET name = ${name}, category_id = ${categoryId}
    WHERE id = ${id}
    RETURNING *;
  `;
  return result[0];
}

// Delete a subcategory by ID
export async function sqlDeleteSubcategory(id: number) {
  await sql`
    DELETE FROM subcategories
    WHERE id = ${id};
  `;
  return { deleted: true };
}
