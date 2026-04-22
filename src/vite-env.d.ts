/// <reference types="vite/client" />

declare const __APP_VERSION__: string

declare module '*.css' {}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.md?raw' {
  const content: string
  export default content
}
