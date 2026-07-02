import { bootstrapApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const { app, dataLayer } = await bootstrapApp(config);

await dataLayer.initialize();

app.listen(config.port, () => {
  console.log(
    `Retrievex Phase 1 API listening on port ${config.port} (db: ${config.databaseProvider})`
  );
});
