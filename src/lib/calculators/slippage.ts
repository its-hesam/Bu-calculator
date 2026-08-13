export interface SlippageInputs {
  triggerPrice: number
  executedPrice: number
  size: number
}

export interface SlippageResult {
  slippagePct: number
  priceDiff: number
  diff: number
}

export function calcSlippage(input: SlippageInputs): SlippageResult {
  const { triggerPrice, executedPrice, size } = input
  const diff = Math.abs(triggerPrice - executedPrice)
  const slippagePct = (diff / triggerPrice) * 100
  const priceDiff = diff * size

  return { slippagePct, priceDiff, diff }
}
