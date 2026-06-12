export interface BackendConfig {
  port: number;
  databaseUrl: string;
  escrowContractAddress: string;
  filecoinRpcUrl: string;
  clientPrivateKey: string;
  spPrivateKey: string;
  retrievalTimeoutSeconds: number;
}

export function loadConfig(): BackendConfig {
  return {
    port: Number(process.env.PORT ?? 3000),
    databaseUrl: process.env.DATABASE_URL ?? "",
    escrowContractAddress: process.env.ESCROW_CONTRACT_ADDRESS ?? "",
    filecoinRpcUrl: process.env.FILECOIN_RPC_URL ?? "",
    clientPrivateKey: process.env.CLIENT_PRIVATE_KEY ?? "",
    spPrivateKey: process.env.SP_PRIVATE_KEY ?? "",
    retrievalTimeoutSeconds: Number(process.env.RETRIEVAL_TIMEOUT_SECONDS ?? 86400)
  };
}
