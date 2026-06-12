import type {
  CreateRetrievalRequestInput,
  RetrievalRequest
} from "@retrievex/shared";
import { randomUUID } from "node:crypto";
import type { RetrievalRepository } from "../repositories/retrieval.repository.js";
import type { EscrowService } from "./escrow.service.js";

export class RetrievalService {
  constructor(
    private readonly retrievals: RetrievalRepository,
    private readonly escrow: EscrowService
  ) {}

  async createRequest(input: CreateRetrievalRequestInput): Promise<RetrievalRequest> {
    if (input.client_address.toLowerCase() !== this.escrow.getClientAddress().toLowerCase()) {
      throw new Error("Client address must match configured client signer.");
    }

    if (input.sp_address.toLowerCase() !== this.escrow.getProviderAddress().toLowerCase()) {
      throw new Error("Storage Provider address must match configured SP signer.");
    }

    const escrow = await this.escrow.lockFunds(input);
    const request: RetrievalRequest = {
      id: escrow.escrow_request_id || randomUUID(),
      cid: input.cid,
      client_address: input.client_address,
      sp_address: input.sp_address,
      amount_fil: input.amount_fil,
      status: "pending",
      escrow_status: escrow.escrow_status
    };

    return this.retrievals.create(request);
  }

  async getStatus(id: string): Promise<RetrievalRequest | null> {
    return this.retrievals.findById(id);
  }
}
