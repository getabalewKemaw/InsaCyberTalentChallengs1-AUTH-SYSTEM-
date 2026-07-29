import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema.js";
import { config } from "./env.js";
const pool = new Pool({
  connectionString: config.databaseUrl,
});
pool.on("error", (err) => {
  console.error("[PostgreSQL Pool Error]:", err);
});
export const db = drizzle(pool, { schema });
