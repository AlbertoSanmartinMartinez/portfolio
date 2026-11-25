import type { Project } from "@/content/schema";
import styles from "./site.module.css";

export function ProjectList({ projects, title }: { projects: Project[]; title: string }) {
  return (
    <section id="projects" className={styles.section} aria-labelledby="projects-title">
      <h2 id="projects-title">{title}</h2>
      <ul className={styles.cards}>
        {projects.map((project) => {
          const links = Object.entries(project.links ?? {}).filter(([, url]) => url);
          return (
            <li key={project.id} className={styles.card}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <ul className={styles.tags} aria-label="Stack">
                {project.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {links.length > 0 && (
                <p className={styles.links}>
                  {links.map(([kind, url]) => (
                    <a key={kind} href={url} rel="noopener noreferrer">
                      {kind === "repo" ? "GitHub" : new URL(url as string).host}
                    </a>
                  ))}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
