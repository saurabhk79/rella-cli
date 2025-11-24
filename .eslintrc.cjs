/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module",
    ecmaVersion: "latest"
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  ignorePatterns: ["dist", "node_modules"],
  rules: {
    "prettier/prettier": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "off"
  }
};
