import type { FormEvent } from "react";
import { useState } from "react";
import type { ProviderMetrics } from "@retrievex/shared";
import { getProviderMetrics } from "../api/client";

export function ProviderAnalyticsPage() {
  const [providerId, setProviderId] = useState("");
  const [metrics, setMetrics] = useState<ProviderMetrics | null>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "loaded" | "failed">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadState("loading");

    try {
      const providerMetrics = await getProviderMetrics(providerId);
      setMetrics(providerMetrics);
      setLoadState("loaded");
    } catch {
      setMetrics(null);
      setLoadState("failed");
    }
  }

  return (
    <main className="page" id="provider-analytics">
      <header className="page-header">
        <div>
          <p className="eyebrow">Storage Provider</p>
          <h1>Provider Analytics</h1>
        </div>
      </header>

      <form className="provider-form" onSubmit={handleSubmit}>
        <label>
          Storage Provider
          <input
            name="provider_id"
            type="text"
            value={providerId}
            required
            onChange={(event) => setProviderId(event.target.value)}
          />
        </label>
        <button type="submit" disabled={loadState === "loading"}>
          {loadState === "loading" ? "Loading..." : "Load Metrics"}
        </button>
      </form>

      <section className="metrics-grid" aria-label="Storage Provider performance">
        <div className="metric">
          <span className="metric-label">Retrievals Served</span>
          <strong>{metrics?.total_retrievals ?? 0}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">Success Rate</span>
          <strong>{metrics ? `${metrics.success_rate}%` : "0%"}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">Average Response Time</span>
          <strong>{metrics ? `${metrics.average_response_time_ms}ms` : "0ms"}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">Reputation Score</span>
          <strong>{metrics?.reputation_score ?? 0}</strong>
        </div>
      </section>
      {loadState === "failed" && <p className="form-status">Provider metrics unavailable.</p>}
    </main>
  );
}
