import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type Tone = "primary" | "success" | "danger" | "warning" | "neutral"

interface ResultHeroProps {
  eyebrow?: ReactNode
  title: string
  value: ReactNode
  sub?: ReactNode
  tone?: Tone
  className?: string
}

const dotClasses: Record<Tone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  danger: "bg-destructive",
  warning: "bg-warning",
  neutral: "bg-muted-foreground",
}

const valueClasses: Record<Tone, string> = {
  primary: "text-primary",
  success: "text-success",
  danger: "text-destructive",
  warning: "text-warning",
  neutral: "text-foreground",
}

export function ResultHero({ eyebrow, title, value, sub, tone = "primary", className }: ResultHeroProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border/80 bg-card", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
        {eyebrow ? (
          <span className="eyebrow truncate">{eyebrow}</span>
        ) : (
          <span />
        )}
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClasses[tone])} />
      </div>
      <div className="px-5 py-5 sm:px-6">
        <h3 className="text-[13px] font-medium text-muted-foreground">{title}</h3>
        <div className={cn("mt-1.5 font-mono text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl", valueClasses[tone])}>
          {value}
        </div>
        {sub && <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{sub}</div>}
      </div>
    </div>
  )
}
