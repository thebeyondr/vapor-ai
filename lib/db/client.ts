import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

// Use dynamic import of env to avoid client-side validation
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
