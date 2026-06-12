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
  cid: string;
  client_address: string;
  sp_address: string;
  amount_fil: string;
}

export interface SubmitReceiptInput {
  retrieval_id: string;
  signature: string;
  timestamp: string;
}
