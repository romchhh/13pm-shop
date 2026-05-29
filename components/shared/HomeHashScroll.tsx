"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Прокрутка до #about, #reviews, #faq після переходу на головну */
export default function HomeHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const scrollToHash = () => {
      const hash = window.location.hash.replace(/^#+/, "").split("#")[0];
      if (!hash) return;
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    requestAnimationFrame(() => {
      scrollToHash();
      window.setTimeout(scrollToHash, 150);
    });
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, [pathname]);

  return null;
}
