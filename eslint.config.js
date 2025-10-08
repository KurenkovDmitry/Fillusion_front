import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
// defineConfig здесь не обязателен, но помогает с автодополнением
// import { defineConfig } from 'eslint/config' (если вы его импортировали)


export default [ // defineConfig() можно убрать, если не используется
  {
    ignores: ['dist/'], // Более современный синтаксис для игнорирования
  },
  {
    files: ['**/*.{ts,tsx}'],
    // extends теперь не используется, все плагины добавляются напрямую
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // Подключаем рекомендованные правила
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // И отключаем то, что нам не нужно
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off'
    },
  },
]
