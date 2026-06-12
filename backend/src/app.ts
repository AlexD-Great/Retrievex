import cors from "cors";
import express from "express";
import { providerRouter } from "./routes/provider.routes.js";
import { retrievalRouter } from "./routes/retrieval.routes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/retrieval", retrievalRouter);
  app.use("/sp", providerRouter);

  return app;
}
