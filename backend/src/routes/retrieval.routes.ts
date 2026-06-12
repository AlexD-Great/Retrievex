import { Router } from "express";

export const retrievalRouter = Router();

retrievalRouter.post("/request", async (_req, res) => {
  res.status(501).json({
    error: "POST /retrieval/request must create escrow-backed retrieval requests."
  });
});

retrievalRouter.post("/receipt", async (_req, res) => {
  res.status(501).json({
    error: "POST /retrieval/receipt must validate a receipt and trigger settlement."
  });
});

retrievalRouter.get("/status/:id", async (req, res) => {
  res.status(501).json({
    id: req.params.id,
    error: "GET /retrieval/status/:id must return retrieval status."
  });
});
