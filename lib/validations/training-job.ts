import { z } from "zod"

export const hyperparameterRanges = {
  learningRate: {
    min: 0.000001,    // 1e-6
    max: 1.0,
    recommended: 0.0002,  // 2e-4, standard for LoRA
    description: "Controls step size during optimization"
  },
  epochs: {
    min: 1,
    max: 100,
    recommended: 3,
    description: "Number of complete passes through training data"
  },
  batchSize: {
    min: 1,
    max: 128,
    recommended: 16,
    description: "Number of samples processed before model update"
  }
} as const

export const trainingJobSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  modelId: z.string()
    .min(1, "Please select a base model"),
  learningRate: z.number()
    .min(hyperparameterRanges.learningRate.min, "Learning rate must be at least 1e-6")
    .max(hyperparameterRanges.learningRate.max, "Learning rate must be at most 1")
    .refine((val) => val > 0, { message: "Learning rate must be positive" }),
  epochs: z.number()
    .int("Epochs must be a whole number")
    .min(hyperparameterRanges.epochs.min, "At least 1 epoch required")
    .max(hyperparameterRanges.epochs.max, "Maximum 100 epochs"),
  batchSize: z.number()
    .int("Batch size must be a whole number")
    .min(hyperparameterRanges.batchSize.min, "Batch size must be at least 1")
    .max(hyperparameterRanges.batchSize.max, "Batch size must be at most 128")
    .refine((val) => val > 0 && (val & (val - 1)) === 0, {
      message: "Batch size should be a power of 2 (e.g., 2, 4, 8, 16, 32, 64, 128)"
    })
})

export type TrainingJobInput = z.infer<typeof trainingJobSchema>
