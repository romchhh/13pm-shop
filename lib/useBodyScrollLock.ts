"use client";

import { useLayoutEffect } from "react";

type SavedBodyStyles = {
  overflow: string;
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  paddingRight: string;
};

let lockCount = 0;
let savedScrollY = 0;
let savedBodyStyles: SavedBodyStyles | null = null;
let savedHtmlOverflow = "";

function getScrollbarWidth(): number {
  if (typeof window === "undefined") return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

function lockBody(): void {
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    const scrollbarWidth = getScrollbarWidth();

    savedBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight,
    };
    savedHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.documentElement.style.overflow = "hidden";
  }
  lockCount += 1;
}

function unlockBody(): void {
  if (lockCount <= 0) return;
  lockCount -= 1;
  if (lockCount !== 0 || !savedBodyStyles) return;

  const styles = savedBodyStyles;
  document.body.style.overflow = styles.overflow;
  document.body.style.position = styles.position;
  document.body.style.top = styles.top;
  document.body.style.left = styles.left;
  document.body.style.right = styles.right;
  document.body.style.width = styles.width;
  document.body.style.paddingRight = styles.paddingRight;
  document.documentElement.style.overflow = savedHtmlOverflow;

  savedBodyStyles = null;
  window.scrollTo(0, savedScrollY);
}

/** Blocks page scroll while `locked` is true. Safe with multiple simultaneous overlays (ref counter). */
export function useBodyScrollLock(locked: boolean): void {
  useLayoutEffect(() => {
    if (!locked) return;
    lockBody();
    return () => unlockBody();
  }, [locked]);
}
