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

const LOGO_HEIGHTS = {
  compact: 40,
  default: 52,
  footer: 46,
} as const;

function logoDimensions(sizeKey: keyof typeof LOGO_HEIGHTS) {
  const height = LOGO_HEIGHTS[sizeKey];
  return {
    height,
    width: Math.round(height * LOGO_ASPECT),
  };
}

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
  const { width, height } = logoDimensions(sizeKey);

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
        width={width}
        height={height}
        decoding="async"
        className="block h-auto w-auto max-h-[calc(var(--site-nav-height)-1.5rem)] object-contain object-center"
        style={{
          width,
          height,
          aspectRatio: `${295} / ${415}`,
        }}
      />
    </Link>
  );
}
