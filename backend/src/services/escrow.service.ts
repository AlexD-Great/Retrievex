import type { CreateRetrievalRequestInput } from "@retrievex/shared";

export interface EscrowLockResult {
  escrow_request_id: string;
  escrow_status: "pending";
}

export class EscrowService {
  async lockFunds(input: CreateRetrievalRequestInput): Promise<EscrowLockResult> {
    void input;
    throw new Error("Escrow lock must call the deployed FVM escrow contract.");
  }

  async releasePayment(retrievalId: string, receiptHash: string): Promise<void> {
    void retrievalId;
    void receiptHash;
    throw new Error("Escrow release must call the deployed FVM escrow contract.");
  }

  async refundOnTimeout(retrievalId: string): Promise<void> {
    void retrievalId;
    throw new Error("Timeout refund must call the deployed FVM escrow contract.");
  }
}
