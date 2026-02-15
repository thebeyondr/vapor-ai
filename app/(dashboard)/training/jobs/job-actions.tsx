"use client"

import { Button } from "@/components/ui/button"
import { Play, StopCircle, Eye, Rocket } from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { startTrainingJob, failTrainingJob } from "./actions"
import { deployTrainingJob } from "@/app/(dashboard)/deployments/actions"

type Job = {
  id: number
  status: "queued" | "running" | "complete" | "failed"
}

export function JobActions({ job }: { job: Job }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

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

  const handleDeploy = () => {
    startTransition(async () => {
      const result = await deployTrainingJob(job.id)
      if (result.success) {
        toast.success("Deployment created successfully")
        router.push("/deployments")
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

  // For complete status - show deploy + view buttons
  if (job.status === "complete") {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleDeploy}
          disabled={isPending}
        >
          <Rocket className="mr-2 h-4 w-4" />
          Deploy
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/training/jobs/${job.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </Button>
      </div>
    )
  }

  // For failed status - just show view button
  return (
    <Button size="sm" variant="outline" asChild>
      <Link href={`/training/jobs/${job.id}`}>
        <Eye className="mr-2 h-4 w-4" />
        View
      </Link>
    </Button>
  )
}
