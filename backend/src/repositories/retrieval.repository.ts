import type { RetrievalRequest } from "@retrievex/shared";
import type pg from "pg";

export interface RetrievalRepository {
  create(request: RetrievalRequest): Promise<RetrievalRequest>;
  findById(id: string): Promise<RetrievalRequest | null>;
  updateStatus(id: string, status: RetrievalRequest["status"]): Promise<void>;
}

export class PostgresRetrievalRepository implements RetrievalRepository {
  constructor(private readonly db: pg.Pool) {}

  async create(request: RetrievalRequest): Promise<RetrievalRequest> {
    const result = await this.db.query<RetrievalRequest>(
      `INSERT INTO RetrievalRequests
        (id, cid, client_address, sp_address, amount_fil, status, escrow_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, cid, client_address, sp_address, amount_fil, status, escrow_status`,
      [
        request.id,
        request.cid,
        request.client_address,
        request.sp_address,
        request.amount_fil,
        request.status,
        request.escrow_status
      ]
    );

    return result.rows[0];
  }

  async findById(id: string): Promise<RetrievalRequest | null> {
    const result = await this.db.query<RetrievalRequest>(
      `SELECT id, cid, client_address, sp_address, amount_fil, status, escrow_status
       FROM RetrievalRequests
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] ?? null;
  }

  async updateStatus(id: string, status: RetrievalRequest["status"]): Promise<void> {
    await this.db.query(
      `UPDATE RetrievalRequests
       SET status = $2, escrow_status = CASE WHEN $2 = 'completed' THEN 'completed' ELSE escrow_status END
       WHERE id = $1`,
      [id, status]
    );
  }
}
