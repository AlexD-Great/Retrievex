import type { RetrievalReceipt, StoredReceipt, SubmitReceiptInput } from "@retrievex/shared";
import { createHash, randomUUID } from "node:crypto";
import { verifyMessage } from "ethers";
import type { ReceiptRepository } from "../repositories/receipt.repository.js";
import type { RetrievalRepository } from "../repositories/retrieval.repository.js";
import type { EscrowService } from "./escrow.service.js";
import type { ReputationService } from "./reputation.service.js";

interface ReceiptSigningPayload {
  cid: string;
  provider: string;
  timestamp: string;
  status: "success";
}

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
      client_confirmation: input.client_confirmation,
      status: "success"
    };
    const signingPayload: ReceiptSigningPayload = {
      cid: receipt.cid,
      provider: receipt.provider,
      timestamp: receipt.timestamp,
      status: receipt.status
    };
    const signingMessage = this.serialize(signingPayload);

    const recoveredProvider = verifyMessage(signingMessage, input.provider_signature);
    if (recoveredProvider.toLowerCase() !== request.sp_address.toLowerCase()) {
      throw new Error("Invalid provider receipt signature.");
    }

    const recoveredClient = verifyMessage(signingMessage, input.client_confirmation);
    if (recoveredClient.toLowerCase() !== request.client_address.toLowerCase()) {
      throw new Error("Invalid client confirmation signature.");
    }

    const receiptHash = this.hashReceipt(receipt);
    await this.escrow.releasePayment(request.id, receiptHash);
    await this.retrievals.updateStatus(request.id, "completed");
    await this.reputation.recordSuccess(request.sp_address, 0);

    return this.receipts.create({
      id: randomUUID(),
      retrieval_id: request.id,
      signature: input.provider_signature,
      timestamp: input.timestamp
    });
  }

  private hashReceipt(receipt: RetrievalReceipt): string {
    return `0x${createHash("sha256").update(this.serialize(receipt)).digest("hex")}`;
  }

  private serialize(payload: RetrievalReceipt | ReceiptSigningPayload): string {
    return JSON.stringify(payload);
  }
}
