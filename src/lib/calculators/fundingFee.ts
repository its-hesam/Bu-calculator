import { type Side, fmt } from "./shared"
import { fundingTexts } from "@/lib/texts"

export interface FundingFeeInputs {
  side: Side
  size: number
  markPrice: number
  ratePct: number
}

export interface FundingFeeResult {
  fee: number
  absFee: number
  rate: number
  flowLine: string
}

export function calcFundingFee(input: FundingFeeInputs): FundingFeeResult {
  const { side, size, markPrice, ratePct } = input
  const fee = size * markPrice * (ratePct / 100)
  const absFee = Math.abs(fee)

  const flowLine =
    ratePct > 0
      ? side === "long"
        ? fundingTexts.flow.paysShort(fmt(absFee, 6))
        : fundingTexts.flow.receivesFromLong(fmt(absFee, 6))
      : side === "long"
        ? fundingTexts.flow.receivesFromShort(fmt(absFee, 6))
        : fundingTexts.flow.paysLong(fmt(absFee, 6))

  return { fee, absFee, rate: ratePct, flowLine }
}
