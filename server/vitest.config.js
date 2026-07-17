import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['app.js', 'client.js', 'index.js'],
      exclude: [
        'tests/**',
        '**/*.test.js',
        '**/*.config.js',
        '**/*.d.ts',
        'generated/**'
      ],
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: '../coverage/server',
      thresholds: {
        statements: 86,
        branches: 88,
        functions: 85,
        lines: 87
      }
    }
  }
});
