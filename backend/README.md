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
