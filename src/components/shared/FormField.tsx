import { useId, isValidElement, cloneElement, type ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: ReactNode
  hint?: string
  children: ReactNode
  className?: string
}

export function FormField({ label, hint, children, className }: FormFieldProps) {
  const autoId = useId()

  let child: ReactNode = children
  let fieldId: string | undefined
  if (isValidElement<{ id?: string }>(children) && typeof children.type === "string") {
    fieldId = children.props.id ?? autoId
    child = cloneElement(children, { id: fieldId })
  }

  return (
    <div className={cn("min-w-0 space-y-2", className)}>
      <Label
        htmlFor={fieldId}
        className="block text-[13px] font-medium leading-snug tracking-normal text-foreground/90"
      >
        <span className="flex items-center justify-between gap-2">
          <span className="min-w-0">{label}</span>
          {hint && <span className="shrink-0 text-[12px] font-normal leading-snug text-muted-foreground/70">{hint}</span>}
        </span>
      </Label>
      {child}
    </div>
  )
}