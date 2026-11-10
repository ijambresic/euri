import tseslint from "typescript-eslint";

// Deliberately tiny: TypeScript's strict mode already covers most mistakes.
// These rules catch the one bug class it does not: a promise nobody awaits or
// catches.
export default tseslint.config(
  {
    files: ["src/**/*.ts", "public/ts/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json", "./public/tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
  {
    // Server only: Express 4 ignores the promise an async route handler returns,
    // so a bare `async (req, res) => ...` route is an error. Wrap it in
    // asyncHandler (src/asyncHandler.ts). In the browser an async event listener
    // is harmless, so the rule is not applied there.
    files: ["src/**/*.ts"],
    rules: {
      "@typescript-eslint/no-misused-promises": "error",
    },
  },
);
