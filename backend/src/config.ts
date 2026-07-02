export type DatabaseProvider = "firestore" | "postgres";

export interface BackendConfig {
  port: number;
  databaseProvider: DatabaseProvider;
  databaseUrl: string;
  firebaseProjectId: string;
  firestoreEmulatorHost: string;
  escrowContractAddress: string;
  filecoinRpcUrl: string;
  spPrivateKey: string;
  retrievalTimeoutSeconds: number;
  synapseWithCDN: boolean;
}

export function loadConfig(): BackendConfig {
  return {
    port: Number(process.env.PORT ?? 3000),
    databaseProvider: (process.env.DB_PROVIDER as DatabaseProvider) ?? "firestore",
    databaseUrl: process.env.DATABASE_URL ?? "",
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
    firestoreEmulatorHost: process.env.FIRESTORE_EMULATOR_HOST ?? "",
    escrowContractAddress: process.env.ESCROW_CONTRACT_ADDRESS ?? "",
    filecoinRpcUrl: process.env.FILECOIN_RPC_URL ?? "",
    spPrivateKey: process.env.SP_PRIVATE_KEY ?? "",
    retrievalTimeoutSeconds: Number(process.env.RETRIEVAL_TIMEOUT_SECONDS ?? 86400),
    synapseWithCDN: (process.env.SYNAPSE_WITH_CDN ?? "true") === "true"
  };
}
