"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

const bodyClass =
  "font-['Montserrat'] text-sm leading-relaxed tracking-[-0.02em] text-[#3D1A00]/85 sm:text-base";

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className={`mb-2 last:mb-0 ${bodyClass}`}>{children}</p>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-4 font-['Montserrat'] text-base font-semibold leading-snug tracking-[-0.02em] text-[#3D1A00] first:mt-0 sm:text-lg">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-3 font-['Montserrat'] text-sm font-semibold leading-snug tracking-[-0.02em] text-[#3D1A00] first:mt-0 sm:text-base">
      {children}
    </h3>
  ),
  ul: ({ children }) => (
    <ul className={`mb-2 list-disc space-y-1 pl-5 ${bodyClass}`}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className={`mb-2 list-decimal space-y-1 pl-5 ${bodyClass}`}>{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-[#3D1A00]">{children}</strong>
  ),
  b: ({ children }) => <b className="font-semibold text-[#3D1A00]">{children}</b>,
  em: ({ children }) => <em className="italic text-[#3D1A00]/90">{children}</em>,
  i: ({ children }) => <i className="italic text-[#3D1A00]/90">{children}</i>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-[#8B9A47] underline decoration-[#8B9A47]/40 underline-offset-2 transition-colors hover:text-[#6f7d38]"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-4 border-[#8B9A47]/40 pl-3 font-['Montserrat'] text-sm italic text-[#3D1A00]/75 sm:text-base">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-[#3D1A00]/15" />,
  br: () => <br />,
  div: ({ children }) => <div className="mb-2 last:mb-0 [&:last-child]:mb-0">{children}</div>,
  span: ({ children }) => <span>{children}</span>,
  table: ({ children }) => (
    <div className="mb-3 max-w-full overflow-x-auto">
      <table className="min-w-full border-collapse border border-[#3D1A00]/15 text-left text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-[#3D1A00]/05">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-[#3D1A00]/10">{children}</tr>,
  th: ({ children }) => (
    <th className="border border-[#3D1A00]/15 px-2 py-1.5 font-semibold text-[#3D1A00]">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-[#3D1A00]/10 px-2 py-1.5 text-[#3D1A00]/85">{children}</td>
  ),
};

type Props = {
  content: string;
  className?: string;
};

function normalizeMarkdownInput(raw: string): string {
  return raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export default function CategoryDescriptionMarkdown({ content, className }: Props) {
  const normalized = normalizeMarkdownInput(content).trim();
  if (!normalized) return null;

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkBreaks, remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={markdownComponents}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
