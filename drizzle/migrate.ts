import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import dotenv from "dotenv";
dotenv.config();

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) throw new Error("POSTGRES_URL is not set");

const sql = postgres(POSTGRES_URL, { max: 1 });
const db = drizzle(sql);
await migrate(db, { migrationsFolder: "./drizzle" });
await sql.end();
