/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_KEY: string
  readonly PROD: boolean
  // Add other environment variables you use here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
