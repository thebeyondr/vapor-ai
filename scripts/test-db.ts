import { config } from "dotenv"

// Load .env.local BEFORE importing db client
config({ path: ".env.local" })

import { db } from "../lib/db/client"
import { trainingJobs } from "../lib/db/schema"

async function testDb() {
  try {
    console.log("Testing database connection...")

    // Insert a test record
    const [inserted] = await db
      .insert(trainingJobs)
      .values({
        name: "Test Training Job",
        status: "queued",
        modelName: "llama-3-8b",
        epochs: 5,
        learningRate: 0.001,
      })
      .returning()

    console.log("✓ Test record inserted:", inserted)

    // Query all records
    const allJobs = await db.select().from(trainingJobs)
    console.log(`✓ Database has ${allJobs.length} training job(s)`)

    console.log("\n✓ Database connection successful!")
  } catch (error) {
    console.error("✗ Database connection failed:", error)
    process.exit(1)
  }
}

testDb()
