import { ESCROW_ABI } from "@retrievex/shared";
import { parseAbi } from "viem";

export const escrowAbi = parseAbi([...ESCROW_ABI]);

export const escrowAddress = import.meta.env.VITE_ESCROW_ADDRESS as `0x${string}`;

export const RETRIEVAL_TIMEOUT_SECONDS = Number(
  import.meta.env.VITE_RETRIEVAL_TIMEOUT_SECONDS ?? 86400
);
