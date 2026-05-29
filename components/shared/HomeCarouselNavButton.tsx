type HomeCarouselNavButtonProps = {
  direction: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
  label: string;
};

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={direction === "left" ? "" : "rotate-180"}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

/** Круглі стрілки каруселі головної (як CTA на картках категорій). */
export default function HomeCarouselNavButton({
  direction,
  onClick,
  disabled = false,
  label,
}: HomeCarouselNavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-[#1C1C1C] text-white shadow-sm transition-colors hover:bg-[var(--site-accent)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-[#1C1C1C] lg:h-11 lg:w-11"
    >
      <ChevronIcon direction={direction} />
    </button>
  );
}
