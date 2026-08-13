import { type Direction } from "./shared"
import { commonTexts } from "@/lib/texts"

export interface WalletAsset {
  coin: string
  amount: number
  markPrice: number
  deductRate: number
  usdtValue: number
  priceSource: string
}

export interface CrossCoinMPositionInput {
  symbol: string
  side: Direction
  mmrPct: number
  contractType: "COIN-M" | "USDT-M" | "USDC-M"

  baseCoin?: string
  qtyUSD?: number
  entryPrice?: number
  markPrice?: number
 
  size?: number
  entryPriceL?: number
  markPriceL?: number
}

export interface CrossCoinMPosition {
  sym: string
  side: Direction
  mmrPct: number
  pnl: number
  mm: number
  isCoin: boolean
  type: string
  baseCoin?: string
  qty?: number
  entry: number
  mark: number
  size?: number
}

export interface CrossCoinMInputs {
  positions: CrossCoinMPositionInput[]
  walletAssets: WalletAsset[]
  liquidationTime: number
}

export interface CrossCoinMResult {
  walletBase: number
  totalCloseFee: number
  wallet: number
  positions: CrossCoinMPosition[]
  totalPnl: number
  totalMM: number
  equity: number
  marginRatio: number
  liquidated: boolean
  stable: "USDT"
  isCoinM: true
  walletAssets: WalletAsset[]
  totalWalletUSDT: number
  liquidationDate: Date
}

export function calcCrossCoinM(input: CrossCoinMInputs): CrossCoinMResult {
  const markMap: Record<string, number> = {}
  for (const p of input.positions) {
    if (p.contractType === "COIN-M" && p.baseCoin && p.markPrice && p.markPrice > 0) {
      markMap[p.baseCoin.toUpperCase()] = p.markPrice
    }
  }

  const positions: CrossCoinMPosition[] = []
  for (const p of input.positions) {
    if (p.contractType === "COIN-M") {
      const baseCoin = (p.baseCoin || "coins").toUpperCase()
      const qty = p.qtyUSD!
      const entry = p.entryPrice!
      const mark = p.markPrice!
      const pvE = qty / entry
      const pvM = qty / mark
      const pnlCoin = p.side === "LONG" ? pvM - pvE : pvE - pvM
      const pnlUSDT = pnlCoin * mark
      const mmUSDT = (qty / mark) * (p.mmrPct / 100) * mark 
      positions.push({
        sym: p.symbol,
        side: p.side,
        mmrPct: p.mmrPct,
        pnl: pnlUSDT,
        mm: mmUSDT,
        isCoin: true,
        type: commonTexts.stableTabs.coin,
        baseCoin,
        qty,
        entry,
        mark,
      })
    } else {
      const size = p.size!
      const entry = p.entryPriceL!
      const mark = p.markPriceL!
      const pnl = p.side === "LONG" ? (mark - entry) * size : (entry - mark) * size
      const mm = mark * size * (p.mmrPct / 100)
      positions.push({
        sym: p.symbol,
        side: p.side,
        mmrPct: p.mmrPct,
        pnl,
        mm,
        isCoin: false,
        type: p.contractType,
        size,
        entry,
        mark,
      })
    }
  }

  const totalWalletUSDT = input.walletAssets.reduce((s, w) => s + w.usdtValue, 0)
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0)
  const totalMM = positions.reduce((s, p) => s + p.mm, 0)
  const equity = totalWalletUSDT + totalPnl
  const marginRatio = totalMM / equity * 100
  const liquidated = equity <= totalMM

  return {
    walletBase: totalWalletUSDT,
    totalCloseFee: 0,
    wallet: totalWalletUSDT,
    positions,
    totalPnl,
    totalMM,
    equity,
    marginRatio,
    liquidated,
    stable: "USDT",
    isCoinM: true,
    walletAssets: input.walletAssets,
    totalWalletUSDT,
    liquidationDate: new Date(input.liquidationTime),
  }
}


export const EXR_RATES: Record<string, number> = {
  USDT: 100, USDC: 99.9, USDE: 98.5, FDUSD: 98.5,
  BTC: 99.9, ETH: 99.9, BNB: 96, XRP: 98,
  SOL: 98.5, DOGE: 95, ADA: 95, AVAX: 95,
  AAVE: 95, BCH: 95, DOT: 95, LINK: 95,
  LTC: 95, SUI: 95, TON: 95, TRX: 95,
  XAUT: 95, XLM: 95,
}