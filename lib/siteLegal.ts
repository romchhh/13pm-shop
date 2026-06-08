/** Публічний домен сайту для юридичних посилань у футері. */
export const SITE_PUBLIC_ORIGIN = "https://13pm.com.ua";

export const siteRequisites = {
  recipient: "ФОП Симоненко Максим Васильович",
  iban: "UA373220010000026001380012994",
  taxId: "3275014793",
  bankName: "Акціонерне товариство «УНІВЕРСАЛ БАНК»",
  mfo: "322001",
  bankEdrpou: "21133352",
} as const;

export const siteLegalLinks = [
  { label: "Публічна оферта", href: `${SITE_PUBLIC_ORIGIN}/terms-of-service` },
  { label: "Політика конфіденційності", href: `${SITE_PUBLIC_ORIGIN}/privacy-policy` },
  { label: "Повернення та обмін", href: `${SITE_PUBLIC_ORIGIN}/returns-and-exchange` },
] as const;
