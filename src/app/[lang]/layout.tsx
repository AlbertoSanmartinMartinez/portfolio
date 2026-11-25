import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/content/load";
import { readEnv } from "@/env";
import { hasLocale, locales } from "@/i18n/config";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { profile } = getContent(lang);
  const title = `${profile.name} — ${profile.headline}`;
  const description = profile.summary[0];
  return {
    metadataBase: new URL(readEnv().SITE_URL),
    title,
    description,
    alternates: { canonical: `/${lang}`, languages: { es: "/es", en: "/en", "x-default": "/" } },
    openGraph: { type: "profile", locale: lang === "es" ? "es_ES" : "en_US", title, description, url: `/${lang}` },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
