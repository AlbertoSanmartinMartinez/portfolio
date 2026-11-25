import type { Profile } from "@/content/schema";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { privacyPolicy } from "@/i18n/privacy";
import { ContactForm } from "./ContactForm";
import styles from "./site.module.css";

type Props = { links: Profile["links"]; lang: Locale; title: string; intro: string; form: Dictionary["contactForm"] };

export function Contact({ links, lang, title, intro, form }: Props) {
  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-title">
      <h2 id="contact-title">{title}</h2>
      <p>{intro}</p>
      <ContactForm lang={lang} copy={form} privacyHref={privacyPolicy[lang].path} />
      <ul className={styles.contactLinks}>
        <li>
          <a href={`mailto:${links.email}`}>{links.email}</a>
        </li>
        <li>
          <a href={links.linkedin} rel="noopener noreferrer">
            LinkedIn
          </a>
        </li>
        <li>
          <a href={links.github} rel="noopener noreferrer">
            GitHub
          </a>
        </li>
      </ul>
    </section>
  );
}
