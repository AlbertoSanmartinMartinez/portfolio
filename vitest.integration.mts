import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Needs the local stack and its variables: `scripts/stack.sh up`, `pnpm db:migrate`,
// and the exports printed by `scripts/stack.sh info`, plus SITE_URL.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["tests/integration/**/*.test.ts"], environment: "node", fileParallelism: false },
});
