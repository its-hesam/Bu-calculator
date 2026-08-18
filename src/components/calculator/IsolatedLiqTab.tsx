import { useState, useRef } from "react"
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
import { RowPanel } from "@/components/shared/RowPanel"
import { isoTexts, commonTexts, mmrExplanationTexts, liqReductionTexts } from "@/lib/texts"
import {
  calcIsoLinearMarginOk, calcIsoCoinMMarginOk, calcIsoLinearReduction, calcIsoCoinMReduction,
  type IsoLinearInputs, type IsoCoinMInputs, type IsoLinearResult, type IsoCoinMResult,
  type LiqReductionLinearResult, type LiqReductionCoinMResult, type ReductionStageAResult,
  type LiqTier, type LiqReductionOrder,
  fmt, type Side, sideLabel, stopLossProximity,
} from "@/lib/calculators"
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
  Layers,
  ListOrdered,
  Plus,
} from "lucide-react"

const lr = liqReductionTexts

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

function ReductionCheckboxes({
  useMmr,
  setUseMmr,
  useReduction,
  setUseReduction,
}: {
  useMmr: boolean
  setUseMmr: (v: boolean) => void
  useReduction: boolean
  setUseReduction: (v: boolean) => void
}) {
  return (
    <div className="space-y-2.5">
      <CheckboxField checked={useMmr} onChange={setUseMmr} label={commonTexts.addMmrExplanation} />
      <CheckboxField checked={useReduction} onChange={setUseReduction} label={commonTexts.liquidationReduction} />
    </div>
  )
}

export interface TierRowState {
  id: number
  maxSize: string
  mmr: string
}

export interface RedOrderState {
  id: number
  time: string
  size: string
  pnl: string
}

function TierEditor({
  tiers,
  setTiers,
  unit,
}: {
  tiers: TierRowState[]
  setTiers: (v: TierRowState[]) => void
  unit: string
}) {
  const t = lr.tiers
  const idRef = useRef(1000)
  const add = () => setTiers([...tiers, { id: idRef.current++, maxSize: "", mmr: "" }])
  const remove = (id: number) => {
    if (tiers.length > 2) setTiers(tiers.filter(x => x.id !== id))
  }
  const update = (id: number, key: keyof TierRowState, v: string) =>
    setTiers(tiers.map(x => (x.id === id ? { ...x, [key]: v } : x)))

  return (
    <SectionCard title={t.heading} description={lr.section.description} icon={<Layers className="h-4 w-4" />}>
      <div className="space-y-3">
        {tiers.map((row, i) => {
          const isTop = i === tiers.length - 1
          return (
            <RowPanel key={row.id} index={i + 1} label={`Tier ${i + 1}`} onRemove={() => remove(row.id)} accent={isTop ? "success" : "primary"}>
              <div className="grid grid-cols-1 gap-3">
                <FormField label={t.maxSize(unit).label} hint={isTop ? t.maxSizeTopHint(unit) : t.maxSize(unit).hint}>
                  <Input type="number" step="any" placeholder={isTop ? "unbounded" : ""} value={row.maxSize} onChange={e => update(row.id, "maxSize", e.target.value)} />
                </FormField>
                <FormField label={t.mmr.label} hint={t.mmr.hint}>
                  <Input type="number" step="any" value={row.mmr} onChange={e => update(row.id, "mmr", e.target.value)} />
                </FormField>
              </div>
            </RowPanel>
          )
        })}
        <Button variant="outline" size="full" className="gap-2 border-dashed" onClick={add}>
          <Plus className="h-4 w-4" /> {t.add(tiers.length + 1)}
        </Button>
      </div>
    </SectionCard>
  )
}

function ReductionOrdersEditor({
  orders,
  setOrders,
  unit,
  pnlUnit,
}: {
  orders: RedOrderState[]
  setOrders: (v: RedOrderState[]) => void
  unit: string
  pnlUnit: string
}) {
  const t = lr.orders
  const idRef = useRef(2000)
  const add = () => setOrders([...orders, { id: idRef.current++, time: "", size: "", pnl: "" }])
  const remove = (id: number) => {
    if (orders.length > 0) setOrders(orders.filter(x => x.id !== id))
  }
  const update = (id: number, key: keyof RedOrderState, v: string) =>
    setOrders(orders.map(x => (x.id === id ? { ...x, [key]: v } : x)))

  return (
    <SectionCard title={t.heading} description={t.description} icon={<ListOrdered className="h-4 w-4" />}>
      <div className="space-y-3">
        {orders.map((o, i) => (
          <RowPanel key={o.id} index={i + 1} label="Order" onRemove={() => remove(o.id)} accent="danger">
            <div className="grid grid-cols-1 gap-3">
              <FormField label={t.fields.time.label} hint={t.fields.time.hint}>
                <Input type="datetime-local" step="1" value={o.time} onChange={e => update(o.id, "time", e.target.value)} />
              </FormField>
              <FormField label={t.fields.size(unit).label} hint={t.fields.size(unit).hint}>
                <Input type="number" step="any" value={o.size} onChange={e => update(o.id, "size", e.target.value)} />
              </FormField>
              <FormField label={t.fields.pnl(pnlUnit).label} hint={t.fields.pnl(pnlUnit).hint}>
                <Input type="number" step="any" value={o.pnl} onChange={e => update(o.id, "pnl", e.target.value)} />
              </FormField>
            </div>
          </RowPanel>
        ))}
        <Button variant="outline" size="full" className="gap-2 border-dashed" onClick={add}>
          <Plus className="h-4 w-4" /> {t.add}
        </Button>
      </div>
    </SectionCard>
  )
}

function ReductionStageAPanel({
  stageA,
  stable,
  unit,
}: {
  stageA: ReductionStageAResult
  stable: string
  unit: string
}) {
  const facts: Array<[string, string]> = [
    ["Original position size", `${fmt(stageA.originalSize, 6)} ${unit}`],
    ["Original position tier", `${stageA.originalTier.label} — MMR ${stageA.originalTier.mmrPct}%`],
    ["Maintenance Margin (original tier)", `${fmt(stageA.originalMm, 6)} ${stable}`],
    ["Available margin before reduction", `${fmt(stageA.marginBefore, 6)} ${stable}`],
    ["Remaining position size", `${fmt(stageA.remainingSize, 6)} ${unit} → ${stageA.remainingTier.label}`],
    ["Margin after reductions", `${fmt(stageA.marginAfter, 6)} ${stable}`],
  ]
  return (
    <BreakdownPanel>
      <BreakdownRow icon={<Layers className="h-4 w-4" />} title={lr.stageA} tone="warning">
        <ul className="space-y-1.5 font-mono text-[13px]">
          {facts.map(([k, v]) => (
            <li key={k} className="flex gap-2">
              <span className="text-warning">▪</span>
              <span><strong>{k}:</strong> {v}</span>
            </li>
          ))}
        </ul>
        {stageA.events.length > 0 && (
          <>
            <p className="mt-2 flex items-center gap-1.5 font-mono text-[12px] font-semibold text-warning"><ListOrdered className="h-3.5 w-3.5" /> Liquidation-Reduction Orders (Order History):</p>
            <ul className="space-y-1.5">
              {stageA.events.map(e => (
                <li key={e.idx} className="rounded-md bg-warning/5 px-2.5 py-1.5 font-mono text-[12px]">
                  <strong>#{e.idx}</strong> reduced {fmt(e.size, 6)} {unit} (PnL <span className={e.pnl >= 0 ? "text-success" : "text-destructive"}>{e.pnl >= 0 ? "+" : ""}{fmt(e.pnl, 6)} {stable}</span>) → remaining {fmt(e.sizeAfter, 6)} {unit}; tier {e.tierBefore.label} → {e.tierAfter.label} (MMR {e.tierBefore.mmrPct}% → {e.tierAfter.mmrPct}%); MM {fmt(e.mmBefore, 6)} → {fmt(e.mmAfter, 6)} {stable}
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          The available margin/equity dropped to or below the required Maintenance Margin, so the liquidation-reduction mechanism was triggered and the position was reduced in stages by the actual orders above. The remaining position was then evaluated separately for final liquidation.
        </p>
      </BreakdownRow>
    </BreakdownPanel>
  )
}

function IsoLinearBody({
  res,
  stable,
  sideType,
  entry,
  size,
  mmr,
}: {
  res: IsoLinearResult
  stable: string
  sideType: Side
  entry: string
  size: string
  mmr: string
}) {
  const t = isoTexts.linear
  const sl = sideLabel(sideType)
  return (
    <>
      <MetricGrid className="sm:grid-cols-3">
        <Stat label={t.stats.mm} value={`${fmt(res.maintenanceMargin, 6)} ${stable}`} tone="warning" icon={<Scale className="h-4 w-4" />} />
        <Stat label={t.stats.margin} value={`${fmt(res.margin, 6)} ${stable}`} tone="success" icon={<Wallet className="h-4 w-4" />} />
        <Stat label={t.stats.buffer} value={`${fmt(res.margin - res.maintenanceMargin, 6)} ${stable}`} sub={t.stats.bufferSub} tone="primary" icon={<Activity className="h-4 w-4" />} />
        <Stat label={t.stats.move} value={`${res.movePct}%`} sub={t.stats.moveSub} icon={<TrendingDown className="h-4 w-4" />} />
        <Stat label={t.stats.leverage} value={res.leverageUsed ? `${res.leverageUsed}x` : "—"} tone={res.leverageUsed ? "default" : "muted"} icon={<Gauge className="h-4 w-4" />} />
      </MetricGrid>

      <BreakdownPanel>
        <BreakdownRow icon={<FunctionSquare className="h-4 w-4" />} title={t.breakdown.formula(sl)} tone="primary">
          <span className="font-mono text-[13px] text-primary/90">{res.formulaText}</span>
        </BreakdownRow>
        <BreakdownRow icon={<ListChecks className="h-4 w-4" />} title={t.breakdown.steps}>
          <ul className="space-y-1.5">
            {res.steps.map((s, i) => (
              <li key={i} className="flex gap-2.5 font-mono text-[13px]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-semibold text-primary">{i + 1}</span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ul>
        </BreakdownRow>
        <BreakdownRow icon={<NotebookPen className="h-4 w-4" />} title={t.breakdown.details}>
          <ul className="space-y-1">
            {Object.entries(res.details).map(([k, v], i) => (
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
            Minimum Margin = Position Size × Entry Price × MMR = {size} × {entry} × {mmr}% = {fmt(res.maintenanceMargin, 6)} {stable}
          </p>
          <p className="mt-1.5">{t.breakdown.mmrOutro}</p>
        </BreakdownRow>
        <BreakdownRow icon={<Wallet className="h-4 w-4" />} title={t.breakdown.narrative} tone="success">
          <p>{res.narrative}</p>
        </BreakdownRow>
      </BreakdownPanel>
    </>
  )
}

function IsoCoinMBody({
  res,
  sideType,
}: {
  res: IsoCoinMResult
  sideType: Side
}) {
  const t = isoTexts.coinM
  const sl = sideLabel(sideType)
  return (
    <>
      <MetricGrid className="sm:grid-cols-3">
        <Stat label={t.stats.mm} value={`${fmt(res.maintenanceMargin, 8)} coins`} tone="warning" icon={<Scale className="h-4 w-4" />} />
        <Stat label={t.stats.margin} value={`${fmt(res.margin, 8)} coins`} tone="success" icon={<Wallet className="h-4 w-4" />} />
        <Stat label={t.stats.buffer} value={`${fmt(res.margin - res.maintenanceMargin, 8)} coins`} sub={t.stats.bufferSub} tone="primary" icon={<Activity className="h-4 w-4" />} />
        <Stat label={t.stats.move} value={`${res.movePct}%`} sub={t.stats.moveSub} icon={<TrendingDown className="h-4 w-4" />} />
        <Stat label={t.stats.leverage} value={res.leverageUsed ? `${res.leverageUsed}x` : "—"} tone={res.leverageUsed ? "default" : "muted"} icon={<Gauge className="h-4 w-4" />} />
      </MetricGrid>

      <BreakdownPanel>
        <BreakdownRow icon={<FunctionSquare className="h-4 w-4" />} title={t.breakdown.formula(sl)} tone="primary">
          <span className="font-mono text-[13px] text-primary/90">{res.formulaText}</span>
        </BreakdownRow>
        <BreakdownRow icon={<ListChecks className="h-4 w-4" />} title={t.breakdown.steps}>
          <ul className="space-y-1.5">
            {res.steps.map((s, i) => (
              <li key={i} className="flex gap-2.5 font-mono text-[13px]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-semibold text-primary">{i + 1}</span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ul>
        </BreakdownRow>
        <BreakdownRow icon={<NotebookPen className="h-4 w-4" />} title={t.breakdown.details}>
          <ul className="space-y-1">
            {Object.entries(res.details).map(([k, v], i) => (
              <li key={i} className="flex gap-2 text-[13px]">
                <span className="text-primary">▪</span>
                <span>{v === "" ? k : `${k}: ${v}`}</span>
              </li>
            ))}
          </ul>
        </BreakdownRow>
        <BreakdownRow icon={<Wallet className="h-4 w-4" />} title={t.breakdown.narrative} tone="success">
          <p>{res.narrative}</p>
        </BreakdownRow>
      </BreakdownPanel>
    </>
  )
}

function seedTiers(mmrField: string): TierRowState[] {
  return [
    { id: 1, maxSize: "", mmr: "0.4" },
    { id: 2, maxSize: "", mmr: mmrField || "0.5" },
  ]
}

function seedOrders(): RedOrderState[] {
  return [{ id: 1, time: "", size: "", pnl: "" }]
}

function parseTiers(tiers: TierRowState[]): { tiers: LiqTier[]; error?: string } {
  if (tiers.length < 2) return { tiers: [], error: lr.errors.tierMin }
  const parsed: LiqTier[] = []
  let prevMax = 0
  for (let i = 0; i < tiers.length; i++) {
    const row = tiers[i]
    const isTop = i === tiers.length - 1
    const mmrN = parseFloat(row.mmr)
    if (!mmrN || mmrN <= 0) return { tiers: [], error: lr.errors.tierMmr }
    const maxN = row.maxSize.trim() === "" ? null : parseFloat(row.maxSize)
    if (maxN !== null) {
      if (isNaN(maxN) || maxN <= 0) return { tiers: [], error: lr.errors.tierMaxSize }
      if (maxN <= prevMax) return { tiers: [], error: lr.errors.tierIncreasing }
      prevMax = maxN
    } else if (!isTop) {
      return { tiers: [], error: lr.errors.tierMaxSize }
    }
    parsed.push({ maxSize: maxN, mmrPct: mmrN })
  }
  return { tiers: parsed }
}

function parseOrders(orders: RedOrderState[], originalSize: number): { orders: LiqReductionOrder[]; error?: string } {
  if (orders.length === 0) return { orders: [], error: lr.errors.orderMin }
  const parsed: LiqReductionOrder[] = []
  let totalReduced = 0
  for (const o of orders) {
    const sizeN = parseFloat(o.size)
    const pnlN = parseFloat(o.pnl)
    if (!sizeN || sizeN <= 0) return { orders: [], error: lr.errors.orderSize }
    if (isNaN(pnlN)) return { orders: [], error: lr.errors.orderPnl }
    totalReduced += sizeN
    const tRaw = o.time.trim()
    const t = tRaw ? new Date(tRaw).getTime() : NaN
    parsed.push(tRaw && !isNaN(t) ? { size: sizeN, pnl: pnlN, time: t } : { size: sizeN, pnl: pnlN })
  }
  if (totalReduced >= originalSize) return { orders: [], error: lr.errors.overReduce }
  parsed.sort((a, b) => (a.time ?? Number.POSITIVE_INFINITY) - (b.time ?? Number.POSITIVE_INFINITY))
  return { orders: parsed }
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
  const [useMmrExplanation, setUseMmrExplanation] = useState(false)
  const [useReduction, setUseReduction] = useState(false)
  const [tiers, setTiers] = useState<TierRowState[]>([])
  const [orders, setOrders] = useState<RedOrderState[]>([])
  const [result, setResult] = useState<ReturnType<typeof calcIsoLinearMarginOk> | null>(null)
  const [reduction, setReduction] = useState<LiqReductionLinearResult | null>(null)
  const [error, setError] = useState("")

  const stable = side === "USDC" ? "USDC" : "USDT"
  const marginField = t.fields.margin(stable)
  const pairLabel = `${(currency.trim() || "BTC").toUpperCase()}USDT`

  const handleToggleReduction = (v: boolean) => {
    setUseReduction(v)
    if (v) {
      setTiers(prev => (prev.length ? prev : seedTiers(mmr)))
      setOrders(prev => (prev.length ? prev : seedOrders()))
      setResult(null)
      setReduction(null)
    }
  }

  const calculate = () => {
    setError("")
    setResult(null)
    setReduction(null)
    const entryN = parseFloat(entry)
    const sizeN = parseFloat(size)
    const mmrN = parseFloat(mmr)
    if (!entryN || !sizeN || !mmrN) { setError(t.errors.missing); return }
    const marginRaw = margin.trim()
    const levRaw = lev.trim()
    if (marginRaw === "" && levRaw === "") { setError(t.errors.marginOrLeverage); return }
    let am: number | undefined = marginRaw !== "" ? parseFloat(marginRaw) : undefined

    if (useReduction) {
      if (am === undefined) { am = (sizeN * entryN) / (parseFloat(levRaw) || 1) }
      const pt = parseTiers(tiers)
      if (pt.error) { setError(pt.error); return }
      const po = parseOrders(orders, sizeN)
      if (po.error) { setError(po.error); return }
      const red = calcIsoLinearReduction({
        side: sideType,
        pair: pairLabel,
        entryPrice: entryN,
        positionSize: sizeN,
        availableMargin: am,
        stable,
        tiers: pt.tiers,
        orders: po.orders,
      })
      setReduction(red)
      return
    }

    const inputs: IsoLinearInputs = {
      side: sideType,
      entryPrice: entryN,
      positionSize: sizeN,
      mmrPct: mmrN,
      leverage: levRaw !== "" ? parseFloat(levRaw) : undefined,
      availableMargin: am,
      stable,
    }
    const res = calcIsoLinearMarginOk(inputs)
    setResult(res)
    if (!res.ok) setError(res.reason!)
  }

  const sl = sideLabel(sideType)
  const resultBlock = result?.result
  const src = reduction ? reduction.stageB : resultBlock

  const slNum = parseFloat(stopLoss)
  const hasSlPrice = hasSL && !!slNum
  const stopLossLabel = hasSlPrice ? fmt(slNum, 6) : "—"
  const slProximityText =
    hasSlPrice && src
      ? stopLossProximity(parseFloat(entry), src.liquidationPrice, slNum) === "close"
        ? commonTexts.slProximityClose
        : commonTexts.slProximityFar
      : ""

  const mmrBase = useMmrExplanation && src
    ? {
        pair: pairLabel,
        stable,
        size: String(size),
        entry: String(entry),
        mmrPct: `${reduction ? reduction.stageA.originalTier.mmrPct : mmr}%`,
        mm: fmt(reduction ? reduction.stageA.originalMm : src.maintenanceMargin, 6),
        tier: reduction ? reduction.stageA.originalTier.label : "Tier 1",
      }
    : null

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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
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
            <ReductionCheckboxes
              useMmr={useMmrExplanation}
              setUseMmr={setUseMmrExplanation}
              useReduction={useReduction}
              setUseReduction={handleToggleReduction}
            />
            {useReduction && (
              <>
                <TierEditor tiers={tiers} setTiers={setTiers} unit="coins" />
                <ReductionOrdersEditor orders={orders} setOrders={setOrders} unit="coins" pnlUnit={stable} />
              </>
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
      result={src && (
        <div className="space-y-5 animate-slide-up">
          <ResultHero
            eyebrow={reduction ? lr.stageB : t.eyebrow(side, sl)}
            title={reduction ? lr.stageB : t.heroTitle}
            value={src.liquidationPrice.toFixed(6)}
            sub={t.heroSub(src.movePct, sideType === "long", entry)}
            tone={sideType === "long" ? "primary" : "danger"}
          />
          {reduction && <ReductionStageAPanel stageA={reduction.stageA} stable={stable} unit="coins" />}
          <IsoLinearBody
            res={src}
            stable={stable}
            sideType={sideType}
            entry={entry}
            size={reduction ? fmt(reduction.stageA.remainingSize, 6) : size}
            mmr={reduction ? `${reduction.stageA.remainingTier.mmrPct}` : mmr}
          />
          <TemplateCards
            variant={hasSL ? "isoLinearSL" : "isoLinear"}
            params={{
              side: sl,
              direction: sl,
              market: `${side}-M`,
              currency: currency.trim() || stable,
              entry: String(entry),
              size: String(size),
              mmr: `${mmr}%`,
              stable,
              margin: fmt(src.margin, 6),
              mm: fmt(src.maintenanceMargin, 6),
              buffer: fmt(src.margin - src.maintenanceMargin, 6),
              diff: fmt(src.diff, 6),
              sign: sideType === "long" ? "−" : "+",
              belowAbove: sideType === "long" ? "below" : "above",
              liq: src.liquidationPrice.toFixed(6),
              move: `${src.movePct}%`,
              leverage: src.leverageUsed ? `${src.leverageUsed}x` : "—",
              positionId: positionId.trim() || "—",
              ...(hasSL ? { stopLoss: stopLossLabel, slProximityText } : {}),
              mmrSection: mmrBase ? mmrExplanationTexts.build(mmrBase) : "",
              mmrSectionUser: mmrBase ? mmrExplanationTexts.buildUser(mmrBase) : "",
              liqReductionSection: reduction ? reduction.colleagueSection : "",
              liqReductionUser: reduction ? reduction.userSection : "",
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
  const [useMmrExplanation, setUseMmrExplanation] = useState(false)
  const [useReduction, setUseReduction] = useState(false)
  const [tiers, setTiers] = useState<TierRowState[]>([])
  const [orders, setOrders] = useState<RedOrderState[]>([])
  const [result, setResult] = useState<ReturnType<typeof calcIsoCoinMMarginOk> | null>(null)
  const [reduction, setReduction] = useState<LiqReductionCoinMResult | null>(null)
  const [error, setError] = useState("")

  const pairLabel = `${(currency.trim() || "BTC").toUpperCase()}USDT`

  const handleToggleReduction = (v: boolean) => {
    setUseReduction(v)
    if (v) {
      setTiers(prev => (prev.length ? prev : seedTiers(mmr)))
      setOrders(prev => (prev.length ? prev : seedOrders()))
      setResult(null)
      setReduction(null)
    }
  }

  const calculate = () => {
    setError("")
    setResult(null)
    setReduction(null)
    const qtyN = parseFloat(qty)
    const entryN = parseFloat(entry)
    const mmrN = parseFloat(mmr)
    if (!qtyN || !entryN || !mmrN) { setError(t.errors.missing); return }
    const levRaw = lev.trim()
    const imRaw = margin.trim()
    if (levRaw === "" && imRaw === "") { setError(t.errors.marginOrLeverage); return }
    let am: number | undefined = imRaw !== "" ? parseFloat(imRaw) : undefined

    if (useReduction) {
      if (am === undefined) { am = (qtyN / entryN) / (parseFloat(levRaw) || 1) }
      const pt = parseTiers(tiers)
      if (pt.error) { setError(pt.error); return }
      const po = parseOrders(orders, qtyN)
      if (po.error) { setError(po.error); return }
      const red = calcIsoCoinMReduction({
        side: sideType,
        pair: pairLabel,
        qtyUSD: qtyN,
        entryPrice: entryN,
        availableMarginCoins: am,
        tiers: pt.tiers,
        orders: po.orders,
      })
      setReduction(red)
      return
    }

    const inputs: IsoCoinMInputs = {
      side: sideType,
      qtyUSD: qtyN,
      entryPrice: entryN,
      mmrPct: mmrN,
      leverage: levRaw !== "" ? parseFloat(levRaw) : undefined,
      availableMarginCoins: am,
    }
    const res = calcIsoCoinMMarginOk(inputs)
    setResult(res)
    if (!res.ok) setError(res.reason!)
  }

  const sl = sideLabel(sideType)
  const resultBlock = result?.result
  const src = reduction ? reduction.stageB : resultBlock

  const slNum = parseFloat(stopLoss)
  const hasSlPrice = hasSL && !!slNum
  const stopLossLabel = hasSlPrice ? fmt(slNum, 6) : "—"
  const slProximityText =
    hasSlPrice && src
      ? stopLossProximity(parseFloat(entry), src.liquidationPrice, slNum) === "close"
        ? commonTexts.slProximityClose
        : commonTexts.slProximityFar
      : ""

  const mmrBase = useMmrExplanation && src
    ? {
        pair: pairLabel,
        stable: "coins",
        size: String(qty),
        entry: String(entry),
        mmrPct: `${reduction ? reduction.stageA.originalTier.mmrPct : mmr}%`,
        mm: fmt(reduction ? reduction.stageA.originalMm : src.maintenanceMargin, 6),
        tier: reduction ? reduction.stageA.originalTier.label : "Tier 1",
        isCoinM: true,
      }
    : null

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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
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
            <ReductionCheckboxes
              useMmr={useMmrExplanation}
              setUseMmr={setUseMmrExplanation}
              useReduction={useReduction}
              setUseReduction={handleToggleReduction}
            />
            {useReduction && (
              <>
                <TierEditor tiers={tiers} setTiers={setTiers} unit="USD" />
                <ReductionOrdersEditor orders={orders} setOrders={setOrders} unit="USD" pnlUnit="coins" />
              </>
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
      result={src && (
        <div className="space-y-5 animate-slide-up">
          <ResultHero
            eyebrow={reduction ? lr.stageB : t.eyebrow(sl)}
            title={reduction ? lr.stageB : t.heroTitle}
            value={src.liquidationPrice.toFixed(6)}
            sub={t.heroSub(src.movePct, sideType === "long", entry)}
            tone={sideType === "long" ? "primary" : "danger"}
          />
          {reduction && <ReductionStageAPanel stageA={reduction.stageA} stable="coins" unit="USD" />}
          <IsoCoinMBody res={src} sideType={sideType} />
          <TemplateCards
            variant={hasSL ? "isoCoinMSL" : "isoCoinM"}
            params={{
              side: sl,
              direction: sl,
              market: "Coin-M",
              currency: currency.trim() || "—",
              entry: String(entry),
              qty: reduction ? `${fmt(reduction.stageA.remainingSize, 6)} USD` : `${qty} USD`,
              mmr: `${mmr}%`,
              margin: fmt(src.margin, 6),
              mm: fmt(src.maintenanceMargin, 6),
              pv: src.positionValue.toFixed(6),
              bf: src.bankruptcyFee.toFixed(6),
              adj: src.adjustment.toFixed(6),
              sign: sideType === "long" ? "+" : "-",
              belowAbove: sideType === "long" ? "below" : "above",
              liq: src.liquidationPrice.toFixed(6),
              move: `${src.movePct}%`,
              leverage: src.leverageUsed ? `${src.leverageUsed}x` : "—",
              positionId: positionId.trim() || "—",
              ...(hasSL ? { stopLoss: stopLossLabel, slProximityText } : {}),
              mmrSection: mmrBase ? mmrExplanationTexts.build(mmrBase) : "",
              mmrSectionUser: mmrBase ? mmrExplanationTexts.buildUser(mmrBase) : "",
              liqReductionSection: reduction ? reduction.colleagueSection : "",
              liqReductionUser: reduction ? reduction.userSection : "",
            }}
          />
        </div>
      )}
    />
  )
}