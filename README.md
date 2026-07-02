# Retrievex

This system is strictly derived from the Retrievex Phase 1 PRD. No functionality exists outside of defined scope.

Retrievex Phase 1 is a minimal retrieval payment layer for Filecoin. It introduces a controlled payment loop for CID-based retrieval using escrow, signed receipts, client confirmation, Storage Provider reputation, and a simple dashboard.

## Reviewer Summary

Retrievex Phase 1 implements only the MVP path defined in the PRD:

```text
Client -> Escrow -> Storage Provider -> Retrieval -> Receipt -> Settlement
```

The repository is organized to make that path reviewable at the code level:

- `contracts/` contains the Filecoin EVM escrow contract.
- `backend/` contains the REST API, retrieval lifecycle logic, receipt handling, reputation updates, and monitoring metrics.
- `frontend/` contains the dashboard, new retrieval request flow, and provider analytics UI.
- `shared/` contains only shared Phase 1 types and interfaces.

## Phase 1 Scope

Implemented scope:

- Paid retrieval requests via escrow on Filecoin EVM.
- Storage Provider assignment for a retrieval request.
- Storage Provider retrieval execution.
- Signed retrieval receipt submission.
- Client confirmation of retrieval receipt.
- Escrow payment release after confirmation.
- Timeout-based refund path.
- Basic Storage Provider reputation scoring.
- Simple monitoring dashboard for retrieval activity.

Explicitly excluded scope:

- zk-SNARKs.
- Slashing.
- Marketplace logic.
- Dynamic pricing.
- SLA systems.
- Protocol-level Filecoin changes.
- Any feature not defined in the Phase 1 PRD.

## Deployments

### Filecoin Testnet (Calibration)

| Component | Address | Network | Date |
| --- | --- | --- | --- |
| Escrow Contract | `0x5239ad0C0872E9ECB3b8fcd0aB5418C7015C0978` | Filecoin Testnet | 2026-06-13 |

**RPC Endpoint:** `https://rpc.ankr.com/filecoin_testnet`

**Explorer:** [Filfox Testnet](https://calibration.filfox.io/address/0x5239ad0C0872E9ECB3b8fcd0aB5418C7015C0978)

## System Overview

The Phase 1 system is intentionally deterministic and minimal.

```text
Client
  -> creates retrieval request and deposits FIL
Escrow
  -> locks funds for the request
Storage Provider
  -> receives assigned request
Retrieval
  -> Storage Provider retrieves CID data
Receipt
  -> Storage Provider returns signed retrieval receipt
Settlement
  -> client confirms receipt and escrow releases payment
```

No additional execution paths are defined for Phase 1.

## PRD To Code Traceability Map

| PRD Component | Repository Module | Purpose |
| --- | --- | --- |
| Escrow System | `contracts/contracts/Escrow.sol` | Locks FIL per retrieval request, releases payment on confirmed receipt, refunds on timeout. |
| FVM Deployment | `contracts/hardhat.config.ts`, `contracts/scripts/deploy.ts` | Compiles and deploys the escrow contract to Filecoin EVM testnet. |
| Retrieval Flow | `backend/src/services/retrieval.service.ts` | Creates escrow-backed retrieval requests and exposes request status. |
| Retrieval API | `backend/src/routes/retrieval.routes.ts` | Defines `POST /retrieval/request`, `POST /retrieval/receipt`, and `GET /retrieval/status/:id`. |
| Receipt System | `backend/src/services/receipt.service.ts` | Builds the PRD-defined receipt object, hashes it, and triggers settlement. |
| Receipt Persistence | `backend/src/repositories/receipt.repository.ts` | Defines storage boundary for submitted receipts. |
| Reputation System | `backend/src/services/reputation.service.ts` | Applies basic `+1` success and `-1` failure/timeout reputation behavior. |
| Provider Metrics API | `backend/src/routes/provider.routes.ts` | Defines `GET /sp/:id/metrics`. |
| Database Schema | `backend/src/db/schema.sql` | Defines `RetrievalRequests`, `Receipts`, and `Providers`. |
| Dashboard UI | `frontend/src/pages/DashboardPage.tsx` | Shows active requests, escrow status, recent history, and SP summary. |
| New Retrieval Request UI | `frontend/src/pages/NewRetrievalRequestPage.tsx` | Captures CID, Storage Provider, FIL amount, estimated retrieval time, and reliability score. |
| Provider Analytics UI | `frontend/src/pages/ProviderAnalyticsPage.tsx` | Shows retrievals served, success rate, average response time, and reputation score. |
| Shared Phase 1 Types | `shared/src/types.ts`, `shared/src/receipt.ts`, `shared/src/status.ts` | Keeps frontend and backend aligned on PRD-defined entities and states. |

## Repository Structure

```text
Retrievex/
  README.md
  IMPLEMENTATION_PLAN.md
  package.json
  tsconfig.base.json
  frontend/
    src/
      api/
      components/
      pages/
  backend/
    src/
      db/
      repositories/
      routes/
      services/
  contracts/
    contracts/
    scripts/
    test/
  shared/
    src/
```

## API Overview

The backend exposes only the Phase 1 PRD endpoints:

- `POST /retrieval/request`
- `POST /retrieval/receipt`
- `GET /retrieval/status/:id`
- `GET /sp/:id/metrics`

No additional public API surface is defined.

Backend execution uses configured Filecoin EVM testnet signers for the Phase 1 MVP:

- `CLIENT_PRIVATE_KEY` creates escrow requests and confirms receipts.
- `SP_PRIVATE_KEY` submits signed receipt hashes.
- `RETRIEVAL_TIMEOUT_SECONDS` defaults to `86400` seconds.

## Data Model

Tables are limited to the PRD schema:

### RetrievalRequests

- `id`
- `cid`
- `client_address`
- `sp_address`
- `amount_fil`
- `status`

### Receipts

- `id`
- `retrieval_id`
- `signature`
- `timestamp`

### Providers

- `id`
- `reputation_score`
- `total_retrievals`

## Receipt Structure

The receipt model follows the PRD-defined off-chain signed object:

```json
{
  "cid": "string",
  "provider": "SP_address",
  "timestamp": "unix_time",
  "client_confirmation": "signature",
  "status": "success"
}
```

Phase 1 receipt verification is receipt-based only:

- Validate Storage Provider signature.
- Confirm CID matches the request.
- Confirm client acknowledgment.

No zk proof system is included.

## Build Confidence

Execution order:

1. Define shared Phase 1 types and states.
2. Implement the escrow contract state machine.
3. Implement the minimal REST API endpoints.
4. Connect retrieval request creation to escrow locking.
5. Validate and store signed receipts.
6. Release escrow payment after client confirmation.
7. Update basic Storage Provider reputation.
8. Render dashboard, retrieval request, and provider analytics views.

Intentional simplifications:

- Receipt-based verification instead of zk verification.
- Basic reputation scoring instead of slashing.
- Fixed API surface instead of marketplace workflows.
- Lightweight monitoring instead of SLA enforcement.
- Testnet escrow deployment before any production network assumption.


## Setup Instructions

Setup Instructions:

```bash
npm install
npm run build
npm run test
```

## Contract Deployment Flow

High level only:

1. Configure Filecoin EVM testnet RPC and deployer key.
2. Compile `contracts/contracts/Escrow.sol`.
3. Deploy the escrow contract to Filecoin EVM testnet.
4. Set the deployed escrow address in the backend environment.
5. Submit retrieval requests through the backend API.

