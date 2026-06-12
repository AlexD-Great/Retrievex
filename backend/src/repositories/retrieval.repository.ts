import type { RetrievalRequest } from "@retrievex/shared";

export interface RetrievalRepository {
  create(request: RetrievalRequest): Promise<RetrievalRequest>;
  findById(id: string): Promise<RetrievalRequest | null>;
  updateStatus(id: string, status: RetrievalRequest["status"]): Promise<void>;
}
