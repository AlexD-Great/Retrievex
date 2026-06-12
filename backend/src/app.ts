import cors from "cors";
import express from "express";
import { loadConfig } from "./config.js";
import { db } from "./db/database.js";
import { PostgresProviderRepository } from "./repositories/provider.repository.js";
import { PostgresReceiptRepository } from "./repositories/receipt.repository.js";
import { PostgresRetrievalRepository } from "./repositories/retrieval.repository.js";
import { createProviderRouter } from "./routes/provider.routes.js";
import { createRetrievalRouter } from "./routes/retrieval.routes.js";
import { EscrowService } from "./services/escrow.service.js";
import { ReceiptService } from "./services/receipt.service.js";
import { ReputationService } from "./services/reputation.service.js";
import { RetrievalService } from "./services/retrieval.service.js";

export function createApp() {
  const app = express();
  const config = loadConfig();
  const retrievalRepository = new PostgresRetrievalRepository(db);
  const receiptRepository = new PostgresReceiptRepository(db);
  const providerRepository = new PostgresProviderRepository(db);
  const escrowService = new EscrowService(config);
  const reputationService = new ReputationService(providerRepository);
  const retrievalService = new RetrievalService(retrievalRepository, escrowService);
  const receiptService = new ReceiptService(
    receiptRepository,
    retrievalRepository,
    escrowService,
    reputationService
  );

  app.use(cors());
  app.use(express.json());

  app.use("/retrieval", createRetrievalRouter(retrievalService, receiptService));
  app.use("/sp", createProviderRouter(reputationService));

  return app;
}
