export interface RetrievalActivityMetrics {
  activeRetrievals: number;
  successFailureRatio: number;
  responseTimeDistributionMs: number[];
}

export class MonitoringService {
  snapshot(): RetrievalActivityMetrics {
    return {
      activeRetrievals: 0,
      successFailureRatio: 0,
      responseTimeDistributionMs: []
    };
  }
}
