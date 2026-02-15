import { NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { trainingJobs } from "@/lib/db/schema"
import { sql } from "drizzle-orm"

export async function GET() {
  try {
    // Simple query to verify connection
    const result = await db.select({ count: sql<number>`count(*)` }).from(trainingJobs)
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      trainingJobCount: result[0]?.count ?? 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { status: "unhealthy", database: "disconnected", error: String(error) },
      { status: 500 }
    )
  }
}
