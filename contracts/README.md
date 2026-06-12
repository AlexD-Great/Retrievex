# Retrievex Contracts

Phase 1 contract scope is limited to Filecoin EVM testnet escrow logic:

- Deposit FIL from client.
- Assign retrieval request to a Storage Provider.
- Release payment after a valid receipt and client confirmation.
- Refund on timeout.

No zk-SNARKs, slashing, marketplace logic, pricing dynamics, or SLA systems belong here.

Language: Solidity.

Reason: Filecoin EVM supports Solidity contracts for the Phase 1 escrow primitive.
