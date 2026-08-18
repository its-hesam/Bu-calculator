import { type Side } from "./shared"

export interface SlippageInputs {
  side: Side
  currency: string
  entryPrice: number
  stopLossPrice: number
  actualClosePrice: number
  size: number
  leverage?: number
}

export interface SlippageResult {
  pnlAtStopLoss: number
  pnlAtActual: number
  slippagePnl: number
  slippagePct: number
  priceDiff: number
  diff: number
  margin?: number
  roiAtStopLoss?: number
  roiAtActual?: number
}

export function calcSlippage(input: SlippageInputs): SlippageResult {
  const { side, entryPrice, stopLossPrice, actualClosePrice, size, leverage } = input

  const pnlFor = (closePrice: number) =>
    side === "long" ? (closePrice - entryPrice) * size : (entryPrice - closePrice) * size

  const pnlAtStopLoss = pnlFor(stopLossPrice)
  const pnlAtActual = pnlFor(actualClosePrice)

  const diff = Math.abs(stopLossPrice - actualClosePrice)
  const slippagePct = (diff / stopLossPrice) * 100
  const priceDiff = diff * size

  const margin = leverage && leverage > 0 ? (entryPrice * size) / leverage : undefined
  const roiAtStopLoss = margin && margin > 0 ? (pnlAtStopLoss / margin) * 100 : undefined
  const roiAtActual = margin && margin > 0 ? (pnlAtActual / margin) * 100 : undefined

  return {
    pnlAtStopLoss,
    pnlAtActual,
    slippagePnl: pnlAtActual - pnlAtStopLoss,
    slippagePct,
    priceDiff,
    diff,
    margin,
    roiAtStopLoss,
    roiAtActual,
  }
}
