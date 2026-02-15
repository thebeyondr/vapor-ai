"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Zap, TrendingUp, AlertCircle } from "lucide-react"
import { InferenceMetrics } from "@/lib/services/inference-simulator"

interface InferenceStatsProps {
  metrics: InferenceMetrics
}

export function InferenceStats({ metrics }: InferenceStatsProps) {
  const { requestVolume, p50Latency, p95Latency, errorRate, successRate } = metrics

  const stats = [
    {
      title: "Request Volume",
      icon: Activity,
      value: requestVolume > 0 ? `${requestVolume.toFixed(1)} req/sec` : "No traffic",
      description: "Current request rate",
      isWarning: false,
    },
    {
      title: "P50 Latency",
      icon: Zap,
      value: `${Math.round(p50Latency)}ms`,
      description: "Median response time",
      isWarning: p50Latency > 200,
    },
    {
      title: "P95 Latency",
      icon: TrendingUp,
      value: `${Math.round(p95Latency)}ms`,
      description: "95th percentile (SLA target)",
      isWarning: p95Latency > 500,
    },
    {
      title: "Error Rate",
      icon: AlertCircle,
      value: `${errorRate.toFixed(2)}%`,
      description: `${successRate.toFixed(2)}% success rate`,
      isWarning: errorRate > 1,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.isWarning ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.isWarning ? "text-red-600 dark:text-red-400" : ""}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
