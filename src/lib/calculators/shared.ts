import { commonTexts } from "@/lib/texts"

export const vipFees: Array<[number, number]> = [
  [0.02, 0.06],
  [0.02, 0.05],
  [0.016, 0.05],
  [0.014, 0.04],
  [0.012, 0.0375],
  [0.01, 0.035],
  [0.008, 0.0315],
  [0.006, 0.03],
]

export const BANKRUPTCY_FEE = 0.0006

export function fmt(n: number, d = 2): string {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })
}

export type Side = "long" | "short"
export type LinearType = "USDT-M" | "USDC-M"
export type Direction = "LONG" | "SHORT"

export function sideLabel(side: Side): string {
  return side === "long" ? commonTexts.side.long : commonTexts.side.short
}

export function directionSide(dir: Direction): "long" | "short" {
  return dir === "LONG" ? "long" : "short"
}