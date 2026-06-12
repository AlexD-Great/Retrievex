import type { ProviderMetrics } from "@retrievex/shared";

export interface ProviderRepository {
  findMetrics(providerId: string): Promise<ProviderMetrics | null>;
  recordSuccess(providerId: string, responseTimeMs: number): Promise<void>;
  recordFailure(providerId: string): Promise<void>;
}
