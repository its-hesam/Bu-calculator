import { fmt } from "./shared"
import { type CrossLinearResult } from "./crossLinear"
import { type CrossCoinMResult } from "./crossCoinM"
import { crossTexts } from "@/lib/texts"

const SEP = "─────────────────────────────────"
const section = (heading: string) => `\n${SEP}\n${heading}\n${SEP}\n`

export function buildCrossReport(d: CrossLinearResult | CrossCoinMResult): string {
  const liqDt = d.liquidationDate
  const walletBeforeLiq = d.isCoinM
    ? `${fmt(d.totalWalletUSDT)} USDT`
    : `${fmt(d.walletBase)} ${d.stable}`
  const rep = crossTexts.result.report

  let t = `${rep.title}\n${rep.time(liqDt.toUTCString())}\n${rep.walletBefore(walletBeforeLiq)}\n${rep.resultLabel(d.liquidated ? rep.resultLiquidated : rep.resultSafe)}`

  t += section(rep.walletHeading)

  if (d.isCoinM) {
    d.walletAssets.forEach((w) => {
      t += `\n${rep.assetLine(w.coin, String(w.amount), String(w.markPrice), String(w.deductRate), fmt(w.usdtValue), w.priceSource)}`
    })
    t += `\n${rep.totalWallet(fmt(d.totalWalletUSDT))}`
  } else {
    t += `\n${rep.walletBalance(fmt(d.walletBase), d.stable)}`
    if (d.totalCloseFee > 0) {
      t += `\n${rep.closingFees(fmt(d.totalCloseFee), d.stable)}\n${rep.effectiveBalance(fmt(d.wallet), d.stable)}`
    }
  }

  t += section(rep.positionsHeading)

  d.positions.forEach((p, i) => {
    t += `\n${rep.positionTitle(i + 1, p.sym, p.side, p.type)}`
    if (p.isCoin) {
      const pvE = (p.qty! / p.entry).toFixed(6)
      const pvM = (p.qty! / p.mark).toFixed(6)
      const coin = p.baseCoin || "coins"
      t += `\n${rep.coinQtyLine(String(p.qty), fmt(p.entry), fmt(p.mark), String(p.mmrPct))}`
      t += `\n${rep.coinPvLine(pvE, coin, pvM)}`
      t += `\n${rep.coinPnlLine(fmt(p.pnl), fmt(p.mm))}`
    } else {
      t += `\n${rep.linearQtyLine(String(p.size), fmt(p.entry), fmt(p.mark), String(p.mmrPct))}`
      t += `\n${rep.linearPnlLine(`${p.pnl >= 0 ? "+" : ""}${fmt(p.pnl)}`, fmt(p.mm))}`
    }
  })

  t += section(rep.summaryHeading)
  t += `\n${rep.totalWallet(fmt(d.isCoinM ? d.totalWalletUSDT : d.walletBase))}`
  t += `\n${rep.totalPnl(`${d.totalPnl >= 0 ? "+" : ""}${fmt(d.totalPnl)}`)}`
  t += `\n${rep.totalEquity(fmt(d.equity))}`
  t += `\n${rep.totalMm(fmt(d.totalMM))}`
  t += `\n${rep.marginRatio(fmt(d.marginRatio))}`
  t += `\n${rep.status(d.liquidated ? rep.statusLiquidated : rep.statusSafe)}`

  const losers = d.positions.filter((p) => p.pnl < 0).sort((a, b) => a.pnl - b.pnl)

  let narrative: string
  if (d.liquidated) {
    narrative = rep.narrative.liquidatedIntro(liqDt.toUTCString(), walletBeforeLiq)
    if (losers.length) {
      narrative += rep.narrative.liquidatedPositions(losers.length > 1, losers.map((p) => `${p.sym} ${p.side}`).join(", "))
    }
    narrative += rep.narrative.liquidatedOutro(fmt(d.equity), fmt(d.totalMM), fmt(d.marginRatio))
  } else {
    narrative = rep.narrative.safe(liqDt.toUTCString(), walletBeforeLiq, fmt(d.equity), fmt(d.totalMM), fmt(d.equity - d.totalMM), fmt(d.marginRatio))
  }

  t += section(rep.whatHappenedHeading) + narrative
  t += section(rep.formulasHeading)
  t += `\n${rep.formula1}\n${rep.formula2}\n${rep.formula3}\n${rep.formula4}\n${rep.formula5}\n${rep.formula6}\n${rep.formula7}`

  return t
}
