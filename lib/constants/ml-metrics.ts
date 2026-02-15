/**
 * ML Metric Range Constants
 *
 * Reference values for machine learning metrics used throughout the application.
 * These constants provide realistic ranges for:
 * - Training simulator validation
 * - Inference metric generation
 * - Chart normalization and visualization
 * - Phase 7 verification and testing
 *
 * Note: Existing simulators (training-simulator, inference-simulator) already
 * produce realistic values. These constants serve as a documented source of truth.
 */

export const ML_METRIC_RANGES = {
  /**
   * Training loss values
   * - Initial: Typical loss at start of training
   * - Converged: Expected loss after successful training
   */
  loss: {
    initial: { min: 2.0, max: 5.0 },
    converged: { min: 0.1, max: 1.0 },
  },

  /**
   * GPU utilization percentage
   * - Low: Underutilized GPU, may indicate bottleneck
   * - Good: Healthy utilization for most workloads
   * - Excellent: High utilization, well-optimized training
   */
  gpuUtilization: {
    low: { min: 25, max: 40 },
    good: { min: 40, max: 60 },
    excellent: { min: 60, max: 85 },
  },

  /**
   * Learning rate values for fine-tuning
   * - Small: Conservative for sensitive models
   * - Typical: Default for most fine-tuning tasks
   * - Large: Aggressive for quick convergence
   */
  learningRate: {
    small: 0.0001,
    typical: 0.001,
    large: 0.01,
  },

  /**
   * Model accuracy percentage
   * - Initial: Baseline accuracy before training
   * - Trained: Expected accuracy after fine-tuning
   */
  accuracy: {
    initial: { min: 0.4, max: 0.6 },
    trained: { min: 0.75, max: 0.95 },
  },

  /**
   * Inference latency in milliseconds
   * - p50: Median latency
   * - p95Factor: Multiplier for p95 latency (p50 * 2.5)
   * - p99Factor: Multiplier for p99 latency (p50 * 4.0)
   */
  latency: {
    p50: { min: 15, max: 45 },
    p95Factor: 2.5,
    p99Factor: 4.0,
  },

  /**
   * Error rate percentage for deployed models
   * - Healthy: Normal error rate range
   * - Degraded: Indicates potential issues
   */
  errorRate: {
    healthy: { min: 0.001, max: 0.01 },
    degraded: { min: 0.01, max: 0.05 },
  },
} as const

/**
 * Type exports for type-safe metric range access
 */
export type MLMetricRanges = typeof ML_METRIC_RANGES
export type MetricCategory = keyof MLMetricRanges
