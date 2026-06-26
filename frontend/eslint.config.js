import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // These two rules come from the React Compiler-oriented "recommended"
      // preset and flag standard, safe patterns used throughout this app
      // (data-fetching in useEffect, reading ref.current in a context
      // provider's render to pass it through context). They are not bugs
      // here since this project does not use the React Compiler. Kept as
      // warnings rather than disabled outright so they remain visible.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      // Context files intentionally export both the provider component and
      // its corresponding useX() hook from the same file for ergonomics.
      'react-refresh/only-export-components': 'off',
    },
  },
])
