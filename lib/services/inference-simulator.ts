/**
 * Inference metrics simulator for deployment monitoring
 * Generates realistic metrics using statistical distributions
 */

export interface InferenceMetrics {
  requestVolume: number // Requests per second
  p50Latency: number // Median latency (ms)
  p95Latency: number // 95th percentile latency (ms)
  p99Latency: number // 99th percentile latency (ms)
  errorRate: number // Percentage (0-100)
  successRate: number // Percentage (0-100)
}

interface Deployment {
  id: number
  modelName: string
  createdAt: Date
  status: string
}

/**
 * Generate realistic inference metrics based on deployment age and model size
 * Uses Gaussian noise with Box-Muller transform for realistic distributions
 */
export function generateInferenceMetrics(deployment: Deployment): InferenceMetrics {
  // Return zero metrics for non-active deployments
  if (deployment.status !== "active") {
    return {
      requestVolume: 0,
      p50Latency: 0,
      p95Latency: 0,
      p99Latency: 0,
      errorRate: 0,
      successRate: 0,
    }
  }

  // Base metrics vary by model size (inferred from name)
  const isNano = deployment.modelName.toLowerCase().includes("nano")
  const baseP50 = isNano ? 50 : 120 // Nano models are faster

  // Add Gaussian noise to P50 latency (use deployment id for deterministic-ish behavior)
  const p50Offset = (deployment.id % 10) - 5 // -5 to +5ms offset based on id
  const p50Latency = baseP50 + p50Offset + randomGaussian(0, 10)

  // P95 is typically 2-4x P50 in healthy systems
  const p95Latency = p50Latency * (2.5 + randomGaussian(0, 0.3))

  // P99 is typically 1.5-2x P95
  const p99Latency = p95Latency * (1.5 + randomGaussian(0, 0.2))

  // Request volume based on deployment age (ramps up over time)
  const ageHours = (Date.now() - deployment.createdAt.getTime()) / (1000 * 60 * 60)
  const maturityFactor = Math.min(1, ageHours / 24) // Full traffic after 24h
  const baseVolume = isNano ? 100 : 50 // Nano gets more traffic (cheaper)
  const requestVolume = baseVolume * maturityFactor + randomGaussian(0, baseVolume * 0.1)

  // Error rate: healthy < 1%, occasional spikes
  const baseErrorRate = 0.3 // 0.3% baseline
  const spike = Math.random() < 0.05 ? randomGaussian(2, 0.5) : 0 // 5% chance of spike
  const errorRate = Math.max(0, Math.min(5, baseErrorRate + spike))

  return {
    requestVolume: Math.max(0, requestVolume),
    p50Latency: Math.max(10, p50Latency),
    p95Latency: Math.max(20, p95Latency),
    p99Latency: Math.max(30, p99Latency),
    errorRate: Math.round(errorRate * 100) / 100,
    successRate: Math.round((100 - errorRate) * 100) / 100,
  }
}

/**
 * Box-Muller transform for Gaussian distribution
 * Returns a random value from a normal distribution with given mean and standard deviation
 */
function randomGaussian(mean: number, stdDev: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + z0 * stdDev
}
