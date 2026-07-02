export interface RetrievalResult {
  cid: string;
  sizeBytes: number;
  latencyMs: number;
}

/**
 * Abstraction over the data plane that actually serves CID bytes.
 * Synapse is the Phase 1 implementation; tests can inject a fake, and a
 * direct-IPFS/HTTP transport could be added later without touching services.
 */
export interface RetrievalTransport {
  retrieve(cid: string): Promise<RetrievalResult>;
}
