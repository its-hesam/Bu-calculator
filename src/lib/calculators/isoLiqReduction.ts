import { type Side, fmt, sideLabel } from "./shared"
import { calcIsoLinear, type IsoLinearResult } from "./isoLinear"
import { calcIsoCoinM, type IsoCoinMResult } from "./isoCoinM"
import { liqReductionTexts } from "@/lib/texts"

export interface LiqTier {
  maxSize: number | null
  mmrPct: number
}

export interface LiqReductionOrder {
  size: number
  pnl: number
  time?: number
}

export interface LiqReductionBaseInputs {
  side: Side
  pair: string
  tiers: LiqTier[]
  orders: LiqReductionOrder[]
}

export interface LiqReductionLinearInputs extends LiqReductionBaseInputs {
  entryPrice: number
  positionSize: number
  availableMargin: number
  stable: string
}

export interface LiqReductionCoinMInputs extends LiqReductionBaseInputs {
  qtyUSD: number
  entryPrice: number
  availableMarginCoins: number
}

export interface TierRef {
  index: number
  label: string
  mmrPct: number
  maxSize: number | null
}

export interface ReductionEvent {
  idx: number
  sizeBefore: number
  size: number
  pnl: number
  sizeAfter: number
  marginBefore: number
  marginAfter: number
  tierBefore: TierRef
  tierAfter: TierRef
  mmBefore: number
  mmAfter: number
}

export interface ReductionStageAResult {
  originalSize: number
  originalTier: TierRef
  originalMm: number
  marginBefore: number
  events: ReductionEvent[]
  remainingSize: number
  remainingTier: TierRef
  marginAfter: number
}

export interface LiqReductionLinearResult {
  stageA: ReductionStageAResult
  stageB: IsoLinearResult
  colleagueSection: string
  userSection: string
}

export interface LiqReductionCoinMResult {
  stageA: ReductionStageAResult
  stageB: IsoCoinMResult
  colleagueSection: string
  userSection: string
}

export type LiqReductionResult = LiqReductionLinearResult | LiqReductionCoinMResult

export const directionLabel = (side: Side) => sideLabel(side)
export const signedValue = (v: number) => `${v >= 0 ? "+" : ""}${fmt(v, 6)}`

export function tierAt(size: number, tiers: LiqTier[]): TierRef {
  const list = tiers.length ? tiers : [{ maxSize: null, mmrPct: 0 }]
  for (let i = 0; i < list.length; i++) {
    const t = list[i]
    if (t.maxSize !== null && size > t.maxSize) continue
    return { index: i + 1, label: `Tier ${i + 1}`, mmrPct: t.mmrPct, maxSize: t.maxSize }
  }
  const last = list[list.length - 1]
  return { index: list.length, label: `Tier ${list.length}`, mmrPct: last.mmrPct, maxSize: null }
}

export function calcIsoLinearReduction(input: LiqReductionLinearInputs): LiqReductionLinearResult {
  const { side, pair, entryPrice, positionSize, availableMargin, stable, tiers, orders } = input

  const mmFor = (size: number, mmrPct: number) => size * entryPrice * (mmrPct / 100)

  const originalTier = tierAt(positionSize, tiers)
  const originalMm = mmFor(positionSize, originalTier.mmrPct)

  const events: ReductionEvent[] = []
  let size = positionSize
  let margin = availableMargin

  const sortedOrders = [...orders].sort(
    (a, b) => (a.time ?? Number.POSITIVE_INFINITY) - (b.time ?? Number.POSITIVE_INFINITY),
  )

  for (let i = 0; i < sortedOrders.length; i++) {
    const order = sortedOrders[i]
    const sizeBefore = size
    const marginBefore = margin
    const tierBefore = tierAt(sizeBefore, tiers)
    const mmBefore = mmFor(sizeBefore, tierBefore.mmrPct)
    size -= order.size
    margin += order.pnl
    const tierAfter = tierAt(size, tiers)
    const mmAfter = mmFor(size, tierAfter.mmrPct)
    events.push({
      idx: i + 1,
      sizeBefore,
      size: order.size,
      pnl: order.pnl,
      sizeAfter: size,
      marginBefore,
      marginAfter: margin,
      tierBefore,
      tierAfter,
      mmBefore,
      mmAfter,
    })
  }

  const remainingSize = size
  const remainingTier = events.length ? events[events.length - 1].tierAfter : originalTier
  const marginAfter = margin
  const remMm = mmFor(remainingSize, remainingTier.mmrPct)

  const stageA: ReductionStageAResult = {
    originalSize: positionSize,
    originalTier,
    originalMm,
    marginBefore: availableMargin,
    events,
    remainingSize,
    remainingTier,
    marginAfter,
  }

  const stageB = calcIsoLinear({
    side,
    entryPrice,
    positionSize: remainingSize,
    mmrPct: remainingTier.mmrPct,
    availableMargin: marginAfter,
    stable,
  })

  const colleagueSection = buildColleagueSection({
    market: `${stable}-M`,
    direction: directionLabel(side),
    stageA,
    stable,
    mmFor,
    remainingMm: remMm,
    finalLiq: stageB.liquidationPrice.toFixed(6),
    finalMove: `${stageB.movePct}%`,
  })

  const userSection = buildUserSection({
    pair,
    direction: directionLabel(side),
    stageA,
    stable,
    finalLiq: stageB.liquidationPrice.toFixed(6),
    finalMove: `${stageB.movePct}%`,
    unit: (size: number) => `${fmt(size, 6)} coins`,
  })

  return { stageA, stageB, colleagueSection, userSection }
}

export function calcIsoCoinMReduction(input: LiqReductionCoinMInputs): LiqReductionCoinMResult {
  const { side, pair, qtyUSD, entryPrice, availableMarginCoins, tiers, orders } = input

  const costPerUnit = (size: number) => size / entryPrice
  const mmFor = (size: number, mmrPct: number) => costPerUnit(size) * (mmrPct / 100)

  const originalTier = tierAt(qtyUSD, tiers)
  const originalMm = mmFor(qtyUSD, originalTier.mmrPct)

  const events: ReductionEvent[] = []
  let size = qtyUSD
  let margin = availableMarginCoins

  const sortedOrders = [...orders].sort(
    (a, b) => (a.time ?? Number.POSITIVE_INFINITY) - (b.time ?? Number.POSITIVE_INFINITY),
  )

  for (let i = 0; i < sortedOrders.length; i++) {
    const order = sortedOrders[i]
    const sizeBefore = size
    const marginBefore = margin
    const tierBefore = tierAt(sizeBefore, tiers)
    const mmBefore = mmFor(sizeBefore, tierBefore.mmrPct)
    size -= order.size
    margin += order.pnl
    const tierAfter = tierAt(size, tiers)
    const mmAfter = mmFor(size, tierAfter.mmrPct)
    events.push({
      idx: i + 1,
      sizeBefore,
      size: order.size,
      pnl: order.pnl,
      sizeAfter: size,
      marginBefore,
      marginAfter: margin,
      tierBefore,
      tierAfter,
      mmBefore,
      mmAfter,
    })
  }

  const remainingSize = size
  const remainingTier = events.length ? events[events.length - 1].tierAfter : originalTier
  const marginAfter = margin
  const remMm = mmFor(remainingSize, remainingTier.mmrPct)

  const stageA: ReductionStageAResult = {
    originalSize: qtyUSD,
    originalTier,
    originalMm,
    marginBefore: availableMarginCoins,
    events,
    remainingSize,
    remainingTier,
    marginAfter,
  }

  const stageB = calcIsoCoinM({
    side,
    qtyUSD: remainingSize,
    entryPrice,
    mmrPct: remainingTier.mmrPct,
    availableMarginCoins: marginAfter,
  })

  const colleagueSection = buildColleagueSection({
    market: "Coin-M",
    direction: directionLabel(side),
    stageA,
    stable: "coins",
    mmFor,
    remainingMm: remMm,
    finalLiq: stageB.liquidationPrice.toFixed(6),
    finalMove: `${stageB.movePct}%`,
    sizeUnit: (size: number) => `${size} USD`,
  })

  const userSection = buildUserSection({
    pair,
    direction: directionLabel(side),
    stageA,
    stable: "coins",
    finalLiq: stageB.liquidationPrice.toFixed(6),
    finalMove: `${stageB.movePct}%`,
    unit: (size: number) => `${fmt(size, 6)} USD`,
  })

  return { stageA, stageB, colleagueSection, userSection }
}

function buildColleagueSection(p: {
  market: string
  direction: string
  stageA: ReductionStageAResult
  stable: string
  mmFor: (size: number, mmrPct: number) => number
  remainingMm: number
  finalLiq: string
  finalMove: string
  sizeUnit?: (size: number) => string
}): string {
  const unit = p.sizeUnit ?? ((s: number) => `${fmt(s, 6)} coins`)
  const lines = p.stageA.events.map((e) => {
    const mmBefore = p.mmFor(e.sizeBefore, e.tierBefore.mmrPct)
    const mmAfter = p.mmFor(e.sizeAfter, e.tierAfter.mmrPct)
    return `  #${e.idx}: reduced by ${fmt(e.size, 6)} (PnL ${signedValue(e.pnl)} ${p.stable}) → remaining ${unit(e.sizeAfter)}; tier ${e.tierBefore.label} → ${e.tierAfter.label} (MMR ${e.tierBefore.mmrPct}% → ${e.tierAfter.mmrPct}%); MM ${fmt(mmBefore, 6)} → ${fmt(mmAfter, 6)} ${p.stable}`
  })
  return liqReductionTexts.explain.colleague({
    market: p.market,
    direction: p.direction,
    originalSize: unit(p.stageA.originalSize),
    originalTier: p.stageA.originalTier.label,
    originalMmrPct: `${p.stageA.originalTier.mmrPct}%`,
    originalMm: fmt(p.stageA.originalMm, 6),
    stable: p.stable,
    marginBefore: fmt(p.stageA.marginBefore, 6),
    events: lines,
    marginAfter: fmt(p.stageA.marginAfter, 6),
    remainingSize: unit(p.stageA.remainingSize),
    remainingTier: p.stageA.remainingTier.label,
    remainingMmrPct: `${p.stageA.remainingTier.mmrPct}%`,
    finalLiq: p.finalLiq,
    finalMove: p.finalMove,
    finalMm: fmt(p.remainingMm, 6),
  })
}

function buildUserSection(p: {
  pair: string
  direction: string
  stageA: ReductionStageAResult
  stable: string
  finalLiq: string
  finalMove: string
  unit: (size: number) => string
}): string {
  const lines = p.stageA.events.map(
    (e) => `  • Reduced by ${fmt(e.size, 6)} (realized PnL ${signedValue(e.pnl)} ${p.stable}) → remaining ${p.unit(e.sizeAfter)}`,
  )
  return liqReductionTexts.explain.user({
    pair: p.pair,
    direction: p.direction,
    tier: p.stageA.originalTier.label,
    events: lines,
    remainingSize: p.unit(p.stageA.remainingSize),
    finalLiq: p.finalLiq,
    finalMove: p.finalMove,
  })
}