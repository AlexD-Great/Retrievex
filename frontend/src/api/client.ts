import type {
  ConfirmReleaseInput,
  CreateRetrievalRequestInput,
  ProviderMetrics,
  RetrievalRequest,
  StoredReceipt,
  SubmitReceiptInput
} from "@retrievex/shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed");
  }

  return payload as T;
}

export async function createRetrievalRequest(
  input: CreateRetrievalRequestInput
): Promise<RetrievalRequest> {
  const response = await fetch(`${API_BASE_URL}/retrieval/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  return parseJsonResponse<RetrievalRequest>(response);
}

export async function submitReceipt(input: SubmitReceiptInput): Promise<StoredReceipt> {
  const response = await fetch(`${API_BASE_URL}/retrieval/receipt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  return parseJsonResponse<StoredReceipt>(response);
}

export async function confirmRelease(input: ConfirmReleaseInput): Promise<RetrievalRequest> {
  const response = await fetch(`${API_BASE_URL}/retrieval/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  return parseJsonResponse<RetrievalRequest>(response);
}

export async function getRetrievalStatus(id: string): Promise<RetrievalRequest> {
  const response = await fetch(`${API_BASE_URL}/retrieval/status/${id}`);
  return parseJsonResponse<RetrievalRequest>(response);
}

export async function getProviderMetrics(id: string): Promise<ProviderMetrics> {
  const response = await fetch(`${API_BASE_URL}/sp/${id}/metrics`);
  return parseJsonResponse<ProviderMetrics>(response);
}
