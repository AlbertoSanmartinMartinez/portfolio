import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit and integration tests together, for the coverage of the diff in CI (needs the stack).
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    environment: "node",
    fileParallelism: false,
    coverage: { provider: "v8", include: ["src/**/*.ts"], reporter: ["text", "cobertura"] },
  },
});
