import { Router } from "express";

export const providerRouter = Router();

providerRouter.get("/:id/metrics", async (req, res) => {
  res.status(501).json({
    id: req.params.id,
    error: "GET /sp/:id/metrics must return Phase 1 provider metrics."
  });
});
