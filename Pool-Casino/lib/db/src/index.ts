import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import path from "path";
import * as schema from "./schema";

const client = createClient({
  url: process.env.DATABASE_URL || `file:${path.join(__dirname, "../../data/sqlite.db")}`,
});

export const db = drizzle(client, { schema });

export * from "./schema";
