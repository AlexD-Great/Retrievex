CREATE TABLE IF NOT EXISTS RetrievalRequests (
  id TEXT PRIMARY KEY,
  cid TEXT NOT NULL,
  client_address TEXT NOT NULL,
  sp_address TEXT NOT NULL,
  amount_fil TEXT NOT NULL,
  status TEXT NOT NULL
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
  total_retrievals INTEGER NOT NULL DEFAULT 0
);
