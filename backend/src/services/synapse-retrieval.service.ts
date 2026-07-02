import type { Synapse } from "@filoz/synapse-sdk";
import { performance } from "node:perf_hooks";
import type { BackendConfig } from "../config.js";
import type { RetrievalResult, RetrievalTransport } from "./retrieval-transport.js";
import { createSynapse } from "./synapse.client.js";

/**
 * Retrieves CID bytes through the Filecoin Synapse SDK and measures serve
 * latency. This is the concrete "Storage Provider serves data" step and the
 * source of the real response-time signal used by reputation.
 */
export class SynapseRetrievalService implements RetrievalTransport {
  private client: Synapse | null = null;

  constructor(private readonly config: BackendConfig) {}

  private getClient(): Synapse {
    if (!this.client) {
      this.client = createSynapse(this.config);
    }

    return this.client;
  }

  async retrieve(cid: string): Promise<RetrievalResult> {
    const client = this.getClient();
    const start = performance.now();
    const bytes = await client.storage.download({
      pieceCid: cid,
      withCDN: this.config.synapseWithCDN
    });
    const latencyMs = Math.round(performance.now() - start);

    return { cid, sizeBytes: bytes.byteLength, latencyMs };
  }
}
