import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import SiteChrome from "@/components/layout/SiteChrome";
import NotFoundPage from "@/components/shared/NotFoundPage";
import { buildPageMetadata } from "@/lib/seo";
import { seoCopy } from "@/lib/seoCopy";
import "./(site)/critical.css";
import "./(site)/globals.css";
import "./(site)/mobile-optimizations.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  fallback: ["system-ui", "arial"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  style: ["italic"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
});

export const metadata: Metadata = buildPageMetadata({
  title: seoCopy.notFound.title,
  description: seoCopy.notFound.description,
  path: "/404",
  noIndex: true,
});

/** Глобальна 404 — власний html/body (немає app/layout.tsx) + хедер/футер як на сайті. */
export default function GlobalNotFound() {
  return (
    <html lang="uk" className={`${montserrat.className} ${playfair.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4A5840" />
      </head>
      <body>
        <SiteChrome>
          <NotFoundPage />
        </SiteChrome>
      </body>
    </html>
  );
}
