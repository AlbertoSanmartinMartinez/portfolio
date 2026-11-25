"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { localeCookie, type Locale } from "@/i18n/config";
import styles from "./site.module.css";

export type Section = { id: string; label: string };

type Props = {
  name: string;
  lang: Locale;
  sections: Section[];
  labels: { menu: { open: string; close: string }; languageSwitch: { label: string; ariaLabel: string } };
};

export function Header({ name, lang, sections, labels }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const other: Locale = lang === "es" ? "en" : "es";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Keep the section and remember the choice (AC-3).
  function switchLanguage(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    document.cookie = `${localeCookie}=${other}; path=/; max-age=31536000; samesite=lax`;
    router.push(`/${other}${window.location.hash}`);
  }

  return (
    <header className={styles.header}>
      <a className={styles.brand} href={`/${lang}`}>
        {name}
      </a>
      <button
        type="button"
        className={styles.menuButton}
        aria-expanded={open}
        aria-controls="site-nav"
        aria-label={open ? labels.menu.close : labels.menu.open}
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden="true">{open ? "✕" : "☰"}</span>
      </button>
      <nav id="site-nav" className={styles.nav} data-open={open}>
        <ul>
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} onClick={() => setOpen(false)}>
                {section.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={`/${other}`}
              hrefLang={other}
              lang={other}
              aria-label={`${labels.languageSwitch.label} — ${labels.languageSwitch.ariaLabel}`}
              onClick={switchLanguage}
            >
              {labels.languageSwitch.label}
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
