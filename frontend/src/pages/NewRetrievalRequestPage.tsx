import type { RetrievalRequest } from "@retrievex/shared";
import type { FormEvent } from "react";
import { useState } from "react";
import { decodeEventLog, parseEther } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { createRetrievalRequest, getProviderMetrics } from "../api/client";
import { escrowAbi, escrowAddress, RETRIEVAL_TIMEOUT_SECONDS } from "../lib/escrow";

interface NewRetrievalRequestPageProps {
  onRequestCreated: (request: RetrievalRequest) => void;
}

export function NewRetrievalRequestPage({ onRequestCreated }: NewRetrievalRequestPageProps) {
  const [cid, setCid] = useState("");
  const [provider, setProvider] = useState("");
  const [amountFil, setAmountFil] = useState("");
  const [reliabilityScore, setReliabilityScore] = useState<string>("Not loaded");
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "submitted" | "failed">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  async function loadProviderMetrics(spAddress: string) {
    if (!spAddress) {
      setReliabilityScore("Not loaded");
      return;
    }

    try {
      const metrics = await getProviderMetrics(spAddress);
      setReliabilityScore(String(metrics.reputation_score));
    } catch {
      setReliabilityScore("Unavailable");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isConnected || !address || !publicClient) {
      setError("Connect your wallet to initiate a retrieval.");
      return;
    }

    setSubmitState("submitting");

    try {
      const timeoutAt = BigInt(Math.floor(Date.now() / 1000) + RETRIEVAL_TIMEOUT_SECONDS);

      // 1. Lock escrow on-chain from the client's own wallet.
      const hash = await writeContractAsync({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: "createRequest",
        args: [cid, provider as `0x${string}`, timeoutAt],
        value: parseEther(amountFil)
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // 2. Recover the on-chain requestId from the RetrievalRequested event.
      let requestId: string | undefined;
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({ abi: escrowAbi, data: log.data, topics: log.topics });
          if (decoded.eventName === "RetrievalRequested") {
            requestId = (decoded.args as { requestId: bigint }).requestId.toString();
            break;
          }
        } catch {
          // Not an escrow event; skip.
        }
      }

      if (!requestId) {
        throw new Error("Could not read requestId from the transaction.");
      }

      // 3. Record the (already funded) request with the backend.
      const request = await createRetrievalRequest({
        request_id: requestId,
        cid,
        client_address: address,
        sp_address: provider,
        amount_fil: amountFil
      });

      setSubmitState("submitted");
      onRequestCreated(request);
      setCid("");
      setProvider("");
      setAmountFil("");
    } catch (submitError) {
      setSubmitState("failed");
      setError(submitError instanceof Error ? submitError.message : "Request could not be submitted.");
    }
  }

  return (
    <main className="page" id="new-retrieval">
      <header className="page-header">
        <div>
          <p className="eyebrow">Client Journey</p>
          <h1>New Retrieval Request</h1>
        </div>
      </header>

      <form className="request-form" onSubmit={handleSubmit}>
        <label>
          CID (Filecoin PieceCID)
          <input
            name="cid"
            type="text"
            value={cid}
            required
            placeholder="bafkzcib..."
            onChange={(event) => setCid(event.target.value)}
          />
        </label>
        <label>
          Storage Provider
          <input
            name="sp_address"
            type="text"
            value={provider}
            required
            onBlur={() => loadProviderMetrics(provider)}
            onChange={(event) => setProvider(event.target.value)}
          />
        </label>
        <label>
          Payment Amount (FIL)
          <input
            name="amount_fil"
            type="number"
            min="0"
            step="0.000000000000000001"
            value={amountFil}
            required
            onChange={(event) => setAmountFil(event.target.value)}
          />
        </label>
        <div className="request-summary">
          <div>
            <span>Estimated retrieval time</span>
            <strong>Pending SP response</strong>
          </div>
          <div>
            <span>SP reliability score</span>
            <strong>{reliabilityScore}</strong>
          </div>
        </div>
        <button type="submit" disabled={submitState === "submitting" || !isConnected}>
          {submitState === "submitting"
            ? "Initiating…"
            : isConnected
              ? "Initiate Retrieval"
              : "Connect wallet to initiate"}
        </button>
        {error && <p className="form-status">{error}</p>}
      </form>
    </main>
  );
}
