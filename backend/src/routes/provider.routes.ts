import { Router } from "express";
import type { ReputationService } from "../services/reputation.service.js";

export function createProviderRouter(reputationService: ReputationService) {
  const router = Router();

  router.get("/:id/metrics", async (req, res) => {
    const metrics = await reputationService.getMetrics(req.params.id);
    res.json(metrics);
  });

  return router;
}
