import { type Side, fmt, sideLabel } from "./shared"
import { isoTexts } from "@/lib/texts"

export interface IsoLinearInputs {
  side: Side
  entryPrice: number
  positionSize: number
  mmrPct: number
  leverage?: number
  availableMargin?: number
  stable: string
}

export interface IsoLinearResult {
  liquidationPrice: number
  maintenanceMargin: number
  margin: number
  diff: number
  movePct: string
  marginSource: "direct" | "leverage"
  leverageUsed: number | null
  formulaText: string
  steps: string[]
  details: Record<string, string>
  narrative: string
}

export function calcIsoLinear(input: IsoLinearInputs): IsoLinearResult {
  const { side, entryPrice, positionSize, mmrPct, leverage, availableMargin, stable } = input
  const mmr = mmrPct / 100
  const MM = positionSize * entryPrice * mmr

  let margin: number
  let marginSource: "direct" | "leverage"
  let leverageUsed: number | null = null

  if (availableMargin !== undefined) {
    margin = availableMargin
    marginSource = "direct"
    leverageUsed = leverage ?? null
  } else {
    leverageUsed = leverage!
    margin = (positionSize * entryPrice) / leverageUsed
    marginSource = "leverage"
  }

  const diff = (margin - MM) / positionSize
  const liqPrice = side === "long" ? entryPrice - diff : entryPrice + diff
  const movePct = Math.abs(((liqPrice - entryPrice) / entryPrice) * 100).toFixed(4)

  const sl = sideLabel(side)
  const formulaText =
    side === "long" ? isoTexts.linear.formula.long : isoTexts.linear.formula.short

  const steps: string[] = [
    isoTexts.linear.steps.mm(String(positionSize), String(entryPrice), String(mmrPct), fmt(MM, 6), stable),
    isoTexts.linear.steps.subtract(fmt(margin, 6), fmt(MM, 6), fmt(margin - MM, 6), stable),
    isoTexts.linear.steps.divide(fmt(margin - MM, 6), String(positionSize), fmt(diff, 6)),
    isoTexts.linear.steps.liq(String(entryPrice), side === "long" ? "−" : "+", fmt(diff, 6), liqPrice.toFixed(6)),
  ]

  const marginLine =
    marginSource === "direct"
      ? isoTexts.linear.details.marginDirect(fmt(margin, 6), stable, leverageUsed ? `${leverageUsed}x` : undefined)
      : isoTexts.linear.details.marginLeverage(fmt(margin, 6), stable, `${leverageUsed}x`)

  const details: Record<string, string> = {
    [isoTexts.linear.details.avgOpenPrice]: String(entryPrice),
    [isoTexts.linear.details.positionSize]: `${positionSize} coins`,
    [marginLine]: "",
    [isoTexts.linear.details.mmr]: `${mmrPct}%`,
    [isoTexts.linear.details.positionType]: sl,
  }

  const narrative = isoTexts.linear.narrative(
    sl,
    String(entryPrice),
    fmt(margin, 6),
    stable,
    side === "long",
    fmt(margin - MM, 6),
    fmt(MM, 6),
    liqPrice.toFixed(6),
    movePct,
  )

  return {
    liquidationPrice: liqPrice,
    maintenanceMargin: MM,
    margin,
    diff,
    movePct,
    marginSource,
    leverageUsed,
    formulaText,
    steps,
    details,
    narrative,
  }
}

export function calcIsoLinearMarginOk(input: IsoLinearInputs): { ok: boolean; reason?: string; result?: IsoLinearResult } {
  const result = calcIsoLinear(input)
  if (result.margin <= result.maintenanceMargin) {
    return {
      ok: false,
      reason: isoTexts.linear.lowMarginReason(fmt(result.margin, 6), input.stable, fmt(result.maintenanceMargin, 6)),
    }
  }
  return { ok: true, result }
}