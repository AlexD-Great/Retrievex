import type { StoredReceipt } from "@retrievex/shared";

export interface ReceiptRepository {
  create(receipt: StoredReceipt): Promise<StoredReceipt>;
  findByRetrievalId(retrievalId: string): Promise<StoredReceipt | null>;
}
