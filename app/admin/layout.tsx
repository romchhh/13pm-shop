// /app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { SidebarProvider } from "@/lib/SidebarContext";
import ClientLayoutShell from "@/components/admin/ClientLayoutShell";
import { SITE_ICON_PATH, SITE_STORE_NAME, siteMetadataIcons } from "@/lib/siteBrand";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${SITE_STORE_NAME} — Адмін-панель`,
  icons: siteMetadataIcons,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/svg+xml" href={SITE_ICON_PATH} />
        <link rel="shortcut icon" type="image/svg+xml" href={SITE_ICON_PATH} />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body className={montserrat.className}>
          <SidebarProvider>
            <ClientLayoutShell>{children}</ClientLayoutShell>
          </SidebarProvider>
      </body>
    </html>
  );
}
