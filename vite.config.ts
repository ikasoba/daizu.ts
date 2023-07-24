import { defineConfig } from "vitest/dist/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: "json"
    }
  }
})