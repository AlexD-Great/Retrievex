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
    return this.providers.findMetrics(providerId);
  }
}
