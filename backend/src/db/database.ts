import pg from "pg";
import type { BackendConfig } from "../config.js";
import { PostgresProviderRepository } from "../repositories/provider.repository.js";
import { PostgresReceiptRepository } from "../repositories/receipt.repository.js";
import { PostgresRetrievalRepository } from "../repositories/retrieval.repository.js";
import type { DataLayer } from "./data-layer.js";

const { Pool } = pg;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS RetrievalRequests (
    id TEXT PRIMARY KEY,
    cid TEXT NOT NULL,
    client_address TEXT NOT NULL,
    sp_address TEXT NOT NULL,
    amount_fil TEXT NOT NULL,
    status TEXT NOT NULL,
    escrow_status TEXT NOT NULL DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS Receipts (
    id TEXT PRIMARY KEY,
    retrieval_id TEXT NOT NULL REFERENCES RetrievalRequests(id),
    signature TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Providers (
    id TEXT PRIMARY KEY,
    reputation_score INTEGER NOT NULL DEFAULT 0,
    total_retrievals INTEGER NOT NULL DEFAULT 0,
    successful_retrievals INTEGER NOT NULL DEFAULT 0,
    failed_retrievals INTEGER NOT NULL DEFAULT 0,
    total_response_time_ms INTEGER NOT NULL DEFAULT 0
  );
`;

export function createPostgresDataLayer(config: BackendConfig): DataLayer {
  const pool = new Pool({ connectionString: config.databaseUrl });

  return {
    repositories: {
      retrieval: new PostgresRetrievalRepository(pool),
      receipt: new PostgresReceiptRepository(pool),
      provider: new PostgresProviderRepository(pool)
    },
    async initialize() {
      await pool.query(SCHEMA);
    }
  };
}
