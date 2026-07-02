export interface RetrievalReceipt {
  cid: string;
  provider: string;
  timestamp: string;
  status: "success";
}

export interface StoredReceipt {
  id: string;
  retrieval_id: string;
  signature: string;
  timestamp: string;
}
