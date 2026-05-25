"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { scrollPageToTopReliable } from "@/lib/scrollPageToTop";

/** Скидає скрол при кожному переході на інший товар (/product/...). */
export default function ProductRouteScrollToTop() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!pathname?.startsWith("/product/")) return;
    scrollPageToTopReliable();
  }, [pathname]);

  return null;
}
