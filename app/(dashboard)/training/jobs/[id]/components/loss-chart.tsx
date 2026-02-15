"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LossChartProps {
  data: Array<{ step: number; loss: number; accuracy?: number }>
}

export function LossChart({ data }: LossChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loss Curve</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height: 350 }}>
          <p className="text-sm text-muted-foreground">Waiting for training data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loss Curve</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="step"
              label={{ value: "Training Step", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              domain={[0, "dataMax + 0.5"]}
              label={{ value: "Loss", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value) => (typeof value === 'number' ? value.toFixed(4) : '--')}
              labelFormatter={(label) => `Step ${label}`}
            />
            <Area
              type="monotone"
              dataKey="loss"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fill="url(#lossGradient)"
              dot={false}
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
