import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrivacyPage } from "@/components/PrivacyPage";
import { getDictionary } from "@/i18n/dictionaries";

export const metadata: Metadata = { title: getDictionary("es").privacy.title };

/** /es/privacidad — the privacy page only exists in its own language (AC-9). */
export default async function Page({ params }: PageProps<"/[lang]/privacidad">) {
  const { lang } = await params;
  if (lang !== "es") notFound();
  return <PrivacyPage lang="es" />;
}
