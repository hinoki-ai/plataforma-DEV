import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    exclude: ["tests/e2e/**/*"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/convex": path.resolve(__dirname, "./convex"),
      "@/convex/_generated": path.resolve(__dirname, "./convex/_generated"),
    },
  },
});
