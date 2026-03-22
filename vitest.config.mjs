import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: [path.join(__dirname, "src/test/vitest-setup.ts")],
    coverage: {
      provider: "v8",
      include: ["src/services/reports.ts", "src/lib/date-range.ts", "src/lib/export.ts"],
      all: true,
      thresholds: {
        lines: 100,
        functions: 100,
        statements: 100,
        branches: 70,
      },
    },
    pool: "forks",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
