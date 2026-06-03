/** Контактні дані сайту — одне джерело для хедера, футера та сторінки «Співпраця». */
const PHONE_TEL = "+380932679796" as const;
const PHONE_DISPLAY = "+380 93 267 97 96" as const;

const phones = [{ display: PHONE_DISPLAY, tel: PHONE_TEL }] as const;

export const siteContact = {
  phones,
  phoneDisplay: PHONE_DISPLAY,
  phoneTel: PHONE_TEL,
  messengerPhone: {
    display: PHONE_DISPLAY,
    tel: PHONE_TEL,
  },
  messengerLabel: "Viber, Telegram",
  viberUrl: "viber://chat?number=380932679796",
  telegramUrl: "https://t.me/+380932679796",
  scheduleLines: [
    "Пн.-Пт.: 09.00 - 18.00",
    "Сб.-Нд.: за попередньою домовленістю",
  ] as const,
  instagramUrl:
    "https://www.instagram.com/13pm.tactic?igsh=ZTFjdTA5aGlkZHg5&utm_source=qr",
  instagramHandle: "@13pm.tactic",
  tiktokUrl: "https://www.tiktok.com/@13pm.tactic",
  tiktokHandle: "@13pm.tactic",
};
