import type { RetrievalRequest } from "@retrievex/shared";
import { useState } from "react";
import { usePublicClient, useWriteContract } from "wagmi";
import { confirmRelease, getRetrievalStatus, submitReceipt } from "../api/client";
import { escrowAbi, escrowAddress } from "../lib/escrow";

interface RequestActionsProps {
  request: RetrievalRequest;
  onUpdated: (request: RetrievalRequest) => void;
}

/**
 * Per-request lifecycle controls:
 *  - pending:     SP operator serves the data and submits the receipt (backend).
 *  - in-progress: the client releases escrow on-chain from their own wallet.
 */
export function RequestActions({ request, onUpdated }: RequestActionsProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  async function handleSubmitReceipt() {
    setBusy(true);
    setError(null);
    try {
      await submitReceipt({ retrieval_id: request.id });
      onUpdated(await getRetrievalStatus(request.id));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Receipt submission failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm() {
    if (!publicClient) {
      setError("Wallet client unavailable.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const hash = await writeContractAsync({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: "confirmReceipt",
        args: [BigInt(request.id)]
      });
      await publicClient.waitForTransactionReceipt({ hash });
      onUpdated(await confirmRelease({ retrieval_id: request.id }));
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Confirmation failed.");
    } finally {
      setBusy(false);
    }
  }

  if (request.status === "pending") {
    return (
      <div className="row-actions">
        <button type="button" disabled={busy} onClick={handleSubmitReceipt}>
          {busy ? "Submitting…" : "Submit Receipt (SP)"}
        </button>
        {error && <span className="row-error">{error}</span>}
      </div>
    );
  }

  if (request.status === "in-progress") {
    return (
      <div className="row-actions">
        <button type="button" disabled={busy} onClick={handleConfirm}>
          {busy ? "Confirming…" : "Confirm & Release"}
        </button>
        {error && <span className="row-error">{error}</span>}
      </div>
    );
  }

  return null;
}
