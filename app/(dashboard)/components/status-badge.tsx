import { Badge } from "@/components/ui/badge"
import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react"

type Status = "queued" | "running" | "complete" | "failed"

const statusConfig = {
  queued: {
    label: "Queued",
    variant: "outline" as const,
    className: "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    icon: Clock,
  },
  running: {
    label: "Running",
    variant: "outline" as const,
    className: "border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400",
    icon: Loader2,
  },
  complete: {
    label: "Complete",
    variant: "outline" as const,
    className: "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    variant: "outline" as const,
    className: "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400",
    icon: XCircle,
  },
}

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className={`mr-1 h-3 w-3 ${status === "running" ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  )
}
