import type { ProviderMetrics } from "@retrievex/shared";
import type pg from "pg";

export interface ProviderRepository {
  findMetrics(providerId: string): Promise<ProviderMetrics | null>;
  recordSuccess(providerId: string, responseTimeMs: number): Promise<void>;
  recordFailure(providerId: string): Promise<void>;
}

interface ProviderMetricRow {
  id: string;
  reputation_score: number;
  total_retrievals: number;
  successful_retrievals: number;
  total_response_time_ms: number;
}

export class PostgresProviderRepository implements ProviderRepository {
  constructor(private readonly db: pg.Pool) {}

  async findMetrics(providerId: string): Promise<ProviderMetrics | null> {
    const result = await this.db.query<ProviderMetricRow>(
      `SELECT id, reputation_score, total_retrievals, successful_retrievals, total_response_time_ms
       FROM Providers
       WHERE id = $1`,
      [providerId]
    );
    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      reputation_score: Number(row.reputation_score),
      total_retrievals: Number(row.total_retrievals),
      success_rate:
        Number(row.total_retrievals) === 0
          ? 0
          : Math.round((Number(row.successful_retrievals) / Number(row.total_retrievals)) * 100),
      average_response_time_ms:
        Number(row.successful_retrievals) === 0
          ? 0
          : Math.round(Number(row.total_response_time_ms) / Number(row.successful_retrievals))
    };
  }

  async recordSuccess(providerId: string, responseTimeMs: number): Promise<void> {
    await this.db.query(
      `INSERT INTO Providers
        (id, reputation_score, total_retrievals, successful_retrievals, failed_retrievals, total_response_time_ms)
       VALUES ($1, 1, 1, 1, 0, $2)
       ON CONFLICT (id) DO UPDATE SET
         reputation_score = Providers.reputation_score + 1,
         total_retrievals = Providers.total_retrievals + 1,
         successful_retrievals = Providers.successful_retrievals + 1,
         total_response_time_ms = Providers.total_response_time_ms + EXCLUDED.total_response_time_ms`,
      [providerId, Math.max(0, Math.round(responseTimeMs))]
    );
  }

  async recordFailure(providerId: string): Promise<void> {
    await this.db.query(
      `INSERT INTO Providers
        (id, reputation_score, total_retrievals, successful_retrievals, failed_retrievals, total_response_time_ms)
       VALUES ($1, -1, 1, 0, 1, 0)
       ON CONFLICT (id) DO UPDATE SET
         reputation_score = Providers.reputation_score - 1,
         total_retrievals = Providers.total_retrievals + 1,
         failed_retrievals = Providers.failed_retrievals + 1`,
      [providerId]
    );
  }
}
