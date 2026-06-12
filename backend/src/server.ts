import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { initializeDatabase } from "./db/database.js";

const config = loadConfig();
const app = createApp();

await initializeDatabase();

app.listen(config.port, () => {
  console.log(`Retrievex Phase 1 API listening on port ${config.port}`);
});
