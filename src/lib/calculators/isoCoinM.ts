import { type Side, fmt, BANKRUPTCY_FEE, sideLabel } from "./shared"
import { isoTexts } from "@/lib/texts"

export interface IsoCoinMInputs {
  side: Side
  qtyUSD: number
  entryPrice: number
  mmrPct: number
  leverage?: number
  availableMarginCoins?: number
}

export interface IsoCoinMResult {
  liquidationPrice: number
  positionValue: number
  maintenanceMargin: number
  bankruptcyFee: number
  adjustment: number
  margin: number
  imSource: "direct" | "leverage"
  leverageUsed: number | null
  movePct: string
  formulaText: string
  steps: string[]
  details: Record<string, string>
  narrative: string
}

export function calcIsoCoinM(input: IsoCoinMInputs): IsoCoinMResult {
  const { side, qtyUSD, entryPrice, mmrPct, leverage, availableMarginCoins } = input
  const mmr = mmrPct / 100
  const fee = BANKRUPTCY_FEE
  const PV = qtyUSD / entryPrice
  const MM = PV * mmr
  const BF = PV * fee

  let margin: number
  let imSource: "direct" | "leverage"
  let leverageUsed: number | null = null

  if (availableMarginCoins !== undefined) {
    margin = availableMarginCoins
    imSource = "direct"
    leverageUsed = leverage ?? null
  } else {
    leverageUsed = leverage!
    margin = PV / leverageUsed
    imSource = "leverage"
  }

  const adj = margin - MM - BF
  const liqPrice = side === "long" ? qtyUSD / (PV + adj) : qtyUSD / (PV - adj)
  const movePct = Math.abs(((liqPrice - entryPrice) / entryPrice) * 100).toFixed(4)

  const sl = sideLabel(side)
  const formulaText =
    side === "long" ? isoTexts.coinM.formula.long : isoTexts.coinM.formula.short

  const steps: string[] = [
    isoTexts.coinM.steps.pv(String(qtyUSD), String(entryPrice), PV.toFixed(6)),
    imSource === "leverage"
      ? isoTexts.coinM.steps.marginFromLeverage(PV.toFixed(6), String(leverageUsed), margin.toFixed(6))
      : isoTexts.coinM.steps.marginDirect(margin.toFixed(6)),
    isoTexts.coinM.steps.mm(PV.toFixed(6), String(mmrPct), MM.toFixed(6)),
    isoTexts.coinM.steps.bf(PV.toFixed(6), BF.toFixed(6)),
    isoTexts.coinM.steps.adjustment(margin.toFixed(6), MM.toFixed(6), BF.toFixed(6), adj.toFixed(6)),
    isoTexts.coinM.steps.liq(String(qtyUSD), PV.toFixed(6), side === "long" ? "+" : "-", adj.toFixed(6), liqPrice.toFixed(6)),
  ]

  const imLine =
    imSource === "direct"
      ? isoTexts.coinM.details.marginDirect(fmt(margin, 6), leverageUsed ? `${leverageUsed}x` : undefined)
      : isoTexts.coinM.details.marginLeverage(fmt(margin, 6), `${leverageUsed}x`)

  const details: Record<string, string> = {
    [isoTexts.coinM.details.qtyUnit]: `${qtyUSD} USD`,
    [isoTexts.coinM.details.entryPrice]: String(entryPrice),
    [imLine]: "",
    [isoTexts.coinM.details.mmr]: `${mmrPct}%`,
    [isoTexts.coinM.details.positionType]: sl,
  }

  const narrative = isoTexts.coinM.narrative(
    sl,
    String(entryPrice),
    fmt(margin, 6),
    side === "long",
    liqPrice.toFixed(6),
    movePct,
  )

  return {
    liquidationPrice: liqPrice,
    positionValue: PV,
    maintenanceMargin: MM,
    bankruptcyFee: BF,
    adjustment: adj,
    margin,
    imSource,
    leverageUsed,
    movePct,
    formulaText,
    steps,
    details,
    narrative,
  }
}

export function calcIsoCoinMMarginOk(input: IsoCoinMInputs): { ok: boolean; reason?: string; result?: IsoCoinMResult } {
  const result = calcIsoCoinM(input)
  if (result.margin <= result.maintenanceMargin) {
    return {
      ok: false,
      reason: isoTexts.coinM.lowMarginReason(fmt(result.margin, 6), fmt(result.maintenanceMargin, 6)),
    }
  }
  return { ok: true, result }
}