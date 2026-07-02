import type { CreateRetrievalRequestInput, RetrievalRequest } from "@retrievex/shared";
import { EscrowRequestStatus } from "@retrievex/shared";
import { parseEther } from "ethers";
import type { RetrievalRepository } from "../repositories/retrieval.repository.js";
import type { EscrowService } from "./escrow.service.js";
import { normalizePieceCID } from "./piece-cid.js";

export class RetrievalService {
  constructor(
    private readonly retrievals: RetrievalRepository,
    private readonly escrow: EscrowService
  ) {}

  /**
   * Records a retrieval request whose escrow was already locked on-chain by the
   * client's wallet. The backend verifies the on-chain state matches the
   * submitted metadata before persisting, so a client cannot record a request
   * they did not actually fund.
   */
  async createRequest(input: CreateRetrievalRequestInput): Promise<RetrievalRequest> {
    const cid = normalizePieceCID(input.cid);

    if (input.sp_address.toLowerCase() !== this.escrow.getProviderAddress().toLowerCase()) {
      throw new Error("Storage Provider address must match configured SP signer.");
    }

    const onChain = await this.escrow.getOnChainRequest(input.request_id);

    if (onChain.status !== EscrowRequestStatus.Pending) {
      throw new Error("On-chain request is not in a pending state.");
    }
    if (onChain.client.toLowerCase() !== input.client_address.toLowerCase()) {
      throw new Error("On-chain client does not match the connected wallet.");
    }
    if (onChain.provider.toLowerCase() !== input.sp_address.toLowerCase()) {
      throw new Error("On-chain provider does not match the request.");
    }
    if (onChain.cid !== cid) {
      throw new Error("On-chain CID does not match the request.");
    }
    if (onChain.amount !== parseEther(input.amount_fil)) {
      throw new Error("On-chain escrow amount does not match the request.");
    }

    const request: RetrievalRequest = {
      id: input.request_id,
      cid,
      client_address: onChain.client,
      sp_address: input.sp_address,
      amount_fil: input.amount_fil,
      status: "pending",
      escrow_status: "pending"
    };

    return this.retrievals.create(request);
  }

  async getStatus(id: string): Promise<RetrievalRequest | null> {
    return this.retrievals.findById(id);
  }

  /**
   * Finalizes a request after the client has called confirmReceipt on-chain
   * from their wallet, releasing escrow to the SP. Verifies the on-chain
   * Completed status before updating local state.
   */
  async confirmRelease(id: string): Promise<RetrievalRequest> {
    const request = await this.retrievals.findById(id);
    if (!request) {
      throw new Error("Retrieval request not found.");
    }

    const onChain = await this.escrow.getOnChainRequest(id);
    if (onChain.status !== EscrowRequestStatus.Completed) {
      throw new Error("Escrow has not been released on-chain yet.");
    }

    await this.retrievals.updateStatus(id, "completed");
    return { ...request, status: "completed", escrow_status: "completed" };
  }
}
