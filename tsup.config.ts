import { defineConfig } from 'tsup'

export default defineConfig({
  // Outputs `dist/a.js` and `dist/b.js`.
  entry: {
    byaf: 'src/byaf/index.ts',
    'character-image': 'src/character-image/index.ts',
  },
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  outDir: 'dist',
  target: 'es2020',
})
