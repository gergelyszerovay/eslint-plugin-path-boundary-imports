import { TSESLint } from "@typescript-eslint/utils";
import packageJson from "../package.json";
import { rules } from "./rules";

const eslintPluginPath: TSESLint.FlatConfig.Plugin = {
  meta: {
    name: "eslint-plugin-path",
    version: packageJson.version,
  },
  rules: {
    "enforce-import-pattern": rules.noRelativeImports,
  },
};

const flatConfigPlugin: TSESLint.FlatConfig.Plugin = {
  ...eslintPluginPath,
};

export = flatConfigPlugin;
