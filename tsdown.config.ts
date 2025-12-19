import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/convert.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'es2022',
  exports: true,
})
