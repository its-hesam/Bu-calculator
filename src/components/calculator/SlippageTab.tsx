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
import { PositionInfoFields } from "@/components/shared/PositionInfoFields"
import { slippageTexts, commonTexts } from "@/lib/texts"
import { calcSlippage, fmt, type Side } from "@/lib/calculators"
import { Calculator, ShieldAlert, GripHorizontal, Info, FunctionSquare, BadgeDollarSign, Percent, Crosshair, CircleDollarSign, TrendingUp, TrendingDown } from "lucide-react"

export function SlippageTab() {
  const [direction, setDirection] = useState<Side>("long")
  const [currency, setCurrency] = useState("")
  const [leverage, setLeverage] = useState("")
  const [positionId, setPositionId] = useState("")
  const [entry, setEntry] = useState("")
  const [stopLoss, setStopLoss] = useState("")
  const [actual, setActual] = useState("")
  const [size, setSize] = useState("")
  const [result, setResult] = useState<ReturnType<typeof calcSlippage> | null>(null)
  const [error, setError] = useState("")

  const t = slippageTexts
  const cur = currency.trim() || "USDT"

  const calculate = () => {
    setError("")
    setResult(null)
    const entryN = parseFloat(entry), slN = parseFloat(stopLoss), acN = parseFloat(actual), s = parseFloat(size)
    if (!entryN || !slN || !acN || !s) { setError(t.error); return }
    setResult(calcSlippage({
      side: direction,
      currency: cur,
      entryPrice: entryN,
      stopLossPrice: slN,
      actualClosePrice: acN,
      size: s,
      leverage: leverage.trim() ? parseFloat(leverage) : undefined,
    }))
  }

  const pnlTone = (v: number) => (v >= 0 ? "success" : "danger")
  const signed = (v: number) => `${v >= 0 ? "+" : ""}${fmt(v, 6)} USDT`

  return (
    <ToolLayout
      form={
        <SectionCard title={t.section.title} description={t.section.description} icon={<GripHorizontal className="h-4 w-4" />}>
          <div className="space-y-4">
            <PositionInfoFields
              currency={currency}
              onCurrencyChange={setCurrency}
              leverage={leverage}
              onLeverageChange={setLeverage}
              direction={direction}
              onDirectionChange={setDirection}
              positionId={positionId}
              onPositionIdChange={setPositionId}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <FormField label={t.fields.entry.label}>
                <Input type="number" step="any" placeholder={t.fields.entry.placeholder} value={entry} onChange={e => setEntry(e.target.value)} />
              </FormField>
              <FormField label={t.fields.stopLoss.label}>
                <Input type="number" step="any" placeholder={t.fields.stopLoss.placeholder} value={stopLoss} onChange={e => setStopLoss(e.target.value)} />
              </FormField>
              <FormField label={t.fields.actual.label}>
                <Input type="number" step="any" placeholder={t.fields.actual.placeholder} value={actual} onChange={e => setActual(e.target.value)} />
              </FormField>
              <FormField label={t.fields.size.label} hint={t.fields.size.hint}>
                <Input type="number" step="any" placeholder={t.fields.size.placeholder} value={size} onChange={e => setSize(e.target.value)} />
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
            eyebrow={t.hero.eyebrow}
            title={t.hero.title}
            value={`${fmt(result.slippagePct, 6)}%`}
            tone="warning"
            sub={t.heroSub(fmt(result.priceDiff, 6), "USDT", size)}
          />

          <MetricGrid className="sm:grid-cols-3">
            <Stat label={t.stats.pnlAtSL} value={signed(result.pnlAtStopLoss)} tone={pnlTone(result.pnlAtStopLoss)} icon={<TrendingUp className="h-4 w-4" />} />
            <Stat label={t.stats.pnlActual} value={signed(result.pnlAtActual)} tone={pnlTone(result.pnlAtActual)} icon={<TrendingDown className="h-4 w-4" />} />
            <Stat label={t.stats.slippagePnl} value={`${result.slippagePnl >= 0 ? "+" : ""}${fmt(result.slippagePnl, 6)} USDT`} tone={pnlTone(result.slippagePnl)} icon={<GripHorizontal className="h-4 w-4" />} />
            <Stat label={t.stats.slippage} value={`${fmt(result.slippagePct, 6)}%`} tone="warning" icon={<Percent className="h-4 w-4" />} />
            <Stat label={t.stats.priceDiff} value={`${fmt(result.priceDiff, 6)} USDT`} tone="primary" icon={<CircleDollarSign className="h-4 w-4" />} />
            <Stat label={t.stats.actual} value={fmt(parseFloat(actual), 6)} sub={`${t.stats.stopLoss}: ${fmt(parseFloat(stopLoss), 6)}`} icon={<Crosshair className="h-4 w-4" />} />
          </MetricGrid>

          <BreakdownPanel>
            <BreakdownRow icon={<FunctionSquare className="h-4 w-4" />} title={t.breakdown.pnlAtSL} tone="primary">
              <p className="font-mono text-[13px]">
                {commonTexts.formula}: {direction === "long" ? t.formulas.pnlLong : t.formulas.pnlShort}
                <br />
                {direction === "long"
                  ? <>({stopLoss} − {entry}) × {size} = <strong className="text-success">{signed(result.pnlAtStopLoss)}</strong></>
                  : <>({entry} − {stopLoss}) × {size} = <strong className="text-success">{signed(result.pnlAtStopLoss)}</strong></>}
              </p>
            </BreakdownRow>
            <BreakdownRow icon={<FunctionSquare className="h-4 w-4" />} title={t.breakdown.pnlActual}>
              <p className="font-mono text-[13px]">
                {commonTexts.formula}: {direction === "long" ? t.formulas.pnlLong : t.formulas.pnlShort}
                <br />
                {direction === "long"
                  ? <>({actual} − {entry}) × {size} = <strong className="text-destructive">{signed(result.pnlAtActual)}</strong></>
                  : <>({entry} − {actual}) × {size} = <strong className="text-destructive">{signed(result.pnlAtActual)}</strong></>}
              </p>
            </BreakdownRow>
            <BreakdownRow icon={<BadgeDollarSign className="h-4 w-4" />} title={t.breakdown.pnlImpact} tone="danger">
              <p className="font-mono text-[13px]">{commonTexts.formula}: {t.formulas.pnlImpact}<br />
                {fmt(result.pnlAtActual, 6)} − ({fmt(result.pnlAtStopLoss, 6)}) = <strong className={result.slippagePnl >= 0 ? "text-success" : "text-destructive"}>{result.slippagePnl >= 0 ? "+" : ""}{fmt(result.slippagePnl, 6)} USDT</strong>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">The extra loss (or gain) caused by the position closing worse than the Stop Loss price.</p>
            </BreakdownRow>
            <BreakdownRow icon={<Percent className="h-4 w-4" />} title={t.breakdown.slippage} tone="warning">
              <p className="font-mono text-[13px]">{commonTexts.formula}: {t.formulas.slippage}<br />|{stopLoss} − {actual}| ÷ {stopLoss} × 100 = <strong className="text-warning">{fmt(result.slippagePct, 6)}%</strong></p>
            </BreakdownRow>
            <BreakdownRow icon={<BadgeDollarSign className="h-4 w-4" />} title={t.breakdown.priceDiff} tone="primary">
              <p className="font-mono text-[13px]">{commonTexts.formula}: {t.formulas.priceDiff}<br />|{stopLoss} − {actual}| × {size} = <strong className="text-primary">{fmt(result.priceDiff, 6)} USDT</strong></p>
            </BreakdownRow>
          </BreakdownPanel>

          <div className="rounded-xl border border-success/20 bg-success/[0.05] p-5">
            <h4 className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-success"><Info className="h-4 w-4" /> {t.about.heading}</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">{t.about.paragraph1}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.about.paragraph2}</p>
          </div>

          <TemplateCards
            variant="slippage"
            params={{
              side: direction === "long" ? "LONG" : "SHORT",
              pair: `${cur}USDT`,
              leverage: leverage.trim() ? `${leverage}x` : "—",
              positionId: positionId.trim() || "—",
              closedPrice: fmt(parseFloat(actual), 6),
              stopLossPrice: fmt(parseFloat(stopLoss), 6),
              pnlDiffFormula: [
                t.difference.pnlAtStopLoss(direction, entry, stopLoss, size, fmt(result.pnlAtStopLoss, 6)),
                t.difference.pnlAtActual(direction, entry, actual, size, fmt(result.pnlAtActual, 6)),
                t.difference.result(fmt(result.pnlAtStopLoss, 6), fmt(result.pnlAtActual, 6), `${result.slippagePnl >= 0 ? "+" : ""}${fmt(result.slippagePnl, 6)}`),
              ].join("\n"),
            }}
          />
        </div>
      )}
    />
  )
}
