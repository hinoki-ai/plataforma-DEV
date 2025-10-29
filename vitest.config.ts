import path from "path";

const config = {
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

export default config;
