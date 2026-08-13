import type { ReactNode } from "react"
import { Info } from "lucide-react"

export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-lg border border-border/80 bg-muted/30 px-3.5 py-3 text-[13px] leading-relaxed text-muted-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>{children}</div>
    </div>
  )
}
