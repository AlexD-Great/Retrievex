import type { StoredReceipt } from "@retrievex/shared";
import type { Firestore } from "firebase-admin/firestore";
import type { ReceiptRepository } from "../receipt.repository.js";

const COLLECTION = "receipts";

export class FirestoreReceiptRepository implements ReceiptRepository {
  constructor(private readonly db: Firestore) {}

  async create(receipt: StoredReceipt): Promise<StoredReceipt> {
    await this.db.collection(COLLECTION).doc(receipt.id).set(receipt);
    return receipt;
  }

  async findByRetrievalId(retrievalId: string): Promise<StoredReceipt | null> {
    const snapshot = await this.db
      .collection(COLLECTION)
      .where("retrieval_id", "==", retrievalId)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    return snapshot.empty ? null : (snapshot.docs[0].data() as StoredReceipt);
  }
}
