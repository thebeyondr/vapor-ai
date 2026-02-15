export interface TrainingSimulatorConfig {
  initialLoss?: number
  finalLoss?: number
  decayRate?: number
}

export interface MetricPoint {
  epoch: number
  step: number
  loss: number
  accuracy: number
}

export class TrainingSimulator {
  private readonly initialLoss: number
  private readonly finalLoss: number
  private readonly decayRate: number

  constructor(config: TrainingSimulatorConfig = {}) {
    this.initialLoss = config.initialLoss ?? 2.5
    this.finalLoss = config.finalLoss ?? 0.3
    this.decayRate = config.decayRate ?? 0.15
  }

  /**
   * Generates a loss value using exponential decay with diminishing Gaussian noise
   * @param step Current training step
   * @param totalSteps Total steps in training run
   * @returns Loss value (floored at 0.05)
   */
  generateLossPoint(step: number, totalSteps: number): number {
    const progress = step / totalSteps

    // Exponential decay
    const baseLoss = this.finalLoss + (this.initialLoss - this.finalLoss) * Math.exp(-this.decayRate * step)

    // Diminishing noise: starts at 0.1, reduces to 0.02 (80% reduction) as training progresses
    const noiseScale = 0.1 * (1 - progress * 0.8)

    // Gaussian noise (Box-Muller transform for normal distribution)
    const u1 = Math.random()
    const u2 = Math.random()
    const gaussianNoise = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const noise = gaussianNoise * noiseScale

    const loss = baseLoss + noise

    // Floor at 0.05 to prevent negative or unrealistically low values
    return Math.max(0.05, loss)
  }

  /**
   * Generates an accuracy value inversely related to loss
   * @param loss Current loss value
   * @returns Accuracy value clamped between 0 and 1
   */
  generateAccuracy(loss: number): number {
    // Inverse relationship: as loss decreases, accuracy increases
    const baseAccuracy = 1 - (loss / this.initialLoss)

    // Small noise for realism (±0.02 range)
    const noise = (Math.random() - 0.5) * 0.04

    const accuracy = baseAccuracy + noise

    // Clamp between 0 and 1
    return Math.max(0, Math.min(1, accuracy))
  }

  /**
   * Generates a batch of sequential metric points
   * @param startStep Starting step number
   * @param count Number of points to generate
   * @param totalSteps Total steps in training run
   * @param stepsPerEpoch Steps per epoch (for calculating epoch number)
   * @returns Array of metric points with epoch, step, loss, accuracy
   */
  generateMetricsBatch(
    startStep: number,
    count: number,
    totalSteps: number,
    stepsPerEpoch: number
  ): MetricPoint[] {
    const metrics: MetricPoint[] = []

    for (let i = 0; i < count; i++) {
      const step = startStep + i
      const loss = this.generateLossPoint(step, totalSteps)
      const accuracy = this.generateAccuracy(loss)
      const epoch = Math.floor(step / stepsPerEpoch) + 1

      metrics.push({
        epoch,
        step,
        loss,
        accuracy,
      })
    }

    return metrics
  }
}
