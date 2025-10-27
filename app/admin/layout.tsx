// /app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Roboto } from "next/font/google";
import { SidebarProvider } from "@/lib/SidebarContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import ClientLayoutShell from "@/components/admin/ClientLayoutShell";

const outfit = Roboto({
  subsets: ["cyrillic"],
});

export const metadata: Metadata = {
  title: "CHARS — Admin Panel",
  icons: {
    icon: "/images/light-theme/chars-logo-header-light.png",
    shortcut: "/images/light-theme/chars-logo-header-light.png",
    apple: "/images/light-theme/chars-logo-header-light.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <head>
        {/* Additional favicon for compatibility */}
        <link rel="icon" type="image/png" href="/images/light-theme/chars-logo-header-light.png" />
        <link rel="shortcut icon" type="image/png" href="/images/light-theme/chars-logo-header-light.png" />
        <link rel="apple-touch-icon" href="/images/light-theme/chars-logo-header-light.png" />
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            <ClientLayoutShell>{children}</ClientLayoutShell>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
