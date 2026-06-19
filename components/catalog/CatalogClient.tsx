"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import SidebarMenu from "../layout/SidebarMenu";
import ProductSkeleton from "./ProductSkeleton";
import { usePathname, useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { getDiscountedPrice } from "@/lib/pricing";
import {
  GA4_BRAND,
  GA4_CURRENCY,
  GA4_VERTICAL,
  pushGA4EcommerceEvent,
} from "@/lib/ga4Ecommerce";
import CategoryDescriptionMarkdown from "@/components/shared/CategoryDescriptionMarkdown";
import CatalogFilters from "@/components/catalog/CatalogFilters";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import {
  catalogHasMoreToShow,
  catalogInitialVisibleCount,
  catalogLoadMoreIncrement,
  getCatalogAlignedVisibleCount,
} from "@/lib/catalogVisibleCount";
import { isCatalogPromoProduct } from "@/lib/isCatalogPromoProduct";
import { productMatchesColorFilter } from "@/lib/catalogColorFilter";
import {
  buildCatalogColorOptions,
  buildCatalogSizeOptions,
  productMatchesCatalogSizes,
} from "@/lib/catalogFilterOptions";
import type { ProductColorOption } from "@/lib/productOptions";

interface Product {
  id: number;
  name: string;
  slug?: string | null;
  price: number;
  old_price?: number | null;
  description?: string | null;
  first_media?: { url: string; type: string } | null;
  discount_percentage?: number | null;
  is_hit?: boolean;
  is_new?: boolean;
  top_sale?: boolean;
  limited_edition?: boolean;
  dietitian_approved?: boolean;
  is_promo?: boolean;
  free_delivery_badge?: boolean;
  gift_product_id?: number | null;
  category_id?: number | null;
  category_ids?: number[] | null;
   subcategory_id?: number | null;
   subcategory_ids?: number[] | null;
  category_name?: string | null;
  subcategory_name?: string | null;
  subtitle?: string | null;
  stock?: number;
  in_stock?: boolean;
  package_weight?: string | null;
  course?: string | null;
  color_options?: ProductColorOption[];
  size_variants?: unknown;
}

interface Category {
  id: number;
  name: string;
  description?: string | null;
}

interface CatalogClientProps {
  initialProducts: Product[];
  categories: Category[];
  initialSelectedCategoryIds?: number[];
  selectedCategoryDescription?: string | null;
}

function readCatalogListFlag(params: ReadonlyURLSearchParams, key: string): boolean {
  const v = params.get(key);
  return v === "1" || v === "true";
}

/** Іконка «фільтр» для кнопки на мобільному */
function FilterIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" d="M4 6h16M8 12h8M10 18h4" />
      <circle cx="6" cy="6" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="14" cy="18" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function CatalogClient({
  initialProducts,
  categories,
  initialSelectedCategoryIds,
  selectedCategoryDescription,
}: CatalogClientProps) {
  const { isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const { addItem } = useBasket();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useBodyScrollLock(mobileFiltersOpen);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [sortOrder, setSortOrder] = useState<"recommended" | "newest" | "asc" | "desc" | "sale">("recommended");
  const [promoOnly, setPromoOnly] = useState(() => readCatalogListFlag(searchParams, "promo"));
  const [hitsOnly, setHitsOnly] = useState(() => readCatalogListFlag(searchParams, "hits"));
  const [newOnly, setNewOnly] = useState(() => readCatalogListFlag(searchParams, "new"));
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    initialSelectedCategoryIds ?? []
  );
  const [subcategories, setSubcategories] = useState<
    { id: number; name: string; category_id: number }[]
  >([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [selectedColorInput, setSelectedColorInput] = useState<string | null>(null);
  const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(null);
  const [selectedSizesInput, setSelectedSizesInput] = useState<string[]>([]);
  const [selectedSizesFilter, setSelectedSizesFilter] = useState<string[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [basketError, setBasketError] = useState<string | null>(null);
  const initializedFromQueryRef = useRef(false);

  // Load all subcategories for filters
  useEffect(() => {
    let cancelled = false;
    async function loadSubcategories() {
      try {
        const res = await fetch("/api/subcategories");
        if (!res.ok) return;
        const data: { id: number; name: string; category_id: number }[] =
          await res.json();
        if (!cancelled) {
          setSubcategories(data);
        }
      } catch {
        // тихо ігноруємо помилку — фільтр за підкатегоріями просто не з'явиться
      }
    }
    loadSubcategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // Init/override selection when приходимо з хедера по підкатегорії (?subcategory=...)
  useEffect(() => {
    if (!subcategories.length) return;

    const subName = searchParams.get("subcategory");
    if (!subName) return;

    const found = subcategories.find(
      (s) => s.name.toLowerCase() === subName.toLowerCase()
    );
    if (!found) return;

    initializedFromQueryRef.current = true;

    // Клік з хедера по підкатегорії завжди повністю перевизначає вибір
    setSelectedCategories([found.category_id]);
    setSelectedSubcategories([found.id]);
    setMinPrice(null);
    setMaxPrice(null);
    setMinPriceInput("");
    setMaxPriceInput("");
  }, [searchParams, subcategories]);

  // Init/override selection when приходимо з хедера по категорії (?categoryId=...)
  useEffect(() => {
    if (initialProducts.length === 0) return;

    const catIdParam = searchParams.get("categoryId");
    if (!catIdParam) return;

    const idNum = Number(catIdParam);
    if (Number.isNaN(idNum)) return;

    const exists = categories.some((c) => c.id === idNum);
    if (!exists) return;

    setSelectedCategories([idNum]);
    setSelectedSubcategories([]);
    setMinPrice(null);
    setMaxPrice(null);
    setMinPriceInput("");
    setMaxPriceInput("");
  }, [searchParams, categories, initialProducts]);

  // ?promo=1 | ?hits=1 | ?new=1 — синхронізація з URL і скидання категорій/ціни
  useEffect(() => {
    const promo = readCatalogListFlag(searchParams, "promo");
    const hits = readCatalogListFlag(searchParams, "hits");
    const isNew = readCatalogListFlag(searchParams, "new");
    const hasCategoryInUrl = Boolean(searchParams.get("categoryId"));
    const hasSubcategoryInUrl = Boolean(searchParams.get("subcategory"));

    setPromoOnly(promo);
    setHitsOnly(hits);
    setNewOnly(isNew);

    if ((promo || hits || isNew) && !hasCategoryInUrl && !hasSubcategoryInUrl) {
      setSelectedCategories([]);
      setSelectedSubcategories([]);
      setMinPrice(null);
      setMaxPrice(null);
      setMinPriceInput("");
      setMaxPriceInput("");
    }
  }, [searchParams]);

  const clearListModeFilters = useCallback(() => {
    setPromoOnly(false);
    setHitsOnly(false);
    setNewOnly(false);

    const params = new URLSearchParams(searchParams.toString());
    let changed = false;
    for (const key of ["promo", "hits", "new"] as const) {
      if (params.has(key)) {
        params.delete(key);
        changed = true;
      }
    }
    if (changed) {
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const priceRange = useMemo(() => {
    if (initialProducts.length === 0) return { min: 0, max: 10000 };
    const prices = initialProducts.map((p) => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [initialProducts]);

  const catalogColorOptions = useMemo(
    () => buildCatalogColorOptions(initialProducts),
    [initialProducts]
  );

  const catalogSizeOptions = useMemo(
    () => buildCatalogSizeOptions(initialProducts),
    [initialProducts]
  );

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const productCategoryIds =
        product.category_ids && product.category_ids.length > 0
          ? product.category_ids
          : product.category_id != null
          ? [product.category_id]
          : [];

      const productSubcategoryIds =
        product.subcategory_ids && product.subcategory_ids.length > 0
          ? product.subcategory_ids
          : product.subcategory_id != null
          ? [product.subcategory_id]
          : [];

      const matchesCategory =
        selectedCategories.length === 0 ||
        productCategoryIds.some((id) => selectedCategories.includes(id));
      const matchesSubcategory =
        selectedSubcategories.length === 0 ||
        productSubcategoryIds.some((id) => selectedSubcategories.includes(id));
      const matchesMinPrice = minPrice === null || product.price >= minPrice;
      const matchesMaxPrice = maxPrice === null || product.price <= maxPrice;
      const matchesPromo = !promoOnly || isCatalogPromoProduct(product);
      const matchesHits = !hitsOnly || product.is_hit === true;
      const matchesNew = !newOnly || product.is_new === true;
      const matchesColor = productMatchesColorFilter(
        product.color_options,
        selectedColorFilter
      );
      const matchesSize = productMatchesCatalogSizes(product, selectedSizesFilter);
      return (
        matchesCategory &&
        matchesSubcategory &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesPromo &&
        matchesHits &&
        matchesNew &&
        matchesColor &&
        matchesSize
      );
    });
  }, [
    initialProducts,
    minPrice,
    maxPrice,
    selectedCategories,
    selectedSubcategories,
    promoOnly,
    hitsOnly,
    newOnly,
    selectedColorFilter,
    selectedSizesFilter,
  ]);

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 200);
    return () => clearTimeout(timer);
  }, [
    selectedCategories,
    selectedSubcategories,
    minPrice,
    maxPrice,
    sortOrder,
    promoOnly,
    hitsOnly,
    newOnly,
    selectedColorFilter,
    selectedSizesFilter,
  ]);

  const hasPromoProducts = useMemo(() => {
    return initialProducts.some((p) => isCatalogPromoProduct(p));
  }, [initialProducts]);

  const activeCategoryForDescription = useMemo(() => {
    if (selectedCategories.length > 1) return null;

    const fromProp = selectedCategoryDescription?.trim();
    if (fromProp) {
      const id =
        selectedCategories.length === 1
          ? selectedCategories[0]
          : initialSelectedCategoryIds?.[0] ?? null;
      const cat = id != null ? categories.find((c) => c.id === id) : undefined;
      return { name: cat?.name ?? null, description: fromProp };
    }

    let categoryId: number | null = null;
    if (selectedCategories.length === 1) {
      categoryId = selectedCategories[0];
    } else if (initialSelectedCategoryIds?.length === 1) {
      categoryId = initialSelectedCategoryIds[0];
    } else {
      const param = searchParams.get("categoryId");
      if (param) {
        const parsed = Number(param);
        if (!Number.isNaN(parsed)) categoryId = parsed;
      }
    }

    if (categoryId == null) return null;
    const cat = categories.find((c) => c.id === categoryId);
    const description = cat?.description?.trim();
    if (!cat || !description) return null;
    return { name: cat.name, description };
  }, [
    categories,
    selectedCategories,
    selectedCategoryDescription,
    initialSelectedCategoryIds,
    searchParams,
  ]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortOrder) {
      case "asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "newest":
        return sorted.sort((a, b) => b.id - a.id);
      case "sale":
        return sorted.sort((a, b) => {
          const aHasSale = isCatalogPromoProduct(a) ? 1 : 0;
          const bHasSale = isCatalogPromoProduct(b) ? 1 : 0;
          return bHasSale - aHasSale;
        });
      default:
        return sorted;
    }
  }, [filteredProducts, sortOrder]);

  const [isCatalogDesktop, setIsCatalogDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsCatalogDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const [visibleCount, setVisibleCount] = useState(() =>
    typeof window !== "undefined"
      ? catalogInitialVisibleCount(window.matchMedia("(min-width: 1024px)").matches)
      : 9
  );

  const filterListSignature = useMemo(
    () =>
      JSON.stringify({
        sortOrder,
        selectedCategories,
        selectedSubcategories,
        minPrice,
        maxPrice,
        promoOnly,
        hitsOnly,
        newOnly,
        selectedColorFilter,
        selectedSizesFilter,
        total: sortedProducts.length,
      }),
    [
      sortOrder,
      selectedCategories,
      selectedSubcategories,
      minPrice,
      maxPrice,
      promoOnly,
      hitsOnly,
      newOnly,
      selectedColorFilter,
      selectedSizesFilter,
      sortedProducts.length,
    ]
  );

  useEffect(() => {
    setVisibleCount(catalogInitialVisibleCount(isCatalogDesktop));
  }, [filterListSignature, isCatalogDesktop]);

  const alignedVisibleCount = useMemo(
    () =>
      getCatalogAlignedVisibleCount(
        visibleCount,
        sortedProducts.length,
        isCatalogDesktop
      ),
    [visibleCount, sortedProducts.length, isCatalogDesktop]
  );

  const visibleProducts = useMemo(
    () => sortedProducts.slice(0, alignedVisibleCount),
    [sortedProducts, alignedVisibleCount]
  );

  const hasMoreProducts = catalogHasMoreToShow(
    visibleCount,
    sortedProducts.length,
    isCatalogDesktop
  );

  const lastViewItemListSignatureRef = useRef<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isFiltering) return;
    if (visibleProducts.length === 0) return;

    const itemsForGA4 = visibleProducts.map((p) => {
      const unitPrice = getDiscountedPrice(p.price, p.discount_percentage);
      return {
        item_id: String(p.id),
        item_name: p.name,
        item_brand: GA4_BRAND,
        item_category: p.subcategory_name ?? p.category_name ?? "Каталог",
        price: unitPrice,
        quantity: 1,
        google_business_vertical: GA4_VERTICAL,
      };
    });

    // Simple dedupe to avoid firing on the same render
    const signature = JSON.stringify(itemsForGA4.map((i) => i.item_id));
    if (lastViewItemListSignatureRef.current === signature) return;
    lastViewItemListSignatureRef.current = signature;

    pushGA4EcommerceEvent("view_item_list", {
      currency: GA4_CURRENCY,
      items: itemsForGA4,
      value: itemsForGA4.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0),
    });
  }, [isFiltering, visibleProducts]);

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setBasketError(null);
    // Зберігаємо в кошику той самий файл, що й на картці/сторінці товару
    const firstMediaUrl =
      product.first_media && "url" in product.first_media
        ? product.first_media.url
        : "";
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        size: "—",
        quantity: 1,
        // В кошику / оформленні це перетворюється у `/api/images/<filename>`
        imageUrl: firstMediaUrl,
        discount_percentage: product.discount_percentage ?? undefined,
        category_name: product.subcategory_name ?? product.category_name ?? null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Недостатньо товару в наявності";
      setBasketError(message);
      setTimeout(() => setBasketError(null), 5000);
    }
  };

  const handleApplyFilters = () => {
    setMinPrice(minPriceInput ? Number(minPriceInput) : null);
    setMaxPrice(maxPriceInput ? Number(maxPriceInput) : null);
    setSelectedColorFilter(selectedColorInput);
    setSelectedSizesFilter(selectedSizesInput);
    setMobileFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setMinPrice(null);
    setMaxPrice(null);
    setMinPriceInput("");
    setMaxPriceInput("");
    setSelectedColorInput(null);
    setSelectedColorFilter(null);
    setSelectedSizesInput([]);
    setSelectedSizesFilter([]);
    setPromoOnly(false);
    setHitsOnly(false);
    setNewOnly(false);
  };

  const toggleSizeInput = (size: string) => {
    setSelectedSizesInput((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleCategory = (id: number) => {
    const isRemoving = selectedCategories.includes(id);

    if (!isRemoving && (promoOnly || hitsOnly || newOnly)) {
      clearListModeFilters();
    }

    setSelectedCategories((prev) => {
      // Якщо категорія вже вибрана — знімаємо її і чистимо її підкатегорії
      if (prev.includes(id)) {
        setSelectedSubcategories((prevSubs) =>
          prevSubs.filter((scId) => {
            const sc = subcategories.find((s) => s.id === scId);
            return !sc || sc.category_id !== id;
          })
        );
        return prev.filter((c) => c !== id);
      }
      // Якщо не вибрана — додаємо до списку (можна кілька категорій)
      return [...prev, id];
    });
  };

  const toggleSubcategory = (id: number) => {
    const isRemoving = selectedSubcategories.includes(id);

    if (!isRemoving && (promoOnly || hitsOnly || newOnly)) {
      clearListModeFilters();
    }

    setSelectedSubcategories((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const catalogPageTitle = promoOnly
    ? "Акції"
    : hitsOnly
      ? "BESTSELLERS"
      : newOnly
        ? "Новинки"
        : "Каталог товарів";

  return (
    <>
      <section className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-12 pt-4 pb-20 bg-white min-h-screen">
        {/* Breadcrumbs + заголовок (як на макеті) */}
        <div className="mb-8 flex flex-col gap-4 lg:mb-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm font-['Montserrat'] text-black/45">
              <li>
                <Link href="/" className="hover:text-black/70 transition-colors">
                  Головна
                </Link>
              </li>
              <li aria-hidden className="text-black/30">
                ›
              </li>
              <li className="text-black/70">Каталог товарів</li>
            </ol>
          </nav>

          <h1 className="font-['Montserrat'] text-xl font-bold tracking-tight text-black lg:hidden">
            {catalogPageTitle}
          </h1>

          {/* Мобільна панель: фільтр + лічильник + сортування в один ряд */}
          <div className="flex flex-nowrap items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2.5 font-['Montserrat'] text-sm font-semibold text-[#1a1a1a] shadow-sm transition-colors hover:border-black/25 sm:px-5 sm:py-3 sm:text-base"
            >
              <FilterIcon className="h-4 w-4 text-black/55 sm:h-5 sm:w-5" />
              Фільтр
            </button>
            <p className="min-w-0 shrink truncate font-['Montserrat'] text-[11px] text-black/50 sm:text-xs">
              Показ{" "}
              <span className="font-medium text-black/75">
                {sortedProducts.length === 0 ? 0 : 1}-{visibleProducts.length}
              </span>{" "}
              з{" "}
              <span className="font-medium text-black/75">{sortedProducts.length}</span>
            </p>
            <label className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5">
              <span className="hidden font-['Montserrat'] text-[11px] text-black/50 sm:inline sm:text-xs">
                Сортування:
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                className="max-w-[min(11rem,42vw)] rounded-lg border border-black/10 bg-white py-2 pl-2 pr-6 font-['Montserrat'] text-[11px] text-black focus:border-[var(--site-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--site-accent)]/30 sm:max-w-[13rem] sm:text-xs"
                aria-label="Сортування"
              >
                <option value="recommended">Найпопулярніші</option>
                <option value="newest">За новизною</option>
                <option value="asc">Ціна: зростання</option>
                <option value="desc">Ціна: спадання</option>
                <option value="sale">Спочатку акційні</option>
              </select>
            </label>
          </div>

          {/* Десктоп: заголовок на одному рівні з лічильником і сортуванням */}
          <div className="hidden lg:flex lg:flex-wrap lg:items-baseline lg:justify-between lg:gap-x-8 lg:gap-y-2">
            <h1 className="font-['Montserrat'] text-4xl font-bold tracking-tight text-black">
              {catalogPageTitle}
            </h1>
            <div className="flex flex-wrap items-baseline justify-end gap-x-8 gap-y-2">
              <p className="font-['Montserrat'] text-sm text-black/50">
                Показ{" "}
                <span className="font-medium text-black/80">
                  {sortedProducts.length === 0 ? 0 : 1}-{visibleProducts.length}
                </span>{" "}
                з{" "}
                <span className="font-medium text-black/80">{sortedProducts.length}</span>{" "}
                продуктів
              </p>
              <label className="flex flex-wrap items-baseline gap-2">
                <span className="font-['Montserrat'] text-sm text-black/55">Сортування:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                  className="min-w-[220px] rounded-lg border border-black/10 bg-white py-2.5 pl-3 pr-8 font-['Montserrat'] text-sm text-black focus:border-[var(--site-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--site-accent)]/30"
                >
                  <option value="recommended">Найпопулярніші</option>
                  <option value="newest">За новизною</option>
                  <option value="asc">Ціна: за зростанням</option>
                  <option value="desc">Ціна: за спаданням</option>
                  <option value="sale">Спочатку акційні</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {/* Мобільні фільтри — панель з заокругленням зверху */}
        {mobileFiltersOpen && (
          <>
            <div
              className="fixed inset-0 z-[var(--z-site-overlay-backdrop)] bg-black/40 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
              aria-hidden
            />
            <div className="fixed inset-x-0 bottom-0 z-[var(--z-site-overlay)] flex max-h-[92vh] flex-col rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] lg:hidden">
              <CatalogFilters
                variant="mobile"
                categories={categories}
                subcategories={subcategories}
                selectedCategories={selectedCategories}
                selectedSubcategories={selectedSubcategories}
                toggleCategory={toggleCategory}
                toggleSubcategory={toggleSubcategory}
                priceRange={priceRange}
                minPriceInput={minPriceInput}
                maxPriceInput={maxPriceInput}
                setMinPriceInput={setMinPriceInput}
                setMaxPriceInput={setMaxPriceInput}
                promoOnly={promoOnly}
                setPromoOnly={setPromoOnly}
                hasPromoProducts={hasPromoProducts}
                colorOptions={catalogColorOptions}
                selectedColorInput={selectedColorInput}
                setSelectedColorInput={setSelectedColorInput}
                sizeOptions={catalogSizeOptions}
                selectedSizesInput={selectedSizesInput}
                toggleSizeInput={toggleSizeInput}
                onClear={handleClearFilters}
                onSave={handleApplyFilters}
                onClose={() => setMobileFiltersOpen(false)}
              />
            </div>
          </>
        )}

        {/* Основний контент */}
        <div className="flex gap-8 lg:gap-10 xl:gap-12 items-start lg:items-stretch">
          {/* Сайдбар фільтрів — картка як на макеті; колонка на всю висоту сітки, щоб sticky працював */}
          <aside className="hidden w-[min(100%,320px)] flex-shrink-0 lg:block">
            <div className="sticky top-[calc(var(--site-header-offset)+1rem)] overflow-x-hidden rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <CatalogFilters
                variant="sidebar"
                categories={categories}
                subcategories={subcategories}
                selectedCategories={selectedCategories}
                selectedSubcategories={selectedSubcategories}
                toggleCategory={toggleCategory}
                toggleSubcategory={toggleSubcategory}
                priceRange={priceRange}
                minPriceInput={minPriceInput}
                maxPriceInput={maxPriceInput}
                setMinPriceInput={setMinPriceInput}
                setMaxPriceInput={setMaxPriceInput}
                promoOnly={promoOnly}
                setPromoOnly={setPromoOnly}
                hasPromoProducts={hasPromoProducts}
                colorOptions={catalogColorOptions}
                selectedColorInput={selectedColorInput}
                setSelectedColorInput={setSelectedColorInput}
                sizeOptions={catalogSizeOptions}
                selectedSizesInput={selectedSizesInput}
                toggleSizeInput={toggleSizeInput}
                onClear={handleClearFilters}
                onSave={handleApplyFilters}
              />
            </div>
          </aside>

          {/* Сітка товарів */}
          <div className="flex-1 min-w-0">
            {basketError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-['Montserrat'] text-red-700">
                {basketError}
              </div>
            )}

            {/* Картки товарів */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 sm:gap-x-5 sm:gap-y-3">
              {isFiltering ? (
                Array.from({ length: 9 }).map((_, i) => (
                  <ProductSkeleton key={`skeleton-${i}`} />
                ))
              ) : visibleProducts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                  <h3 className="text-xl font-bold font-['Montserrat'] uppercase tracking-wider text-[#1C1C1C]">
                    Товарів не знайдено
                  </h3>
                  <p className="text-sm font-['Montserrat'] text-gray-400 text-center max-w-md">
                    Спробуйте змінити параметри фільтрів або перегляньте інші категорії
                  </p>
                </div>
              ) : (
                visibleProducts.map((product, index) => (
                  <CatalogProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    imagePriority={index < 3}
                    imageLoading={index < 9 ? "eager" : "lazy"}
                  />
                ))
              )}
            </div>

            {/* Пагінація / показати ще */}
            {hasMoreProducts && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() =>
                    setVisibleCount(
                      (prev) => prev + catalogLoadMoreIncrement(isCatalogDesktop)
                    )
                  }
                  className="px-8 py-3 bg-[#1C1C1C] text-white font-semibold font-['Montserrat'] uppercase tracking-wider hover:bg-[#1C1C1C]/90 transition-colors rounded-lg min-h-[44px]"
                >
                  Показати ще
                </button>
              </div>
            )}
          </div>
        </div>

        {activeCategoryForDescription && (
          <div className="mt-12 border-t border-[#1C1C1C]/10 pt-10 lg:mt-16 lg:pt-12">
            {activeCategoryForDescription.name && (
              <h2 className="font-['Montserrat'] text-lg font-bold tracking-tight text-[#1C1C1C] lg:text-2xl">
                {activeCategoryForDescription.name}
              </h2>
            )}
            <div className={`max-w-3xl ${activeCategoryForDescription.name ? "mt-4" : ""}`}>
              <CategoryDescriptionMarkdown content={activeCategoryForDescription.description} />
            </div>
          </div>
        )}
      </section>

      <SidebarMenu isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
    </>
  );
}