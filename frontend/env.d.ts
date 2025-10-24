/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REGION: string
  readonly VITE_USER_POOL_ID: string
  readonly VITE_USER_POOL_CLIENT_ID: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_DEVICE_ID_DEFAULT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
