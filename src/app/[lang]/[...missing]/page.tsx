import { notFound } from "next/navigation";

/** Any path under a language that isn't a page: the localized 404 (AC-7). */
export default function Missing(): never {
  notFound();
}
