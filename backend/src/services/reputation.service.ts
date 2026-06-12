import type { ProviderMetrics } from "@retrievex/shared";
import type { ProviderRepository } from "../repositories/provider.repository.js";

export class ReputationService {
  constructor(private readonly providers: ProviderRepository) {}

  async recordSuccess(providerId: string, responseTimeMs: number): Promise<void> {
    await this.providers.recordSuccess(providerId, responseTimeMs);
  }

  async recordFailure(providerId: string): Promise<void> {
    await this.providers.recordFailure(providerId);
  }

  async getMetrics(providerId: string): Promise<ProviderMetrics | null> {
    return (
      (await this.providers.findMetrics(providerId)) ?? {
        id: providerId,
        reputation_score: 0,
        total_retrievals: 0,
        success_rate: 0,
        average_response_time_ms: 0
      }
    );
  }
}
