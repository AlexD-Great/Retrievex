export const RETRIEVAL_STATUSES = [
  "pending",
  "in-progress",
  "completed",
  "failed",
  "timeout"
] as const;

export type RetrievalStatus = (typeof RETRIEVAL_STATUSES)[number];

export const ESCROW_STATUSES = ["pending", "completed", "refunded"] as const;

export type EscrowStatus = (typeof ESCROW_STATUSES)[number];
