import { z } from "zod";

const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "use YYYY-MM");
const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "use a kebab-case id");
const text = z.string().trim().min(1);

export const profileSchema = z.strictObject({
  name: text,
  headline: text,
  location: text,
  summary: z.array(text).min(1),
  photo: text.optional(),
  links: z.strictObject({ linkedin: z.url(), github: z.url(), email: z.email() }),
});

export const experienceSchema = z.array(
  z.strictObject({
    id,
    company: text,
    role: text,
    location: text.optional(),
    start: yearMonth,
    end: yearMonth.optional(),
    highlights: z.array(text).max(5),
  }),
);

export const projectsSchema = z.array(
  z.strictObject({
    id,
    name: text,
    description: text,
    stack: z.array(text),
    links: z.strictObject({ site: z.url().optional(), repo: z.url().optional() }).optional(),
  }),
);

export type Profile = z.infer<typeof profileSchema>;
export type Experience = z.infer<typeof experienceSchema>[number];
export type Project = z.infer<typeof projectsSchema>[number];
export type Content = { profile: Profile; experience: Experience[]; projects: Project[] };
