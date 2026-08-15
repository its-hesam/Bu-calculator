import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface CheckboxFieldProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  className?: string
}

export function CheckboxField({ checked, onChange, label, className }: CheckboxFieldProps) {
  return (
    <Label className={cn("flex cursor-pointer items-center gap-2.5 text-[13px] font-medium normal-case tracking-normal text-foreground", className)}>
      <Checkbox checked={checked} onCheckedChange={onChange} />
      {label}
    </Label>
  )
}
