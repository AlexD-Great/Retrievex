import type { FormEvent } from "react";
import { useState } from "react";
import type { RetrievalRequest } from "@retrievex/shared";
import { createRetrievalRequest, getProviderMetrics } from "../api/client";

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
    setSubmitState("submitting");

    try {
      const request = await createRetrievalRequest({
        cid,
        sp_address: provider,
        amount_fil: amountFil,
        client_address: ""
      });
      setSubmitState("submitted");
      onRequestCreated(request);
      setCid("");
      setProvider("");
      setAmountFil("");
    } catch {
      setSubmitState("failed");
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
          CID
          <input
            name="cid"
            type="text"
            value={cid}
            required
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
        <button type="submit" disabled={submitState === "submitting"}>
          {submitState === "submitting" ? "Initiating..." : "Initiate Retrieval"}
        </button>
        {submitState === "failed" && (
          <p className="form-status">Retrieval request could not be submitted.</p>
        )}
      </form>
    </main>
  );
}
