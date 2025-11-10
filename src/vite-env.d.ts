/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_DATABASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly PROD: boolean
  readonly DEV: boolean
}
