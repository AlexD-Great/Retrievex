import type { RetrievalReceipt, StoredReceipt, SubmitReceiptInput } from "@retrievex/shared";
import { createHash, randomUUID } from "node:crypto";
import type { ReceiptRepository } from "../repositories/receipt.repository.js";
import type { RetrievalRepository } from "../repositories/retrieval.repository.js";
import type { EscrowService } from "./escrow.service.js";
import type { ReputationService } from "./reputation.service.js";
import type { RetrievalTransport } from "./retrieval-transport.js";

export class ReceiptService {
  constructor(
    private readonly receipts: ReceiptRepository,
    private readonly retrievals: RetrievalRepository,
    private readonly escrow: EscrowService,
    private readonly reputation: ReputationService,
    private readonly retrieval: RetrievalTransport
  ) {}

  /**
   * SP-triggered: serves and verifies the data via Synapse, signs the receipt
   * as the SP operator, and submits the receipt hash on-chain. The client then
   * releases escrow from their wallet (see RetrievalService.confirmRelease).
   */
  async submitReceipt(input: SubmitReceiptInput): Promise<StoredReceipt> {
    const request = await this.retrievals.findById(input.retrieval_id);
    if (!request) {
      throw new Error("Retrieval request not found.");
    }
    if (request.status !== "pending") {
      throw new Error("Receipt can only be submitted for a pending request.");
    }

    // Serve the CID bytes via Synapse and measure latency. Failure to serve
    // means the SP did not fulfil the request: record a failure and do not
    // submit a receipt on-chain.
    let latencyMs: number;
    try {
      const result = await this.retrieval.retrieve(request.cid);
      latencyMs = result.latencyMs;
    } catch {
      await this.reputation.recordFailure(request.sp_address);
      throw new Error("Retrieval verification failed: data could not be served for the CID.");
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const receipt: RetrievalReceipt = {
      cid: request.cid,
      provider: request.sp_address,
      timestamp,
      status: "success"
    };
    const serialized = this.serialize(receipt);
    const signature = await this.escrow.signAsProvider(serialized);
    const receiptHash = `0x${createHash("sha256").update(serialized).digest("hex")}`;

    await this.escrow.submitReceipt(request.id, receiptHash);
    await this.retrievals.updateStatus(request.id, "in-progress");
    await this.reputation.recordSuccess(request.sp_address, latencyMs);

    return this.receipts.create({
      id: randomUUID(),
      retrieval_id: request.id,
      signature,
      timestamp
    });
  }

  private serialize(payload: RetrievalReceipt): string {
    return JSON.stringify(payload);
  }
}
