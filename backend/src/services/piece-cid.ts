import { tryFrom } from "@filoz/synapse-core/piece";

/**
 * Filecoin retrieval addresses data by PieceCID (CommP), which is what the
 * Synapse data plane serves. A raw IPFS/DAG CID is not retrievable here, so we
 * validate/normalize at the boundary and reject anything that is not a PieceCID.
 */
export function isValidPieceCID(cid: string): boolean {
  return tryFrom(cid) !== null;
}

/** Returns the canonical PieceCID string, or throws if the input is not one. */
export function normalizePieceCID(cid: string): string {
  const pieceCid = tryFrom(cid);
  if (pieceCid === null) {
    throw new Error("cid must be a valid Filecoin PieceCID (CommP).");
  }

  return pieceCid.toString();
}
