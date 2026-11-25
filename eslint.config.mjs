import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // INV-006: pages and components never reach the database layer; server code
  // under src/app/api/ and src/db/ may (docs/architecture.md).
  {
    files: ["src/components/**", "src/app/**"],
    ignores: ["src/app/api/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["@/db", "@/db/*", "**/db", "**/db/*"], message: "UI code must not import the database layer (INV-006)." }] },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    ".lighthouseci/**",
    "src/lib/api/schema.d.ts",
  ]),
]);

export default eslintConfig;
