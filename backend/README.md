# Retrievex Backend

Phase 1 backend scope is limited to a Node.js server with these endpoints:

- `POST /retrieval/request`
- `POST /retrieval/receipt`
- `GET /retrieval/status/:id`
- `GET /sp/:id/metrics`

The backend owns retrieval lifecycle state, receipt validation, basic Storage Provider reputation, logging, and lightweight monitoring metrics.

No zk proofs, slashing, marketplace logic, pricing dynamics, or SLA systems belong here.

Framework: Node.js with Express.

Reason: small REST API surface that matches the PRD endpoint list without adding event systems or extra service boundaries.

## Required Environment

Use `.env.example` at the repository root as the placeholder template.

- `PORT`
- `DB_PROVIDER`
- `DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FILECOIN_RPC_URL`
- `ESCROW_CONTRACT_ADDRESS`
- `SP_PRIVATE_KEY`
- `RETRIEVAL_TIMEOUT_SECONDS`
- `SYNAPSE_WITH_CDN`

Clients deposit and release escrow from their own browser wallet, so no client key is stored server-side. The backend holds only the `SP_PRIVATE_KEY` to submit receipts on-chain and authenticate Synapse retrieval.

## Build

```bash
npm.cmd run build --workspace shared
npm.cmd run build --workspace backend
```
