import { TextDecoder, TextEncoder } from 'util'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: { all: true, include: ['src/**/*.{ts,tsx}'] },
    deps: { moduleDirectories: ['node_modules'] },
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
  },
})
