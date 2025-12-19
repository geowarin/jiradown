import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  test: {
    environment: "node",
    reporters: "verbose",
    coverage: {
      enabled: false,
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
