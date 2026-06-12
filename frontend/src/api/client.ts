import type {
  CreateRetrievalRequestInput,
  ProviderMetrics,
  RetrievalRequest,
  SubmitReceiptInput
} from "@retrievex/shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export async function createRetrievalRequest(
  input: CreateRetrievalRequestInput
): Promise<RetrievalRequest> {
  const response = await fetch(`${API_BASE_URL}/retrieval/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  return response.json();
}

export async function submitReceipt(input: SubmitReceiptInput) {
  const response = await fetch(`${API_BASE_URL}/retrieval/receipt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  return response.json();
}

export async function getRetrievalStatus(id: string): Promise<RetrievalRequest> {
  const response = await fetch(`${API_BASE_URL}/retrieval/status/${id}`);
  return response.json();
}

export async function getProviderMetrics(id: string): Promise<ProviderMetrics> {
  const response = await fetch(`${API_BASE_URL}/sp/${id}/metrics`);
  return response.json();
}
