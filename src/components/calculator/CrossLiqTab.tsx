import { useState, useRef } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StableTabs } from "@/components/shared/StableTabs"
import { SectionCard } from "@/components/shared/SectionCard"
import { FormField } from "@/components/shared/FormField"
import { InfoNote } from "@/components/shared/InfoNote"
import { Stat, MetricGrid } from "@/components/shared/Stat"
import { RowPanel } from "@/components/shared/RowPanel"
import { VerdictBanner } from "@/components/shared/VerdictBanner"
import { TemplateCards } from "@/components/shared/TemplateCards"
import { ToolLayout } from "@/components/shared/ToolLayout"
import { PositionInfoFields } from "@/components/shared/PositionInfoFields"
import { CheckboxField } from "@/components/shared/CheckboxField"
import { crossTexts, commonTexts, mmrExplanationTexts } from "@/lib/texts"
import {
  calcCrossLinear, calcCrossCoinM, buildGist, buildSteps, buildExplain,
  EXR_RATES, fmt, type CrossLinearResult, type CrossCoinMResult, type CrossResult,
  type Direction, type CrossLinearPositionInput, type CrossCoinMPositionInput, type WalletAsset,
  type Side, sideLabel,
} from "@/lib/calculators"
import {
  Calculator,
  Plus,
  Wallet,
  Clock,
  Layers,
  Coins,
  ListPlus,
  ShieldAlert,
  Scale,
  FileBarChart,
  Receipt,
  TrendingUp,
  ShieldCheck,
  CircleDollarSign,
} from "lucide-react"

export function CrossLiqTab() {
  const [subTab, setSubTab] = useState("usdt")

  return (
    <Tabs value={subTab} onValueChange={setSubTab}>
      <StableTabs />
      <TabsContent value="usdt"><CrossLinearForm stable="USDT" /></TabsContent>
      <TabsContent value="usdc"><CrossLinearForm stable="USDC" /></TabsContent>
      <TabsContent value="coin"><CrossCoinMForm /></TabsContent>
    </Tabs>
  )
}

interface PositionInfoCardProps {
  currency: string
  onCurrencyChange: (v: string) => void
  leverage: string
  onLeverageChange: (v: string) => void
  direction: Side
  onDirectionChange: (v: Side) => void
  positionId: string
  onPositionIdChange: (v: string) => void
  hasSL: boolean
  onHasSLChange: (v: boolean) => void
  stopLoss: string
  onStopLossChange: (v: string) => void
  useMmr: boolean
  onUseMmrChange: (v: boolean) => void
}

function PositionInfoCard({
  currency,
  onCurrencyChange,
  leverage,
  onLeverageChange,
  direction,
  onDirectionChange,
  positionId,
  onPositionIdChange,
  hasSL,
  onHasSLChange,
  stopLoss,
  onStopLossChange,
  useMmr,
  onUseMmrChange,
}: PositionInfoCardProps) {
  return (
    <SectionCard title={commonTexts.positionInfo} description={commonTexts.positionInfoDesc} icon={<Wallet className="h-4 w-4" />}>
      <div className="space-y-4">
        <PositionInfoFields
          currency={currency}
          onCurrencyChange={onCurrencyChange}
          leverage={leverage}
          onLeverageChange={onLeverageChange}
          direction={direction}
          onDirectionChange={onDirectionChange}
          positionId={positionId}
          onPositionIdChange={onPositionIdChange}
        />
        <CheckboxField checked={useMmr} onChange={onUseMmrChange} label={commonTexts.addMmrExplanation} />
        <CheckboxField checked={hasSL} onChange={onHasSLChange} label={commonTexts.stopLossQuestion} />
        {hasSL && (
          <FormField label={commonTexts.stopLossPrice}>
            <Input type="number" step="any" placeholder={commonTexts.stopLossPricePlaceholder} value={stopLoss} onChange={e => onStopLossChange(e.target.value)} />
          </FormField>
        )}
      </div>
    </SectionCard>
  )
}

interface LinearPosState {
  id: number
  symbol: string
  side: Direction
  size: string
  entry: string
  mark: string
  mmr: string
  fee: string
}

function CrossLinearForm({ stable }: { stable: string }) {
  const t = crossTexts.linear
  const [wallet, setWallet] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [positions, setPositions] = useState<LinearPosState[]>([])
  const [currency, setCurrency] = useState(stable)
  const [leverage, setLeverage] = useState("")
  const [direction, setDirection] = useState<Side>("long")
  const [positionId, setPositionId] = useState("")
  const [hasSL, setHasSL] = useState(false)
  const [stopLoss, setStopLoss] = useState("")
  const [useMmrExplanation, setUseMmrExplanation] = useState(false)
  const [result, setResult] = useState<CrossLinearResult | null>(null)
  const [error, setError] = useState("")
  const idRef = useRef(0)

  const addPosition = () => {
    idRef.current += 1
    setPositions([...positions, { id: idRef.current, symbol: "", side: "LONG", size: "", entry: "", mark: "", mmr: "", fee: "" }])
  }
  const removePosition = (id: number) => setPositions(positions.filter(p => p.id !== id))
  const update = (id: number, key: keyof LinearPosState, value: string | Direction) => {
    setPositions(positions.map(p => p.id === id ? { ...p, [key]: value } : p))
  }

  const calculate = () => {
    setError("")
    setResult(null)
    const walletN = parseFloat(wallet)
    if (isNaN(walletN)) { setError(t.errors.wallet); return }
    if (!date || !time) { setError(t.errors.time); return }
    if (positions.length === 0) { setError(t.errors.noPositions); return }

    const inputs: CrossLinearPositionInput[] = []
    for (const p of positions) {
      const sizeN = parseFloat(p.size), entryN = parseFloat(p.entry), markN = parseFloat(p.mark), mmrN = parseFloat(p.mmr)
      if (!p.symbol.trim() || !sizeN || !entryN || !markN || !mmrN) { setError(t.errors.fillAll); return }
      inputs.push({
        symbol: p.symbol.trim().toUpperCase(),
        side: p.side,
        size: sizeN,
        entryPrice: entryN,
        markPrice: markN,
        mmrPct: mmrN,
        closingFee: p.fee.trim() ? parseFloat(p.fee) : 0,
      })
    }

    const liqTime = new Date(`${date}T${time}Z`).getTime()
    setResult(calcCrossLinear({ walletBalance: walletN, positions: inputs, stable, liquidationTime: liqTime }))
  }

  return (
    <ToolLayout
      form={
        <>
          <PositionInfoCard
            currency={currency}
            onCurrencyChange={setCurrency}
            leverage={leverage}
            onLeverageChange={setLeverage}
            direction={direction}
            onDirectionChange={setDirection}
            positionId={positionId}
            onPositionIdChange={setPositionId}
            hasSL={hasSL}
            onHasSLChange={setHasSL}
            stopLoss={stopLoss}
            onStopLossChange={setStopLoss}
            useMmr={useMmrExplanation}
            onUseMmrChange={setUseMmrExplanation}
          />
          <SectionCard title={t.wallet.section.title} description={t.wallet.section.description} icon={<Wallet className="h-4 w-4" />}>
            <FormField label={t.wallet.fields.wallet(stable).label}>
              <Input type="number" step="any" placeholder={t.wallet.fields.wallet(stable).placeholder} value={wallet} onChange={e => setWallet(e.target.value)} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t.wallet.fields.date.label}><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></FormField>
              <FormField label={t.wallet.fields.time.label} hint={t.wallet.fields.time.hint}><Input type="time" step="1" value={time} onChange={e => setTime(e.target.value)} /></FormField>
            </div>
          </SectionCard>

          <SectionCard
            title={t.positions.section.title}
            description={t.positions.section.description}
            icon={<Layers className="h-4 w-4" />}
            action={<Button variant="outline" size="sm" className="gap-1.5" onClick={addPosition}><Plus className="h-3.5 w-3.5" /> {t.positions.add}</Button>}
          >
            {positions.length === 0 && (
              <p className="rounded-lg border border-dashed border-border bg-surface/40 p-4 text-center text-xs text-muted-foreground">
                {t.positions.empty}
              </p>
            )}
            {positions.map(p => (
              <RowPanel key={p.id} index={p.id} label={crossTexts.rowLabels.position} onRemove={() => removePosition(p.id)}>
                <div className="grid grid-cols-1 gap-3">
                  <FormField label={t.positions.fields.symbol.label}><Input placeholder={t.positions.fields.symbol.placeholder} value={p.symbol} onChange={e => update(p.id, "symbol", e.target.value.toUpperCase())} /></FormField>
                  <FormField label={t.positions.fields.side}>
                    <Select value={p.side} onValueChange={(v: Direction) => update(p.id, "side", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="LONG">{commonTexts.side.longUpper}</SelectItem><SelectItem value="SHORT">{commonTexts.side.shortUpper}</SelectItem></SelectContent>
                    </Select>
                  </FormField>
                  <FormField label={t.positions.fields.size.label} hint={t.positions.fields.size.hint}><Input type="number" step="any" value={p.size} onChange={e => update(p.id, "size", e.target.value)} /></FormField>
                  <FormField label={t.positions.fields.entry}><Input type="number" step="any" value={p.entry} onChange={e => update(p.id, "entry", e.target.value)} /></FormField>
                  <FormField label={t.positions.fields.mmr.label} hint={t.positions.fields.mmr.hint}><Input type="number" step="any" value={p.mmr} onChange={e => update(p.id, "mmr", e.target.value)} /></FormField>
                  <FormField label={t.positions.fields.mark.label}><Input type="number" step="any" placeholder={t.positions.fields.mark.placeholder} value={p.mark} onChange={e => update(p.id, "mark", e.target.value)} /></FormField>
                </div>
                <FormField label={t.positions.fields.fee.label} hint={t.positions.fields.fee.hint}><Input type="number" step="any" placeholder={t.positions.fields.fee.placeholder} value={p.fee} onChange={e => update(p.id, "fee", e.target.value)} /></FormField>
              </RowPanel>
            ))}
            {positions.length > 0 && (
              <Button variant="outline" size="full" className="gap-2 border-dashed" onClick={addPosition}><Plus className="h-4 w-4" /> {t.positions.addMore}</Button>
            )}
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
        <CrossResultView
          result={result}
          hasSL={hasSL}
          useMmrExplanation={useMmrExplanation}
          directionLabel={sideLabel(direction)}
          currencyLabel={currency.trim() || stable}
          positionIdLabel={positionId.trim() || "—"}
          stopLossPrice={stopLoss}
        />
      )}
    />
  )
}

interface CoinMPosState {
  id: number
  symbol: string
  type: "COIN-M" | "USDT-M" | "USDC-M"
  side: Direction
  mmr: string
  baseCoin: string
  qty: string
  entry: string
  mark: string
  size: string
  entryL: string
  markL: string
}

interface CoinMWalletState {
  id: number
  coin: string
  customCoin: string
  amount: string
  rate: string
  manualMark: string
}

const COIN_OPTIONS = ["USDT", "USDC", "USDE", "FDUSD", "BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "AVAX", "AAVE", "BCH", "DOT", "LINK", "LTC", "SUI", "TON", "TRX", "XAUT", "XLM"]

function CrossCoinMForm() {
  const t = crossTexts.coinM
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [positions, setPositions] = useState<CoinMPosState[]>([])
  const [walletAssets, setWalletAssets] = useState<CoinMWalletState[]>([])
  const [currency, setCurrency] = useState("")
  const [leverage, setLeverage] = useState("")
  const [direction, setDirection] = useState<Side>("long")
  const [positionId, setPositionId] = useState("")
  const [hasSL, setHasSL] = useState(false)
  const [stopLoss, setStopLoss] = useState("")
  const [useMmrExplanation, setUseMmrExplanation] = useState(false)
  const [result, setResult] = useState<CrossCoinMResult | null>(null)
  const [error, setError] = useState("")
  const posIdRef = useRef(0)
  const walletIdRef = useRef(0)

  const addPosition = () => {
    posIdRef.current += 1
    setPositions([...positions, { id: posIdRef.current, symbol: "", type: "COIN-M", side: "LONG", mmr: "", baseCoin: "", qty: "", entry: "", mark: "", size: "", entryL: "", markL: "" }])
  }
  const removePosition = (id: number) => setPositions(positions.filter(p => p.id !== id))
  const updatePos = (id: number, key: keyof CoinMPosState, value: string | "COIN-M" | "USDT-M" | "USDC-M" | Direction) => {
    setPositions(positions.map(p => p.id === id ? { ...p, [key]: value } : p))
  }

  const addWallet = () => {
    walletIdRef.current += 1
    setWalletAssets([...walletAssets, { id: walletIdRef.current, coin: "USDT", customCoin: "", amount: "", rate: "100", manualMark: "" }])
  }
  const removeWallet = (id: number) => setWalletAssets(walletAssets.filter(w => w.id !== id))
  const updateWallet = (id: number, key: keyof CoinMWalletState, value: string) => {
    setWalletAssets(walletAssets.map(w => w.id === id ? { ...w, [key]: value } : w))
  }
  const onWalletCoinChange = (id: number, coin: string) => {
    const defRate = EXR_RATES[coin] !== undefined ? EXR_RATES[coin] : 95
    setWalletAssets(walletAssets.map(w => w.id === id ? { ...w, coin, rate: coin === "OTHER" ? "95" : String(defRate) } : w))
  }

  const calculate = () => {
    setError("")
    setResult(null)
    if (!date || !time) { setError(t.errors.time); return }
    if (positions.length === 0) { setError(t.errors.noPositions); return }
    if (walletAssets.length === 0) { setError(t.errors.noAssets); return }

    const markMap: Record<string, number> = {}
    for (const p of positions) {
      if (p.type === "COIN-M" && p.baseCoin.trim() && p.mark && parseFloat(p.mark) > 0) {
        markMap[p.baseCoin.trim().toUpperCase()] = parseFloat(p.mark)
      }
    }

    const posInputs: CrossCoinMPositionInput[] = []
    for (const p of positions) {
      const mmrN = parseFloat(p.mmr)
      if (!p.symbol.trim() || isNaN(mmrN) || !mmrN) { setError(t.errors.symbolMmr); return }
      if (p.type === "COIN-M") {
        const qtyN = parseFloat(p.qty), entryN = parseFloat(p.entry), markN = parseFloat(p.mark)
        if (!qtyN || !entryN || !markN) { setError(t.errors.coinMFields(p.symbol)); return }
        posInputs.push({ symbol: p.symbol.trim().toUpperCase(), side: p.side, mmrPct: mmrN, contractType: "COIN-M", baseCoin: p.baseCoin.trim().toUpperCase(), qtyUSD: qtyN, entryPrice: entryN, markPrice: markN })
      } else {
        const sizeN = parseFloat(p.size), entryN = parseFloat(p.entryL), markN = parseFloat(p.markL)
        if (!sizeN || !entryN || !markN) { setError(t.errors.allFields(p.symbol)); return }
        posInputs.push({ symbol: p.symbol.trim().toUpperCase(), side: p.side, mmrPct: mmrN, contractType: p.type, size: sizeN, entryPriceL: entryN, markPriceL: markN })
      }
    }

    const assets: WalletAsset[] = []
    const src = t.assets.priceSource
    for (const w of walletAssets) {
      let coin = w.coin
      if (coin === "OTHER") coin = w.customCoin.trim().toUpperCase()
      if (!coin) { setError(t.errors.coinName); return }
      const amountN = parseFloat(w.amount)
      const rateN = parseFloat(w.rate)
      if (isNaN(amountN) || amountN <= 0) { setError(t.errors.amount(coin)); return }
      if (isNaN(rateN) || rateN < 0 || rateN > 100) { setError(t.errors.rate(coin)); return }

      let markPrice = 1, priceSource = src.fixed
      if (coin === "USDT") { markPrice = 1; priceSource = src.fixed }
      else if (coin === "USDC") { markPrice = 1; priceSource = src.fixed }
      else {
        if (markMap[coin]) { markPrice = markMap[coin]; priceSource = src.auto(coin) }
        else {
          const manualMark = parseFloat(w.manualMark)
          if (isNaN(manualMark) || manualMark <= 0) { setError(t.errors.mark(coin)); return }
          markPrice = manualMark; priceSource = src.manual
        }
      }
      const usdtValue = amountN * markPrice * (rateN / 100)
      assets.push({ coin, amount: amountN, markPrice, deductRate: rateN, usdtValue, priceSource })
    }

    const liqTime = new Date(`${date}T${time}Z`).getTime()
    setResult(calcCrossCoinM({ positions: posInputs, walletAssets: assets, liquidationTime: liqTime }))
  }

  return (
    <ToolLayout
      form={
        <>
          <PositionInfoCard
            currency={currency}
            onCurrencyChange={setCurrency}
            leverage={leverage}
            onLeverageChange={setLeverage}
            direction={direction}
            onDirectionChange={setDirection}
            positionId={positionId}
            onPositionIdChange={setPositionId}
            hasSL={hasSL}
            onHasSLChange={setHasSL}
            stopLoss={stopLoss}
            onStopLossChange={setStopLoss}
            useMmr={useMmrExplanation}
            onUseMmrChange={setUseMmrExplanation}
          />
          <SectionCard title={t.time.section.title} description={t.time.section.description} icon={<Clock className="h-4 w-4" />}>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t.time.fields.date.label}><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></FormField>
              <FormField label={t.time.fields.time.label} hint={t.time.fields.time.hint}><Input type="time" step="1" value={time} onChange={e => setTime(e.target.value)} /></FormField>
            </div>
          </SectionCard>

          <SectionCard
            title={t.assets.section.title}
            description={t.assets.section.description}
            icon={<Coins className="h-4 w-4" />}
            action={<Button variant="outline" size="sm" className="gap-1.5" onClick={addWallet}><Plus className="h-3.5 w-3.5" /> {t.assets.add}</Button>}
          >
            <InfoNote>{t.assets.infoNote}</InfoNote>
            {walletAssets.length === 0 && (
              <p className="rounded-lg border border-dashed border-border bg-surface/40 p-4 text-center text-xs text-muted-foreground">
                {t.assets.empty}
              </p>
            )}
            {walletAssets.map(w => (
              <RowPanel key={w.id} index={w.id} label={crossTexts.rowLabels.wallet} onRemove={() => removeWallet(w.id)} accent="success">
                <div className="grid grid-cols-1 gap-3">
                  <FormField label={t.assets.fields.coin}>
                    <Select value={w.coin} onValueChange={(v: string) => onWalletCoinChange(w.id, v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {COIN_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        <SelectItem value="OTHER">{t.assets.otherOption}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label={t.assets.fields.amount.label}><Input type="number" step="any" placeholder={t.assets.fields.amount.placeholder} value={w.amount} onChange={e => updateWallet(w.id, "amount", e.target.value)} /></FormField>
                  <FormField label={t.assets.fields.rate.label} hint={t.assets.fields.rate.hint}><Input type="number" step="any" value={w.rate} disabled={w.coin === "USDT"} onChange={e => updateWallet(w.id, "rate", e.target.value)} /></FormField>
                </div>
                {w.coin === "OTHER" && (
                  <FormField label={t.assets.fields.customCoin.label}><Input placeholder={t.assets.fields.customCoin.placeholder} value={w.customCoin} onChange={e => updateWallet(w.id, "customCoin", e.target.value.toUpperCase())} /></FormField>
                )}
                {w.coin !== "USDT" && (
                  <FormField label={t.assets.fields.mark.label} hint={t.assets.fields.mark.hint}>
                    <Input type="number" step="any" placeholder={t.assets.fields.mark.placeholder} value={w.manualMark} onChange={e => updateWallet(w.id, "manualMark", e.target.value)} />
                  </FormField>
                )}
                <p className="text-[11px] text-muted-foreground">
                  {w.coin === "USDT" ? t.assets.usdtFootnote : t.assets.otherFootnote}
                </p>
              </RowPanel>
            ))}
            {walletAssets.length > 0 && (
              <Button variant="outline" size="full" className="gap-2 border-dashed" onClick={addWallet}><Plus className="h-4 w-4" /> {t.assets.addMore}</Button>
            )}
          </SectionCard>

          <SectionCard
            title={t.positions.section.title}
            description={t.positions.section.description}
            icon={<ListPlus className="h-4 w-4" />}
            action={<Button variant="outline" size="sm" className="gap-1.5" onClick={addPosition}><Plus className="h-3.5 w-3.5" /> {t.positions.add}</Button>}
          >
            <InfoNote>{t.positions.infoNote}</InfoNote>
            {positions.length === 0 && (
              <p className="rounded-lg border border-dashed border-border bg-surface/40 p-4 text-center text-xs text-muted-foreground">
                {t.positions.empty}
              </p>
            )}
            {positions.map(p => (
              <RowPanel key={p.id} index={p.id} label={crossTexts.rowLabels.position} onRemove={() => removePosition(p.id)} accent={p.side === "LONG" ? "success" : "danger"}>
                <div className="grid grid-cols-1 gap-3">
                  <FormField label={t.positions.fields.symbol.label}><Input placeholder={t.positions.fields.symbol.placeholder} value={p.symbol} onChange={e => updatePos(p.id, "symbol", e.target.value.toUpperCase())} /></FormField>
                  <FormField label={t.positions.fields.type}>
                    <Select value={p.type} onValueChange={(v: CoinMPosState["type"]) => updatePos(p.id, "type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="COIN-M">{commonTexts.stableTabs.coin}</SelectItem><SelectItem value="USDT-M">{commonTexts.stableTabs.usdt}</SelectItem><SelectItem value="USDC-M">{commonTexts.stableTabs.usdc}</SelectItem></SelectContent>
                    </Select>
                  </FormField>
                  <FormField label={t.positions.fields.side}>
                    <Select value={p.side} onValueChange={(v: Direction) => updatePos(p.id, "side", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="LONG">{commonTexts.side.longUpper}</SelectItem><SelectItem value="SHORT">{commonTexts.side.shortUpper}</SelectItem></SelectContent>
                    </Select>
                  </FormField>
                  <FormField label={t.positions.fields.mmr.label} hint={t.positions.fields.mmr.hint}><Input type="number" step="any" placeholder={t.positions.fields.mmr.placeholder} value={p.mmr} onChange={e => updatePos(p.id, "mmr", e.target.value)} /></FormField>
                </div>
                {p.type === "COIN-M" ? (
                  <div className="grid grid-cols-1 gap-3">
                    <FormField label={t.positions.fields.baseCoin.label}><Input placeholder={t.positions.fields.baseCoin.placeholder} value={p.baseCoin} onChange={e => updatePos(p.id, "baseCoin", e.target.value.toUpperCase())} /></FormField>
                    <FormField label={t.positions.fields.qty.label} hint={t.positions.fields.qty.hint}><Input type="number" step="any" placeholder={t.positions.fields.qty.placeholder} value={p.qty} onChange={e => updatePos(p.id, "qty", e.target.value)} /></FormField>
                    <FormField label={t.positions.fields.entry.label}><Input type="number" step="any" placeholder={t.positions.fields.entry.placeholder} value={p.entry} onChange={e => updatePos(p.id, "entry", e.target.value)} /></FormField>
                    <FormField label={t.positions.fields.mark.label}><Input type="number" step="any" placeholder={t.positions.fields.mark.placeholder} value={p.mark} onChange={e => updatePos(p.id, "mark", e.target.value)} /></FormField>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <FormField label={t.positions.fields.size.label} hint={t.positions.fields.size.hint}><Input type="number" step="any" placeholder={t.positions.fields.size.placeholder} value={p.size} onChange={e => updatePos(p.id, "size", e.target.value)} /></FormField>
                    <FormField label={t.positions.fields.entry.label}><Input type="number" step="any" placeholder={t.positions.fields.entry.placeholder} value={p.entryL} onChange={e => updatePos(p.id, "entryL", e.target.value)} /></FormField>
                    <FormField label={t.positions.fields.mark.label}><Input type="number" step="any" placeholder={t.positions.fields.mark.placeholder} value={p.markL} onChange={e => updatePos(p.id, "markL", e.target.value)} /></FormField>
                  </div>
                )}
              </RowPanel>
            ))}
            {positions.length > 0 && (
              <Button variant="outline" size="full" className="gap-2 border-dashed" onClick={addPosition}><Plus className="h-4 w-4" /> {t.positions.addMore}</Button>
            )}
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
        <CrossResultView
          result={result}
          hasSL={hasSL}
          useMmrExplanation={useMmrExplanation}
          directionLabel={sideLabel(direction)}
          currencyLabel={currency.trim() || "USDT"}
          positionIdLabel={positionId.trim() || "—"}
          stopLossPrice={stopLoss}
        />
      )}
    />
  )
}

function crossBuilderMmrSections(result: CrossResult): { colleague: string; user: string } {
  const unit = result.isCoinM ? "USDT" : result.stable
  const lines = result.positions.map(p => {
    const pair = p.sym.replace(/(USDT|USDC)$/i, "")
    return `${p.sym} (${p.side}): MMR ${p.mmrPct}% → MM = ${fmt(p.mm)} ${unit} · ${commonTexts.limitsUrl(pair)}`
  })
  const refs = [...new Set(result.positions.map(p => {
    const pair = p.sym.replace(/(USDT|USDC)$/i, "")
    return commonTexts.limitsUrl(pair)
  }))].join("\n")
  const colleague = `Maintenance Margin (MMR/MM) Explanation\n${mmrExplanationTexts.definition}\n${lines.join("\n")}\n${mmrExplanationTexts.tier}\n${mmrExplanationTexts.threshold}\nReference:\n${refs}`
  const user = `Please also note the maintenance margin (MMR) on your account:\nMMR (Maintenance Margin Rate) is the minimum margin rate required by the exchange to keep positions open, and the Maintenance Margin (MM) is the minimum margin that must remain available at all times.\n${lines.join("\n")}\n${mmrExplanationTexts.tier}\n${mmrExplanationTexts.threshold}\nReference:\n${refs}`
  return { colleague, user }
}

interface CrossResultViewProps {
  result: CrossResult
  hasSL?: boolean
  useMmrExplanation?: boolean
  directionLabel?: string
  currencyLabel?: string
  positionIdLabel?: string
  stopLossPrice?: string
}

function CrossResultView({ result, hasSL = false, useMmrExplanation = false, directionLabel = "—", currencyLabel = "—", positionIdLabel = "—", stopLossPrice = "" }: CrossResultViewProps) {
  const t = crossTexts.result
  const liqDt = result.liquidationDate

  const slNum = parseFloat(stopLossPrice)
  const hasSlPrice = hasSL && !!slNum
  const stopLossLabel = hasSlPrice ? fmt(slNum, 6) : "—"
  const slProximityText = hasSlPrice
    ? result.marginRatio > 70 ? commonTexts.slProximityClose : commonTexts.slProximityFar
    : ""
  const pct = Math.min(result.marginRatio / 200 * 100, 100)
  const barColor = result.marginRatio >= 100 ? "danger" : result.marginRatio > 70 ? "warning" : "success"
  const isCoinM = result.isCoinM
  const coinResult = result as CrossCoinMResult
  const totalWalletUSDT = isCoinM ? coinResult.totalWalletUSDT : result.walletBase

  const eqLabel = isCoinM ? `${fmt(result.equity)} USDT` : `${fmt(result.equity)} ${result.stable}`
  const mmLabel = isCoinM ? `${fmt(result.totalMM)} USDT` : `${fmt(result.totalMM)} ${result.stable}`
  const mmDisplay = mmLabel
  const walletDisplay = isCoinM ? `${fmt(totalWalletUSDT)} USDT ${t.converted}` : `${fmt(result.walletBase)} ${result.stable}`
  const pnlDisplay = isCoinM ? `${result.totalPnl >= 0 ? "+" : ""}${fmt(result.totalPnl)} USDT` : `${result.totalPnl >= 0 ? "+" : ""}${fmt(result.totalPnl)} ${result.stable}`
  const unit = isCoinM ? "USDT" : result.stable

  const gist = buildGist(result)
  const steps = buildSteps(result)
  const explain = buildExplain(result)
  const mmrSections = useMmrExplanation ? crossBuilderMmrSections(result) : null

  return (
    <div className="space-y-5 animate-slide-up">
      <VerdictBanner
        ok={!result.liquidated}
        okTitle={t.verdict.ok}
        dangerTitle={t.verdict.danger}
      >
        {result.liquidated
          ? t.verdict.liquidated(liqDt.toUTCString(), eqLabel, mmLabel, fmt(result.marginRatio))
          : t.verdict.safe(liqDt.toUTCString(), mmLabel, fmt(result.marginRatio))}
      </VerdictBanner>

      <div className="rounded-xl border border-border/80 bg-card p-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground"><Scale className="h-3.5 w-3.5 text-primary" /> {t.marginRatio}</span>
          <span className={`font-mono font-semibold ${barColor === "danger" ? "text-destructive" : barColor === "warning" ? "text-warning" : "text-success"}`}>{fmt(result.marginRatio)}%</span>
        </div>
        <Progress value={pct} colorTheme={barColor} />
      </div>

      <MetricGrid>
        <Stat label={t.stats.time} value={liqDt.toUTCString().replace(" GMT", "")} sub={t.stats.timeSub} icon={<Clock className="h-4 w-4" />} />
        <Stat label={t.stats.wallet} value={walletDisplay} icon={<Wallet className="h-4 w-4" />} />
        {!isCoinM && result.totalCloseFee > 0 && <Stat label={t.stats.fees} value={`−${fmt(result.totalCloseFee)} ${result.stable}`} tone="danger" icon={<Receipt className="h-4 w-4" />} />}
        <Stat label={t.stats.pnl} value={pnlDisplay} tone={result.totalPnl >= 0 ? "success" : "danger"} icon={<TrendingUp className="h-4 w-4" />} />
        <Stat label={t.stats.equity} value={`${fmt(result.equity)} USDT`} tone={result.equity > result.totalMM ? "success" : "danger"} icon={<CircleDollarSign className="h-4 w-4" />} />
        <Stat
          label={t.stats.mm}
          value={`${fmt(result.totalMM)} USDT`}
          tone={result.marginRatio >= 100 ? "danger" : result.marginRatio > 70 ? "warning" : "default"}
          icon={<ShieldCheck className="h-4 w-4" />}
        />
      </MetricGrid>

      <Card className="stagger-1 overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b border-border/60 px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/90"><FileBarChart className="h-4 w-4 text-primary" /> {t.positionsTable.heading}</h3>
          </div>
          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>{t.positionsTable.pair}</TableHead><TableHead>{t.positionsTable.type}</TableHead><TableHead>{t.positionsTable.side}</TableHead><TableHead>{t.positionsTable.size}</TableHead><TableHead>{t.positionsTable.entry}</TableHead><TableHead>{t.positionsTable.mark}</TableHead><TableHead className="text-right">{t.positionsTable.pnl}</TableHead><TableHead className="text-right">{t.positionsTable.mm}</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {result.positions.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{p.sym}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.type}</TableCell>
                    <TableCell><Badge variant={p.side === "LONG" ? "long" : "short"}>{p.side}</Badge></TableCell>
                    <TableCell>{p.isCoin ? `${p.qty} USD` : `${p.size} coins`}</TableCell>
                    <TableCell className="font-mono tabular-nums">{fmt(p.entry!)}</TableCell>
                    <TableCell className="font-mono tabular-nums">{fmt(p.mark!)}</TableCell>
                    <TableCell className={`text-right font-mono tabular-nums ${p.pnl >= 0 ? "text-success" : "text-destructive"}`}>{p.pnl >= 0 ? "+" : ""}{fmt(p.pnl)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{fmt(p.mm)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 font-semibold">
                  <TableCell colSpan={6} className="text-right text-muted-foreground">{t.positionsTable.totals}</TableCell>
                  <TableCell className={`text-right font-mono tabular-nums ${result.totalPnl >= 0 ? "text-success" : "text-destructive"}`}>{result.totalPnl >= 0 ? "+" : ""}{fmt(result.totalPnl)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{fmt(result.totalMM)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {isCoinM && coinResult.walletAssets && coinResult.walletAssets.length > 0 && (
        <Card className="stagger-2 overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b border-border/60 px-5 py-3.5">
              <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/90"><Coins className="h-4 w-4 text-primary" /> {t.walletTable.heading}</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow><TableHead>{t.walletTable.coin}</TableHead><TableHead>{t.walletTable.amount}</TableHead><TableHead>{t.walletTable.mark}</TableHead><TableHead>{t.walletTable.rate}</TableHead><TableHead className="text-right">{t.walletTable.value}</TableHead><TableHead>{t.walletTable.source}</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {coinResult.walletAssets.map((w, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-bold">{w.coin}</TableCell>
                    <TableCell className="font-mono tabular-nums">{w.amount}</TableCell>
                    <TableCell className="font-mono tabular-nums">{w.markPrice}</TableCell>
                    <TableCell className="font-mono tabular-nums">{w.deductRate}%</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-success">{fmt(w.usdtValue)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{w.priceSource}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 font-semibold">
                  <TableCell colSpan={4} className="text-right text-muted-foreground">{t.walletTable.total}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-success">{fmt(totalWalletUSDT)} USDT</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card className="stagger-3 overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b border-border/60 px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/90"><FileBarChart className="h-4 w-4 text-primary" /> {t.explain.heading}</h3>
          </div>
          <div className="space-y-3 p-5">
            <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-4">
              <h4 className="mb-2 text-[13px] font-semibold text-primary">{t.explain.summary}</h4>
              <div className="text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground" dangerouslySetInnerHTML={{ __html: gist }} />
            </div>
            <div className="rounded-lg border border-border/80 bg-surface/40 p-4">
              <h4 className="mb-2 text-[13px] font-semibold text-foreground">{t.explain.steps}</h4>
              <div className="text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground" dangerouslySetInnerHTML={{ __html: steps }} />
            </div>
            <div className="rounded-lg border border-warning/20 bg-warning/[0.04] p-4">
              <h4 className="mb-2 text-[13px] font-semibold text-warning">{t.explain.reference}</h4>
              <div className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                <div><strong className="text-warning">{t.explain.core}</strong><br /><span className="text-warning/80" dangerouslySetInnerHTML={{ __html: explain.core }} /></div>
                <div><strong className="text-warning">{t.explain.mmr}</strong><br /><span className="text-warning/80" dangerouslySetInnerHTML={{ __html: explain.mmr }} /></div>
                <div><strong className="text-warning">{t.explain.why}</strong><br /><span className="text-warning/80" dangerouslySetInnerHTML={{ __html: explain.why }} /></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <TemplateCards
        variant={hasSL ? "crossSL" : "cross"}
        params={{
          direction: directionLabel,
          currency: currencyLabel,
          positionId: positionIdLabel,
          verdict: result.liquidated ? "Liquidated" : "Not Liquidated",
          time: liqDt.toUTCString(),
          walletDisplay,
          pnlDisplay,
          equityDisplay: `${fmt(result.equity)} ${unit}`,
          mmDisplay,
          ratio: `${fmt(result.marginRatio)}%`,
          walletNum: fmt(isCoinM ? totalWalletUSDT : result.walletBase),
          pnlNum: fmt(result.totalPnl),
          equityNum: fmt(result.equity),
          mmNum: fmt(result.totalMM),
          unit,
          count: String(result.positions.length),
          verdictDetail: result.liquidated
            ? `Your account was liquidated because the combined unrealized losses consumed the wallet equity. Total equity (${eqLabel}) fell to or below the required maintenance margin (${mmLabel}), pushing the margin ratio to ${fmt(result.marginRatio)}%. The exchange force-closed all cross margin positions to prevent a negative balance.`
            : `Your account was not liquidated at this timestamp. Total equity (${eqLabel}) exceeded the required maintenance margin (${mmLabel}), keeping the margin ratio below 100%.`,
          ...(hasSL ? { stopLoss: stopLossLabel, slProximityText } : {}),
          mmrSection: mmrSections ? mmrSections.colleague : "",
          mmrSectionUser: mmrSections ? mmrSections.user : "",
          liqReductionSection: "",
          liqReductionUser: "",
        }}
      />
    </div>
  )
}
