import Image from "next/image";

const WALLET_LOGOS = [
  { src: "/images/icons/Badge-2.svg", alt: "Apple Pay" },
  { src: "/images/icons/Badge-3.svg", alt: "Google Pay" },
] as const;

type PaymentWalletLogosProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  layout?: "row" | "column";
};

const HEIGHT_CLASS = {
  sm: "h-5",
  md: "h-6",
  lg: "h-9 sm:h-10",
} as const;

export default function PaymentWalletLogos({
  className = "",
  size = "md",
  layout = "row",
}: PaymentWalletLogosProps) {
  const heightClass = HEIGHT_CLASS[size];
  const layoutClass =
    layout === "column"
      ? "flex-col items-end gap-2"
      : "flex-row flex-wrap items-center gap-2";

  return (
    <div className={`flex ${layoutClass} ${className}`}>
      {WALLET_LOGOS.map(({ src, alt }) => (
        <Image
          key={src}
          src={src}
          alt={alt}
          width={65}
          height={49}
          className={`${heightClass} w-auto shrink-0`}
        />
      ))}
    </div>
  );
}
