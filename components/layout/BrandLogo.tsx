import Link from "next/link";
import { SITE_STORE_NAME } from "@/lib/siteBrand";

/** Повний файл з квадратом — favicon / PWA */
export const SITE_ICON_PATH = "/13pm.svg";

/** Напис 13pm без фону */
export const SITE_LOGO_MARK_WHITE = "/13pm-white.svg";
export const SITE_LOGO_MARK_BLACK = "/13pm-mark-black.svg";

export type BrandLogoVariant = "default" | "onHero" | "footer";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
  onNavigate?: () => void;
  /** onHero/footer — білий напис; default — чорний напис (без фону) */
  variant?: BrandLogoVariant;
};

/** Співвідношення сторін mark-SVG (viewBox 295×415) */
const LOGO_ASPECT = 295 / 415;

/** Майже на всю висоту рядка навігації (--site-nav-height) */
const LOGO_HEIGHT_CLASS = {
  compact: "h-[calc(var(--site-nav-height)-1rem)]",
  default: "h-[calc(var(--site-nav-height)-1.35rem)]",
  footer: "h-11",
} as const;

/** Логотип 13pm — img для стабільного показу SVG */
export default function BrandLogo({
  className = "",
  compact = false,
  onNavigate,
  variant = "default",
}: BrandLogoProps) {
  const isWhite = variant === "onHero" || variant === "footer";
  const src = isWhite ? SITE_LOGO_MARK_WHITE : SITE_LOGO_MARK_BLACK;
  const sizeKey = compact ? "compact" : variant === "footer" ? "footer" : "default";
  const heightClass = LOGO_HEIGHT_CLASS[sizeKey];

  return (
    <Link
      href="/"
      onClick={onNavigate}
      className={`inline-flex shrink-0 items-center justify-center leading-none ${className}`}
      aria-label="13pm tactic — на головну"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${SITE_STORE_NAME} — логотип`}
        width={Math.round(52 * LOGO_ASPECT)}
        height={52}
        decoding="async"
        className={`block w-auto max-w-none object-contain object-center ${heightClass}`}
        style={{ aspectRatio: `${295} / ${415}` }}
      />
    </Link>
  );
}
