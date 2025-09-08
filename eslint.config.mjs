import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      // Ignore generated files
      "src/generated/**/*",
      "**/*.d.ts",
      // Ignore build outputs
      ".next/**/*",
      "dist/**/*",
      "build/**/*",
      // Ignore dependencies
      "node_modules/**/*",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.extends("prettier"),
  {
    rules: {
      // Allow explicit any in some cases for flexibility
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unused vars in some contexts
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
