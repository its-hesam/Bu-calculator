import { vipFees } from "./shared"

export type OrderType = "maker" | "taker"

export interface FeeRow {
  time: string
  price: number
  qty: number
  orderType: OrderType
}

export interface TradingFeeBaseInputs {
  vipLevel: number
  entries: FeeRow[]
  exits: FeeRow[]
  hasFeeCard: boolean
  grossPnl: number
}

export interface TradingFeeLinearInputs extends TradingFeeBaseInputs {
  stable: string
}

export interface TradingFeeCoinMInputs extends TradingFeeBaseInputs {
  coinName: string
}

export interface TradingFeeResult {
  vipLevel: number
  baseMakerRate: number
  baseTakerRate: number
  effMakerRate: number
  effTakerRate: number
  hasFeeCard: boolean
  entryFees: number[]
  exitFees: number[]
  totalEntryFee: number
  totalExitFee: number
  totalFee: number
  grossPnl: number
  netPnl: number
  totalEntryValue: number
  totalExitValue: number
  isCoinM: boolean
  stable?: string
  coin?: string
}

function rateFor(orderType: OrderType, maker: number, taker: number): number {
  return orderType === "maker" ? maker : taker
}

export function calcTradingFeeLinear(input: TradingFeeLinearInputs): TradingFeeResult {
  const { vipLevel, entries, exits, hasFeeCard, grossPnl, stable } = input
  const [baseMaker, baseTaker] = vipFees[vipLevel]
  const effMaker = hasFeeCard ? baseMaker / 2 : baseMaker
  const effTaker = hasFeeCard ? baseTaker / 2 : baseTaker

  const entryFees = entries.map(e => (e.price * e.qty * rateFor(e.orderType, effMaker, effTaker)) / 100)
  const exitFees = exits.map(e => (e.price * e.qty * rateFor(e.orderType, effMaker, effTaker)) / 100)
  const totalEntryValue = entries.reduce((s, e) => s + e.price * e.qty, 0)
  const totalExitValue = exits.reduce((s, e) => s + e.price * e.qty, 0)
  const totalEntryFee = entryFees.reduce((s, f) => s + f, 0)
  const totalExitFee = exitFees.reduce((s, f) => s + f, 0)
  const totalFee = totalEntryFee + totalExitFee

  return {
    vipLevel,
    baseMakerRate: baseMaker,
    baseTakerRate: baseTaker,
    effMakerRate: effMaker,
    effTakerRate: effTaker,
    hasFeeCard,
    entryFees,
    exitFees,
    totalEntryFee,
    totalExitFee,
    totalFee,
    grossPnl,
    netPnl: grossPnl - totalFee,
    totalEntryValue,
    totalExitValue,
    isCoinM: false,
    stable,
  }
}

export function calcTradingFeeCoinM(input: TradingFeeCoinMInputs): TradingFeeResult {
  const { vipLevel, entries, exits, hasFeeCard, grossPnl, coinName } = input
  const [baseMaker, baseTaker] = vipFees[vipLevel]
  const effMaker = hasFeeCard ? baseMaker / 2 : baseMaker
  const effTaker = hasFeeCard ? baseTaker / 2 : baseTaker

  const entryFees = entries.map(e => (e.qty * rateFor(e.orderType, effMaker, effTaker)) / 100 / e.price)
  const exitFees = exits.map(e => (e.qty * rateFor(e.orderType, effMaker, effTaker)) / 100 / e.price)
  const totalEntryValue = entries.reduce((s, e) => s + e.qty, 0)
  const totalExitValue = exits.reduce((s, e) => s + e.qty, 0)
  const totalEntryFee = entryFees.reduce((s, f) => s + f, 0)
  const totalExitFee = exitFees.reduce((s, f) => s + f, 0)
  const totalFee = totalEntryFee + totalExitFee

  return {
    vipLevel,
    baseMakerRate: baseMaker,
    baseTakerRate: baseTaker,
    effMakerRate: effMaker,
    effTakerRate: effTaker,
    hasFeeCard,
    entryFees,
    exitFees,
    totalEntryFee,
    totalExitFee,
    totalFee,
    grossPnl,
    netPnl: grossPnl - totalFee,
    totalEntryValue,
    totalExitValue,
    isCoinM: true,
    coin: coinName || "coin",
  }
}
