import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8'),
)

function emitVersionFile(): Plugin {
  return {
    name: 'emit-version-json',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version: pkg.version, builtAt: new Date().toISOString() }),
      })
    },
  }
}

export default defineConfig({
  base: '/shrimper/',
  plugins: [emitVersionFile()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
