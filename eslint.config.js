import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // eslint가 스캔 안 할 것들
  { ignores: ["dist", "node_modules"] },

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // React Hooks 권장룰
      ...reactHooks.configs.recommended.rules,

      // Vite HMR 환경에서 컴포넌트 export 관련 경고
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // TS unused vars: _ 접두는 허용
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // 개발 중 console 허용
      "no-console": "off",
    },
  },

  // Prettier와 충돌하는 ESLint 스타일 룰을 꺼줌
  prettier,
);
