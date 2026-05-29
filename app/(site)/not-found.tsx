import type { Metadata } from "next";
import NotFoundPage from "@/components/shared/NotFoundPage";
import { buildPageMetadata } from "@/lib/seo";
import { seoCopy } from "@/lib/seoCopy";

export const metadata: Metadata = buildPageMetadata({
  title: seoCopy.notFound.title,
  description: seoCopy.notFound.description,
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return <NotFoundPage />;
}
