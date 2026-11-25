import type { Profile as ProfileData } from "@/content/schema";
import styles from "./site.module.css";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function Profile({ profile, title, photoAlt }: { profile: ProfileData; title: string; photoAlt: string }) {
  return (
    <section id="about" className={styles.profile} aria-labelledby="about-title">
      {profile.photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- small static asset, sized by CSS
        <img className={styles.avatar} src={profile.photo} alt={photoAlt} width={128} height={128} />
      ) : (
        <div className={styles.avatar} aria-hidden="true">
          {initials(profile.name)}
        </div>
      )}
      <div>
        <h1>{profile.name}</h1>
        <p className={styles.headline}>{profile.headline}</p>
        <p className={styles.muted}>{profile.location}</p>
      </div>
      <h2 id="about-title" className={styles.visuallyHidden}>
        {title}
      </h2>
      <div className={styles.summary}>
        {profile.summary.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
