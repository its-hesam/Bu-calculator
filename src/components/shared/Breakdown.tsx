import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface BreakdownPanelProps {
  children: ReactNode
  className?: string
}

export function BreakdownPanel({ children, className }: BreakdownPanelProps) {
  return (
    <div className={cn("divide-y divide-border/70 overflow-hidden rounded-xl border border-border/80 bg-card", className)}>
      {children}
    </div>
  )
}

interface BreakdownRowProps {
  icon?: ReactNode
  title: string
  children: ReactNode
  tone?: "default" | "primary" | "success" | "danger" | "warning"
  right?: ReactNode
}

const titleTones = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  danger: "text-destructive",
  warning: "text-warning",
}

export function BreakdownRow({ icon, title, children, tone = "default", right }: BreakdownRowProps) {
  return (
    <div className="p-4 sm:p-5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && <span className={cn("shrink-0", tone === "default" ? "text-primary" : titleTones[tone])}>{icon}</span>}
          <span className={cn("text-[13px] font-semibold tracking-tight", titleTones[tone])}>{title}</span>
        </div>
        {right}
      </div>
      <div className="text-sm leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">
        {children}
      </div>
    </div>
  )
}
