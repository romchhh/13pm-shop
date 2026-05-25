"use client";

import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/shared/AddToCartButton";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { isProductOutOfStock } from "@/lib/productAvailability";
import { productToFavoriteSnapshot } from "@/lib/favoritesStorage";
import FavoriteButton from "@/components/shared/FavoriteButton";
import {
  PRODUCT_CARD_ACCENT,
  productCardBodyClass,
  productCardBottomBadgesRowClass,
  productCardBottomBadgesWrapClass,
  productCardDiscountBadgeClass,
  productCardFavoriteWrapClass,
  productCardGiftBadgeClass,
  productCardHitBadgeClass,
  productCardInlineNewBadgeClass,
  productCardMediaImageClass,
  productCardMediaVideoClass,
  productCardMediaWrapClass,
  productCardNewBadgeClass,
  productCardPriceClass,
  productCardPriceRowClass,
  productCardPromoBadgeClass,
  productCardRootClass,
  productCardStrikePriceClass,
  productCardSubtitleClass,
  productCardTitleClass,
} from "@/lib/productCardStyles";

export type CatalogProductCardItem = {
  id: number;
  name: string;
  slug?: string | null;
  price: number;
  old_price?: number | null;
  discount_percentage?: number | null;
  subtitle?: string | null;
  subcategory_name?: string | null;
  category_name?: string | null;
  first_media?: { url: string; type: string } | null;
  is_promo?: boolean;
  is_hit?: boolean;
  is_new?: boolean;
  gift_product_id?: number | null;
  in_stock?: boolean;
  stock?: number;
};

type CatalogProductCardProps = {
  product: CatalogProductCardItem;
  onAddToCart: (e: React.MouseEvent, product: CatalogProductCardItem) => void;
  /** Показувати рядок розміру / підзаголовку над назвою */
  showSubtitle?: boolean;
  imagePriority?: boolean;
  imageLoading?: "eager" | "lazy";
  className?: string;
};

export default function CatalogProductCard({
  product,
  onAddToCart,
  showSubtitle = true,
  imagePriority = false,
  imageLoading = "lazy",
  className = "",
}: CatalogProductCardProps) {
  const outOfStock = isProductOutOfStock(product);

  const hasPct =
    product.discount_percentage != null && Number(product.discount_percentage) > 0;
  const hasOld =
    product.old_price != null && Number(product.old_price) > Number(product.price);
  const displayPrice = hasPct
    ? Math.round(product.price * (1 - Number(product.discount_percentage) / 100))
    : product.price;
  const strikePrice = hasPct
    ? product.price
    : hasOld
      ? Number(product.old_price)
      : null;
  const discountBadgePct = hasPct
    ? Number(product.discount_percentage)
    : hasOld
      ? Math.max(
          1,
          Math.round((1 - Number(product.price) / Number(product.old_price)) * 100)
        )
      : null;

  const cardSubtitle = showSubtitle
    ? product.subtitle?.trim() ||
      product.subcategory_name?.trim() ||
      product.category_name?.trim() ||
      null
    : null;

  const href = `/product/${product.slug && String(product.slug).trim() ? product.slug : product.id}`;

  return (
    <Link
      href={href}
      scroll
      className={productCardRootClass(className)}
    >
      <div className={productCardMediaWrapClass()}>
        {product.first_media?.type === "video" ? (
          <video
            src={`/api/images/${product.first_media.url}`}
            className={productCardMediaVideoClass()}
            loop
            muted
            playsInline
            autoPlay
            preload="none"
          />
        ) : (
          <Image
            src={getProductImageSrc(product.first_media)}
            alt={`${product.name} — ${SITE_STORE_NAME}`}
            className={productCardMediaImageClass()}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 25vw"
            priority={imagePriority}
            loading={imageLoading}
            quality={imagePriority ? 85 : 70}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUzNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUzNCIgZmlsbD0iI2Y1ZjVmNCIvPjwvc3ZnPg=="
          />
        )}

        {discountBadgePct != null && (
          <span className={productCardDiscountBadgeClass()}>
            −{discountBadgePct}%
          </span>
        )}

        {product.is_new === true && discountBadgePct == null && (
          <span
            className={productCardNewBadgeClass()}
            style={{ backgroundColor: PRODUCT_CARD_ACCENT }}
          >
            Новинка
          </span>
        )}

        <div className={productCardFavoriteWrapClass()}>
          <FavoriteButton
            product={productToFavoriteSnapshot(product)}
            variant="card"
          />
        </div>

        {product.gift_product_id != null && product.gift_product_id > 0 && (
          <span className={productCardGiftBadgeClass()}>+ Подарунок</span>
        )}

        {(product.is_promo === true ||
          product.is_hit === true ||
          (product.is_new === true && discountBadgePct != null)) && (
          <div className={productCardBottomBadgesWrapClass()}>
            <div className={productCardBottomBadgesRowClass()}>
              {product.is_promo === true && (
                <span className={productCardPromoBadgeClass()}>Акція</span>
              )}
              {product.is_new === true && discountBadgePct != null && (
                <span
                  className={productCardInlineNewBadgeClass()}
                  style={{ backgroundColor: PRODUCT_CARD_ACCENT }}
                >
                  Новинка
                </span>
              )}
              {product.is_hit === true && (
                <span className={productCardHitBadgeClass()}>Хіт продажів</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={productCardBodyClass()}>
        {cardSubtitle ? (
          <p className={productCardSubtitleClass()}>{cardSubtitle}</p>
        ) : null}
        <h3 className={productCardTitleClass(Boolean(cardSubtitle))}>
          {product.name}
        </h3>
        <div className={productCardPriceRowClass()}>
          <div className="min-w-0">
            {strikePrice != null && (
              <p className={productCardStrikePriceClass()}>
                {strikePrice.toLocaleString("uk-UA")} ₴
              </p>
            )}
            <p className={productCardPriceClass()}>
              {displayPrice.toLocaleString("uk-UA")} ₴
            </p>
          </div>
          <div className="w-full shrink-0 lg:w-auto">
            <AddToCartButton
              size="sm"
              disabled={outOfStock}
              className="w-full lg:w-auto"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!outOfStock) onAddToCart(e, product);
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
