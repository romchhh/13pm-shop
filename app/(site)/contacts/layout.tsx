import type { Metadata } from "next";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Контакти",
  description: `Звʼяжіться з ${SITE_STORE_NAME}: телефон, email, Instagram, TikTok, Telegram. Консультація щодо подарунків з фанери та індивідуальних замовлень.`,
  path: "/contacts",
});

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
