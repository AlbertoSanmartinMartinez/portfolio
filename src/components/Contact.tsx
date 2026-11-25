import type { Profile } from "@/content/schema";
import styles from "./site.module.css";

export function Contact({ links, title, intro }: { links: Profile["links"]; title: string; intro: string }) {
  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-title">
      <h2 id="contact-title">{title}</h2>
      <p>{intro}</p>
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
