"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TrainingStatsProps {
  currentEpoch: number
  totalEpochs: number
  currentStep: number
  totalSteps: number
  latestLoss: number | null
  latestAccuracy: number | null
  status: string
  startedAt?: Date | null
}

function formatETA(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${seconds}s`
  }
}

export function TrainingStats({
  currentEpoch,
  totalEpochs,
  currentStep,
  totalSteps,
  latestLoss,
  latestAccuracy,
  status,
  startedAt,
}: TrainingStatsProps) {
  const progress = (currentStep / totalSteps) * 100

  // Calculate ETA
  let etaText = "Calculating..."
  if (status === "complete") {
    etaText = "Training Complete"
  } else if (status === "failed") {
    etaText = "Training Failed"
  } else if (progress > 0 && startedAt) {
    const elapsed = Date.now() - startedAt.getTime()
    const estimatedTotal = elapsed / (progress / 100)
    const remaining = Math.max(0, estimatedTotal - elapsed)
    etaText = `ETA: ${formatETA(remaining)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Epoch</p>
            <p className="text-2xl font-bold">
              {currentEpoch} / {totalEpochs}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Steps</p>
            <p className="text-2xl font-bold">
              {currentStep} / {totalSteps}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Loss</p>
            <p className="text-2xl font-bold">
              {latestLoss !== null ? latestLoss.toFixed(4) : "--"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
            <p className="text-2xl font-bold">
              {latestAccuracy !== null ? `${(latestAccuracy * 100).toFixed(2)}%` : "--"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{progress.toFixed(1)}% complete</span>
            <span
              className={
                status === "complete"
                  ? "font-medium text-green-600 dark:text-green-400"
                  : status === "failed"
                  ? "font-medium text-red-600 dark:text-red-400"
                  : "text-muted-foreground"
              }
            >
              {etaText}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
