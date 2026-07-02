import type { BackendConfig } from "../config.js";
import { FirestoreProviderRepository } from "../repositories/firestore/provider.repository.js";
import { FirestoreReceiptRepository } from "../repositories/firestore/receipt.repository.js";
import { FirestoreRetrievalRepository } from "../repositories/firestore/retrieval.repository.js";
import type { DataLayer } from "./data-layer.js";
import { getFirestoreDb } from "./firestore.js";

export function createFirestoreDataLayer(config: BackendConfig): DataLayer {
  const db = getFirestoreDb(config);

  return {
    repositories: {
      retrieval: new FirestoreRetrievalRepository(db),
      receipt: new FirestoreReceiptRepository(db),
      provider: new FirestoreProviderRepository(db)
    },
    // Firestore is schemaless; collections are created on first write.
    async initialize() {}
  };
}
