import { Router } from "express";
import { z } from "zod";
import { isValidPieceCID } from "../services/piece-cid.js";
import type { ReceiptService } from "../services/receipt.service.js";
import type { RetrievalService } from "../services/retrieval.service.js";

const createRequestSchema = z.object({
  request_id: z.string().min(1),
  cid: z
    .string()
    .min(1)
    .refine(isValidPieceCID, "cid must be a valid Filecoin PieceCID (CommP)"),
  client_address: z.string().min(1),
  sp_address: z.string().min(1),
  amount_fil: z.string().refine((amount) => Number(amount) > 0, "amount_fil must be positive")
});

const submitReceiptSchema = z.object({
  retrieval_id: z.string().min(1)
});

const confirmSchema = z.object({
  retrieval_id: z.string().min(1)
});

export function createRetrievalRouter(
  retrievalService: RetrievalService,
  receiptService: ReceiptService
) {
  const router = Router();

  router.post("/request", async (req, res) => {
    const parsed = createRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    try {
      const request = await retrievalService.createRequest(parsed.data);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Request failed." });
    }
  });

  router.post("/receipt", async (req, res) => {
    const parsed = submitReceiptSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    try {
      const receipt = await receiptService.submitReceipt(parsed.data);
      res.status(201).json(receipt);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Receipt submission failed.";
      res.status(message === "Retrieval request not found." ? 404 : 400).json({ error: message });
    }
  });

  router.post("/confirm", async (req, res) => {
    const parsed = confirmSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    try {
      const request = await retrievalService.confirmRelease(parsed.data.retrieval_id);
      res.json(request);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Confirmation failed.";
      res.status(message === "Retrieval request not found." ? 404 : 400).json({ error: message });
    }
  });

  router.get("/status/:id", async (req, res) => {
    const request = await retrievalService.getStatus(req.params.id);
    if (!request) {
      res.status(404).json({ error: "Retrieval request not found." });
      return;
    }

    res.json(request);
  });

  return router;
}
