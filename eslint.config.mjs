import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Disable specific rules for JS/TS and JSX/TSX files
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    rules: {
      // turn off explicit any warnings/errors
      "@typescript-eslint/no-explicit-any": "off",
      // allow unescaped characters in JSX (e.g. apostrophes, >, etc.)
      "react/no-unescaped-entities": "off",
      "prefer-const": "off",
    },
  },
];

export default eslintConfig;
