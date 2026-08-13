import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  colorTheme?: "danger" | "warning" | "success"
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, colorTheme = "success", ...props }, ref) => {
    const colorMap = {
      danger: "bg-destructive",
      warning: "bg-warning",
      success: "bg-success",
    }
    return (
      <div
        ref={ref}
        className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted/70 ring-1 ring-inset ring-border/40", className)}
        {...props}
      >
        <div
          className={cn("h-full w-full flex-1 rounded-full transition-all duration-500", colorMap[colorTheme])}
          style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
        />
      </div>
    )
  },
)
Progress.displayName = "Progress"

export { Progress }
