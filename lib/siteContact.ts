/** Контактні дані сайту — одне джерело для футера, хедера та сторінки «Контакти». */
const phones = [
  { display: "+380 93 259 51 49", tel: "+380932595149" },
  { display: "+380 93 864 20 33", tel: "+380938642033" },
] as const;

export const siteContact = {
  phones,
  phoneDisplay: phones[0].display,
  phoneTel: phones[0].tel,
  messengerPhone: {
    display: "+380 93 259 51 49",
    tel: "+380932595149",
  },
  messengerLabel: "Viber, Telegram",
  viberUrl: "viber://chat?number=380932595149",
  telegramUrl: "https://t.me/+380932595149",
  email: "plywood_@ukr.net",
  scheduleLines: [
    "Пн.-Пт.: 09.00 - 18.00",
    "Сб.-Нд.: за попередньою домовленістю",
  ] as const,
  instagramUrl: "https://www.instagram.com/plywood_present",
  instagramHandle: "@plywood_present",
  tiktokUrl: "https://www.tiktok.com/@plywood_present",
  tiktokHandle: "@plywood_present",
};
