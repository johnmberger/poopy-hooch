import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    isolate: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname),
    },
  },
});
