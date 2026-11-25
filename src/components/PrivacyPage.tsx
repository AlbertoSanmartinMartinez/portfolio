import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { privacyPolicy } from "@/i18n/privacy";
import styles from "./site.module.css";

export function PrivacyPage({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  return (
    <main className={styles.privacy}>
      <h1>{dict.privacy.title}</h1>
      {privacyPolicy[lang].sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
      <p>
        <Link href={`/${lang}`}>{dict.privacy.back}</Link>
      </p>
    </main>
  );
}
