import path from "path";

export default {
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/convex/_generated": path.resolve(__dirname, "./convex/_generated"),
    },
  },
};
