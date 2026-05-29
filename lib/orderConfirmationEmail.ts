/**
 * HTML лист підтвердження замовлення (13pm tactic).
 * Відправка через Resend після оплати замовлення.
 */

import { sendEmail } from "@/lib/email";
import { PAYMENT_TYPE_LABELS_LONG } from "@/lib/paymentTypeLabels";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { siteContact } from "@/lib/siteContact";
import { SITE_ACCENT } from "@/lib/siteColors";

const ACCENT = SITE_ACCENT;
const TEXT = "#1a1a1a";
const MUTED = "rgba(26,26,26,0.72)";
const BG = "#faf9f7";

const DELIVERY_LABELS: Record<string, string> = {
  nova_poshta_branch: "Нова пошта (відділення)",
  nova_poshta_courier: "Нова пошта (кур'єр)",
  nova_poshta_locker: "Нова пошта (поштомат)",
  showroom_pickup: "Самовивіз",
  ukrposhta: "Укрпошта",
  one_click: "Нова пошта — уточнити у клієнта (замовлення в 1 клік)",
};

export type OrderItemForEmail = {
  product_id: number | null;
  product_name: string | null;
  size: string;
  quantity: number;
  price: number;
  color?: string | null;
};

export type OrderForEmail = {
  customer_name: string;
  email: string | null;
  phone_number: string;
  delivery_method: string;
  city: string;
  post_office: string;
  payment_type: string;
  comment?: string | null;
  invoice_id: string;
  nova_poshta_ttn?: string | null;
  created_at: Date;
  items: OrderItemForEmail[];
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Побудова HTML листа в стилі 13pm tactic (var(--site-accent), Montserrat).
 */
export function buildOrderConfirmationHtml(
  order: OrderForEmail,
  baseUrl: string,
  productImageUrls: Map<number, string>
): string {
  const logoUrl = baseUrl + "/13pm-mark-black.svg";
  const total = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const paymentLabel =
    PAYMENT_TYPE_LABELS_LONG[order.payment_type] || order.payment_type;
  const deliveryLabel = DELIVERY_LABELS[order.delivery_method] || order.delivery_method;
  const dateStr = new Date(order.created_at).toLocaleString("uk-UA");

  const rows = order.items
    .map((item) => {
      const imgUrl =
        item.product_id != null ? productImageUrls.get(item.product_id) || "" : "";
      const name = item.product_name || "Товар";
      const variantParts = [item.size, item.color]
        .filter((v): v is string => typeof v === "string" && v.length > 0)
        .map(escapeHtml);
      const variantText = variantParts.length ? ` · ${variantParts.join(", ")}` : "";
      const itemTotal = Number(item.price) * item.quantity;
      const imgCell = imgUrl
        ? `<img src="${escapeHtml(imgUrl)}" alt="" width="80" height="80" style="object-fit:cover;border-radius:10px;display:block;" />`
        : '<span style="color:#999;font-size:12px;">—</span>';
      return `
        <tr>
          <td style="padding:12px 14px;border-bottom:1px solid #eee;vertical-align:middle;">${imgCell}</td>
          <td style="padding:12px 14px;border-bottom:1px solid #eee;vertical-align:middle;font-family:'Montserrat',Arial,sans-serif;font-size:14px;color:${TEXT};">${escapeHtml(name)}${variantText}</td>
          <td style="padding:12px 14px;border-bottom:1px solid #eee;vertical-align:middle;font-family:'Montserrat',Arial,sans-serif;font-size:14px;color:${TEXT};text-align:center;">${item.quantity}</td>
          <td style="padding:12px 14px;border-bottom:1px solid #eee;vertical-align:middle;font-family:'Montserrat',Arial,sans-serif;font-size:14px;color:${TEXT};text-align:right;">${Number(item.price).toFixed(0)} ₴</td>
          <td style="padding:12px 14px;border-bottom:1px solid #eee;vertical-align:middle;font-family:'Montserrat',Arial,sans-serif;font-size:14px;color:${TEXT};font-weight:600;text-align:right;">${itemTotal.toFixed(0)} ₴</td>
        </tr>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Дякуємо за замовлення — ${escapeHtml(SITE_STORE_NAME)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:'Montserrat',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BG};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#ffffff;padding:28px 32px;text-align:center;border-bottom:1px solid #f0eeeb;">
              <a href="${escapeHtml(baseUrl)}" target="_blank" rel="noopener">
                <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(SITE_STORE_NAME)}" width="168" height="48" style="display:inline-block;max-height:48px;width:auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 20px;">
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:${TEXT};letter-spacing:-0.02em;line-height:1.3;">
                Дякуємо за замовлення!
              </h1>
              <p style="margin:0;font-size:15px;color:${MUTED};line-height:1.55;">
                Вітаємо, ${escapeHtml(order.customer_name)}! Ваше замовлення <strong style="color:${ACCENT};">#${escapeHtml(order.invoice_id)}</strong> прийнято. Ми зв&apos;яжемося з вами для уточнення деталей доставки.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BG};border-radius:14px;padding:20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${ACCENT};font-weight:600;">Доставка</p>
                    <p style="margin:0 0 16px;font-size:15px;color:${TEXT};line-height:1.45;">${escapeHtml(deliveryLabel)}<br />${escapeHtml(order.city)}, ${escapeHtml(order.post_office)}</p>
                    ${
                      order.nova_poshta_ttn
                        ? `<p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${ACCENT};font-weight:600;">Номер накладної Нової пошти (ТТН)</p>
                    <p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-weight:600;">${escapeHtml(order.nova_poshta_ttn)}</p>`
                        : ""
                    }
                    <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${ACCENT};font-weight:600;">Оплата</p>
                    <p style="margin:0 0 4px;font-size:15px;color:${TEXT};">${escapeHtml(paymentLabel)}</p>
                    <p style="margin:0;font-size:13px;color:${MUTED};">Дата: ${escapeHtml(dateStr)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${ACCENT};">Товари у замовленні</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eee;border-radius:14px;overflow:hidden;">
                <thead>
                  <tr style="background:${ACCENT};">
                    <th style="padding:11px 14px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#fff;">Фото</th>
                    <th style="padding:11px 14px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#fff;">Товар</th>
                    <th style="padding:11px 14px;text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#fff;">К-сть</th>
                    <th style="padding:11px 14px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#fff;">Ціна</th>
                    <th style="padding:11px 14px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#fff;">Сума</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
              <p style="margin:16px 0 0;font-size:18px;font-weight:700;color:${TEXT};text-align:right;">Разом: ${total.toFixed(0)} ₴</p>
            </td>
          </tr>
          ${
            order.comment && order.comment.trim()
              ? `
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${ACCENT};font-weight:600;">Коментар</p>
              <p style="margin:0;font-size:14px;color:${TEXT};line-height:1.5;">${escapeHtml(order.comment.trim())}</p>
            </td>
          </tr>
          `
              : ""
          }
          <tr>
            <td style="padding:28px 32px;background:${BG};border-top:1px solid #eee;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:${TEXT};">Ми в соцмережах</p>
              <p style="margin:0 0 18px;">
                <a href="${escapeHtml(siteContact.instagramUrl)}" target="_blank" rel="noopener" style="display:inline-block;margin-right:14px;color:${ACCENT};font-size:14px;font-weight:500;text-decoration:none;">Instagram</a>
                <a href="${escapeHtml(siteContact.tiktokUrl)}" target="_blank" rel="noopener" style="display:inline-block;margin-right:14px;color:${ACCENT};font-size:14px;font-weight:500;text-decoration:none;">TikTok</a>
                <a href="${escapeHtml(siteContact.telegramUrl)}" target="_blank" rel="noopener" style="display:inline-block;color:${ACCENT};font-size:14px;font-weight:500;text-decoration:none;">Telegram</a>
              </p>
              <p style="margin:0;font-size:12px;color:${MUTED};line-height:1.5;">
                ${escapeHtml(SITE_STORE_NAME)} — tactical clothing UA | твій тактичний одяг.<br />
                <a href="${escapeHtml(baseUrl)}" style="color:${ACCENT};text-decoration:none;">${escapeHtml(baseUrl.replace(/^https?:\/\//, ""))}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Відправити лист підтвердження замовлення на email клієнта (якщо вказано).
 */
export async function sendOrderConfirmationEmail(
  order: OrderForEmail,
  productImageUrls: Map<number, string>
): Promise<{ success: boolean; error?: string }> {
  if (!order.email || !order.email.trim()) {
    return { success: true };
  }
  const baseUrl =
    process.env.PUBLIC_URL ||
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    "http://localhost:3000";
  const html = buildOrderConfirmationHtml(order, baseUrl, productImageUrls);
  const total = order.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  return sendEmail({
    to: order.email.trim(),
    subject: `Дякуємо за замовлення #${order.invoice_id} — ${SITE_STORE_NAME}`,
    html,
    text: `Дякуємо за замовлення в ${SITE_STORE_NAME}! Номер: ${order.invoice_id}. Разом: ${total.toFixed(0)} ₴. Ми зв'яжемося з вами щодо доставки.`,
  });
}
