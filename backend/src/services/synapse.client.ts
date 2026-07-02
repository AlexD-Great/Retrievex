import { calibration } from "@filoz/synapse-core/chains";
import { Synapse } from "@filoz/synapse-sdk";
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { BackendConfig } from "../config.js";

/**
 * Creates a Synapse client for the Filecoin Calibration testnet, authenticated
 * with the SP operator key (viem account). Synapse is the Phase 1 data plane:
 * the SP serves CID bytes (CDN-accelerated) for retrieval verification.
 */
export function createSynapse(config: BackendConfig): Synapse {
  const account = privateKeyToAccount(config.spPrivateKey as `0x${string}`);

  return Synapse.create({
    account,
    chain: calibration,
    transport: http(config.filecoinRpcUrl),
    source: "retrievex",
    withCDN: config.synapseWithCDN
  });
}
