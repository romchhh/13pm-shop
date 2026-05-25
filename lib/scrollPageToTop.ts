/** Прокрутка вікна на початок (для переходів між сторінками / товарами). */
export function scrollPageToTop(): void {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Кілька спроб — після client navigation і зміни висоти контенту (мобільні браузери). */
export function scrollPageToTopReliable(): void {
  scrollPageToTop();
  requestAnimationFrame(() => {
    scrollPageToTop();
    requestAnimationFrame(scrollPageToTop);
  });
  window.setTimeout(scrollPageToTop, 0);
  window.setTimeout(scrollPageToTop, 50);
}
