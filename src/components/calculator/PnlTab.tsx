import { useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StableTabs } from "@/components/shared/StableTabs"
import { SectionCard } from "@/components/shared/SectionCard"
import { FormField } from "@/components/shared/FormField"
import { Stat, MetricGrid } from "@/components/shared/Stat"
import { ResultHero } from "@/components/shared/ResultHero"
import { BreakdownPanel, BreakdownRow } from "@/components/shared/Breakdown"
import { TemplateCards } from "@/components/shared/TemplateCards"
import { ToolLayout } from "@/components/shared/ToolLayout"
import { SideField } from "@/components/shared/SideField"
import { PositionInfoFields } from "@/components/shared/PositionInfoFields"
import { pnlTexts } from "@/lib/texts"
import { calcPnLLinear, calcPnLCoinM, fmt, type Side } from "@/lib/calculators"
import { Calculator, ShieldAlert, ArrowDownUp, FunctionSquare, NotebookPen, ListChecks, Coins, CircleDollarSign, Percent, TrendingUp, TrendingDown } from "lucide-react"

export function PnlTab() {
  const [subTab, setSubTab] = useState("usdt")

  return (
    <Tabs value={subTab} onValueChange={setSubTab}>
      <StableTabs />
      <TabsContent value="usdt"><PnlLinearForm stable="USDT" /></TabsContent>
      <TabsContent value="usdc"><PnlLinearForm stable="USDC" /></TabsContent>
      <TabsContent value="coin"><PnlCoinMForm /></TabsContent>
    </Tabs>
  )
}

function PnlLinearForm({ stable }: { stable: string }) {
  const t = pnlTexts.linear
  const [side, setSide] = useState<Side>("long")
  const [openP, setOpenP] = useState("")
  const [closeP, setCloseP] = useState("")
  const [qty, setQty] = useState("")
  const [margin, setMargin] = useState("")
  const [currency, setCurrency] = useState(stable)
  const [leverage, setLeverage] = useState("")
  const [positionId, setPositionId] = useState("")
  const [result, setResult] = useState<ReturnType<typeof calcPnLLinear> | null>(null)
  const [error, setError] = useState("")

  const calculate = () => {
    setError("")
    setResult(null)
    const open = parseFloat(openP), close = parseFloat(closeP), qtyN = parseFloat(qty)
    if (!open || !close || !qtyN) { setError(t.error); return }
    const res = calcPnLLinear({
      side, openPrice: open, closePrice: close, qty: qtyN, stable,
      margin: margin.trim() ? parseFloat(margin) : undefined,
    })
    setResult(res)
  }

  const isProfit = (result?.pnl ?? 0) >= 0

  return (
    <ToolLayout
      form={
        <SectionCard title={t.section.title} description={t.section.description} icon={<ArrowDownUp className="h-4 w-4" />}>
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
              <FormField label={t.fields.qty.label} hint={t.fields.qty.hint}>
                <Input type="number" step="any" placeholder={t.fields.qty.placeholder} value={qty} onChange={e => setQty(e.target.value)} />
              </FormField>
              <FormField label={t.fields.open.label}>
                <Input type="number" step="any" placeholder={t.fields.open.placeholder} value={openP} onChange={e => setOpenP(e.target.value)} />
              </FormField>
              <FormField label={t.fields.close.label}>
                <Input type="number" step="any" placeholder={t.fields.close.placeholder} value={closeP} onChange={e => setCloseP(e.target.value)} />
              </FormField>
              <FormField label={t.fields.margin.label} hint={t.fields.margin.hint}>
                <Input type="number" step="any" placeholder={t.fields.margin.placeholder} value={margin} onChange={e => setMargin(e.target.value)} />
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
            eyebrow={t.eyebrow(stable, side)}
            title={t.hero.title}
            value={`${isProfit ? "+" : ""}${fmt(result.pnl, 6)} ${stable}`}
            tone={isProfit ? "success" : "danger"}
          />

          <MetricGrid>
            <Stat label={t.stats.pnl} value={`${isProfit ? "+" : ""}${fmt(result.pnl, 6)} ${stable}`} tone={isProfit ? "success" : "danger"} icon={<CircleDollarSign className="h-4 w-4" />} />
            <Stat label={t.stats.roi} value={result.roi !== undefined ? `${fmt(result.roi, 6)}%` : "—"} tone={result.roi !== undefined ? (isProfit ? "success" : "danger") : "muted"} icon={<Percent className="h-4 w-4" />} />
            <Stat label={t.stats.side} value={side.toUpperCase()} tone={side === "long" ? "success" : "danger"} icon={side === "long" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />} />
          </MetricGrid>

          <BreakdownPanel>
            <BreakdownRow icon={<FunctionSquare className="h-4 w-4" />} title={t.breakdown.formula(side)} tone="primary">
              <span className="font-mono text-[13px] text-primary/90">{result.formulaText}</span>
            </BreakdownRow>
            <BreakdownRow icon={<ListChecks className="h-4 w-4" />} title={t.breakdown.calculation}>
              <span className="font-mono text-[13px]">{result.calcLine}</span>
            </BreakdownRow>
            <BreakdownRow icon={<NotebookPen className="h-4 w-4" />} title={t.breakdown.details}>
              <p className="text-[13px]">
                {t.labels.open} <span className="text-primary">{openP}</span> &nbsp;|&nbsp; {t.labels.close} <span className="text-primary">{closeP}</span> &nbsp;|&nbsp; {t.labels.qty} <span className="text-primary">{qty} coins</span> &nbsp;|&nbsp; {t.labels.side} <span className="text-primary">{side.toUpperCase()}</span>
              </p>
            </BreakdownRow>
          </BreakdownPanel>

          <TemplateCards
            variant="pnlLinear"
            params={{
              side: side.toUpperCase(),
              direction: side.toUpperCase(),
              market: `${stable}-M`,
              currency: currency.trim() || stable,
              open: String(openP),
              close: String(closeP),
              qty: `${qty} coins`,
              pnl: `${isProfit ? "+" : ""}${fmt(result.pnl, 6)} ${stable}`,
              roi: result.roi !== undefined ? `${fmt(result.roi, 6)}%` : "—",
              leverage: leverage.trim() ? `${leverage}x` : "—",
              positionId: positionId.trim() || "—",
            }}
          />
        </div>
      )}
    />
  )
}

function PnlCoinMForm() {
  const t = pnlTexts.coinM
  const [side, setSide] = useState<Side>("long")
  const [coinName, setCoinName] = useState("")
  const [openP, setOpenP] = useState("")
  const [closeP, setCloseP] = useState("")
  const [qty, setQty] = useState("")
  const [margin, setMargin] = useState("")
  const [currency, setCurrency] = useState("")
  const [leverage, setLeverage] = useState("")
  const [positionId, setPositionId] = useState("")
  const [result, setResult] = useState<ReturnType<typeof calcPnLCoinM> | null>(null)
  const [error, setError] = useState("")

  const calculate = () => {
    setError("")
    setResult(null)
    const open = parseFloat(openP), close = parseFloat(closeP), qtyN = parseFloat(qty)
    if (!open || !close || !qtyN) { setError(t.error); return }
    const res = calcPnLCoinM({
      side, coinName: coinName.toUpperCase() || "coins", openPrice: open, closePrice: close, qtyUSD: qtyN,
      margin: margin.trim() ? parseFloat(margin) : undefined,
    })
    setResult(res)
  }

  const isProfit = (result?.pnl ?? 0) >= 0

  return (
    <ToolLayout
      form={
        <SectionCard title={t.section.title} description={t.section.description} icon={<Coins className="h-4 w-4" />}>
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
              <FormField label={t.fields.coin.label}>
                <Input placeholder={t.fields.coin.placeholder} value={coinName} onChange={e => setCoinName(e.target.value.toUpperCase())} />
              </FormField>
              <FormField label={t.fields.open.label}>
                <Input type="number" step="any" placeholder={t.fields.open.placeholder} value={openP} onChange={e => setOpenP(e.target.value)} />
              </FormField>
              <FormField label={t.fields.close.label}>
                <Input type="number" step="any" placeholder={t.fields.close.placeholder} value={closeP} onChange={e => setCloseP(e.target.value)} />
              </FormField>
              <FormField label={t.fields.qty.label} hint={t.fields.qty.hint}>
                <Input type="number" step="any" placeholder={t.fields.qty.placeholder} value={qty} onChange={e => setQty(e.target.value)} />
              </FormField>
              <FormField label={t.fields.margin.label} hint={t.fields.margin.hint}>
                <Input type="number" step="any" placeholder={t.fields.margin.placeholder} value={margin} onChange={e => setMargin(e.target.value)} />
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
            eyebrow={t.eyebrow(side)}
            title={t.hero.title}
            value={`${isProfit ? "+" : ""}${fmt(result.pnl, 6)} ${result.coinName}`}
            sub={t.heroSub(`${isProfit ? "+" : ""}${fmt(result.pnlUSD ?? 0, 6)}`)}
            tone={isProfit ? "success" : "danger"}
          />

          <MetricGrid>
            <Stat label={t.stats.pnl} value={`${isProfit ? "+" : ""}${fmt(result.pnl, 6)} ${result.coinName}`} tone={isProfit ? "success" : "danger"} icon={<CircleDollarSign className="h-4 w-4" />} />
            <Stat label={t.stats.usd} value={`${isProfit ? "+" : ""}${fmt(result.pnlUSD ?? 0, 6)} USD`} tone={isProfit ? "success" : "danger"} icon={<TrendingUp className="h-4 w-4" />} />
            <Stat label={t.stats.roi} value={result.roi !== undefined ? `${fmt(result.roi, 6)}%` : "—"} tone={result.roi !== undefined ? (isProfit ? "success" : "danger") : "muted"} icon={<Percent className="h-4 w-4" />} />
          </MetricGrid>

          <BreakdownPanel>
            <BreakdownRow icon={<FunctionSquare className="h-4 w-4" />} title={t.breakdown.formula(side)} tone="primary">
              <span className="font-mono text-[13px] text-primary/90">{result.formulaText}</span>
            </BreakdownRow>
            <BreakdownRow icon={<ListChecks className="h-4 w-4" />} title={t.breakdown.calculation}>
              <div className="space-y-1 font-mono text-[13px]">
                <p>= {qty} × (1/{openP} − 1/{closeP})</p>
                <p>= {qty} × ({(1 / parseFloat(openP || "1")).toFixed(8)} − {(1 / parseFloat(closeP || "1")).toFixed(8)})</p>
                <p><strong className="text-primary">{fmt(result.pnl, 6)} {result.coinName}</strong></p>
              </div>
            </BreakdownRow>
            <BreakdownRow icon={<NotebookPen className="h-4 w-4" />} title={t.breakdown.details}>
              <p className="text-[13px]">
                {t.labels.open} <span className="text-primary">{openP}</span> &nbsp;|&nbsp; {t.labels.close} <span className="text-primary">{closeP}</span> &nbsp;|&nbsp; {t.labels.qty} <span className="text-primary">{qty} USD</span> &nbsp;|&nbsp; {t.labels.side} <span className="text-primary">{side.toUpperCase()}</span>
              </p>
            </BreakdownRow>
          </BreakdownPanel>

          <TemplateCards
            variant="pnlCoinM"
            params={{
              side: side.toUpperCase(),
              direction: side.toUpperCase(),
              market: "Coin-M",
              coin: result.coinName ?? "coins",
              currency: currency.trim() || result.coinName || "coins",
              open: String(openP),
              close: String(closeP),
              qty: `${qty} USD`,
              pnl: `${isProfit ? "+" : ""}${fmt(result.pnl, 6)} ${result.coinName}`,
              pnlUSD: `${isProfit ? "+" : ""}${fmt(result.pnlUSD ?? 0, 6)} USD`,
              roi: result.roi !== undefined ? `${fmt(result.roi, 6)}%` : "—",
              leverage: leverage.trim() ? `${leverage}x` : "—",
              positionId: positionId.trim() || "—",
            }}
          />
        </div>
      )}
    />
  )
}
