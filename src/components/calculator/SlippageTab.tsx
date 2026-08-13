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
import { slippageTexts, commonTexts } from "@/lib/texts"
import { calcSlippage, fmt } from "@/lib/calculators"
import { Calculator, ShieldAlert, GripHorizontal, Info, FunctionSquare, BadgeDollarSign, Percent, Crosshair, CircleDollarSign } from "lucide-react"

export function SlippageTab() {
  const [trigger, setTrigger] = useState("")
  const [executed, setExecuted] = useState("")
  const [size, setSize] = useState("")
  const [result, setResult] = useState<ReturnType<typeof calcSlippage> | null>(null)
  const [error, setError] = useState("")

  const t = slippageTexts

  const calculate = () => {
    setError("")
    setResult(null)
    const tg = parseFloat(trigger), ex = parseFloat(executed), s = parseFloat(size)
    if (!tg || !ex || !s) { setError(t.error); return }
    setResult(calcSlippage({ triggerPrice: tg, executedPrice: ex, size: s }))
  }

  return (
    <ToolLayout
      form={
        <SectionCard title={t.section.title} description={t.section.description} icon={<GripHorizontal className="h-4 w-4" />}>
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-1">
            <FormField label={t.fields.trigger.label}>
              <Input type="number" step="any" placeholder={t.fields.trigger.placeholder} value={trigger} onChange={e => setTrigger(e.target.value)} />
            </FormField>
            <FormField label={t.fields.executed.label}>
              <Input type="number" step="any" placeholder={t.fields.executed.placeholder} value={executed} onChange={e => setExecuted(e.target.value)} />
            </FormField>
            <FormField label={t.fields.size.label} hint={t.fields.size.hint}>
              <Input type="number" step="any" placeholder={t.fields.size.placeholder} value={size} onChange={e => setSize(e.target.value)} />
            </FormField>
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
            eyebrow={t.hero.eyebrow}
            title={t.hero.title}
            value={`${fmt(result.slippagePct, 6)}%`}
            tone="warning"
            sub={t.heroSub(fmt(result.priceDiff, 6), size)}
          />

          <MetricGrid className="sm:grid-cols-4">
            <Stat label={t.stats.slippage} value={`${fmt(result.slippagePct, 6)}%`} tone="warning" icon={<Percent className="h-4 w-4" />} />
            <Stat label={t.stats.priceDiff} value={`${fmt(result.priceDiff, 6)} USDT`} tone="primary" icon={<CircleDollarSign className="h-4 w-4" />} />
            <Stat label={t.stats.trigger} value={fmt(parseFloat(trigger), 6)} icon={<Crosshair className="h-4 w-4" />} />
            <Stat label={t.stats.executed} value={fmt(parseFloat(executed), 6)} icon={<GripHorizontal className="h-4 w-4" />} />
          </MetricGrid>

          <BreakdownPanel>
            <BreakdownRow icon={<FunctionSquare className="h-4 w-4" />} title={t.breakdown.slippage} tone="primary">
              <p className="font-mono text-[13px]">{commonTexts.formula}: {t.formulas.slippage}<br />|{trigger} − {executed}| ÷ {trigger} × 100 = <strong className="text-warning">{fmt(result.slippagePct, 6)}%</strong></p>
            </BreakdownRow>
            <BreakdownRow icon={<BadgeDollarSign className="h-4 w-4" />} title={t.breakdown.priceDiff}>
              <p className="font-mono text-[13px]">{commonTexts.formula}: {t.formulas.priceDiff}<br />|{trigger} − {executed}| × {size} = <strong className="text-primary">{fmt(result.priceDiff, 6)} USDT</strong></p>
            </BreakdownRow>
          </BreakdownPanel>

          <div className="rounded-xl border border-success/20 bg-success/[0.05] p-4">
            <h4 className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-success"><Info className="h-4 w-4" /> {t.about.heading}</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">{t.about.paragraph1}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.about.paragraph2}</p>
          </div>

          <TemplateCards
            variant="slippage"
            params={{
              trigger: fmt(parseFloat(trigger), 6),
              executed: fmt(parseFloat(executed), 6),
              size: `${size} coins`,
              slippage: `${fmt(result.slippagePct, 6)}%`,
              priceDiff: `${fmt(result.priceDiff, 6)} USDT`,
              diff: fmt(result.diff, 6),
            }}
          />
        </div>
      )}
    />
  )
}
