import { useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StableTabs } from "@/components/shared/StableTabs"
import { SectionCard } from "@/components/shared/SectionCard"
import { FormField } from "@/components/shared/FormField"
import { InfoNote } from "@/components/shared/InfoNote"
import { Stat, MetricGrid } from "@/components/shared/Stat"
import { ResultHero } from "@/components/shared/ResultHero"
import { BreakdownPanel, BreakdownRow } from "@/components/shared/Breakdown"
import { TemplateCards } from "@/components/shared/TemplateCards"
import { ToolLayout } from "@/components/shared/ToolLayout"
import { SideField } from "@/components/shared/SideField"
import { PositionInfoFields } from "@/components/shared/PositionInfoFields"
import { CheckboxField } from "@/components/shared/CheckboxField"
import { isoTexts, commonTexts } from "@/lib/texts"
import { calcIsoLinearMarginOk, calcIsoCoinMMarginOk, type IsoLinearInputs, type IsoCoinMInputs, fmt, type Side, sideLabel, stopLossProximity } from "@/lib/calculators"
import {
  Calculator,
  ShieldAlert,
  FunctionSquare,
  ListChecks,
  NotebookPen,
  BookOpen,
  Wallet,
  ArrowDownUp,
  Scale,
  Activity,
  Gauge,
  TrendingDown,
} from "lucide-react"

export function IsolatedLiqTab() {
  const [subTab, setSubTab] = useState("usdt")

  return (
    <Tabs value={subTab} onValueChange={setSubTab}>
      <StableTabs />
      <TabsContent value="usdt">
        <IsoLinearForm side="USDT" />
      </TabsContent>
      <TabsContent value="usdc">
        <IsoLinearForm side="USDC" />
      </TabsContent>
      <TabsContent value="coin">
        <IsoCoinMForm />
      </TabsContent>
    </Tabs>
  )
}

function IsoLinearForm({ side }: { side: "USDT" | "USDC" }) {
  const t = isoTexts.linear
  const [sideType, setSideType] = useState<Side>("long")
  const [entry, setEntry] = useState("")
  const [size, setSize] = useState("")
  const [mmr, setMmr] = useState("")
  const [lev, setLev] = useState("")
  const [margin, setMargin] = useState("")
  const [currency, setCurrency] = useState<string>(side)
  const [positionId, setPositionId] = useState("")
  const [hasSL, setHasSL] = useState(false)
  const [stopLoss, setStopLoss] = useState("")
  const [result, setResult] = useState<ReturnType<typeof calcIsoLinearMarginOk> | null>(null)
  const [error, setError] = useState("")

  const stable = side === "USDC" ? "USDC" : "USDT"
  const marginField = t.fields.margin(stable)

  const calculate = () => {
    setError("")
    setResult(null)
    const entryN = parseFloat(entry)
    const sizeN = parseFloat(size)
    const mmrN = parseFloat(mmr)
    if (!entryN || !sizeN || !mmrN) { setError(t.errors.missing); return }
    const marginRaw = margin.trim()
    const levRaw = lev.trim()
    if (marginRaw === "" && levRaw === "") { setError(t.errors.marginOrLeverage); return }

    const inputs: IsoLinearInputs = {
      side: sideType,
      entryPrice: entryN,
      positionSize: sizeN,
      mmrPct: mmrN,
      leverage: levRaw !== "" ? parseFloat(levRaw) : undefined,
      availableMargin: marginRaw !== "" ? parseFloat(marginRaw) : undefined,
      stable,
    }
    const res = calcIsoLinearMarginOk(inputs)
    setResult(res)
    if (!res.ok) setError(res.reason!)
  }

  const sl = sideLabel(sideType)
  const resultBlock = result?.result

  const slNum = parseFloat(stopLoss)
  const hasSlPrice = hasSL && !!slNum
  const stopLossLabel = hasSlPrice ? fmt(slNum, 6) : "—"
  const slProximityText =
    hasSlPrice && resultBlock
      ? stopLossProximity(parseFloat(entry), resultBlock.liquidationPrice, slNum) === "close"
        ? commonTexts.slProximityClose
        : commonTexts.slProximityFar
      : ""

  return (
    <ToolLayout
      form={
        <SectionCard title={t.section.title} description={t.section.description} icon={<ArrowDownUp className="h-4 w-4" />}>
          <div className="space-y-4">
            <PositionInfoFields
              currency={currency}
              onCurrencyChange={setCurrency}
              leverage={lev}
              onLeverageChange={setLev}
              direction={sideType}
              onDirectionChange={setSideType}
              positionId={positionId}
              onPositionIdChange={setPositionId}
              showDirection={false}
              showLeverage={false}
            />
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-1">
              <SideField value={sideType} onChange={(v) => setSideType(v)} />
              <FormField label={t.fields.entry.label}>
                <Input type="number" step="any" placeholder={t.fields.entry.placeholder} value={entry} onChange={e => setEntry(e.target.value)} />
              </FormField>
              <FormField label={t.fields.size.label} hint={t.fields.size.hint}>
                <Input type="number" step="any" placeholder={t.fields.size.placeholder} value={size} onChange={e => setSize(e.target.value)} />
              </FormField>
              <FormField label={t.fields.mmr.label} hint={t.fields.mmr.hint}>
                <Input type="number" step="any" placeholder={t.fields.mmr.placeholder} value={mmr} onChange={e => setMmr(e.target.value)} />
              </FormField>
              <FormField label={t.fields.leverage.label} hint={t.fields.leverage.hint}>
                <Input type="number" step="any" placeholder={t.fields.leverage.placeholder} value={lev} onChange={e => setLev(e.target.value)} />
              </FormField>
              <FormField label={marginField.label} hint={marginField.hint}>
                <Input type="number" step="any" placeholder={marginField.placeholder} value={margin} onChange={e => setMargin(e.target.value)} />
              </FormField>
            </div>
            <CheckboxField checked={hasSL} onChange={setHasSL} label={commonTexts.stopLossQuestion} />
            {hasSL && (
              <FormField label={commonTexts.stopLossPrice}>
                <Input type="number" step="any" placeholder={commonTexts.stopLossPricePlaceholder} value={stopLoss} onChange={e => setStopLoss(e.target.value)} />
              </FormField>
            )}
            <InfoNote>{t.infoNote}</InfoNote>
          </div>
        </SectionCard>
      }
      action={
        <Button onClick={calculate} size="full" className="gap-2">
          <Calculator className="h-4 w-4" /> {t.calculate}
        </Button>
      }
      errors={
        <>
          {error && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {result && !result.ok && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>
                <strong>{t.lowMarginTitle}</strong>
                <br />
                {result.reason}
              </AlertDescription>
            </Alert>
          )}
        </>
      }
      result={resultBlock && (
        <div className="space-y-5 animate-slide-up">
          <ResultHero
            eyebrow={t.eyebrow(side, sl)}
            title={t.heroTitle}
            value={resultBlock.liquidationPrice.toFixed(6)}
            sub={t.heroSub(resultBlock.movePct, sideType === "long", entry)}
            tone={sideType === "long" ? "primary" : "danger"}
          />

          <MetricGrid className="sm:grid-cols-3">
            <Stat label={t.stats.mm} value={`${fmt(resultBlock.maintenanceMargin, 6)} ${stable}`} tone="warning" icon={<Scale className="h-4 w-4" />} />
            <Stat label={t.stats.margin} value={`${fmt(resultBlock.margin, 6)} ${stable}`} tone="success" icon={<Wallet className="h-4 w-4" />} />
            <Stat label={t.stats.buffer} value={`${fmt(resultBlock.margin - resultBlock.maintenanceMargin, 6)} ${stable}`} sub={t.stats.bufferSub} tone="primary" icon={<Activity className="h-4 w-4" />} />
            <Stat label={t.stats.move} value={`${resultBlock.movePct}%`} sub={t.stats.moveSub} icon={<TrendingDown className="h-4 w-4" />} />
            <Stat label={t.stats.leverage} value={resultBlock.leverageUsed ? `${resultBlock.leverageUsed}x` : "—"} tone={resultBlock.leverageUsed ? "default" : "muted"} icon={<Gauge className="h-4 w-4" />} />
          </MetricGrid>

          <BreakdownPanel>
            <BreakdownRow icon={<FunctionSquare className="h-4 w-4" />} title={t.breakdown.formula(sl)} tone="primary">
              <span className="font-mono text-[13px] text-primary/90">{resultBlock.formulaText}</span>
            </BreakdownRow>
            <BreakdownRow icon={<ListChecks className="h-4 w-4" />} title={t.breakdown.steps}>
              <ul className="space-y-1.5">
                {resultBlock.steps.map((s, i) => (
                  <li key={i} className="flex gap-2.5 font-mono text-[13px]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-semibold text-primary">{i + 1}</span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ul>
            </BreakdownRow>
            <BreakdownRow icon={<NotebookPen className="h-4 w-4" />} title={t.breakdown.details}>
              <ul className="space-y-1">
                {Object.entries(resultBlock.details).map(([k, v], i) => (
                  <li key={i} className="flex gap-2 text-[13px]">
                    <span className="text-primary">▪</span>
                    <span>{v === "" ? k : `${k}: ${v}`}</span>
                  </li>
                ))}
              </ul>
            </BreakdownRow>
            <BreakdownRow icon={<BookOpen className="h-4 w-4" />} title={t.breakdown.mmr} tone="warning">
              <p>{t.breakdown.mmrIntro}</p>
              <p className="mt-1.5 font-mono text-[13px] text-warning">
                Minimum Margin = Position Size × Entry Price × MMR = {size} × {entry} × {mmr}% = {fmt(resultBlock.maintenanceMargin, 6)} {stable}
              </p>
              <p className="mt-1.5">{t.breakdown.mmrOutro}</p>
            </BreakdownRow>
            <BreakdownRow icon={<Wallet className="h-4 w-4" />} title={t.breakdown.narrative} tone="success">
              <p>{resultBlock.narrative}</p>
            </BreakdownRow>
          </BreakdownPanel>

          <TemplateCards
            variant={hasSL ? "isoLinearSL" : "isoLinear"}
            params={{
              side: sl,
              direction: sl,
              market: `${side}-M`,
              currency: currency.trim() || stable,
              entry: String(entry),
              size: `${size} coins`,
              mmr: `${mmr}%`,
              margin: `${fmt(resultBlock.margin, 6)} ${stable}`,
              mm: `${fmt(resultBlock.maintenanceMargin, 6)} ${stable}`,
              buffer: `${fmt(resultBlock.margin - resultBlock.maintenanceMargin, 6)} ${stable}`,
              liq: resultBlock.liquidationPrice.toFixed(6),
              move: `${resultBlock.movePct}%`,
              leverage: resultBlock.leverageUsed ? `${resultBlock.leverageUsed}x` : "—",
              positionId: positionId.trim() || "—",
              ...(hasSL ? { stopLoss: stopLossLabel, slProximityText } : {}),
            }}
          />
        </div>
      )}
    />
  )
}

function IsoCoinMForm() {
  const t = isoTexts.coinM
  const [sideType, setSideType] = useState<Side>("long")
  const [qty, setQty] = useState("")
  const [entry, setEntry] = useState("")
  const [mmr, setMmr] = useState("")
  const [lev, setLev] = useState("")
  const [margin, setMargin] = useState("")
  const [currency, setCurrency] = useState("")
  const [positionId, setPositionId] = useState("")
  const [hasSL, setHasSL] = useState(false)
  const [stopLoss, setStopLoss] = useState("")
  const [result, setResult] = useState<ReturnType<typeof calcIsoCoinMMarginOk> | null>(null)
  const [error, setError] = useState("")

  const calculate = () => {
    setError("")
    setResult(null)
    const qtyN = parseFloat(qty)
    const entryN = parseFloat(entry)
    const mmrN = parseFloat(mmr)
    if (!qtyN || !entryN || !mmrN) { setError(t.errors.missing); return }
    const levRaw = lev.trim()
    const imRaw = margin.trim()
    if (levRaw === "" && imRaw === "") { setError(t.errors.marginOrLeverage); return }

    const inputs: IsoCoinMInputs = {
      side: sideType,
      qtyUSD: qtyN,
      entryPrice: entryN,
      mmrPct: mmrN,
      leverage: levRaw !== "" ? parseFloat(levRaw) : undefined,
      availableMarginCoins: imRaw !== "" ? parseFloat(imRaw) : undefined,
    }
    const res = calcIsoCoinMMarginOk(inputs)
    setResult(res)
    if (!res.ok) setError(res.reason!)
  }

  const sl = sideLabel(sideType)
  const resultBlock = result?.result

  const slNum = parseFloat(stopLoss)
  const hasSlPrice = hasSL && !!slNum
  const stopLossLabel = hasSlPrice ? fmt(slNum, 6) : "—"
  const slProximityText =
    hasSlPrice && resultBlock
      ? stopLossProximity(parseFloat(entry), resultBlock.liquidationPrice, slNum) === "close"
        ? commonTexts.slProximityClose
        : commonTexts.slProximityFar
      : ""

  return (
    <ToolLayout
      form={
        <SectionCard title={t.section.title} description={t.section.description} icon={<ArrowDownUp className="h-4 w-4" />}>
          <div className="space-y-4">
            <PositionInfoFields
              currency={currency}
              onCurrencyChange={setCurrency}
              leverage={lev}
              onLeverageChange={setLev}
              direction={sideType}
              onDirectionChange={setSideType}
              positionId={positionId}
              onPositionIdChange={setPositionId}
              showDirection={false}
              showLeverage={false}
            />
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-1">
              <SideField value={sideType} onChange={(v) => setSideType(v)} />
              <FormField label={t.fields.qty.label} hint={t.fields.qty.hint}>
                <Input type="number" step="any" placeholder={t.fields.qty.placeholder} value={qty} onChange={e => setQty(e.target.value)} />
              </FormField>
              <FormField label={t.fields.entry.label}>
                <Input type="number" step="any" placeholder={t.fields.entry.placeholder} value={entry} onChange={e => setEntry(e.target.value)} />
              </FormField>
              <FormField label={t.fields.mmr.label} hint={t.fields.mmr.hint}>
                <Input type="number" step="any" placeholder={t.fields.mmr.placeholder} value={mmr} onChange={e => setMmr(e.target.value)} />
              </FormField>
              <FormField label={t.fields.leverage.label} hint={t.fields.leverage.hint}>
                <Input type="number" step="any" placeholder={t.fields.leverage.placeholder} value={lev} onChange={e => setLev(e.target.value)} />
              </FormField>
              <FormField label={t.fields.margin.label} hint={t.fields.margin.hint}>
                <Input type="number" step="any" placeholder={t.fields.margin.placeholder} value={margin} onChange={e => setMargin(e.target.value)} />
              </FormField>
            </div>
            <CheckboxField checked={hasSL} onChange={setHasSL} label={commonTexts.stopLossQuestion} />
            {hasSL && (
              <FormField label={commonTexts.stopLossPrice}>
                <Input type="number" step="any" placeholder={commonTexts.stopLossPricePlaceholder} value={stopLoss} onChange={e => setStopLoss(e.target.value)} />
              </FormField>
            )}
            <InfoNote>{t.infoNote}</InfoNote>
          </div>
        </SectionCard>
      }
      action={
        <Button onClick={calculate} size="full" className="gap-2">
          <Calculator className="h-4 w-4" /> {t.calculate}
        </Button>
      }
      errors={
        <>
          {error && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {result && !result.ok && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>
                <strong>{t.lowMarginTitle}</strong>
                <br />
                {result.reason}
              </AlertDescription>
            </Alert>
          )}
        </>
      }
      result={resultBlock && (
        <div className="space-y-5 animate-slide-up">
          <ResultHero
            eyebrow={t.eyebrow(sl)}
            title={t.heroTitle}
            value={resultBlock.liquidationPrice.toFixed(6)}
            sub={t.heroSub(resultBlock.movePct, sideType === "long", entry)}
            tone={sideType === "long" ? "primary" : "danger"}
          />

          <MetricGrid className="sm:grid-cols-3">
            <Stat label={t.stats.mm} value={`${fmt(resultBlock.maintenanceMargin, 8)} coins`} tone="warning" icon={<Scale className="h-4 w-4" />} />
            <Stat label={t.stats.margin} value={`${fmt(resultBlock.margin, 8)} coins`} tone="success" icon={<Wallet className="h-4 w-4" />} />
            <Stat label={t.stats.buffer} value={`${fmt(resultBlock.margin - resultBlock.maintenanceMargin, 8)} coins`} sub={t.stats.bufferSub} tone="primary" icon={<Activity className="h-4 w-4" />} />
            <Stat label={t.stats.move} value={`${resultBlock.movePct}%`} sub={t.stats.moveSub} icon={<TrendingDown className="h-4 w-4" />} />
            <Stat label={t.stats.leverage} value={resultBlock.leverageUsed ? `${resultBlock.leverageUsed}x` : "—"} tone={resultBlock.leverageUsed ? "default" : "muted"} icon={<Gauge className="h-4 w-4" />} />
          </MetricGrid>

          <BreakdownPanel>
            <BreakdownRow icon={<FunctionSquare className="h-4 w-4" />} title={t.breakdown.formula(sl)} tone="primary">
              <span className="font-mono text-[13px] text-primary/90">{resultBlock.formulaText}</span>
            </BreakdownRow>
            <BreakdownRow icon={<ListChecks className="h-4 w-4" />} title={t.breakdown.steps}>
              <ul className="space-y-1.5">
                {resultBlock.steps.map((s, i) => (
                  <li key={i} className="flex gap-2.5 font-mono text-[13px]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-semibold text-primary">{i + 1}</span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ul>
            </BreakdownRow>
            <BreakdownRow icon={<NotebookPen className="h-4 w-4" />} title={t.breakdown.details}>
              <ul className="space-y-1">
                {Object.entries(resultBlock.details).map(([k, v], i) => (
                  <li key={i} className="flex gap-2 text-[13px]">
                    <span className="text-primary">▪</span>
                    <span>{v === "" ? k : `${k}: ${v}`}</span>
                  </li>
                ))}
              </ul>
            </BreakdownRow>
            <BreakdownRow icon={<Wallet className="h-4 w-4" />} title={t.breakdown.narrative} tone="success">
              <p>{resultBlock.narrative}</p>
            </BreakdownRow>
          </BreakdownPanel>

          <TemplateCards
            variant={hasSL ? "isoCoinMSL" : "isoCoinM"}
            params={{
              side: sl,
              direction: sl,
              market: "Coin-M",
              currency: currency.trim() || "—",
              entry: String(entry),
              qty: `${qty} USD`,
              mmr: `${mmr}%`,
              margin: `${fmt(resultBlock.margin, 8)} coins`,
              mm: `${fmt(resultBlock.maintenanceMargin, 8)} coins`,
              buffer: `${fmt(resultBlock.margin - resultBlock.maintenanceMargin, 8)} coins`,
              liq: resultBlock.liquidationPrice.toFixed(6),
              move: `${resultBlock.movePct}%`,
              leverage: resultBlock.leverageUsed ? `${resultBlock.leverageUsed}x` : "—",
              positionId: positionId.trim() || "—",
              ...(hasSL ? { stopLoss: stopLossLabel, slProximityText } : {}),
            }}
          />
        </div>
      )}
    />
  )
}
