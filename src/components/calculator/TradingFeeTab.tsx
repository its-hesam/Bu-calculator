import { useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { PositionInfoFields } from "@/components/shared/PositionInfoFields"
import { feeTexts, commonTexts } from "@/lib/texts"
import { calcTradingFeeLinear, calcTradingFeeCoinM, fmt, type Side } from "@/lib/calculators"
import { Calculator, ShieldAlert, Receipt, ArrowDownUp, Coins, ArrowDownToLine, ArrowUpFromLine, Crown, BadgePercent } from "lucide-react"

type OrderType = "maker" | "taker"

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

function OrderTypeField({ value, onChange, label }: { value: OrderType; onChange: (v: OrderType) => void; label: string }) {
  return (
    <FormField label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="maker">{commonTexts.orderTypes.maker}</SelectItem>
          <SelectItem value="taker">{commonTexts.orderTypes.taker}</SelectItem>
        </SelectContent>
      </Select>
    </FormField>
  )
}

function FeeLinearForm({ stable }: { stable: string }) {
  const t = feeTexts.linear
  const [vip, setVip] = useState("0")
  const [entryType, setEntryType] = useState<OrderType>("maker")
  const [exitType, setExitType] = useState<OrderType>("maker")
  const [size, setSize] = useState("")
  const [entry, setEntry] = useState("")
  const [exit, setExit] = useState("")
  const [currency, setCurrency] = useState(stable)
  const [leverage, setLeverage] = useState("")
  const [direction, setDirection] = useState<Side>("long")
  const [positionId, setPositionId] = useState("")
  const [result, setResult] = useState<ReturnType<typeof calcTradingFeeLinear> | null>(null)
  const [error, setError] = useState("")

  const calculate = () => {
    setError("")
    setResult(null)
    const sizeN = parseFloat(size), entryN = parseFloat(entry), exitN = parseFloat(exit)
    if (!sizeN || !entryN || !exitN) { setError(t.error); return }
    setResult(calcTradingFeeLinear({ vipLevel: parseInt(vip), entryType, exitType, size: sizeN, entryPrice: entryN, exitPrice: exitN, stable }))
  }

  return (
    <ToolLayout
      form={
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
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-1">
              <FormField label={t.fields.vip}>
                <Select value={vip} onValueChange={setVip}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VIP_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label={t.fields.size.label} hint={t.fields.size.hint}>
                <Input type="number" step="any" placeholder={t.fields.size.placeholder} value={size} onChange={e => setSize(e.target.value)} />
              </FormField>
              <OrderTypeField label={t.fields.entryType} value={entryType} onChange={(v) => setEntryType(v)} />
              <OrderTypeField label={t.fields.exitType} value={exitType} onChange={(v) => setExitType(v)} />
              <FormField label={t.fields.entry.label}>
                <Input type="number" step="any" placeholder={t.fields.entry.placeholder} value={entry} onChange={e => setEntry(e.target.value)} />
              </FormField>
              <FormField label={t.fields.exit.label}>
                <Input type="number" step="any" placeholder={t.fields.exit.placeholder} value={exit} onChange={e => setExit(e.target.value)} />
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
            eyebrow={t.eyebrow(stable, `VIP ${result.vipLevel}`)}
            title={t.hero.title}
            value={`${fmt(result.total, 6)} ${stable}`}
            tone="primary"
            sub={t.heroSub(String(result.makerRate), String(result.takerRate))}
          />

          <MetricGrid className="sm:grid-cols-4">
            <Stat label={t.stats.entry} value={`${fmt(result.entryFee, 6)} ${stable}`} tone="primary" sub={`${result.entryType} @ ${result.entryRate}%`} icon={<ArrowDownToLine className="h-4 w-4" />} />
            <Stat label={t.stats.exit} value={`${fmt(result.exitFee, 6)} ${stable}`} tone="primary" sub={`${result.exitType} @ ${result.exitRate}%`} icon={<ArrowUpFromLine className="h-4 w-4" />} />
            <Stat label={t.stats.vip} value={`VIP ${result.vipLevel}`} icon={<Crown className="h-4 w-4" />} />
            <Stat label={t.stats.total} value={`${fmt(result.total, 6)} ${stable}`} tone="success" icon={<BadgePercent className="h-4 w-4" />} />
          </MetricGrid>

          <BreakdownPanel>
            <BreakdownRow icon={<ArrowDownUp className="h-4 w-4" />} title={t.breakdown.entry(result.entryType, String(result.entryRate))} tone="primary">
              <p className="font-mono text-[13px]">{commonTexts.formula}: {t.formulas.entry}<br />{entry} × {size} × {result.entryRate}% = <strong className="text-primary">{fmt(result.entryFee, 6)} {stable}</strong></p>
            </BreakdownRow>
            <BreakdownRow icon={<ArrowDownUp className="h-4 w-4" />} title={t.breakdown.exit(result.exitType, String(result.exitRate))}>
              <p className="font-mono text-[13px]">{commonTexts.formula}: {t.formulas.exit}<br />{exit} × {size} × {result.exitRate}% = <strong className="text-primary">{fmt(result.exitFee, 6)} {stable}</strong></p>
            </BreakdownRow>
          </BreakdownPanel>

          <TemplateCards
            variant="feeLinear"
            params={{
              market: `${stable}-M`,
              currency: currency.trim() || stable,
              direction: direction === "long" ? "LONG" : "SHORT",
              vip: `VIP ${result.vipLevel}`,
              maker: `${result.makerRate}%`,
              taker: `${result.takerRate}%`,
              size: `${size} coins`,
              entry: String(entry),
              exit: String(exit),
              entryFee: `${fmt(result.entryFee, 6)} ${stable}`,
              exitFee: `${fmt(result.exitFee, 6)} ${stable}`,
              totalFee: `${fmt(result.total, 6)} ${stable}`,
              positionId: positionId.trim() || "—",
            }}
          />
        </div>
      )}
    />
  )
}

function FeeCoinMForm() {
  const t = feeTexts.coinM
  const [vip, setVip] = useState("0")
  const [coinName, setCoinName] = useState("")
  const [entryType, setEntryType] = useState<OrderType>("maker")
  const [exitType, setExitType] = useState<OrderType>("maker")
  const [qty, setQty] = useState("")
  const [open, setOpen] = useState("")
  const [close, setClose] = useState("")
  const [currency, setCurrency] = useState("")
  const [leverage, setLeverage] = useState("")
  const [direction, setDirection] = useState<Side>("long")
  const [positionId, setPositionId] = useState("")
  const [result, setResult] = useState<ReturnType<typeof calcTradingFeeCoinM> | null>(null)
  const [error, setError] = useState("")

  const calculate = () => {
    setError("")
    setResult(null)
    const qtyN = parseFloat(qty), openN = parseFloat(open), closeN = parseFloat(close)
    if (!qtyN || !openN || !closeN) { setError(t.error); return }
    setResult(calcTradingFeeCoinM({ vipLevel: parseInt(vip), coinName: coinName.toUpperCase() || "coin", entryType, exitType, qtyUSD: qtyN, openPrice: openN, closePrice: closeN }))
  }

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
              direction={direction}
              onDirectionChange={setDirection}
              positionId={positionId}
              onPositionIdChange={setPositionId}
            />
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-1">
              <FormField label={t.fields.vip}>
                <Select value={vip} onValueChange={setVip}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{VIP_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
              <FormField label={t.fields.coin.label}>
                <Input placeholder={t.fields.coin.placeholder} value={coinName} onChange={e => setCoinName(e.target.value.toUpperCase())} />
              </FormField>
              <FormField label={t.fields.qty.label} hint={t.fields.qty.hint}>
                <Input type="number" step="any" placeholder={t.fields.qty.placeholder} value={qty} onChange={e => setQty(e.target.value)} />
              </FormField>
              <OrderTypeField label={t.fields.entryType} value={entryType} onChange={(v) => setEntryType(v)} />
              <OrderTypeField label={t.fields.exitType} value={exitType} onChange={(v) => setExitType(v)} />
              <FormField label={t.fields.open.label}>
                <Input type="number" step="any" placeholder={t.fields.open.placeholder} value={open} onChange={e => setOpen(e.target.value)} />
              </FormField>
              <FormField label={t.fields.close.label}>
                <Input type="number" step="any" placeholder={t.fields.close.placeholder} value={close} onChange={e => setClose(e.target.value)} />
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
            eyebrow={t.eyebrow(`VIP ${result.vipLevel}`)}
            title={t.hero.title}
            value={`${result.total.toFixed(8)} ${result.coin}`}
            tone="primary"
            sub={t.heroSub(result.coin ?? "coin", String(result.makerRate), String(result.takerRate))}
          />

          <MetricGrid className="sm:grid-cols-4">
            <Stat label={t.stats.open} value={`${result.entryFee.toFixed(8)} ${result.coin}`} tone="primary" sub={`${result.entryType} @ ${result.entryRate}%`} icon={<ArrowDownToLine className="h-4 w-4" />} />
            <Stat label={t.stats.close} value={`${result.exitFee.toFixed(8)} ${result.coin}`} tone="primary" sub={`${result.exitType} @ ${result.exitRate}%`} icon={<ArrowUpFromLine className="h-4 w-4" />} />
            <Stat label={t.stats.pair} value={result.coin ?? "—"} icon={<Coins className="h-4 w-4" />} />
            <Stat label={t.stats.total} value={`${result.total.toFixed(8)} ${result.coin}`} tone="success" icon={<BadgePercent className="h-4 w-4" />} />
          </MetricGrid>

          <BreakdownPanel>
            <BreakdownRow icon={<ArrowDownUp className="h-4 w-4" />} title={t.breakdown.open(result.entryType, String(result.entryRate), result.coin ?? "coin")} tone="primary">
              <p className="font-mono text-[13px]">{commonTexts.formula}: {t.formulas.open}<br />({qty} × {result.entryRate}%) ÷ {open} = <strong className="text-primary">{result.entryFee.toFixed(8)} {result.coin}</strong></p>
            </BreakdownRow>
            <BreakdownRow icon={<ArrowDownUp className="h-4 w-4" />} title={t.breakdown.close(result.exitType, String(result.exitRate), result.coin ?? "coin")}>
              <p className="font-mono text-[13px]">{commonTexts.formula}: {t.formulas.close}<br />({qty} × {result.exitRate}%) ÷ {close} = <strong className="text-primary">{result.exitFee.toFixed(8)} {result.coin}</strong></p>
            </BreakdownRow>
          </BreakdownPanel>

          <TemplateCards
            variant="feeCoinM"
            params={{
              market: `Coin-M (${result.coin})`,
              coin: result.coin ?? "coin",
              currency: currency.trim() || (result.coin ?? "coin"),
              direction: direction === "long" ? "LONG" : "SHORT",
              vip: `VIP ${result.vipLevel}`,
              maker: `${result.makerRate}%`,
              taker: `${result.takerRate}%`,
              qty: `${qty} USD`,
              open: String(open),
              close: String(close),
              openFee: `${result.entryFee.toFixed(8)} ${result.coin}`,
              closeFee: `${result.exitFee.toFixed(8)} ${result.coin}`,
              totalFee: `${result.total.toFixed(8)} ${result.coin}`,
              positionId: positionId.trim() || "—",
            }}
          />
        </div>
      )}
    />
  )
}
