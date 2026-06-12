import type { RetrievalReceipt, StoredReceipt, SubmitReceiptInput } from "@retrievex/shared";
import { createHash, randomUUID } from "node:crypto";
import type { ReceiptRepository } from "../repositories/receipt.repository.js";
import type { RetrievalRepository } from "../repositories/retrieval.repository.js";
import type { EscrowService } from "./escrow.service.js";
import type { ReputationService } from "./reputation.service.js";

export class ReceiptService {
  constructor(
    private readonly receipts: ReceiptRepository,
    private readonly retrievals: RetrievalRepository,
    private readonly escrow: EscrowService,
    private readonly reputation: ReputationService
  ) {}

  async submitReceipt(input: SubmitReceiptInput): Promise<StoredReceipt> {
    const request = await this.retrievals.findById(input.retrieval_id);
    if (!request) {
      throw new Error("Retrieval request not found.");
    }

    const receipt: RetrievalReceipt = {
      cid: request.cid,
      provider: request.sp_address,
      timestamp: input.timestamp,
      client_confirmation: input.signature,
      status: "success"
    };

    const receiptHash = this.hashReceipt(receipt);
    await this.escrow.releasePayment(request.id, receiptHash);
    await this.retrievals.updateStatus(request.id, "completed");
    await this.reputation.recordSuccess(request.sp_address, 0);

    return this.receipts.create({
      id: randomUUID(),
      retrieval_id: request.id,
      signature: input.signature,
      timestamp: input.timestamp
    });
  }

  private hashReceipt(receipt: RetrievalReceipt): string {
    return createHash("sha256").update(JSON.stringify(receipt)).digest("hex");
  }
}
