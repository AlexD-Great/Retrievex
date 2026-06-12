export interface RetrievalReceipt {
  cid: string;
  provider: string;
  timestamp: string;
  client_confirmation: string;
  status: "success";
}

export interface StoredReceipt {
  id: string;
  retrieval_id: string;
  signature: string;
  timestamp: string;
}
