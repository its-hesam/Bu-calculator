import { type Direction } from "./shared"

export interface CrossLinearPositionInput {
  symbol: string
  side: Direction
  size: number
  entryPrice: number
  markPrice: number
  mmrPct: number
  closingFee?: number
}

export interface CrossLinearPosition {
  sym: string
  side: Direction
  size: number
  entry: number
  mark: number
  mmrPct: number
  pnl: number
  mm: number
  isCoin: false
  type: string
}

export interface CrossLinearInputs {
  walletBalance: number
  positions: CrossLinearPositionInput[]
  stable: string
  liquidationTime: number
}

export interface CrossLinearResult {
  walletBase: number
  totalCloseFee: number
  wallet: number
  positions: CrossLinearPosition[]
  totalPnl: number
  totalMM: number
  equity: number
  marginRatio: number
  liquidated: boolean
  stable: string
  isCoinM: false
  walletAssets: null
  liquidationDate: Date
}

export function calcCrossLinear(input: CrossLinearInputs): CrossLinearResult {
  const positions: CrossLinearPosition[] = []
  let totalCloseFee = 0

  for (const p of input.positions) {
    const posFee = p.closingFee ?? 0
    totalCloseFee += posFee
    const pnl = p.side === "LONG" ? (p.markPrice - p.entryPrice) * p.size : (p.entryPrice - p.markPrice) * p.size
    const mm = p.markPrice * p.size * (p.mmrPct / 100)
    positions.push({
      sym: p.symbol,
      side: p.side,
      size: p.size,
      entry: p.entryPrice,
      mark: p.markPrice,
      mmrPct: p.mmrPct,
      pnl,
      mm,
      isCoin: false,
      type: `${input.stable}-M`,
    })
  }

  const wallet = input.walletBalance - totalCloseFee
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0)
  const totalMM = positions.reduce((s, p) => s + p.mm, 0)
  const equity = wallet + totalPnl
  const marginRatio = totalMM / equity * 100
  const liquidated = equity <= totalMM

  return {
    walletBase: input.walletBalance,
    totalCloseFee,
    wallet,
    positions,
    totalPnl,
    totalMM,
    equity,
    marginRatio,
    liquidated,
    stable: input.stable,
    isCoinM: false,
    walletAssets: null,
    liquidationDate: new Date(input.liquidationTime),
  }
}