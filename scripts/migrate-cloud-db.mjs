import { readFile, readdir } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

const sql = neon(process.env.DATABASE_URL);
const directory = new URL("../sql/", import.meta.url);
for (const name of (await readdir(directory)).filter(name => /^\d+_.*\.sql$/.test(name)).sort()) {
  const migration = await readFile(new URL(name, directory), "utf8");
  const statements = migration.split(";").map(statement => statement.trim()).filter(Boolean);
  for (const statement of statements) await sql.query(statement);
}
console.log("Cloud snapshot and member audit schemas are ready.");
