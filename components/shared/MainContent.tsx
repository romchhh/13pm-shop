"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { scrollPageToTopReliable } from "@/lib/scrollPageToTop";

interface MainContentProps {
  children: React.ReactNode;
  id?: string;
}

export default function MainContent({ children, id }: MainContentProps) {
  const pathname = usePathname();
  const [isHomePage, setIsHomePage] = useState(false);

  useEffect(() => {
    setIsHomePage(pathname === "/");
  }, [pathname]);

  // Вимикаємо нативне відновлення скролу та завжди прокручуємо догори при зміні роуту
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    scrollPageToTopReliable();
  }, [pathname]);

  return (
    <main id={id} className={`bg-[var(--background-warm-yellow)] ${isHomePage ? "" : "mt-[var(--site-header-offset)]"}`}>
      {children}
    </main>
  );
}

