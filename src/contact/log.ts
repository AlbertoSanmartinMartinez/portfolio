import type { Logger } from "./service";

/** Structured JSON lines on stdout, collected by App Platform (docs/guides/observability.md). */
export const jsonLogger: Logger = {
  info: (event, data = {}) => console.log(JSON.stringify({ level: "info", event, ...data, time: new Date().toISOString() })),
  error: (event, data = {}) => console.error(JSON.stringify({ level: "error", event, ...data, time: new Date().toISOString() })),
};
