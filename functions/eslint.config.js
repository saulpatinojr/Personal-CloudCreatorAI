import globals from "globals";
import tseslint from "typescript-eslint";


export default [
  {
    languageOptions: { globals: globals.browser },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error"
    }
  },
  ...tseslint.configs.recommended,
];
