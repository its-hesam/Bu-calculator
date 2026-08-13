import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField } from "@/components/shared/FormField"
import { commonTexts } from "@/lib/texts"
import type { Side } from "@/lib/calculators"

interface SideFieldProps {
  value: Side
  onChange: (v: Side) => void
}

export function SideField({ value, onChange }: SideFieldProps) {
  return (
    <FormField label={commonTexts.side.label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="long">{commonTexts.side.long}</SelectItem>
          <SelectItem value="short">{commonTexts.side.short}</SelectItem>
        </SelectContent>
      </Select>
    </FormField>
  )
}
