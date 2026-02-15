"use client"

import { Button } from "@/components/ui/button"
import { Rocket } from "lucide-react"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deployTrainingJob } from "@/app/(dashboard)/deployments/actions"

interface DeployButtonProps {
  jobId: number
  jobStatus: string
}

export function DeployButton({ jobId, jobStatus }: DeployButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Only show deploy button for completed jobs
  if (jobStatus !== "complete") {
    return null
  }

  const handleDeploy = () => {
    startTransition(async () => {
      const result = await deployTrainingJob(jobId)
      if (result.success) {
        toast.success("Deployment created successfully")
        router.push("/deployments")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button onClick={handleDeploy} disabled={isPending}>
      <Rocket className="mr-2 h-4 w-4" />
      Deploy Model
    </Button>
  )
}
