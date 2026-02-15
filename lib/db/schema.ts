import { pgTable, serial, text, timestamp, varchar, integer, real } from "drizzle-orm/pg-core"

export const trainingJobs = pgTable("training_jobs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  status: text("status", { enum: ["queued", "running", "complete", "failed"] }).notNull().default("queued"),
  modelName: varchar("model_name", { length: 255 }).notNull(),
  epochs: integer("epochs").notNull().default(3),
  learningRate: real("learning_rate").notNull().default(0.0002),
  batchSize: integer("batch_size").notNull().default(16),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
})
