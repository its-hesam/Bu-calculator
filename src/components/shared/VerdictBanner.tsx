import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface VerdictBannerProps {
  ok: boolean
  okTitle: string
  dangerTitle: string
  children: ReactNode
  className?: string
}

export function VerdictBanner({ ok, okTitle, dangerTitle, children, className }: VerdictBannerProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-l-2",
        ok ? "border-l-success" : "border-l-destructive",
        className,
      )}
    >
      <div className="p-5">
        <div className="mb-2 flex items-center gap-2.5">
          <span
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
              ok ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
            )}
          >
            {ok ? "✓" : "!"}
          </span>
          <span className={cn("text-sm font-semibold", ok ? "text-success" : "text-destructive")}>
            {ok ? okTitle : dangerTitle}
          </span>
        </div>
        <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </Card>
  )
}
