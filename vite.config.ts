import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: [...configDefaults.exclude, 'server/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.config.{ts,tsx}',
        'src/**/*.d.ts',
        'src/**/generated/**',
      ],
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage/frontend',
      thresholds: {
        statements: 90,
        branches: 76,
        functions: 92,
        lines: 94,
      },
    },
  },
})
