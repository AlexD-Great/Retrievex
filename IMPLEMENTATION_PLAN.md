# Retrievex Phase 1 Implementation Plan

This plan is aligned directly to the Retrievex Phase 1 PRD and excludes every future roadmap item.

## Confirmed Scope Boundaries

Implement:

- Escrow.
- Retrieval requests.
- Retrieval receipts.
- Client confirmation.
- Basic Storage Provider reputation.
- Simple dashboard and provider analytics.
- Minimal logging and monitoring for retrieval activity.

Do not implement:

- zk-SNARKs.
- Slashing.
- Marketplace logic.
- Pricing dynamics.
- SLA systems.
- Protocol-level Filecoin changes.

## PRD Section To Code Structure

| PRD Section | Implementation Area | Notes |
| --- | --- | --- |
| Section 1: Understanding the Product | `README.md`, shared domain model | Defines the product, users, Phase 1 capabilities, and success metrics. |
| Section 2: Frontend Specification | `frontend/` | Implements Dashboard, New Retrieval Request, and Provider Analytics only. |
| Section 3: Backend Specification | `backend/` | Implements Node.js API, retrieval lifecycle, receipt handling, reputation, and database schema. |
| Section 4: Infrastructure & DevOps | repo root, `backend/`, `frontend/`, `contracts/` | Keeps deployment lightweight: static frontend, Node.js backend, Filecoin EVM testnet contracts. |
| Section 5: Integration with Filecoin | `contracts/`, `backend/` | Handles FVM escrow integration and receipt-based verification. |
| Section 6: Phase 2 Roadmap | none | Explicitly ignored for Phase 1 implementation. |
| Section 7: Data Flow | `contracts/`, `backend/`, `frontend/` | Drives the request-to-release lifecycle across modules. |

## Module Plan

### 1. Contracts: Escrow

Deliverables:

- Escrow contract for Filecoin EVM testnet.
- Request creation with FIL deposit.
- Request assignment to a Storage Provider.
- Payment release after valid receipt and client confirmation.
- Timeout refund path.

Acceptance criteria:

- Funds are isolated per request.
- Only Phase 1 escrow state transitions exist.
- No slashing or marketplace behavior exists.

### 2. Backend: Retrieval Lifecycle API

Deliverables:

- `POST /retrieval/request`
- `POST /retrieval/receipt`
- `GET /retrieval/status/:id`
- `GET /sp/:id/metrics`
- Persistence for `RetrievalRequests`, `Receipts`, and `Providers`.

Acceptance criteria:

- A request stores CID, client address, Storage Provider address, FIL amount, and status.
- A receipt stores retrieval ID, signature, and timestamp.
- Status transitions follow: Request -> Escrow Locked -> SP Retrieves -> Receipt Generated -> Client Confirms -> Payment Released.

### 3. Backend: Receipt Verification

Deliverables:

- Validation for Storage Provider signature.
- CID match check against the original request.
- Client acknowledgment check.

Acceptance criteria:

- Receipt verification uses receipt-based verification only.
- No zk proof system exists.
- Verification target remains under 200ms latency.

### 4. Backend: Reputation

Deliverables:

- `+1` successful retrieval.
- `-1` timeout or failure.
- Weighted average score for display.
- Provider metrics aggregation.

Acceptance criteria:

- Reputation is a ranking and selection signal only.
- No penalties, slashing, or stake mechanics exist.

### 5. Frontend: Dashboard

Deliverables:

- Active retrieval requests.
- Escrow status.
- Recent retrieval history.
- Storage Provider performance summary.
- Basic monitoring metrics.

Acceptance criteria:

- Every retrieval state is visible: pending, in-progress, completed, failed/timeout.
- The UI is function-first and not marketing-heavy.

### 6. Frontend: New Retrieval Request

Deliverables:

- CID input.
- Storage Provider selection.
- FIL payment amount input.
- Estimated retrieval time display.
- Storage Provider reliability score display.
- `Initiate Retrieval` call to action.

Acceptance criteria:

- Submitting creates an escrow-backed retrieval request.
- The flow does not include marketplace pricing or bidding.

### 7. Frontend: Provider Analytics

Deliverables:

- Retrievals served.
- Success rate.
- Average response time.
- Reputation score.

Acceptance criteria:

- Analytics are limited to Phase 1 provider performance signals.

### 8. Logging And Monitoring

Deliverables:

- Retrieval request event logs.
- Receipt submission logs.
- Escrow state transition logs.
- Metrics for active retrieval count, success vs failure ratio, and response time distribution.

Acceptance criteria:

- Monitoring stays lightweight.
- No SLA enforcement or enterprise monitoring system exists.

## Database Schema

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

## Phase 1 User Flow

```text
Request
  -> Escrow Locked
  -> SP Retrieves
  -> Receipt Generated
  -> Client Confirms
  -> Payment Released
```

## First Implementation Order

1. Define shared Phase 1 status and receipt models.
2. Implement escrow contract state machine.
3. Implement backend persistence and minimal API endpoints.
4. Implement receipt validation and escrow release integration.
5. Implement reputation updates.
6. Implement dashboard views.
7. Add lightweight logging, monitoring, and tests around lifecycle paths.
