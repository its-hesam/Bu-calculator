import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionCardProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function SectionCard({ title, description, icon, action, children, className, contentClassName }: SectionCardProps) {
  return (
    <section className={cn("px-5 py-5 sm:px-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {icon && <span className="shrink-0 text-primary">{icon}</span>}
            <h3 className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/90">{title}</h3>
          </div>
          {description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={cn("mt-4", contentClassName)}>{children}</div>
    </section>
  )
}
