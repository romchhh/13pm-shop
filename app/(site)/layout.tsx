import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AppProvider } from "@/lib/GeneralProvider";
import { BasketProvider } from "@/lib/BasketProvider";
import { registerServiceWorker } from "@/lib/registerSW";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
  variable: "--font-inter",
  adjustFontFallback: true,
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
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/images/light-theme/chars-logo-header-light.png" as="image" />
        <link rel="preload" href="/images/IMG_5831.webm" as="video" type="video/webm" />
        <link rel="preload" href="/api/products/top-sale" as="fetch" crossOrigin="anonymous" />
        {/* Preload Why Choose Us images */}
        <link rel="preload" href="/images/IMG_0043.JPG" as="image" />
        <link rel="preload" href="/images/IMAGE 2025-10-17 21:48:37.jpg" as="image" />
        <link rel="dns-prefetch" href="//placehold.co" />
        {/* Fonts are already optimized via next/font/google */}
      </head>
      <body>
        <AppProvider>
          <BasketProvider>
            <Header />
            <main className="mt-16 lg:mt-20">{children}</main>
            <Footer />
          </BasketProvider>
        </AppProvider>
        <script dangerouslySetInnerHTML={{
          __html: `(${registerServiceWorker.toString()})()`
        }} />
      </body>
    </html>
  );
}
