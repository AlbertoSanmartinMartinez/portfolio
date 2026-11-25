import type { Experience } from "@/content/schema";
import type { Locale } from "@/i18n/config";
import styles from "./site.module.css";

function formatMonth(value: string, lang: Locale): string {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(lang, { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
}

type Props = { entries: Experience[]; lang: Locale; title: string; present: string };

export function ExperienceList({ entries, lang, title, present }: Props) {
  return (
    <section id="experience" className={styles.section} aria-labelledby="experience-title">
      <h2 id="experience-title">{title}</h2>
      <ol className={styles.timeline}>
        {entries.map((entry) => (
          <li key={entry.id}>
            <h3>
              {entry.role} · {entry.company}
            </h3>
            <p className={styles.muted}>
              <time dateTime={entry.start}>{formatMonth(entry.start, lang)}</time> –{" "}
              {entry.end ? <time dateTime={entry.end}>{formatMonth(entry.end, lang)}</time> : present}
              {entry.location ? ` · ${entry.location}` : ""}
            </p>
            {entry.highlights.length > 0 && (
              <ul>
                {entry.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
