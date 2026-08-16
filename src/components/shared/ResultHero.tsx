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
    <div className={cn("relative overflow-hidden rounded-2xl border border-border/80 bg-card", className)}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-6 py-3.5">
        {eyebrow ? (
          <span className="flex min-w-0 items-center gap-2 truncate">
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClasses[tone])} />
            <span className="eyebrow truncate">{eyebrow}</span>
          </span>
        ) : (
          <span />
        )}
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClasses[tone])} />
      </div>
      <div className="px-6 py-6 sm:px-7">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={cn("mt-2 font-mono text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl", valueClasses[tone])}>
          {value}
        </div>
        {sub && <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{sub}</div>}
      </div>
    </div>
  )
}
