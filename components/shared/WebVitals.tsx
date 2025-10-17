"use client";

import { useEffect } from "react";

export function WebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load web-vitals dynamically only on client side
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        import('@/lib/web-vitals').then(({ reportWebVitals }) => {
          reportWebVitals();
        });
      });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => {
        import('@/lib/web-vitals').then(({ reportWebVitals }) => {
          reportWebVitals();
        });
      }, 1);
    }
  }, []);

  return null;
}

