import { notFound } from "next/navigation";
import { Contact } from "@/components/Contact";
import { ExperienceList } from "@/components/ExperienceList";
import { Header, type Section } from "@/components/Header";
import { Profile } from "@/components/Profile";
import { ProjectList } from "@/components/ProjectList";
import styles from "@/components/site.module.css";
import { getContent } from "@/content/load";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { profile, experience, projects } = getContent(lang);
  const sections: Section[] = [
    { id: "about", label: dict.sections.about },
    { id: "experience", label: dict.sections.experience },
    ...(projects.length ? [{ id: "projects", label: dict.sections.projects }] : []),
    { id: "contact", label: dict.sections.contact },
  ];

  return (
    <>
      <Header name={profile.name} lang={lang} sections={sections} labels={{ menu: dict.menu, languageSwitch: dict.languageSwitch }} />
      <main className={styles.main}>
        <Profile profile={profile} title={dict.sections.about} photoAlt={dict.photoAlt.replace("{name}", profile.name)} />
        <ExperienceList entries={experience} lang={lang} title={dict.sections.experience} present={dict.present} />
        {projects.length > 0 && <ProjectList projects={projects} title={dict.sections.projects} />}
        <Contact links={profile.links} title={dict.sections.contact} intro={dict.contactIntro} />
      </main>
    </>
  );
}
