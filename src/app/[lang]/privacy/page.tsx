import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrivacyPage } from "@/components/PrivacyPage";
import { getDictionary } from "@/i18n/dictionaries";

export const metadata: Metadata = { title: getDictionary("en").privacy.title };

/** /en/privacy — the privacy page only exists in its own language (AC-9). */
export default async function Page({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  if (lang !== "en") notFound();
  return <PrivacyPage lang="en" />;
}
