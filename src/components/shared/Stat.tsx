import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type StatTone = "default" | "primary" | "success" | "danger" | "warning" | "muted"

interface StatProps {
  label: string
  value: ReactNode
  tone?: StatTone
  sub?: string
  icon?: ReactNode
  className?: string
}

const toneClasses: Record<StatTone, string> = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  danger: "text-destructive",
  warning: "text-warning",
  muted: "text-muted-foreground",
}

const iconTones: Record<StatTone, string> = {
  default: "text-muted-foreground",
  primary: "text-primary",
  success: "text-success",
  danger: "text-destructive",
  warning: "text-warning",
  muted: "text-muted-foreground",
}

export function Stat({ label, value, tone = "default", sub, icon, className }: StatProps) {
  return (
    <div className={cn("bg-surface/60 p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow">{label}</span>
        {icon && <span className={cn("shrink-0", iconTones[tone])}>{icon}</span>}
      </div>
      <div className={cn("mt-2 font-mono text-xl font-semibold leading-tight tabular-nums", toneClasses[tone])}>{value}</div>
      {sub && <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  )
}

interface MetricGridProps {
  children: ReactNode
  className?: string
}

export function MetricGrid({ children, className }: MetricGridProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/80 bg-border/70 sm:grid-cols-3", className)}>
      {children}
    </div>
  )
}
