import type { ProviderMetrics } from "@retrievex/shared";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { ProviderRepository } from "../provider.repository.js";

const COLLECTION = "providers";

interface ProviderMetricDoc {
  id: string;
  reputation_score: number;
  total_retrievals: number;
  successful_retrievals: number;
  failed_retrievals: number;
  total_response_time_ms: number;
}

export class FirestoreProviderRepository implements ProviderRepository {
  constructor(private readonly db: Firestore) {}

  async findMetrics(providerId: string): Promise<ProviderMetrics | null> {
    const snapshot = await this.db.collection(COLLECTION).doc(providerId).get();
    if (!snapshot.exists) {
      return null;
    }

    const row = snapshot.data() as ProviderMetricDoc;
    const total = Number(row.total_retrievals ?? 0);
    const successful = Number(row.successful_retrievals ?? 0);

    return {
      id: row.id,
      reputation_score: Number(row.reputation_score ?? 0),
      total_retrievals: total,
      success_rate: total === 0 ? 0 : Math.round((successful / total) * 100),
      average_response_time_ms:
        successful === 0 ? 0 : Math.round(Number(row.total_response_time_ms ?? 0) / successful)
    };
  }

  async recordSuccess(providerId: string, responseTimeMs: number): Promise<void> {
    await this.db.collection(COLLECTION).doc(providerId).set(
      {
        id: providerId,
        reputation_score: FieldValue.increment(1),
        total_retrievals: FieldValue.increment(1),
        successful_retrievals: FieldValue.increment(1),
        failed_retrievals: FieldValue.increment(0),
        total_response_time_ms: FieldValue.increment(Math.max(0, Math.round(responseTimeMs)))
      },
      { merge: true }
    );
  }

  async recordFailure(providerId: string): Promise<void> {
    await this.db.collection(COLLECTION).doc(providerId).set(
      {
        id: providerId,
        reputation_score: FieldValue.increment(-1),
        total_retrievals: FieldValue.increment(1),
        successful_retrievals: FieldValue.increment(0),
        failed_retrievals: FieldValue.increment(1),
        total_response_time_ms: FieldValue.increment(0)
      },
      { merge: true }
    );
  }
}
