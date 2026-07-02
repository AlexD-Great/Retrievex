/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_FILECOIN_RPC_URL?: string;
  readonly VITE_ESCROW_ADDRESS?: string;
  readonly VITE_RETRIEVAL_TIMEOUT_SECONDS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
