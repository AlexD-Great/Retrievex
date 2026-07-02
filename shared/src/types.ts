import type { EscrowStatus, RetrievalStatus } from "./status.js";

export interface RetrievalRequest {
  id: string;
  cid: string;
  client_address: string;
  sp_address: string;
  amount_fil: string;
  status: RetrievalStatus;
  escrow_status: EscrowStatus;
}

export interface ProviderMetrics {
  id: string;
  reputation_score: number;
  total_retrievals: number;
  success_rate: number;
  average_response_time_ms: number;
}

export interface CreateRetrievalRequestInput {
  // On-chain requestId emitted by the client's createRequest transaction.
  request_id: string;
  cid: string;
  // The connected wallet that locked the escrow on-chain (the payer/client).
  client_address: string;
  sp_address: string;
  amount_fil: string;
}

// SP-triggered: the backend (SP operator) serves the data, signs the receipt,
// and submits it on-chain. No client-supplied signatures are required because
// the client confirms release on-chain from their own wallet.
export interface SubmitReceiptInput {
  retrieval_id: string;
}

// Client-triggered after the wallet has called confirmReceipt on-chain.
export interface ConfirmReleaseInput {
  retrieval_id: string;
}
