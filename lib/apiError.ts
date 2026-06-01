import { NextResponse } from "next/server";

const PRISMA_ERROR_UK: Record<string, string> = {
  P2002: "Такий запис уже існує (наприклад, однаковий slug або назва).",
  P2003: "Неможливо зберегти: пов’язана категорія або товар не існує.",
  P2025: "Запис не знайдено.",
};

/** Повідомлення для відповіді API (сервер). */
export function formatServerError(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: unknown }).code);
    if (PRISMA_ERROR_UK[code]) return PRISMA_ERROR_UK[code];
  }

  if (error instanceof Error) {
    const msg = error.message.trim();
    if (msg && !/^Failed to /i.test(msg)) return msg;
  }

  return fallback;
}

export function apiErrorJson(
  error: unknown,
  fallback: string,
  status = 500
): NextResponse {
  return NextResponse.json({ error: formatServerError(error, fallback) }, { status });
}

/** Текст помилки з тіла відповіді (клієнт / адмінка). */
export async function readApiError(res: Response, fallback: string): Promise<string> {
  let detail: string | null = null;
  try {
    const data = (await res.json()) as { error?: unknown; message?: unknown };
    if (typeof data?.error === "string" && data.error.trim()) detail = data.error.trim();
    else if (typeof data?.message === "string" && data.message.trim())
      detail = data.message.trim();
  } catch {
    /* порожнє або не JSON */
  }

  const base = detail || fallback;
  if (res.status >= 400) {
    return `${base} (HTTP ${res.status})`;
  }
  return base;
}

export async function assertApiOk(res: Response, fallback: string): Promise<void> {
  if (!res.ok) {
    throw new Error(await readApiError(res, fallback));
  }
}
