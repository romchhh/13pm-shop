"use client";

import { Suspense, type ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NewsletterSubscribe from "@/components/layout/NewsletterSubscribe";
import MainContent from "@/components/shared/MainContent";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { AppProvider } from "@/lib/GeneralProvider";
import { BasketProvider } from "@/lib/BasketProvider";
import { FavoritesProvider } from "@/lib/FavoritesProvider";
import { CategoriesProvider } from "@/lib/CategoriesProvider";

type SiteChromeProps = {
  children: ReactNode;
};

export default function SiteChrome({ children }: SiteChromeProps) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Перейти до основного контенту
      </a>
      <ErrorBoundary>
        <AppProvider>
          <BasketProvider>
            <FavoritesProvider>
              <CategoriesProvider>
                <Header />
                <Suspense
                  fallback={
                    <main
                      id="main-content"
                      className="mt-[var(--site-header-offset)] min-h-screen bg-[var(--background-warm-yellow)]"
                    />
                  }
                >
                  <MainContent id="main-content">{children}</MainContent>
                </Suspense>
                <NewsletterSubscribe />
                <Footer />
              </CategoriesProvider>
            </FavoritesProvider>
          </BasketProvider>
        </AppProvider>
      </ErrorBoundary>
    </>
  );
}
