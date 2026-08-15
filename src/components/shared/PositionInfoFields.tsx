import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField } from "@/components/shared/FormField"
import { commonTexts } from "@/lib/texts"
import { Input } from "@/components/ui/input"
import type { Side } from "@/lib/calculators"
import { cn } from "@/lib/utils"

interface PositionInfoFieldsProps {
  currency: string
  onCurrencyChange: (v: string) => void
  leverage: string
  onLeverageChange: (v: string) => void
  direction: Side
  onDirectionChange: (v: Side) => void
  positionId: string
  onPositionIdChange: (v: string) => void
  showDirection?: boolean
  showLeverage?: boolean
  className?: string
}

export function PositionInfoFields({
  currency,
  onCurrencyChange,
  leverage,
  onLeverageChange,
  direction,
  onDirectionChange,
  positionId,
  onPositionIdChange,
  showDirection = true,
  showLeverage = true,
  className,
}: PositionInfoFieldsProps) {
  const t = commonTexts
  return (
    <div className={cn("grid gap-3.5 sm:grid-cols-2 lg:grid-cols-1", className)}>
      <FormField label={t.currency}>
        <Input placeholder={t.currencyPlaceholder} value={currency} onChange={e => onCurrencyChange(e.target.value.toUpperCase())} />
      </FormField>
      {showLeverage && (
        <FormField label={t.leverage}>
          <Input type="number" step="any" placeholder={t.leveragePlaceholder} value={leverage} onChange={e => onLeverageChange(e.target.value)} />
        </FormField>
      )}
      {showDirection && (
        <FormField label={t.positionDirection}>
          <Select value={direction} onValueChange={(v: Side) => onDirectionChange(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="long">{t.side.long}</SelectItem>
              <SelectItem value="short">{t.side.short}</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      )}
      <FormField label={t.positionId}>
        <Input placeholder={t.positionIdPlaceholder} value={positionId} onChange={e => onPositionIdChange(e.target.value)} />
      </FormField>
    </div>
  )
}
