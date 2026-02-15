import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

// Only validate on server side
export const env = envSchema.parse(process.env)
