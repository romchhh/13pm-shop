"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBasket } from "@/lib/BasketProvider";
import Image from "next/image";
import Link from "next/link";
import Alert from "@/components/shared/Alert";
import CartAlert from "@/components/shared/CartAlert";
import { getFirstProductImage } from "@/lib/getFirstProductImage";
import { getProductDisplayPrice, getProductStrikePrice } from "@/lib/pricing";
import {
  GA4_BRAND,
  GA4_CURRENCY,
  GA4_VERTICAL,
  pushGA4EcommerceEvent,
} from "@/lib/ga4Ecommerce";
import { LABEL_FREE_DELIVERY_FROM_2000 } from "@/lib/siteBrand";
import { productGalleryImageAlt } from "@/lib/seoCopy";
import {
  effectiveSizeStockForDisplay,
  expandSizeStockForDisplay,
  parseSizeStock,
  parseSizeVariants,
  productHasSizeStockAvailable,
  type ProductColorOption,
  type ProductSizeStock,
  type ProductSizeVariant,
} from "@/lib/productOptions";
import OneClickOrderModal from "@/components/product/OneClickOrderModal";
import ProductDeliveryPaymentTab from "@/components/product/ProductDeliveryPaymentTab";
import ProductSizePickerBlock from "@/components/product/ProductSizePickerBlock";
import { ProductDetailDescription } from "@/components/product/ProductDetailDescription";
import ProductMediaLightbox from "@/components/product/ProductMediaLightbox";
import YouMightLike from "@/components/product/YouMightLike";
import AddToCartButton from "@/components/shared/AddToCartButton";
import CategoryDescriptionMarkdown from "@/components/shared/CategoryDescriptionMarkdown";
import { isProductOutOfStock, OUT_OF_STOCK_LABEL } from "@/lib/productAvailability";
import { productToFavoriteSnapshot } from "@/lib/favoritesStorage";
import FavoriteButton from "@/components/shared/FavoriteButton";
import { scrollPageToTopReliable } from "@/lib/scrollPageToTop";

const ACCENT = "var(--site-accent)";

type TabId = "details" | "delivery_payment";

interface ProductClientProps {
  product: {
    id: number;
    name: string;
    price: number;
    slug?: string | null;
    stock?: number;
    in_stock?: boolean;
    old_price?: number | null;
    discount_percentage?: number | null;
    subtitle?: string | null;
    short_description?: string | null;
    description?: string | null;
    main_info?: string | null;
    media?: { url: string; type: string }[];
    category_name?: string | null;
    subcategory_name?: string | null;
    category_slug?: string | null;
    category_description?: string | null;
    is_hit?: boolean;
    is_promo?: boolean;
    free_delivery_badge?: boolean;
    gift_product?: {
      id: number;
      name: string;
      slug?: string | null;
      price: number;
      old_price?: number | null;
      discount_percentage?: number | null;
      first_media?: { url: string; type: string } | null;
    } | null;
    bought_together_products?: {
      id: number;
      name: string;
      slug?: string | null;
      price: number;
      first_media?: { url: string; type: string } | null;
      description?: string | null;
    }[];
    color_options?: ProductColorOption[];
    white_color_surcharge_enabled?: boolean;
    size_variants?: unknown;
    color_linked_products?: {
      id: number;
      name: string;
      slug?: string | null;
      color_options?: ProductColorOption[];
    }[];
  };
}

function productHref(slug: string | null | undefined, id: number): string {
  const s = slug && String(slug).trim();
  return s ? `/product/${s}` : `/product/${id}`;
}

export default function ProductClient({ product }: ProductClientProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const { addItem } = useBasket();
  const [showCartAlert, setShowCartAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("info");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [oneClickOpen, setOneClickOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const isAddingToCartRef = useRef(false);
  const mobileGalleryScrollRef = useRef<HTMLDivElement>(null);

  const colors = product.color_options ?? [];
  const sizeStock = useMemo(() => {
    const expanded = expandSizeStockForDisplay(parseSizeStock(product.size_variants));
    return effectiveSizeStockForDisplay(expanded, product.in_stock);
  }, [product.in_stock, product.size_variants]);
  const legacySizeVariants = useMemo(
    () => parseSizeVariants(product.size_variants),
    [product.size_variants]
  );

  const colorLinked = product.color_linked_products ?? [];

  const [selectedSizeIndex, setSelectedSizeIndex] = useState(() => {
    const rows = effectiveSizeStockForDisplay(
      expandSizeStockForDisplay(parseSizeStock(product.size_variants)),
      product.in_stock
    );
    const firstAvailable = rows.findIndex((row) => row.stock > 0);
    return firstAvailable >= 0 ? firstAvailable : 0;
  });

  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedColorIndex(0);
    setQuantity(1);
    const firstAvailable = sizeStock.findIndex((row) => row.stock > 0);
    setSelectedSizeIndex(firstAvailable >= 0 ? firstAvailable : 0);
    const el = mobileGalleryScrollRef.current;
    if (el) el.scrollTo({ left: 0, behavior: "auto" });
  }, [product.id, product.color_options, sizeStock]);

  useEffect(() => {
    if (selectedColorIndex >= colors.length) {
      setSelectedColorIndex(0);
    }
  }, [colors, colors.length, selectedColorIndex]);

  const selectedSizeRow: ProductSizeStock | null =
    sizeStock.length > 0 ? sizeStock[selectedSizeIndex] ?? sizeStock[0] : null;

  const currentSizeLabel = useMemo(() => {
    if (selectedSizeRow?.label) return selectedSizeRow.label;
    const v = legacySizeVariants.find((s) => s.productId === product.id);
    return v?.label ?? "—";
  }, [selectedSizeRow, legacySizeVariants, product.id]);

  const selectedColorName =
    colors.length > 0 && colors[selectedColorIndex]
      ? colors[selectedColorIndex].name
      : undefined;

  const analyticsCategory = product.subcategory_name ?? product.category_name ?? null;
  const displayPrice = getProductDisplayPrice(product.price);
  const strikePrice = getProductStrikePrice(product.price, product.old_price);

  const handleAddToCart = async () => {
    if (isAddingToCartRef.current) return;
    if (sizeStock.length > 0 && (!selectedSizeRow || selectedSizeRow.stock <= 0)) {
      setAlertMessage("Оберіть розмір, який є в наявності");
      setAlertType("warning");
      setTimeout(() => setAlertMessage(null), 4000);
      return;
    }
    if (!addItem) {
      setAlertMessage("Кошик недоступний. Спробуйте оновити сторінку.");
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    isAddingToCartRef.current = true;
    setIsAddingToCart(true);
    try {
      const media = product.media || [];
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        size: currentSizeLabel,
        quantity,
        imageUrl: getFirstProductImage(media),
        discount_percentage: product.discount_percentage ?? undefined,
        subtitle: product.subtitle || product.short_description || undefined,
        color: selectedColorName,
        category_name: analyticsCategory,
      });
      setShowCartAlert(true);
      setTimeout(() => setShowCartAlert(false), 5000);
    } catch (error) {
      setAlertMessage(
        error instanceof Error ? error.message : "Недостатньо товару в наявності"
      );
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      isAddingToCartRef.current = false;
      setIsAddingToCart(false);
    }
  };

  const media = product.media || [];
  const productOutOfStock = isProductOutOfStock({
    in_stock: product.in_stock,
    stock: product.stock,
    size_variants: product.size_variants,
  });
  const selectedSizeUnavailable =
    sizeStock.length > 0 &&
    !productHasSizeStockAvailable(
      sizeStock,
      selectedSizeRow?.label ?? null,
      product.in_stock
    );
  const outOfStock = productOutOfStock;
  const cannotAddToCart = productOutOfStock || selectedSizeUnavailable;
  const categorySlug =
    product.category_slug ?? (product.category_name ? encodeURIComponent(product.category_name) : null);
  const categoryUrl = categorySlug ? `/catalog/${categorySlug}` : "/catalog";

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const lastViewItemIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isMounted) return;
    if (!product?.id) return;
    if (lastViewItemIdRef.current === product.id) return;

    lastViewItemIdRef.current = product.id;
    pushGA4EcommerceEvent("view_item", {
      currency: GA4_CURRENCY,
      value: displayPrice,
      items: [
        {
          item_id: String(product.id),
          item_name: product.name,
          item_brand: GA4_BRAND,
          item_category: analyticsCategory ?? "Каталог",
          price: displayPrice,
          quantity: 1,
          google_business_vertical: GA4_VERTICAL,
        },
      ],
    });

    // Meta Pixel ViewContent
    if (window.fbq) {
      window.fbq("track", "ViewContent", {
        content_ids: [String(product.id)],
        content_name: product.name,
        content_type: "product",
        value: displayPrice,
        currency: "UAH",
      });
    }
  }, [analyticsCategory, displayPrice, isMounted, product.id, product.name]);

  if (!isMounted) return null;

  const shortText =
    product.short_description || product.main_info || product.subtitle || "";

  const onSizeClick = (v: ProductSizeVariant) => {
    if (v.productId === product.id) return;
    scrollPageToTopReliable();
    router.push(productHref(v.slug, v.productId), { scroll: true });
  };

  const thumbWrap =
    "relative aspect-square w-full overflow-hidden rounded-xl border-2 transition-colors bg-white";
  const thumbActive = { borderColor: ACCENT, boxShadow: `0 0 0 1px ${ACCENT}` };
  const thumbIdle = "border-black/[0.08] hover:border-black/20";

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const productBadgesOverlay =
    product.is_promo === true || product.is_hit === true || product.free_delivery_badge === true ? (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/40 to-transparent px-3 pb-3 pt-10">
        <div className="flex flex-wrap gap-2">
          {product.is_promo === true && (
            <span
              className="rounded-md px-2 py-1 text-[10px] font-bold uppercase text-white sm:text-xs"
              style={{ backgroundColor: ACCENT }}
            >
              Акція
            </span>
          )}
          {product.is_hit === true && (
            <span className="rounded-md bg-black px-2 py-1 text-[10px] font-bold uppercase text-white sm:text-xs">
              Хіт
            </span>
          )}
          {product.free_delivery_badge === true && (
            <span className="rounded-md border border-white/30 bg-white/90 px-2 py-1 text-[10px] font-semibold text-emerald-900 sm:text-xs">
              {LABEL_FREE_DELIVERY_FROM_2000}
            </span>
          )}
        </div>
      </div>
    ) : null;

  const renderMediaSlide = (item: { url: string; type: string }, alt: string, priority = false) => {
    if (item.type === "video") {
      return (
        <video
          className="absolute inset-0 z-0 h-full w-full bg-transparent object-contain"
          src={`/api/images/${item.url}`}
          autoPlay
          loop
          muted
          playsInline
        />
      );
    }
    return (
      <Image
        src={`/api/images/${item.url}`}
        alt={alt}
        fill
        className="bg-transparent object-contain"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 56vw"
        priority={priority}
        quality={priority ? 90 : 80}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUzNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUzNCIgZmlsbD0iI2Y1ZjVmNCIvPjwvc3ZnPg=="
      />
    );
  };

  const scrollMobileGalleryTo = (index: number) => {
    const el = mobileGalleryScrollRef.current;
    if (!el || media.length === 0) return;
    const i = Math.max(0, Math.min(index, media.length - 1));
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setActiveImageIndex(i);
  };

  return (
    <section className="w-full bg-white min-h-screen pb-24 sm:pb-0">
      <div className="mx-auto max-w-[1920px] px-4 py-4 sm:px-6 lg:px-12 lg:py-8">
        {/* Breadcrumbs — mobile + desktop */}
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs font-['Montserrat'] text-black/45 sm:text-sm">
            <li>
              <Link href="/" className="hover:text-black/70">
                Головна
              </Link>
            </li>
            <li aria-hidden className="text-black/35">
              &gt;
            </li>
            <li>
              <Link href="/catalog" className="hover:text-black/70">
                Каталог товарів
              </Link>
            </li>
            {product.category_name && (
              <>
                <li aria-hidden className="text-black/35">
                  &gt;
                </li>
                <li>
                  <Link href={categoryUrl} className="hover:text-black/70">
                    {product.category_name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden className="text-black/35">
              &gt;
            </li>
            <li className="text-black/80 line-clamp-1">{product.name}</li>
          </ol>
        </nav>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          {/* Gallery */}
          <div className="relative flex w-full min-w-0 flex-col gap-3 lg:w-[56%] lg:flex-row lg:gap-4">
            <div className="absolute right-2 top-2 z-30 lg:right-0 lg:top-0">
              <FavoriteButton
                product={productToFavoriteSnapshot({
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  old_price: product.old_price,
                  discount_percentage: product.discount_percentage,
                  subtitle: product.subtitle,
                  subcategory_name: product.subcategory_name,
                  category_name: product.category_name,
                  media: product.media,
                  in_stock: product.in_stock,
                  stock: product.stock,
                  is_hit: product.is_hit,
                  is_promo: product.is_promo,
                  gift_product_id: product.gift_product?.id ?? null,
                })}
                variant="product"
              />
            </div>
            {/* Desktop: vertical thumbnails */}
            {media.length > 1 && (
              <div className="hidden shrink-0 flex-col gap-2 lg:flex lg:w-[88px]">
                {media.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`${thumbWrap} ${activeImageIndex === i ? "" : thumbIdle}`}
                    style={activeImageIndex === i ? thumbActive : undefined}
                  >
                    {item.type === "video" ? (
                      <video
                        className="h-full w-full object-cover"
                        src={`/api/images/${item.url}`}
                        muted
                        playsInline
                      />
                    ) : (
                      <Image
                        src={`/api/images/${item.url}`}
                        alt={productGalleryImageAlt(product.name, i, media.length)}
                        fill
                        className="object-cover"
                        sizes="88px"
                        quality={60}
                        loading="lazy"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Мобільна галерея — горизонтальний скрол */}
            <div className="w-full lg:hidden">
              {media.length === 0 ? (
                <div className="flex min-h-[280px] items-center justify-center rounded-2xl font-['Montserrat'] text-black/35">
                  Немає зображення
                </div>
              ) : (
                <>
                  <div
                    ref={mobileGalleryScrollRef}
                    role="region"
                    aria-roledescription="carousel"
                    aria-label="Галерея зображень товару"
                    className="flex w-full min-w-0 snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      const w = el.clientWidth;
                      if (w <= 0) return;
                      const idx = Math.round(el.scrollLeft / w);
                      const clamped = Math.max(0, Math.min(idx, media.length - 1));
                      setActiveImageIndex((prev) => (prev === clamped ? prev : clamped));
                    }}
                  >
                    {media.map((item, i) => (
                      <div
                        key={`mobile-slide-${item.url}-${i}`}
                        className="flex w-full min-w-full shrink-0 snap-center snap-always items-center justify-center"
                      >
                        <button
                          type="button"
                          onClick={() => openLightbox(i)}
                          className="relative aspect-[3/4] w-full max-w-[min(400px,90vw)] shrink-0 overflow-hidden rounded-2xl border-0 bg-transparent p-0 shadow-none outline-none ring-0 focus-visible:ring-2 focus-visible:ring-[var(--site-accent)]/40 focus-visible:ring-offset-2"
                          aria-label={`Відкрити фото ${i + 1} у повному розмірі`}
                        >
                          {renderMediaSlide(
                            item,
                            productGalleryImageAlt(product.name, i, media.length),
                            i === 0
                          )}
                          {i === 0 ? productBadgesOverlay : null}
                        </button>
                      </div>
                    ))}
                  </div>
                  {media.length > 1 && (
                    <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="Слайди галереї">
                      {media.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          role="tab"
                          aria-selected={i === activeImageIndex}
                          aria-label={`Слайд ${i + 1}`}
                          onClick={() => scrollMobileGalleryTo(i)}
                          className={`h-1.5 rounded-full transition-all ${
                            i === activeImageIndex ? "w-5 bg-[var(--site-accent)]" : "w-1.5 bg-black/20"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Десктоп: головне фото */}
            <button
              type="button"
              onClick={() => media.length > 0 && openLightbox(activeImageIndex)}
              className="relative order-1 hidden min-h-[520px] w-full flex-1 cursor-zoom-in overflow-hidden rounded-2xl border-0 bg-transparent p-0 shadow-none outline-none ring-0 focus-visible:ring-2 focus-visible:ring-[var(--site-accent)]/40 focus-visible:ring-offset-2 lg:block"
              aria-label="Збільшити фото"
              disabled={media.length === 0}
            >
              {media[activeImageIndex] ? (
                renderMediaSlide(
                  media[activeImageIndex],
                  productGalleryImageAlt(product.name, activeImageIndex, media.length),
                  true
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center font-['Montserrat'] text-black/35">
                  Немає зображення
                </div>
              )}
              {productBadgesOverlay}
            </button>
          </div>

          <ProductMediaLightbox
            media={media}
            initialIndex={lightboxIndex}
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            productName={product.name}
          />

          {/* Info */}
          <div className="flex w-full flex-col gap-5 font-['Montserrat'] lg:max-w-[44%]">
            <h1 className="text-[1.75rem] font-bold capitalize leading-[1.12] tracking-tight text-black sm:text-4xl lg:text-[2.75rem] xl:text-5xl">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="text-2xl font-bold text-black sm:text-3xl lg:text-4xl">
                {displayPrice.toLocaleString("uk-UA")} грн
              </span>
              {strikePrice != null && (
                <span className="text-lg text-black/40 line-through sm:text-xl">
                  {strikePrice.toLocaleString("uk-UA")} грн
                </span>
              )}
            </div>

            <p className="text-sm text-black/45">{outOfStock ? OUT_OF_STOCK_LABEL : "В наявності"}</p>

            {shortText ? (
              <p className="text-base leading-relaxed text-black/85">{shortText}</p>
            ) : null}

            {(colors.length > 0 || colorLinked.length > 0) && (
              <div className="border-t border-black/10 pt-5">
                <p className="mb-3 text-sm text-black/45">Колір</p>
                <div className="flex flex-wrap gap-3">
                  {colors.length > 0 && (
                    <span
                      className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-sm ring-2 ring-offset-2"
                      style={{
                        backgroundColor: colors[0].hex,
                        borderColor: "rgba(0,0,0,0.15)",
                        boxShadow: `0 0 0 1px ${ACCENT}`,
                      }}
                      title={colors[0].name}
                    >
                      <svg className="h-5 w-5 text-white drop-shadow" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                  {colorLinked.map((linked) => {
                    const linkedColors = linked.color_options ?? [];
                    const c = linkedColors[0];
                    if (!c) return null;
                    const isWhite =
                      c.hex.toLowerCase() === "#ffffff" || c.hex.toLowerCase() === "#fff";
                    return (
                      <Link
                        key={linked.id}
                        href={productHref(linked.slug, linked.id)}
                        className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-sm transition-transform hover:scale-105 ${
                          isWhite ? "border-black/25" : "border-black/10"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                        aria-label={c.name}
                      />
                    );
                  })}
                </div>
                {selectedColorName && (
                  <p className="mt-2 text-xs text-black/50">{selectedColorName}</p>
                )}
              </div>
            )}

            <ProductSizePickerBlock
              productId={product.id}
              categoryName={product.category_name}
              categorySlug={product.category_slug}
              subcategoryName={product.subcategory_name}
              sizeVariants={product.size_variants}
              currentSizeLabel={currentSizeLabel}
              selectedSizeIndex={selectedSizeIndex}
              onSelectSizeIndex={setSelectedSizeIndex}
              onLegacySizeClick={onSizeClick}
            />

            {product.gift_product && (
              <div className="rounded-xl border border-black/10 bg-[#faf8f5] p-4 text-sm">
                <p className="font-semibold text-black">Подарунок до товару</p>
                <Link
                  href={productHref(product.gift_product.slug, product.gift_product.id)}
                  className="mt-1 inline-block font-medium underline" style={{ color: ACCENT }}
                >
                  {product.gift_product.name}
                </Link>
              </div>
            )}

            {/* Кількість + кошик в один ряд (десктоп / планшет) */}
            <div className="hidden gap-3 border-t border-black/10 pt-5 sm:flex sm:items-stretch">
              <div
                className="flex h-14 w-[7.5rem] shrink-0 items-center justify-between rounded-2xl px-2 sm:h-[3.75rem] sm:w-32"
                style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-xl text-black hover:bg-black/5"
                  aria-label="Зменшити"
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center text-base font-medium tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-xl text-black hover:bg-black/5"
                  aria-label="Збільшити"
                >
                  +
                </button>
              </div>
              <AddToCartButton
                size="lg"
                variant="dark"
                className="min-w-0 flex-1 rounded-2xl"
                label={isAddingToCart ? "Додавання…" : "В кошик"}
                outOfStock={cannotAddToCart}
                loading={isAddingToCart}
                onClick={() => {
                  if (!cannotAddToCart && !isAddingToCart) void handleAddToCart();
                }}
              />
            </div>

            {/* Відступ під закріплену панель на мобільному */}
            <div className="h-2 sm:hidden" aria-hidden />

            <button
              type="button"
              onClick={() => !cannotAddToCart && setOneClickOpen(true)}
              disabled={cannotAddToCart}
              className="w-full text-center font-['Montserrat'] text-sm font-semibold text-black/55 underline decoration-black/25 underline-offset-[3px] transition-colors hover:text-black hover:decoration-black/50 disabled:opacity-45"
            >
              Купити в 1 клік
            </button>

            <CartAlert
              isVisible={showCartAlert}
              onGoToCart={() => {
                setShowCartAlert(false);
                router.push("/cart");
              }}
            />
            <Alert
              type={alertType}
              message={alertMessage || ""}
              isVisible={!!alertMessage}
              onClose={() => setAlertMessage(null)}
            />

            <OneClickOrderModal
              open={oneClickOpen}
              onClose={() => setOneClickOpen(false)}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                discount_percentage: product.discount_percentage,
                in_stock: product.in_stock,
                stock: product.stock,
              }}
              quantity={quantity}
            />

          </div>
        </div>

        {product.bought_together_products && product.bought_together_products.length > 0 && (
          <div className="mt-12">
            <YouMightLike
              title="Купують разом"
              suggestedProducts={product.bought_together_products}
              showCatalogLink={false}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="mt-14 border-t border-black/10 pt-10">
          <div role="tablist" className="flex gap-10 border-b border-black/10">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "details"}
              onClick={() => setActiveTab("details")}
              className={`pb-3 font-['Montserrat'] text-sm font-medium transition-colors sm:text-base ${
                activeTab === "details" ? "text-black" : "text-black/45 hover:text-black/70"
              }`}
              style={
                activeTab === "details"
                  ? { boxShadow: `inset 0 -3px 0 0 ${ACCENT}` }
                  : undefined
              }
            >
              Деталі продукту
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "delivery_payment"}
              onClick={() => setActiveTab("delivery_payment")}
              className={`pb-3 font-['Montserrat'] text-sm font-medium transition-colors sm:text-base ${
                activeTab === "delivery_payment" ? "text-black" : "text-black/45 hover:text-black/70"
              }`}
              style={
                activeTab === "delivery_payment"
                  ? { boxShadow: `inset 0 -3px 0 0 ${ACCENT}` }
                  : undefined
              }
            >
              Доставка та оплата
            </button>
          </div>
          <div className="min-h-[100px] pt-4">
            {activeTab === "details" ? (
              product.description ? (
                <ProductDetailDescription content={product.description} />
              ) : (
                <p className="font-['Montserrat'] text-sm text-black/45">Детальний опис відсутній.</p>
              )
            ) : (
              <ProductDeliveryPaymentTab />
            )}
          </div>

          {product.category_description?.trim() ? (
            <div className="mt-10 border-t border-black/10 pt-8">
              <p className="font-['Montserrat'] text-xs font-semibold uppercase tracking-wider text-black/45">
                Про категорію
              </p>
              <div className="mt-3 max-w-3xl">
                <CategoryDescriptionMarkdown content={product.category_description} />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Мобільна панель: кількість + «В кошик» закріплена знизу */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-[1920px] items-stretch gap-2">
          <div
            className="flex h-14 w-[7.5rem] shrink-0 items-center justify-between rounded-2xl px-1"
            style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
          >
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-11 w-9 items-center justify-center rounded-lg text-xl text-black"
              aria-label="Зменшити"
            >
              −
            </button>
            <span className="min-w-[1.75rem] text-center text-base font-semibold tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-11 w-9 items-center justify-center rounded-lg text-xl text-black"
              aria-label="Збільшити"
            >
              +
            </button>
          </div>
          <AddToCartButton
            size="lg"
            variant="dark"
            className="min-w-0 flex-1 rounded-2xl"
            label={isAddingToCart ? "…" : "В кошик"}
            outOfStock={cannotAddToCart}
            loading={isAddingToCart}
            onClick={() => {
              if (!cannotAddToCart && !isAddingToCart) void handleAddToCart();
            }}
          />
        </div>
      </div>
    </section>
  );
}
