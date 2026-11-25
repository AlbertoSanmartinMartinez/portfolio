import { describe, expect, it } from "vitest";
import { getContent, loadContent, type RawContent } from "@/content/load";

const profile = {
  name: "Test Person",
  headline: "Headline",
  location: "Somewhere",
  summary: ["Summary"],
  links: { linkedin: "https://example.test/in/x", github: "https://example.test/x", email: "x@example.test" },
};
const experience = [
  { id: "old", company: "A", role: "R", start: "2019-01", end: "2020-01", highlights: [] },
  { id: "new", company: "B", role: "R", start: "2023-05", highlights: ["H"] },
];
const projects = [{ id: "p", name: "P", description: "D", stack: [] }];
const valid = (): RawContent => ({
  en: { profile, experience, projects },
  es: { profile, experience, projects },
});

describe("content loader", () => {
  it("accepts the committed content", () => {
    expect(getContent("en").profile.name).toBeTruthy();
    expect(getContent("es").profile.name).toBeTruthy();
  });

  it("sorts experience newest first (AC-4)", () => {
    expect(loadContent(valid()).en.experience.map((e) => e.id)).toEqual(["new", "old"]);
  });

  it("names the file and field of a missing value (AC-5)", () => {
    const raw = valid();
    raw.es.profile = { ...profile, headline: undefined };
    expect(() => loadContent(raw)).toThrow("content/es/profile.json: headline:");
  });

  it("rejects more than five highlights", () => {
    const raw = valid();
    raw.en.experience = [{ ...experience[0], highlights: ["1", "2", "3", "4", "5", "6"] }];
    expect(() => loadContent(raw)).toThrow("content/en/experience.json: 0.highlights:");
  });

  it("fails when a translation is missing (AC-5)", () => {
    const raw = valid();
    raw.es.projects = [];
    expect(() => loadContent(raw)).toThrow("content/es/projects.json: missing translation for p");
  });
});
