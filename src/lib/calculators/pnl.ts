import { type Side, fmt } from "./shared"
import { pnlTexts } from "@/lib/texts"

export interface PnLLinearInputs {
  side: Side
  openPrice: number
  closePrice: number
  qty: number
  stable: string
  margin?: number
}

export interface PnLCoinMInputs {
  side: Side
  coinName: string
  openPrice: number
  closePrice: number
  qtyUSD: number
  margin?: number
}

export interface PnLResult {
  pnl: number
  pnlUSD?: number
  roi?: number
  side: Side
  type: "linear" | "coin-m"
  stable?: string
  coinName?: string
  formulaText: string
  calcLine: string
}

export function calcPnLLinear(input: PnLLinearInputs): PnLResult {
  const { side, openPrice, closePrice, qty, stable, margin } = input
  const pnl = side === "long" ? (closePrice - openPrice) * qty : (openPrice - closePrice) * qty
  const roi = margin && margin > 0 ? pnl / margin * 100 : undefined

  const formulaText =
    side === "long" ? pnlTexts.linear.formula.long : pnlTexts.linear.formula.short

  const calcLine = pnlTexts.linear.calcLine(
    `(${closePrice} − ${openPrice}) × ${qty}`,
    `${pnl >= 0 ? "+" : ""}${fmt(pnl, 6)} ${stable}`,
  )

  return { pnl, roi, side, type: "linear", stable, formulaText, calcLine }
}

export function calcPnLCoinM(input: PnLCoinMInputs): PnLResult {
  const { side, coinName, openPrice, closePrice, qtyUSD, margin } = input
  const coin = coinName || "coins"
  const pnl = side === "long" ? qtyUSD * (1 / openPrice - 1 / closePrice) : qtyUSD * (1 / closePrice - 1 / openPrice)
  const pnlUSD = pnl * closePrice
  const roi = margin && margin > 0 ? pnl / margin * 100 : undefined

  const formulaText =
    side === "long" ? pnlTexts.coinM.formula.long : pnlTexts.coinM.formula.short

  const calcLine = pnlTexts.coinM.calcLine(
    `${qtyUSD} × (1/${openPrice} − 1/${closePrice})`,
    `${fmt(pnl, 6)} ${coin}`,
    fmt(pnlUSD, 6),
  )

  return { pnl, pnlUSD, roi, side, type: "coin-m", coinName: coin, formulaText, calcLine }
}
