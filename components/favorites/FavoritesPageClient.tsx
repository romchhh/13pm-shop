"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useBasket } from "@/lib/BasketProvider";
import { useFavorites } from "@/lib/FavoritesProvider";
import CatalogProductCard, {
  type CatalogProductCardItem,
} from "@/components/catalog/CatalogProductCard";
import type { FavoriteProductSnapshot } from "@/lib/favoritesStorage";
import { addProductCardToCart } from "@/lib/productCardAddToCart";

const ACCENT = "var(--site-accent)";

function toCardItem(p: FavoriteProductSnapshot): CatalogProductCardItem {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    old_price: p.old_price,
    discount_percentage: p.discount_percentage,
    subtitle: p.subtitle,
    subcategory_name: p.subcategory_name,
    category_name: p.category_name,
    first_media: p.first_media,
    is_hit: p.is_hit,
    is_new: p.is_new,
    is_promo: p.is_promo,
    gift_product_id: p.gift_product_id,
    in_stock: p.in_stock,
    stock: p.stock,
  };
}

export default function FavoritesPageClient() {
  const { items } = useFavorites();
  const { addItem } = useBasket();
  const [mounted, setMounted] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = async (
    e: React.MouseEvent,
    product: CatalogProductCardItem
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setCartError(null);
    const result = await addProductCardToCart(addItem, product);
    if (!result.ok) {
      setCartError(result.message);
      setTimeout(() => setCartError(null), 5000);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-[40vh] bg-white pt-32 font-['Montserrat'] text-black/50">
        Завантаження...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-16 pt-6 lg:pb-20">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-12">
        <nav
          className="mb-4 font-['Montserrat'] text-sm text-black/45"
          aria-label="Breadcrumb"
        >
          <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
            <li>
              <Link href="/" className="hover:text-[var(--site-accent)]">
                Головна
              </Link>
            </li>
            <li className="text-black/30" aria-hidden>
              &gt;
            </li>
            <li className="text-black/70">Вішлист</li>
          </ol>
        </nav>

        <h1 className="mb-2 font-['Montserrat'] text-2xl font-semibold text-black sm:text-3xl lg:text-4xl">
          Вішлист
        </h1>
        <p className="mb-6 font-['Montserrat'] text-sm text-black/50">
          {items.length > 0
            ? `${items.length} ${items.length === 1 ? "товар" : items.length < 5 ? "товари" : "товарів"} у вішлисті`
            : "Товари у вішлисті зʼявляться тут"}
        </p>

        {cartError && (
          <p className="mb-4 font-['Montserrat'] text-sm text-red-600">{cartError}</p>
        )}

        {items.length === 0 ? (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-10 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <p className="font-['Montserrat'] text-lg text-black/70">
              У вішлисті поки немає товарів
            </p>
            <p className="mt-2 font-['Montserrat'] text-sm text-black/45">
              Натисніть іконку серця на картці товару або на сторінці товару, щоб додати у вішлист
            </p>
            <Link
              href="/catalog"
              className="mt-6 inline-flex min-w-[200px] items-center justify-center rounded-xl px-8 py-3.5 font-['Montserrat'] text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              До каталогу
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:gap-6">
            {items.map((product, index) => (
              <li key={product.id} className="min-w-0">
                <CatalogProductCard
                  product={toCardItem(product)}
                  showSubtitle
                  onAddToCart={handleAddToCart}
                  imagePriority={index < 4}
                  imageLoading={index < 6 ? "eager" : "lazy"}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
