import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SectionCard } from "@/components/shared/SectionCard"
import { FormField } from "@/components/shared/FormField"
import { Stat, MetricGrid } from "@/components/shared/Stat"
import { ResultHero } from "@/components/shared/ResultHero"
import { BreakdownPanel, BreakdownRow } from "@/components/shared/Breakdown"
import { TemplateCards } from "@/components/shared/TemplateCards"
import { ToolLayout } from "@/components/shared/ToolLayout"
import { SideField } from "@/components/shared/SideField"
import { PositionInfoFields } from "@/components/shared/PositionInfoFields"
import { fundingTexts } from "@/lib/texts"
import { calcFundingFee, fmt, type Side } from "@/lib/calculators"
import { Calculator, ShieldAlert, Banknote, ArrowLeftRight, FunctionSquare, CircleDollarSign, Percent, TrendingUp, TrendingDown } from "lucide-react"

export function FundingFeeTab() {
  const [side, setSide] = useState<Side>("long")
  const [size, setSize] = useState("")
  const [mark, setMark] = useState("")
  const [rate, setRate] = useState("")
  const [currency, setCurrency] = useState("")
  const [leverage, setLeverage] = useState("")
  const [positionId, setPositionId] = useState("")
  const [result, setResult] = useState<ReturnType<typeof calcFundingFee> | null>(null)
  const [error, setError] = useState("")

  const t = fundingTexts

  const calculate = () => {
    setError("")
    setResult(null)
    const sizeN = parseFloat(size), markN = parseFloat(mark), rateN = parseFloat(rate)
    if (!sizeN || !markN || !rate) { setError(t.error); return }
    setResult(calcFundingFee({ side, size: sizeN, markPrice: markN, ratePct: rateN }))
  }

  return (
    <ToolLayout
      form={
        <SectionCard title={t.section.title} description={t.section.description} icon={<Banknote className="h-4 w-4" />}>
          <div className="space-y-4">
            <PositionInfoFields
              currency={currency}
              onCurrencyChange={setCurrency}
              leverage={leverage}
              onLeverageChange={setLeverage}
              direction={side}
              onDirectionChange={setSide}
              positionId={positionId}
              onPositionIdChange={setPositionId}
              showDirection={false}
            />
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-1">
              <SideField value={side} onChange={(v) => setSide(v)} />
              <FormField label={t.fields.size.label} hint={t.fields.size.hint}>
                <Input type="number" step="any" placeholder={t.fields.size.placeholder} value={size} onChange={e => setSize(e.target.value)} />
              </FormField>
              <FormField label={t.fields.mark.label} hint={t.fields.mark.hint}>
                <Input type="number" step="any" placeholder={t.fields.mark.placeholder} value={mark} onChange={e => setMark(e.target.value)} />
              </FormField>
              <FormField label={t.fields.rate.label} hint={t.fields.rate.hint}>
                <Input type="number" step="any" placeholder={t.fields.rate.placeholder} value={rate} onChange={e => setRate(e.target.value)} />
              </FormField>
            </div>
          </div>
        </SectionCard>
      }
      action={
        <Button onClick={calculate} size="full" className="gap-2"><Calculator className="h-4 w-4" /> {t.calculate}</Button>
      }
      errors={error && (
        <Alert variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
      )}
      result={result && (
        <div className="space-y-5 animate-slide-up">
          <ResultHero
            eyebrow={t.eyebrow(side.toUpperCase(), rate)}
            title={t.hero.title}
            value={`${fmt(result.fee, 6)} USDT`}
            tone={result.fee >= 0 ? "primary" : "danger"}
            sub={result.flowLine}
          />

          <MetricGrid className="sm:grid-cols-4">
            <Stat label={t.stats.fee} value={`${fmt(result.fee, 6)} USDT`} tone={result.fee >= 0 ? "primary" : "danger"} icon={<CircleDollarSign className="h-4 w-4" />} />
            <Stat label={t.stats.abs} value={`${fmt(result.absFee, 6)} USDT`} icon={<Banknote className="h-4 w-4" />} />
            <Stat label={t.stats.rate} value={`${rate}%`} icon={<Percent className="h-4 w-4" />} />
            <Stat label={t.stats.side} value={side.toUpperCase()} tone={side === "long" ? "success" : "danger"} icon={side === "long" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />} />
          </MetricGrid>

          <BreakdownPanel>
            <BreakdownRow icon={<FunctionSquare className="h-4 w-4" />} title={t.breakdown.formula} tone="primary">
              <p className="font-mono text-[13px]">{t.formula}<br />{size} × {mark} × {rate}% = <strong className="text-primary">{fmt(result.fee, 6)} USDT</strong></p>
            </BreakdownRow>
            <BreakdownRow icon={<ArrowLeftRight className="h-4 w-4" />} title={t.breakdown.flow}>
              <p className="text-[13px]">{result.flowLine}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.breakdown.flowNote}</p>
            </BreakdownRow>
          </BreakdownPanel>

          <TemplateCards
            variant="funding"
            params={{
              side: side.toUpperCase(),
              direction: side.toUpperCase(),
              currency: currency.trim() || "USDT",
              size: String(size),
              sizeLabel: `${size} coins`,
              mark: String(mark),
              rate: `${rate}%`,
              fee: `${fmt(result.fee, 6)} USDT`,
              flow: result.flowLine,
              positionId: positionId.trim() || "—",
            }}
          />
        </div>
      )}
    />
  )
}
