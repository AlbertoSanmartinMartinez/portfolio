import Link from "next/link";
import { lang } from "next/root-params";
import styles from "@/components/site.module.css";
import { defaultLocale, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default async function NotFound() {
  const value = await lang();
  const locale = hasLocale(value) ? value : defaultLocale;
  const dict = getDictionary(locale);
  return (
    <main className={styles.notFound}>
      <h1>{dict.notFound.title}</h1>
      <Link href={`/${locale}`}>{dict.notFound.back}</Link>
    </main>
  );
}
