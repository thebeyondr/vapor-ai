"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeploymentStatusBadge } from "./deployment-status-badge"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export interface DeploymentRow {
  id: number
  modelName: string
  version: string
  status: "deploying" | "active" | "paused" | "failed"
  createdAt: Date
  requestVolume: number
  p95Latency: number
  errorRate: number
}

export const deploymentColumns: ColumnDef<DeploymentRow>[] = [
  {
    accessorKey: "modelName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8"
        >
          Model Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Link
        href={`/deployments/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.getValue("modelName")}
      </Link>
    ),
  },
  {
    accessorKey: "version",
    header: "Version",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("version")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <DeploymentStatusBadge status={row.getValue("status")} />
    ),
    filterFn: (row, id, value) => {
      // Multi-value filter support
      if (value === "all") return true
      return row.getValue(id) === value
    },
  },
  {
    accessorKey: "requestVolume",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8"
        >
          Req/sec
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const volume = row.getValue("requestVolume") as number
      return volume > 0 ? volume.toFixed(1) : "—"
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as number
      const b = rowB.getValue(columnId) as number
      return (a ?? 0) - (b ?? 0)
    },
  },
  {
    accessorKey: "p95Latency",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8"
        >
          P95 Latency
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const latency = row.getValue("p95Latency") as number
      return latency > 0 ? `${Math.round(latency)}ms` : "—"
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as number
      const b = rowB.getValue(columnId) as number
      return (a ?? 0) - (b ?? 0)
    },
  },
  {
    accessorKey: "errorRate",
    header: "Error Rate",
    cell: ({ row }) => {
      const rate = row.getValue("errorRate") as number
      const isHigh = rate > 1
      return (
        <span className={isHigh ? "text-red-600 dark:text-red-400" : ""}>
          {rate.toFixed(2)}%
        </span>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8"
        >
          Deployed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return formatDistanceToNow(date, { addSuffix: true })
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as Date
      const b = rowB.getValue(columnId) as Date
      return a.getTime() - b.getTime()
    },
  },
]
