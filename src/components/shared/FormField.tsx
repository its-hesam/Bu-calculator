import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: ReactNode
  hint?: string
  children: ReactNode
  className?: string
}

export function FormField({ label, hint, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
        <span className="truncate">{label}</span>
        {hint && <span className="shrink-0 text-[11px] font-normal normal-case tracking-normal text-muted-foreground/60">{hint}</span>}
      </Label>
      {children}
    </div>
  )
}
