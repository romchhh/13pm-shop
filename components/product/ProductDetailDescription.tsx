const LABEL_LINE = /^([^:]+):(.*)$/;

type Props = {
  content: string;
  className?: string;
};

export function ProductDetailDescription({ content, className = "" }: Props) {
  const lines = content.split("\n");

  return (
    <div
      className={`whitespace-pre-line font-['Montserrat'] text-sm leading-relaxed text-black/80 sm:text-base ${className}`.trim()}
    >
      {lines.map((line, i) => {
        if (line.length === 0) {
          return <span key={i} className="block h-[0.65em]" aria-hidden />;
        }

        const match = line.match(LABEL_LINE);
        if (match) {
          return (
            <span key={i} className="block">
              <span className="font-semibold text-black/90">{match[1]}:</span>
              {match[2]}
            </span>
          );
        }

        return (
          <span key={i} className="block">
            {line}
          </span>
        );
      })}
    </div>
  );
}
