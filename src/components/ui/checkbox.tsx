import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={checked}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-input bg-input/40 shadow-sm transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring/60 disabled:cursor-not-allowed disabled:opacity-50",
          checked && "border-primary bg-primary text-primary-foreground hover:bg-primary-hover",
          !checked && "hover:border-primary/50",
          className,
        )}
        onClick={(e) => {
          onClick?.(e)
          onCheckedChange?.(!checked)
        }}
        {...props}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>
    )
  },
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
