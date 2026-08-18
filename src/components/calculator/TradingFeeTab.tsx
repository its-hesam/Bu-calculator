import { useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { RowPanel } from "@/components/shared/RowPanel"
import { PositionInfoFields } from "@/components/shared/PositionInfoFields"
import { CheckboxField } from "@/components/shared/CheckboxField"
import { feeTexts, commonTexts } from "@/lib/texts"
import { calcTradingFeeLinear, calcTradingFeeCoinM, fmt, type Side, type TradingFeeResult, type FeeRow } from "@/lib/calculators"
import {
  Calculator,
  ShieldAlert,
  Receipt,
  ArrowDownToLine,
  ArrowUpFromLine,
  Crown,
  BadgePercent,
  Plus,
  BadgeDollarSign,
  Percent,
  Ticket,
} from "lucide-react"

type OrderType = "maker" | "taker"
type MarginMode = "isolated" | "cross"

interface FeeRowState {
  id: number
  time: string
  price: string
  qty: string
  orderType: OrderType
}

export function TradingFeeTab() {
  const [subTab, setSubTab] = useState("usdt")

  return (
    <Tabs value={subTab} onValueChange={setSubTab}>
      <StableTabs />
      <TabsContent value="usdt"><FeeLinearForm stable="USDT" /></TabsContent>
      <TabsContent value="usdc"><FeeLinearForm stable="USDC" /></TabsContent>
      <TabsContent value="coin"><FeeCoinMForm /></TabsContent>
    </Tabs>
  )
}

const VIP_OPTIONS = Array.from({ length: 8 }, (_, i) => ({ value: String(i), label: `VIP ${i}` }))

function OrderTypeSelect({ value, onChange }: { value: OrderType; onChange: (v: OrderType) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="maker">{commonTexts.orderTypes.maker}</SelectItem>
        <SelectItem value="taker">{commonTexts.orderTypes.taker}</SelectItem>
      </SelectContent>
    </Select>
  )
}

interface FeeRowListProps {
  rows: FeeRowState[]
  setRows: (rows: FeeRowState[]) => void
  addLabel: string
  emptyText: string
  rowLabel: string
  accent: "primary" | "success" | "danger"
  timeLabel: string
  timePlaceholder: string
  priceLabel: string
  pricePlaceholder: string
  qtyLabel: string
  qtyHint?: string
  qtyPlaceholder?: string
  typeLabel: string
}

function FeeRowList({ rows, setRows, addLabel, emptyText, rowLabel, accent, timeLabel, timePlaceholder, priceLabel, pricePlaceholder, qtyLabel, qtyHint, qtyPlaceholder, typeLabel }: FeeRowListProps) {
  const add = () => {
    const nextId = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1
    setRows([...rows, { id: nextId, time: "", price: "", qty: "", orderType: "maker" }])
  }
  const update = (id: number, key: keyof FeeRowState, value: string | OrderType) => {
    setRows(rows.map(r => r.id === id ? { ...r, [key]: value } : r))
  }

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" className="w-full gap-1.5 border-dashed" onClick={add}>
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </Button>
      {rows.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-surface/40 p-4 text-center text-xs text-muted-foreground">
          {emptyText}
        </p>
      )}
      {rows.map(r => (
        <RowPanel key={r.id} index={r.id} label={rowLabel} onRemove={() => setRows(rows.filter(x => x.id !== r.id))} accent={accent}>
          <div className="grid grid-cols-1 gap-3">
            <FormField label={timeLabel}>
              <Input type="text" placeholder={timePlaceholder} value={r.time} onChange={e => update(r.id, "time", e.target.value)} />
            </FormField>
            <FormField label={priceLabel}>
              <Input type="number" step="any" placeholder={pricePlaceholder} value={r.price} onChange={e => update(r.id, "price", e.target.value)} />
            </FormField>
            <FormField label={qtyLabel} hint={qtyHint}>
              <Input type="number" step="any" placeholder={qtyPlaceholder} value={r.qty} onChange={e => update(r.id, "qty", e.target.value)} />
            </FormField>
            <FormField label={typeLabel}>
              <OrderTypeSelect value={r.orderType} onChange={(v) => update(r.id, "orderType", v)} />
            </FormField>
          </div>
        </RowPanel>
      ))}
      {rows.length > 0 && (
        <Button variant="outline" size="full" className="gap-2 border-dashed" onClick={add}>
          <Plus className="h-4 w-4" /> {addLabel}
        </Button>
      )}
    </div>
  )
}

function FeeLinearForm({ stable }: { stable: string }) {
  const t = feeTexts.linear
  const c = feeTexts.common
  const [vip, setVip] = useState("0")
  const [entries, setEntries] = useState<FeeRowState[]>([])
  const [exits, setExits] = useState<FeeRowState[]>([])
  const [hasFeeCard, setHasFeeCard] = useState(false)
  const [grossPnl, setGrossPnl] = useState("")
  const [marginMode, setMarginMode] = useState<MarginMode>("isolated")
  const [currency, setCurrency] = useState(stable)
  const [leverage, setLeverage] = useState("")
  const [direction, setDirection] = useState<Side>("long")
  const [positionId, setPositionId] = useState("")
  const [result, setResult] = useState<TradingFeeResult | null>(null)
  const [error, setError] = useState("")

  const calculate = () => {
    setError("")
    setResult(null)
    const toRows = (rs: FeeRowState[]): FeeRow[] | null => {
      const out: FeeRow[] = []
      for (const r of rs) {
        const p = parseFloat(r.price), q = parseFloat(r.qty)
        if (!p || !q) return null
        out.push({ time: r.time.trim(), price: p, qty: q, orderType: r.orderType })
      }
      return out
    }
    const ent = toRows(entries)
    const ext = toRows(exits)
    if (!ent || !ext || ent.length === 0 || ext.length === 0) { setError(t.error); return }
    const gp = parseFloat(grossPnl)
    if (isNaN(gp)) { setError(t.errorPnl); return }
    setResult(calcTradingFeeLinear({ vipLevel: parseInt(vip), entries: ent, exits: ext, hasFeeCard, grossPnl: gp, stable }))
  }

  return (
    <ToolLayout
      form={
        <>
          <SectionCard title={t.section.title} description={t.section.description} icon={<Receipt className="h-4 w-4" />}>
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
              <FormField label={t.fields.vip}>
                <Select value={vip} onValueChange={setVip}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VIP_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label={c.marginMode.label}>
                <Select value={marginMode} onValueChange={(v: MarginMode) => setMarginMode(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="isolated">{c.marginMode.isolated}</SelectItem>
                    <SelectItem value="cross">{c.marginMode.cross}</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label={c.grossPnl.label} hint={c.grossPnl.hint}>
                <Input type="number" step="any" placeholder={c.grossPnl.placeholder} value={grossPnl} onChange={e => setGrossPnl(e.target.value)} />
              </FormField>
              <CheckboxField checked={hasFeeCard} onChange={setHasFeeCard} label={c.feeDeductionCard} />
            </div>
          </SectionCard>
          <SectionCard
            title={c.entries.section}
            icon={<ArrowDownToLine className="h-4 w-4" />}
            contentClassName="space-y-4"
          >
            <FeeRowList
              rows={entries}
              setRows={setEntries}
              addLabel={c.entries.add}
              emptyText={c.entries.empty}
              rowLabel={c.entryRow}
              accent="primary"
              timeLabel={c.entries.fields.time.label}
              timePlaceholder={c.entries.fields.time.placeholder}
              priceLabel={c.entries.fields.price.label}
              pricePlaceholder={c.entries.fields.price.placeholder}
              qtyLabel={c.entries.fields.qty}
              qtyPlaceholder="e.g. 1"
              typeLabel={c.entries.fields.type}
            />
            <InfoNote>Multiple entries and exits are supported. Each transaction is calculated and charged separately.</InfoNote>
          </SectionCard>
          <SectionCard
            title={c.exits.section}
            icon={<ArrowUpFromLine className="h-4 w-4" />}
            contentClassName="space-y-4"
          >
            <FeeRowList
              rows={exits}
              setRows={setExits}
              addLabel={c.exits.add}
              emptyText={c.exits.empty}
              rowLabel={c.exitRow}
              accent="danger"
              timeLabel={c.exits.fields.time.label}
              timePlaceholder={c.exits.fields.time.placeholder}
              priceLabel={c.exits.fields.price.label}
              pricePlaceholder={c.exits.fields.price.placeholder}
              qtyLabel={c.exits.fields.qty}
              qtyPlaceholder="e.g. 1"
              typeLabel={c.exits.fields.type}
            />
          </SectionCard>
        </>
      }
      action={
        <Button onClick={calculate} size="full" className="gap-2"><Calculator className="h-4 w-4" /> {t.calculate}</Button>
      }
      errors={error && (
        <Alert variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
      )}
      result={result && (
        <FeeResultView
          result={result}
          entries={entries}
          exits={exits}
          currency={currency.trim() || stable}
          leverage={leverage.trim() ? `${leverage}x` : "—"}
          direction={direction === "long" ? "LONG" : "SHORT"}
          positionId={positionId.trim() || "—"}
          marginMode={marginMode}
          stable={stable}
        />
      )}
    />
  )
}

function FeeCoinMForm() {
  const t = feeTexts.coinM
  const c = feeTexts.common
  const [vip, setVip] = useState("0")
  const [coinName, setCoinName] = useState("")
  const [entries, setEntries] = useState<FeeRowState[]>([])
  const [exits, setExits] = useState<FeeRowState[]>([])
  const [hasFeeCard, setHasFeeCard] = useState(false)
  const [grossPnl, setGrossPnl] = useState("")
  const [marginMode, setMarginMode] = useState<MarginMode>("isolated")
  const [currency, setCurrency] = useState("")
  const [leverage, setLeverage] = useState("")
  const [direction, setDirection] = useState<Side>("long")
  const [positionId, setPositionId] = useState("")
  const [result, setResult] = useState<TradingFeeResult | null>(null)
  const [error, setError] = useState("")

  const calculate = () => {
    setError("")
    setResult(null)
    const toRows = (rs: FeeRowState[]): FeeRow[] | null => {
      const out: FeeRow[] = []
      for (const r of rs) {
        const p = parseFloat(r.price), q = parseFloat(r.qty)
        if (!p || !q) return null
        out.push({ time: r.time.trim(), price: p, qty: q, orderType: r.orderType })
      }
      return out
    }
    const ent = toRows(entries)
    const ext = toRows(exits)
    if (!ent || !ext || ent.length === 0 || ext.length === 0) { setError(t.error); return }
    const gp = parseFloat(grossPnl)
    if (isNaN(gp)) { setError(t.errorPnl); return }
    setResult(calcTradingFeeCoinM({ vipLevel: parseInt(vip), coinName: coinName.toUpperCase() || "coin", entries: ent, exits: ext, hasFeeCard, grossPnl: gp }))
  }

  return (
    <ToolLayout
      form={
        <>
          <SectionCard title={t.section.title} description={t.section.description} icon={<Receipt className="h-4 w-4" />}>
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
              <FormField label={t.fields.vip}>
                <Select value={vip} onValueChange={setVip}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{VIP_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
              <FormField label={t.fields.coin.label}>
                <Input placeholder={t.fields.coin.placeholder} value={coinName} onChange={e => setCoinName(e.target.value.toUpperCase())} />
              </FormField>
              <FormField label={c.marginMode.label}>
                <Select value={marginMode} onValueChange={(v: MarginMode) => setMarginMode(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="isolated">{c.marginMode.isolated}</SelectItem>
                    <SelectItem value="cross">{c.marginMode.cross}</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label={c.grossPnl.label} hint={c.grossPnl.hint}>
                <Input type="number" step="any" placeholder={c.grossPnl.placeholder} value={grossPnl} onChange={e => setGrossPnl(e.target.value)} />
              </FormField>
              <CheckboxField checked={hasFeeCard} onChange={setHasFeeCard} label={c.feeDeductionCard} />
            </div>
          </SectionCard>
          <SectionCard
            title={c.entries.section}
            icon={<ArrowDownToLine className="h-4 w-4" />}
            contentClassName="space-y-4"
          >
            <FeeRowList
              rows={entries}
              setRows={setEntries}
              addLabel={c.entries.add}
              emptyText={c.entries.empty}
              rowLabel={c.entryRow}
              accent="primary"
              timeLabel={c.entries.fields.time.label}
              timePlaceholder={c.entries.fields.time.placeholder}
              priceLabel={c.entries.fields.price.label}
              pricePlaceholder={c.entries.fields.price.placeholder}
              qtyLabel="Quantity Unit (USD)"
              qtyPlaceholder="e.g. 10000"
              typeLabel={c.entries.fields.type}
            />
            <InfoNote>For Coin-M, quantity is entered in USD and the fee settles in the base coin. Multiple entries and exits are supported.</InfoNote>
          </SectionCard>
          <SectionCard
            title={c.exits.section}
            icon={<ArrowUpFromLine className="h-4 w-4" />}
            contentClassName="space-y-4"
          >
            <FeeRowList
              rows={exits}
              setRows={setExits}
              addLabel={c.exits.add}
              emptyText={c.exits.empty}
              rowLabel={c.exitRow}
              accent="danger"
              timeLabel={c.exits.fields.time.label}
              timePlaceholder={c.exits.fields.time.placeholder}
              priceLabel={c.exits.fields.price.label}
              pricePlaceholder={c.exits.fields.price.placeholder}
              qtyLabel="Quantity Unit (USD)"
              qtyPlaceholder="e.g. 10000"
              typeLabel={c.exits.fields.type}
            />
          </SectionCard>
        </>
      }
      action={
        <Button onClick={calculate} size="full" className="gap-2"><Calculator className="h-4 w-4" /> {t.calculate}</Button>
      }
      errors={error && (
        <Alert variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
      )}
      result={result && (
        <FeeResultView
          result={result}
          entries={entries}
          exits={exits}
          currency={currency.trim() || (result.coin ?? "coin")}
          leverage={leverage.trim() ? `${leverage}x` : "—"}
          direction={direction === "long" ? "LONG" : "SHORT"}
          positionId={positionId.trim() || "—"}
          marginMode={marginMode}
          coin={result.coin ?? "coin"}
        />
      )}
    />
  )
}

interface FeeMsgRow {
  time: string
  orderType: string
  price: string
  qty: string
  value: string
  calcText: string
  fee: string
}

function feeMsgRows(rows: FeeRowState[], fees: number[], effMaker: number, effTaker: number, isCoinM: boolean, feeDecimals: number): FeeMsgRow[] {
  return rows.map((r, i) => {
    const rate = r.orderType === "maker" ? effMaker : effTaker
    const price = parseFloat(r.price)
    const qty = parseFloat(r.qty)
    const value = isCoinM ? qty : price * qty
    const calcText = isCoinM
      ? `(${fmt(qty, 6)} × ${fmt(rate, 4)}%) ÷ ${fmt(price, 6)}`
      : `${fmt(price, 6)} × ${fmt(qty, 6)} × ${fmt(rate, 4)}%`
    return {
      time: r.time.trim(),
      orderType: r.orderType === "maker" ? commonTexts.orderTypes.maker : commonTexts.orderTypes.taker,
      price: fmt(price, 6),
      qty: fmt(qty, 6),
      value: fmt(value, 6),
      calcText,
      fee: fmt(fees[i], feeDecimals),
    }
  })
}

function buildFeeMessage(o: {
  pair: string
  sizeUnit: string
  priceUnit: string
  feeUnit: string
  marginMode: string
  leverage: string
  direction: string
  totalSize: string
  entries: FeeMsgRow[]
  exits: FeeMsgRow[]
  grossPnl: string
  grossOutcome: string
  vip: string
  baseMaker: string
  baseTaker: string
  effMaker: string
  effTaker: string
  hasFeeCard: boolean
  entryFee: string
  exitFee: string
  totalFee: string
  formulaEntry: string
  formulaExit: string
  finalPnlLine: string
  finalPnlValue: string
  netOutcome: string
}): string {
  const L: string[] = []
  const push = (s = "") => L.push(s)
  const { entries, exits } = o

  push("Thank you very much for your patience while we reviewed the details of your position.")
  push()
  push(`We have carefully checked the complete transaction history of your ${o.pair} position. Please find the details below:`)
  push()
  push(`Symbol: ${o.pair}`)
  push(`Margin Mode: ${o.marginMode}`)
  push(`Leverage: ${o.leverage}`)
  push(`Direction: ${o.direction}`)
  push(`Position Size: ${o.totalSize} ${o.sizeUnit}`)
  if (entries.length === 1) {
    push(`Opening Price: ${entries[0].price} ${o.priceUnit}`)
  } else {
    push("Entry Transactions:")
    entries.forEach((e, i) => push(`• Entry #${i + 1}${e.time ? ` — ${e.time}` : ""} — ${e.orderType} Order — Price ${e.price}, Size ${e.qty} ${o.sizeUnit}`))
  }
  if (exits.length === 1) {
    push(`Closing Price: ${exits[0].price} ${o.priceUnit}`)
  } else {
    push("Exit Transactions:")
    exits.forEach((e, i) => push(`• Exit #${i + 1}${e.time ? ` — ${e.time}` : ""} — ${e.orderType} Order — Price ${e.price}, Size ${e.qty} ${o.sizeUnit}`))
  }
  push()
  if (entries.length === 1) {
    const e = entries[0]
    push(`The position was opened through a ${e.orderType} Order, with a filled value of approximately ${e.value} ${o.priceUnit}.`)
  } else {
    push("The position was opened through the following orders:")
    entries.forEach((e, i) => push(`• Entry #${i + 1}${e.time ? ` — ${e.time}` : ""} — ${e.orderType} Order — filled value ≈ ${e.value} ${o.priceUnit}`))
  }
  if (exits.length === 1) {
    const e = exits[0]
    push(`The position was later closed through another ${e.orderType} Order, with a filled value of approximately ${e.value} ${o.priceUnit}.`)
  } else {
    push("The position was later closed through the following orders:")
    exits.forEach((e, i) => push(`• Exit #${i + 1}${e.time ? ` — ${e.time}` : ""} — ${e.orderType} Order — filled value ≈ ${e.value} ${o.priceUnit}`))
  }
  push()
  push(`Your gross realized PnL from the price movement was: ${o.grossPnl}`)
  push(`This means that before trading fees were deducted, the position generated a ${o.grossOutcome} of approximately ${o.grossPnl}.`)
  push()
  push(`Your account is ${o.vip}, and your applicable Futures fee rates are:`)
  push(`Maker: ${o.baseMaker}% · Taker: ${o.baseTaker}%`)
  if (o.hasFeeCard) {
    push()
    push("Since you used a Fee Deduction Card, all applicable fee rates were reduced by 50%. Please find the calculation below:")
    push(`Effective Maker rate: ${o.baseMaker}% ÷ 2 = ${o.effMaker}%`)
    push(`Effective Taker rate: ${o.baseTaker}% ÷ 2 = ${o.effTaker}%`)
  }
  push()
  push("Please note that opening and closing a position are two separate transactions, and each transaction is charged a trading fee separately.")
  push()
  push("OPENING FEE")
  push(`Using the fee formula: ${o.formulaEntry}`)
  entries.forEach((e, i) => push(`Entry #${i + 1}${e.time ? ` (${e.time})` : ""}: ${e.calcText} = ${e.fee} ${o.feeUnit}`))
  push(`Total Opening Fee: ${o.entryFee}`)
  push()
  push("CLOSING FEE")
  push(`Using the fee formula: ${o.formulaExit}`)
  exits.forEach((e, i) => push(`Exit #${i + 1}${e.time ? ` (${e.time})` : ""}: ${e.calcText} = ${e.fee} ${o.feeUnit}`))
  push(`Total Closing Fee: ${o.exitFee}`)
  push()
  push("SUMMARY")
  push(`Opening Fee: ${o.entryFee}`)
  push(`Closing Fee: ${o.exitFee}`)
  push(`Total Fees: ${o.totalFee}`)
  push()
  push("Therefore, your final PnL was:")
  push(`${o.finalPnlLine}`)
  push()
  push(`So, after deducting the trading fees, your final realized ${o.netOutcome} was approximately ${o.finalPnlValue}.`)
  push(`Please keep in mind that the trading fee is charged separately for each side of the trade. In this case, you paid approximately ${o.entryFee} when opening the position and another ${o.exitFee} when closing it, rather than paying a single fee for the entire round trip.`)
  push()
  push("We hope this detailed breakdown clarifies how your position, PnL, and trading fees were calculated.")

  return L.join("\n")
}

interface FeeResultViewProps {
  result: TradingFeeResult
  entries: FeeRowState[]
  exits: FeeRowState[]
  currency: string
  leverage: string
  direction: string
  positionId: string
  marginMode: MarginMode
  stable?: string
  coin?: string
}

function FeeResultView({ result, entries, exits, currency, leverage, direction, positionId, marginMode, stable, coin }: FeeResultViewProps) {
  const isCoinM = result.isCoinM
  const feeUnit = isCoinM ? (coin ?? "coin") : (stable ?? "USDT")
  const pnlUnit = isCoinM ? "USDT" : (stable ?? "USDT")
  const pair = isCoinM ? `${currency}USDT` : `${currency}${stable}`

  const effMaker = result.effMakerRate
  const effTaker = result.effTakerRate
  const feeDecimals = isCoinM ? 8 : 6

  const totalSize = isCoinM
    ? fmt(entries.reduce((s, e) => s + (parseFloat(e.qty) || 0), 0), 2)
    : fmt(entries.reduce((s, e) => s + (parseFloat(e.qty) || 0), 0), 6)

  const msgEntries = feeMsgRows(entries, result.entryFees, effMaker, effTaker, isCoinM, feeDecimals)
  const msgExits = feeMsgRows(exits, result.exitFees, effMaker, effTaker, isCoinM, feeDecimals)

  const totalFeeUSD = isCoinM
    ? result.entryFees.reduce((s, f, i) => s + f * (parseFloat(entries[i].price) || 0), 0) +
      result.exitFees.reduce((s, f, i) => s + f * (parseFloat(exits[i].price) || 0), 0)
    : result.totalFee
  const netPnl = result.grossPnl - totalFeeUSD

  const entryFeeStr = `${fmt(result.totalEntryFee, feeDecimals)} ${feeUnit}`
  const exitFeeStr = `${fmt(result.totalExitFee, feeDecimals)} ${feeUnit}`
  const totalFeeStr = isCoinM
    ? `${fmt(result.totalFee, feeDecimals)} ${feeUnit} (≈ ${fmt(totalFeeUSD, 2)} ${pnlUnit})`
    : `${fmt(result.totalFee, feeDecimals)} ${feeUnit}`
  const grossPnlStr = `${fmt(result.grossPnl, 6)} ${pnlUnit}`
  const finalPnlLine = `${fmt(result.grossPnl, 6)} − ${fmt(totalFeeUSD, 6)} = ${fmt(netPnl, 6)} ${pnlUnit}`
  const finalPnlStr = `${fmt(netPnl, 6)} ${pnlUnit}`
  const grossOutcome = result.grossPnl >= 0 ? "profit" : "loss"
  const netOutcome = netPnl >= 0 ? "profit" : "loss"

  const body = buildFeeMessage({
    pair,
    sizeUnit: isCoinM ? "USD" : currency,
    priceUnit: isCoinM ? "USDT" : (stable ?? "USDT"),
    feeUnit,
    marginMode: marginMode === "isolated" ? "Isolated" : "Cross",
    leverage,
    direction,
    totalSize,
    entries: msgEntries,
    exits: msgExits,
    grossPnl: grossPnlStr,
    grossOutcome,
    vip: `VIP ${result.vipLevel}`,
    baseMaker: fmt(result.baseMakerRate, 4),
    baseTaker: fmt(result.baseTakerRate, 4),
    effMaker: fmt(effMaker, 4),
    effTaker: fmt(effTaker, 4),
    hasFeeCard: result.hasFeeCard,
    entryFee: entryFeeStr,
    exitFee: exitFeeStr,
    totalFee: totalFeeStr,
    formulaEntry: isCoinM ? feeTexts.coinM.formulas.open : feeTexts.linear.formulas.entry,
    formulaExit: isCoinM ? feeTexts.coinM.formulas.close : feeTexts.linear.formulas.exit,
    finalPnlLine,
    finalPnlValue: finalPnlStr,
    netOutcome,
  })

  const lt = feeTexts.linear
  const ct = feeTexts.coinM
  const heroEyebrow = isCoinM ? ct.eyebrow(`VIP ${result.vipLevel}`) : lt.eyebrow(stable ?? "USDT", `VIP ${result.vipLevel}`)
  const heroSub = isCoinM
    ? ct.heroSub(coin ?? "coin", fmt(effMaker, 4), fmt(effTaker, 4), result.hasFeeCard)
    : lt.heroSub(fmt(effMaker, 4), fmt(effTaker, 4), result.hasFeeCard)
  const statEntryLabel = isCoinM ? ct.stats.open : lt.stats.entry
  const statExitLabel = isCoinM ? ct.stats.close : lt.stats.exit
  const statVipLabel = isCoinM ? ct.stats.pair : lt.stats.vip
  const statTotalLabel = isCoinM ? ct.stats.total : lt.stats.total
  const statNetPnlLabel = isCoinM ? ct.stats.netPnl : lt.stats.netPnl
  const brkFeesLabel = isCoinM ? ct.breakdown.fees : lt.breakdown.fees
  const brkEntryLabel = isCoinM ? ct.breakdown.open(entries.length) : lt.breakdown.entry(entries.length)
  const brkExitLabel = isCoinM ? ct.breakdown.close(exits.length) : lt.breakdown.exit(exits.length)
  const brkSummaryLabel = isCoinM ? ct.breakdown.summary : lt.breakdown.summary

  return (
    <div className="space-y-5 animate-slide-up">
      <ResultHero
        eyebrow={heroEyebrow}
        title={isCoinM ? ct.hero.title : lt.hero.title}
        value={`${fmt(result.totalFee, feeDecimals)} ${feeUnit}`}
        tone="primary"
        sub={heroSub}
      />

      <MetricGrid className="sm:grid-cols-3">
        <Stat label={statEntryLabel} value={entryFeeStr} tone="primary" icon={<ArrowDownToLine className="h-4 w-4" />} />
        <Stat label={statExitLabel} value={exitFeeStr} tone="primary" icon={<ArrowUpFromLine className="h-4 w-4" />} />
        <Stat label={statVipLabel} value={isCoinM ? (coin ?? "coin") : `VIP ${result.vipLevel}`} icon={<Crown className="h-4 w-4" />} />
        <Stat label={statTotalLabel} value={totalFeeStr} tone="success" icon={<BadgePercent className="h-4 w-4" />} />
        <Stat label={statNetPnlLabel} value={`${fmt(netPnl, 6)} ${pnlUnit}`} tone={netPnl >= 0 ? "success" : "danger"} icon={<BadgeDollarSign className="h-4 w-4" />} />
      </MetricGrid>

      <BreakdownPanel>
        <BreakdownRow icon={<Percent className="h-4 w-4" />} title={brkFeesLabel} tone="warning">
          <ul className="space-y-1 font-mono text-[13px]">
            <li>Maker: {fmt(result.baseMakerRate, 4)}% {result.hasFeeCard ? `→ ${fmt(effMaker, 4)}% (Fee Deduction Card ÷2)` : ""}</li>
            <li>Taker: {fmt(result.baseTakerRate, 4)}% {result.hasFeeCard ? `→ ${fmt(effTaker, 4)}% (Fee Deduction Card ÷2)` : ""}</li>
          </ul>
        </BreakdownRow>
        <BreakdownRow icon={<ArrowDownToLine className="h-4 w-4" />} title={brkEntryLabel} tone="primary">
          <ul className="space-y-1 font-mono text-[13px]">
            {msgEntries.map((e, i) => (
              <li key={i}>
                {e.calcText} = <strong className="text-primary">{e.fee} {feeUnit}</strong>{e.time ? ` (${e.time})` : ""}
              </li>
            ))}
          </ul>
        </BreakdownRow>
        <BreakdownRow icon={<ArrowUpFromLine className="h-4 w-4" />} title={brkExitLabel} tone="danger">
          <ul className="space-y-1 font-mono text-[13px]">
            {msgExits.map((e, i) => (
              <li key={i}>
                {e.calcText} = <strong className="text-destructive">{e.fee} {feeUnit}</strong>{e.time ? ` (${e.time})` : ""}
              </li>
            ))}
          </ul>
        </BreakdownRow>
        <BreakdownRow icon={<Ticket className="h-4 w-4" />} title={brkSummaryLabel} tone="success">
          <p className="font-mono text-[13px]">
            {result.grossPnl >= 0 ? "+" : ""}{fmt(result.grossPnl, 6)} − {fmt(totalFeeUSD, 6)} = {fmt(netPnl, 6)} {pnlUnit}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Gross realized PnL − total trading fees = final realized PnL.</p>
        </BreakdownRow>
      </BreakdownPanel>

      <TemplateCards
        variant={isCoinM ? "feeCoinM" : "feeLinear"}
        bodies={{ colleague: body, user: body }}
        params={{
          pair,
          market: isCoinM ? `Coin-M (${feeUnit})` : `${stable}-M`,
          currency,
          direction,
          vip: `VIP ${result.vipLevel}`,
          maker: `${fmt(result.baseMakerRate, 4)}%`,
          taker: `${fmt(result.baseTakerRate, 4)}%`,
          totalSize,
          grossPnl: grossPnlStr,
          totalFee: totalFeeStr,
          netPnl: finalPnlStr,
          marginMode: marginMode === "isolated" ? "Isolated" : "Cross",
          leverage,
          positionId,
        }}
      />
    </div>
  )
}
