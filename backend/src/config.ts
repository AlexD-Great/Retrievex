export interface BackendConfig {
  port: number;
  databaseUrl: string;
  escrowContractAddress: string;
  filecoinRpcUrl: string;
}

export function loadConfig(): BackendConfig {
  return {
    port: Number(process.env.PORT ?? 3000),
    databaseUrl: process.env.DATABASE_URL ?? "",
    escrowContractAddress: process.env.ESCROW_CONTRACT_ADDRESS ?? "",
    filecoinRpcUrl: process.env.FILECOIN_RPC_URL ?? ""
  };
}
