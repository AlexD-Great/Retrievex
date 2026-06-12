import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const app = createApp();

app.listen(config.port, () => {
  console.log(`Retrievex Phase 1 API listening on port ${config.port}`);
});
