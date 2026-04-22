import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8'),
)

export default defineConfig({
  base: '/shrimper/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
