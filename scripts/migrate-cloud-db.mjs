import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

const migration = await readFile(new URL("../sql/001_cloud_snapshots.sql", import.meta.url), "utf8");
const sql = neon(process.env.DATABASE_URL);
const statements = migration.split(";").map((statement) => statement.trim()).filter(Boolean);
for (const statement of statements) await sql.query(statement);
console.log("Cloud snapshot schema is ready.");
