import type { StoredReceipt } from "@retrievex/shared";
import type pg from "pg";

export interface ReceiptRepository {
  create(receipt: StoredReceipt): Promise<StoredReceipt>;
  findByRetrievalId(retrievalId: string): Promise<StoredReceipt | null>;
}

export class PostgresReceiptRepository implements ReceiptRepository {
  constructor(private readonly db: pg.Pool) {}

  async create(receipt: StoredReceipt): Promise<StoredReceipt> {
    const result = await this.db.query<StoredReceipt>(
      `INSERT INTO Receipts (id, retrieval_id, signature, timestamp)
       VALUES ($1, $2, $3, $4)
       RETURNING id, retrieval_id, signature, timestamp`,
      [receipt.id, receipt.retrieval_id, receipt.signature, receipt.timestamp]
    );

    return result.rows[0];
  }

  async findByRetrievalId(retrievalId: string): Promise<StoredReceipt | null> {
    const result = await this.db.query<StoredReceipt>(
      `SELECT id, retrieval_id, signature, timestamp
       FROM Receipts
       WHERE retrieval_id = $1
       ORDER BY timestamp DESC
       LIMIT 1`,
      [retrievalId]
    );

    return result.rows[0] ?? null;
  }
}
