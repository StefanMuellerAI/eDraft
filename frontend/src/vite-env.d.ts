/// <reference types="vite/client" />

declare module '*.fdx?raw' {
  const content: string
  export default content
}
