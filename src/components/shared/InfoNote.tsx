import type { ReactNode } from "react"
import { Info } from "lucide-react"

export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-primary/25 bg-primary/[0.05] px-4 py-4 text-sm leading-relaxed text-foreground/80">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/25">
        <Info className="h-3.5 w-3.5" />
      </span>
      <div>{children}</div>
    </div>
  )
}
