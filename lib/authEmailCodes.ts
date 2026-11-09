import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { SITE_STORE_NAME } from "@/lib/siteBrand";

export type AuthCodePurpose = "email-verify" | "password-reset";

const CODE_TTL_MS = 15 * 60 * 1000;

export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

function identifierFor(purpose: AuthCodePurpose, email: string): string {
  return `${purpose}:${normalizeAuthEmail(email)}`;
}

function generateSixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Видаляє попередні коди й створює новий (6 цифр, 15 хв). */
export async function issueAuthCode(
  purpose: AuthCodePurpose,
  email: string
): Promise<{ code: string; expires: Date }> {
  const normalized = normalizeAuthEmail(email);
  const id = identifierFor(purpose, normalized);

  await prisma.verificationToken.deleteMany({
    where: { identifier: id },
  });

  const code = generateSixDigitCode();
  const expires = new Date(Date.now() + CODE_TTL_MS);

  await prisma.verificationToken.create({
    data: {
      identifier: id,
      token: code,
      expires,
    },
  });

  return { code, expires };
}

export async function consumeAuthCode(
  purpose: AuthCodePurpose,
  email: string,
  code: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = normalizeAuthEmail(email);
  const trimmed = String(code || "").trim();
  if (!/^\d{6}$/.test(trimmed)) {
    return { ok: false, error: "Введіть 6-значний код з листа" };
  }

  const id = identifierFor(purpose, normalized);
  const row = await prisma.verificationToken.findFirst({
    where: { identifier: id, token: trimmed },
  });

  if (!row) {
    return { ok: false, error: "Невірний код підтвердження" };
  }

  if (row.expires.getTime() < Date.now()) {
    await prisma.verificationToken.deleteMany({ where: { identifier: id } });
    return { ok: false, error: "Код прострочено. Запросіть новий" };
  }

  await prisma.verificationToken.deleteMany({ where: { identifier: id } });
  return { ok: true };
}

function codeEmailHtml(params: {
  title: string;
  intro: string;
  code: string;
}): string {
  return `<!DOCTYPE html>
<html lang="uk">
<body style="margin:0;padding:0;background:#f4f4f2;font-family:Montserrat,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:#1C1C1C;padding:20px 24px;color:#fff;font-size:14px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">
              ${SITE_STORE_NAME}
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px;color:#1C1C1C;">
              <h1 style="margin:0 0 12px;font-size:20px;">${params.title}</h1>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#444;">${params.intro}</p>
              <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.08em;">Ваш код</p>
              <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:0.28em;font-family:ui-monospace,Menlo,monospace;">${params.code}</p>
              <p style="margin:20px 0 0;font-size:12px;color:#888;line-height:1.5;">Код дійсний 15 хвилин. Якщо ви не запитували цей лист — проігноруйте його.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationCodeEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: email,
    subject: `${SITE_STORE_NAME}: код підтвердження реєстрації`,
    text: `Ваш код підтвердження: ${code}\n\nКод дійсний 15 хвилин.`,
    html: codeEmailHtml({
      title: "Підтвердження email",
      intro: "Щоб завершити реєстрацію в особистому кабінеті, введіть цей код на сайті.",
      code,
    }),
  });
}

export async function sendPasswordResetCodeEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: email,
    subject: `${SITE_STORE_NAME}: скидання пароля`,
    text: `Ваш код для скидання пароля: ${code}\n\nКод дійсний 15 хвилин.`,
    html: codeEmailHtml({
      title: "Скидання пароля",
      intro: "Введіть цей код на сайті, щоб встановити новий пароль до кабінету.",
      code,
    }),
  });
}
