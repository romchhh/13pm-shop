/** Контактні дані сайту — одне джерело для хедера, футера та сторінки «Співпраця». */
const PHONE_TEL = "+380639442061" as const;
const PHONE_DISPLAY = "+380 63 944 20 61" as const;

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
  viberUrl: "viber://chat?number=380639442061",
  telegramUrl: "https://t.me/+380639442061",
  scheduleLines: [
    "Пн.-Пт.: 09.00 - 18.00",
    "Сб.-Нд.: за попередньою домовленістю",
  ] as const,
  facebookUrl: "https://www.facebook.com/share/1E3r8Gt91M/?mibextid=wwXIfr",
  facebookHandle: "13PM tactic",
  instagramUrl:
    "https://www.instagram.com/13pm.tactic?igsh=ZTFjdTA5aGlkZHg5&utm_source=qr",
  instagramHandle: "@13pm.tactic",
  tiktokUrl: "https://www.tiktok.com/@13pm.tactic",
  tiktokHandle: "@13pm.tactic",
};

/** Посилання на соцмережі — одне джерело для меню, футера, хедера. */
export const siteSocialLinks = [
  { label: "Facebook", href: siteContact.facebookUrl, handle: siteContact.facebookHandle },
  { label: "Instagram", href: siteContact.instagramUrl, handle: siteContact.instagramHandle },
  { label: "TikTok", href: siteContact.tiktokUrl, handle: siteContact.tiktokHandle },
  { label: "Telegram", href: siteContact.telegramUrl, handle: null },
] as const;
