import type { BackendConfig } from "../config.js";
import type { ProviderRepository } from "../repositories/provider.repository.js";
import type { ReceiptRepository } from "../repositories/receipt.repository.js";
import type { RetrievalRepository } from "../repositories/retrieval.repository.js";

export interface RepositoryBundle {
  retrieval: RetrievalRepository;
  receipt: ReceiptRepository;
  provider: ProviderRepository;
}

export interface DataLayer {
  repositories: RepositoryBundle;
  /** Provider-specific setup (schema creation for Postgres, no-op for Firestore). */
  initialize(): Promise<void>;
}

/**
 * Selects the persistence backend at boot. Firestore is the Phase 1 default;
 * Postgres is the migration target. Both implement the same repository
 * interfaces, so services never know which one is active. Each backend module
 * is imported dynamically so only the selected driver is loaded.
 */
export async function createDataLayer(config: BackendConfig): Promise<DataLayer> {
  if (config.databaseProvider === "postgres") {
    const { createPostgresDataLayer } = await import("./database.js");
    return createPostgresDataLayer(config);
  }

  const { createFirestoreDataLayer } = await import("./firestore-data-layer.js");
  return createFirestoreDataLayer(config);
}
