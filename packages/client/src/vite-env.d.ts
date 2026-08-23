/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_REVISION_COUNT: string
  readonly VITE_COMMIT_HASH: string
}
