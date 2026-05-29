import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { seoCopy } from "@/lib/seoCopy";

export const metadata: Metadata = buildPageMetadata({
  title: seoCopy.success.title,
  description: seoCopy.success.description,
  path: "/success",
  noIndex: true,
});

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
