import { vipFees } from "./shared"

export interface TradingFeeLinearInputs {
  vipLevel: number
  entryType: "maker" | "taker"
  exitType: "maker" | "taker"
  size: number
  entryPrice: number
  exitPrice: number
  stable: string
}

export interface TradingFeeCoinMInputs {
  vipLevel: number
  coinName: string
  entryType: "maker" | "taker"
  exitType: "maker" | "taker"
  qtyUSD: number
  openPrice: number
  closePrice: number
}

export interface TradingFeeResult {
  vipLevel: number
  makerRate: number
  takerRate: number
  entryFee: number
  exitFee: number
  total: number
  entryType: string
  exitType: string
  entryRate: number
  exitRate: number
  coin?: string
  stable?: string
  isCoinM: boolean
}

export function calcTradingFeeLinear(input: TradingFeeLinearInputs): TradingFeeResult {
  const { vipLevel, entryType, exitType, size, entryPrice, exitPrice, stable } = input
  const [maker, taker] = vipFees[vipLevel]
  const eR = entryType === "maker" ? maker : taker
  const xR = exitType === "maker" ? maker : taker
  const entryFee = entryPrice * size * eR / 100
  const exitFee = exitPrice * size * xR / 100
  const total = entryFee + exitFee

  return { vipLevel, makerRate: maker, takerRate: taker, entryFee, exitFee, total, entryType, exitType, entryRate: eR, exitRate: xR, stable, isCoinM: false }
}

export function calcTradingFeeCoinM(input: TradingFeeCoinMInputs): TradingFeeResult {
  const { vipLevel, coinName, entryType, exitType, qtyUSD, openPrice, closePrice } = input
  const [maker, taker] = vipFees[vipLevel]
  const eR = entryType === "maker" ? maker : taker
  const xR = exitType === "maker" ? maker : taker
  const openFee = (qtyUSD * eR / 100) / openPrice
  const closeFee = (qtyUSD * xR / 100) / closePrice
  const total = openFee + closeFee
  const coin = coinName || "coin"

  return { vipLevel, makerRate: maker, takerRate: taker, entryFee: openFee, exitFee: closeFee, total, entryType, exitType, entryRate: eR, exitRate: xR, coin, isCoinM: true }
}