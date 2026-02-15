import { Badge } from "@/components/ui/badge"
import { Rocket, CheckCircle, Pause, XCircle } from "lucide-react"

type DeploymentStatus = "deploying" | "active" | "paused" | "failed"

const statusConfig = {
  deploying: {
    label: "Deploying",
    variant: "outline" as const,
    className: "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    icon: Rocket,
  },
  active: {
    label: "Active",
    variant: "outline" as const,
    className: "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400",
    icon: CheckCircle,
  },
  paused: {
    label: "Paused",
    variant: "outline" as const,
    className: "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    icon: Pause,
  },
  failed: {
    label: "Failed",
    variant: "outline" as const,
    className: "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400",
    icon: XCircle,
  },
}

export function DeploymentStatusBadge({ status }: { status: DeploymentStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className={`mr-1 h-3 w-3 ${status === "deploying" ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  )
}
