const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/**", ".vercel/**", "references/**", "artifacts/**", "node_modules/**", "ios/**", "android/**"],
  },
]);
