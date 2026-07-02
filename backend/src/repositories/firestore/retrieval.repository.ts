import type { RetrievalRequest } from "@retrievex/shared";
import type { Firestore } from "firebase-admin/firestore";
import type { RetrievalRepository } from "../retrieval.repository.js";

const COLLECTION = "retrievalRequests";

export class FirestoreRetrievalRepository implements RetrievalRepository {
  constructor(private readonly db: Firestore) {}

  async create(request: RetrievalRequest): Promise<RetrievalRequest> {
    await this.db.collection(COLLECTION).doc(request.id).set(request);
    return request;
  }

  async findById(id: string): Promise<RetrievalRequest | null> {
    const snapshot = await this.db.collection(COLLECTION).doc(id).get();
    return snapshot.exists ? (snapshot.data() as RetrievalRequest) : null;
  }

  async updateStatus(id: string, status: RetrievalRequest["status"]): Promise<void> {
    const update: Partial<RetrievalRequest> = { status };
    if (status === "completed") {
      update.escrow_status = "completed";
    }

    await this.db.collection(COLLECTION).doc(id).update(update);
  }
}
