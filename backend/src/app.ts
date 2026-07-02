import cors from "cors";
import express, { type Express } from "express";
import type { BackendConfig } from "./config.js";
import { createDataLayer, type DataLayer } from "./db/data-layer.js";
import { createProviderRouter } from "./routes/provider.routes.js";
import { createRetrievalRouter } from "./routes/retrieval.routes.js";
import { EscrowService } from "./services/escrow.service.js";
import { ReceiptService } from "./services/receipt.service.js";
import { ReputationService } from "./services/reputation.service.js";
import { RetrievalService } from "./services/retrieval.service.js";
import type { RetrievalTransport } from "./services/retrieval-transport.js";
import { SynapseRetrievalService } from "./services/synapse-retrieval.service.js";

export interface AppDependencies {
  dataLayer: DataLayer;
  transport?: RetrievalTransport;
}

export function createApp(config: BackendConfig, deps: AppDependencies): Express {
  const app = express();
  const { retrieval: retrievalRepository, receipt: receiptRepository, provider: providerRepository } =
    deps.dataLayer.repositories;

  const escrowService = new EscrowService(config);
  const reputationService = new ReputationService(providerRepository);
  const retrievalService = new RetrievalService(retrievalRepository, escrowService);
  const retrievalTransport = deps.transport ?? new SynapseRetrievalService(config);
  const receiptService = new ReceiptService(
    receiptRepository,
    retrievalRepository,
    escrowService,
    reputationService,
    retrievalTransport
  );

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", databaseProvider: config.databaseProvider });
  });

  app.use("/retrieval", createRetrievalRouter(retrievalService, receiptService));
  app.use("/sp", createProviderRouter(reputationService));

  return app;
}

/** Convenience bootstrap that builds the configured data layer and app together. */
export async function bootstrapApp(config: BackendConfig): Promise<{
  app: Express;
  dataLayer: DataLayer;
}> {
  const dataLayer = await createDataLayer(config);
  const app = createApp(config, { dataLayer });
  return { app, dataLayer };
}
