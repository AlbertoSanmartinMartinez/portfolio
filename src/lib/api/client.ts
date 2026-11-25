import createClient from "openapi-fetch";
import type { components, paths } from "./schema";

/** Typed client for the site's own API, generated from openapi/openapi.yaml. */
export const api = createClient<paths>({ baseUrl: "" });

export type ContactRequest = components["schemas"]["ContactRequest"];
export type FieldErrorCode = components["schemas"]["FieldErrorCode"];
export type ValidationError = components["schemas"]["ValidationError"];
