import { defineConfig } from "drizzle-kit";
import * as path from "path";

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || `file:${path.join(__dirname, "../../data/sqlite.db")}`,
  },
});
