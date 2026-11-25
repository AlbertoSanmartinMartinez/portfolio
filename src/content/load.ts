import type { z } from "zod";
import { locales, type Locale } from "@/i18n/config";
import { experienceSchema, profileSchema, projectsSchema, type Content } from "./schema";
import enExperience from "../../content/en/experience.json";
import enProfile from "../../content/en/profile.json";
import enProjects from "../../content/en/projects.json";
import esExperience from "../../content/es/experience.json";
import esProfile from "../../content/es/profile.json";
import esProjects from "../../content/es/projects.json";

export type RawContent = Record<Locale, { profile: unknown; experience: unknown; projects: unknown }>;

const raw: RawContent = {
  en: { profile: enProfile, experience: enExperience, projects: enProjects },
  es: { profile: esProfile, experience: esExperience, projects: esProjects },
};

function parse<T>(schema: z.ZodType<T>, data: unknown, file: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(`${file}: ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
  return result.data;
}

function sameIds(a: { id: string }[], b: { id: string }[], file: string): void {
  const missing = a.map((x) => x.id).filter((x) => !b.some((y) => y.id === x));
  if (missing.length) throw new Error(`${file}: missing translation for ${missing.join(", ")}`);
}

/** Validates every language and checks they translate the same entries (AC-5). */
export function loadContent(input: RawContent): Record<Locale, Content> {
  const out = {} as Record<Locale, Content>;
  for (const lang of locales) {
    const experience = parse(experienceSchema, input[lang].experience, `content/${lang}/experience.json`);
    out[lang] = {
      profile: parse(profileSchema, input[lang].profile, `content/${lang}/profile.json`),
      experience: [...experience].sort((a, b) => b.start.localeCompare(a.start)), // AC-4
      projects: parse(projectsSchema, input[lang].projects, `content/${lang}/projects.json`),
    };
  }
  for (const lang of locales) {
    for (const other of locales.filter((l) => l !== lang)) {
      sameIds(out[lang].experience, out[other].experience, `content/${other}/experience.json`);
      sameIds(out[lang].projects, out[other].projects, `content/${other}/projects.json`);
    }
  }
  return out;
}

const content = loadContent(raw);

export function getContent(lang: Locale): Content {
  return content[lang];
}
