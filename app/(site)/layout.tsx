import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AppProvider } from "@/lib/GeneralProvider";
import { BasketProvider } from "@/lib/BasketProvider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "CHARS — Український Бренд Чоловічого Одягу | Стиль Без Компромісів",
  description:
    "CHARS — український бренд чоловічого одягу, заснований у 2023 році. Ми створюємо стильний одяг для різних чоловіків без компромісів. Класика, кежуал та спорт.",
  keywords:
    "CHARS, український бренд одягу, чоловічий одяг, стильний одяг, смарт-кежуал, кежуал-класик, українська мода, одяг для чоловіків, київ",
  openGraph: {
    title: "CHARS — Український Бренд Чоловічого Одягу",
    description:
      "Стильний чоловічий одяг без компромісів. Класика, кежуал та спорт.",
    type: "website",
    locale: "uk_UA",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={inter.className}>
      <body>
        <AppProvider>
          <BasketProvider>
            <Header />
            <main className="mt-16 lg:mt-20">{children}</main>
            <Footer />
          </BasketProvider>
        </AppProvider>
      </body>
    </html>
  );
}
