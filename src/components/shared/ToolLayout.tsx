import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { commonTexts } from "@/lib/texts"
import { Calculator } from "lucide-react"

interface ToolLayoutProps {
  form: ReactNode
  action: ReactNode
  errors?: ReactNode
  result: ReactNode | null
  className?: string
}

export function ToolLayout({ form, action, errors, result, className }: ToolLayoutProps) {
  return (
    <div className={cn("grid gap-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:items-start lg:gap-10", className)}>
      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/80 bg-surface/30">
          {form}
        </div>
        {action}
        {errors}
      </div>
      <div className="min-w-0">
        {result ?? (
          <div className="flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 p-8 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground">
              <Calculator className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground/80">{commonTexts.placeholderTitle}</p>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">{commonTexts.placeholderHint}</p>
          </div>
        )}
      </div>
    </div>
  )
}
