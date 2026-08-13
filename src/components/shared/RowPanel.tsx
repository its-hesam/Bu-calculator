import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { commonTexts } from "@/lib/texts"
import { Trash2 } from "lucide-react"

interface RowPanelProps {
  index: number
  label: string
  onRemove: () => void
  children: ReactNode
  accent?: "primary" | "success" | "danger"
  className?: string
}

const accentClasses = {
  primary: "bg-primary",
  success: "bg-success",
  danger: "bg-destructive",
}

export function RowPanel({ index, label, onRemove, children, accent = "primary", className }: RowPanelProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-border/80 bg-surface/40 transition-colors duration-200 hover:border-border", className)}>
      <div className={cn("absolute left-0 top-0 h-full w-[3px]", accentClasses[accent])} />
      <div className="mb-3 flex items-center justify-between gap-2 pl-3">
        <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-primary">
          {label} <span className="text-muted-foreground/70">#{index}</span>
        </span>
        <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-muted-foreground hover:text-destructive" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" /> {commonTexts.remove}
        </Button>
      </div>
      <div className="space-y-2 pl-3">{children}</div>
    </div>
  )
}
