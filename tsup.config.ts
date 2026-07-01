import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src'],
  outDir: 'build',
  format: ['cjs'],
  // The Prisma-generated client polyfills `__dirname` via
  // `fileURLToPath(import.meta.url)`. When esbuild bundles to CommonJS it stubs
  // `import.meta` to `{}`, so `import.meta.url` becomes `undefined` and that call
  // throws at startup (ERR_INVALID_ARG_TYPE). In CJS `__filename` is always
  // available, so we redefine `import.meta.url` to a real file URL derived from it.
  esbuildOptions(options) {
    options.define = {
      ...options.define,
      'import.meta.url': '__import_meta_url__',
    }
    options.banner = {
      ...options.banner,
      js: "const __import_meta_url__ = require('url').pathToFileURL(__filename).href;",
    }
  },
})
