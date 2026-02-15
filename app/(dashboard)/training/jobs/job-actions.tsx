"use client"

import { Button } from "@/components/ui/button"
import { Play, StopCircle, Eye } from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"
import { toast } from "sonner"
import { startTrainingJob, failTrainingJob } from "./actions"

type Job = {
  id: number
  status: "queued" | "running" | "complete" | "failed"
}

export function JobActions({ job }: { job: Job }) {
  const [isPending, startTransition] = useTransition()

  const handleStart = () => {
    startTransition(async () => {
      const result = await startTrainingJob(job.id)
      if (result.success) {
        toast.success("Training started")
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleStop = () => {
    startTransition(async () => {
      const result = await failTrainingJob(job.id)
      if (result.success) {
        toast.success("Training stopped")
      } else {
        toast.error(result.error)
      }
    })
  }

  if (job.status === "queued") {
    return (
      <Button
        size="sm"
        onClick={handleStart}
        disabled={isPending}
      >
        <Play className="mr-2 h-4 w-4" />
        Start
      </Button>
    )
  }

  if (job.status === "running") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleStop}
        disabled={isPending}
      >
        <StopCircle className="mr-2 h-4 w-4" />
        Stop
      </Button>
    )
  }

  // For complete or failed status
  return (
    <Button size="sm" variant="outline" asChild>
      <Link href={`/training/jobs/${job.id}`}>
        <Eye className="mr-2 h-4 w-4" />
        View
      </Link>
    </Button>
  )
}
