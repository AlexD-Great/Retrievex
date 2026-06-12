import pg from "pg";
import { loadConfig } from "../config.js";

const { Pool } = pg;

export const db = new Pool({
  connectionString: loadConfig().databaseUrl
});
