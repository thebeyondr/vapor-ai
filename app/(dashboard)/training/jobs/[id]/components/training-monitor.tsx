"use client"

import { useState, useCallback } from "react"
import { Play, Square } from "lucide-react"
import { toast } from "sonner"
import { useInterval } from "@/lib/hooks/use-interval"
import { StatusBadge } from "@/app/(dashboard)/components/status-badge"
import { Button } from "@/components/ui/button"
import { LossChart } from "./loss-chart"
import { TrainingStats } from "./training-stats"
import {
  simulateTrainingStep,
  startTrainingJob,
  failTrainingJob,
} from "../../actions"

interface TrainingMonitorProps {
  job: {
    id: number
    name: string
    modelName: string
    epochs: number
    learningRate: number
    batchSize: number
    status: string
    createdAt: Date
    updatedAt: Date
  }
  initialMetrics: Array<{
    step: number
    loss: number
    accuracy: number | null
    epoch: number
  }>
}

export function TrainingMonitor({ job, initialMetrics }: TrainingMonitorProps) {
  const [status, setStatus] = useState(job.status)
  const [metrics, setMetrics] = useState(initialMetrics)
  const [isLoading, setIsLoading] = useState(false)

  // Derived values
  const totalSteps = job.epochs * 100
  const currentStep = metrics[metrics.length - 1]?.step || 0
  const currentEpoch = metrics[metrics.length - 1]?.epoch || 0
  const latestLoss = metrics[metrics.length - 1]?.loss ?? null
  const latestAccuracy = metrics[metrics.length - 1]?.accuracy ?? null
  const isActive = status === "running"

  // Polling callback
  const pollTrainingProgress = useCallback(async () => {
    try {
      // Simulate a training step
      const result = await simulateTrainingStep(job.id)

      if (!result.success) {
        // Training failed
        setStatus("failed")
        toast.error("Training Failed", {
          description: result.error || "An error occurred during training",
        })
      } else if (result.complete) {
        // Training is complete
        setStatus("complete")
        toast.success("Training Complete!", {
          description: `${job.name} finished successfully`,
        })
      } else {
        // Fetch updated metrics
        const response = await fetch(`/api/training/${job.id}/metrics`)
        if (response.ok) {
          const data = await response.json()
          setMetrics(data.metrics)
        }
      }
    } catch (error) {
      console.error("Polling error:", error)
      setStatus("failed")
      toast.error("Training Failed", {
        description: "An unexpected error occurred",
      })
    }
  }, [job.id, job.name])

  // Set up polling interval (1.5 seconds when running, paused otherwise)
  useInterval(pollTrainingProgress, isActive ? 1500 : null)

  // Start training handler
  const handleStartTraining = async () => {
    setIsLoading(true)
    try {
      const result = await startTrainingJob(job.id)
      if (result.success) {
        setStatus("running")
        toast.success("Training Started", {
          description: `${job.name} is now running`,
        })
      } else {
        toast.error("Failed to Start Training", {
          description: result.error || "An error occurred",
        })
      }
    } catch (error) {
      console.error("Start training error:", error)
      toast.error("Failed to Start Training", {
        description: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Stop training handler
  const handleStopTraining = async () => {
    setIsLoading(true)
    try {
      const result = await failTrainingJob(job.id)
      if (result.success) {
        setStatus("failed")
        toast.error("Training Stopped", {
          description: "Job was manually stopped",
        })
      } else {
        toast.error("Failed to Stop Training", {
          description: result.error || "An error occurred",
        })
      }
    } catch (error) {
      console.error("Stop training error:", error)
      toast.error("Failed to Stop Training", {
        description: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with status and actions */}
      <div className="flex items-center justify-between">
        <StatusBadge status={status as "queued" | "running" | "complete" | "failed"} />
        <div className="flex gap-2">
          {status === "queued" && (
            <Button onClick={handleStartTraining} disabled={isLoading}>
              <Play className="mr-2 h-4 w-4" />
              Start Training
            </Button>
          )}
          {status === "running" && (
            <Button
              onClick={handleStopTraining}
              disabled={isLoading}
              variant="destructive"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop Training
            </Button>
          )}
        </div>
      </div>

      {/* Loss chart */}
      <LossChart data={metrics} />

      {/* Training stats */}
      <TrainingStats
        currentEpoch={currentEpoch}
        totalEpochs={job.epochs}
        currentStep={currentStep}
        totalSteps={totalSteps}
        latestLoss={latestLoss}
        latestAccuracy={latestAccuracy}
        status={status}
        startedAt={job.createdAt}
      />
    </div>
  )
}
