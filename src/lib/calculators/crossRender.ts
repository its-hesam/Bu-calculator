import { fmt } from "./shared"
import { type CrossLinearResult } from "./crossLinear"
import { type CrossCoinMResult } from "./crossCoinM"
import { crossTexts } from "@/lib/texts"

export type CrossResult = CrossLinearResult | CrossCoinMResult

export function buildGist(d: CrossResult): string {
  const liqDt = d.liquidationDate
  const losers = d.positions.filter((p) => p.pnl < 0).sort((a, b) => a.pnl - b.pnl)
  const winners = d.positions.filter((p) => p.pnl >= 0)
  const gist = crossTexts.result.gist

  const walletBeforeLiqLbl = d.isCoinM
    ? `${fmt(d.totalWalletUSDT)} USDT`
    : `${fmt(d.walletBase)} ${d.stable}`

  let g = gist.header(liqDt.toUTCString(), walletBeforeLiqLbl)

  if (d.liquidated) {
    g += gist.liquidatedIntro
    if (losers.length) {
      g += gist.drivers(losers.length)
      g += losers.map((p) => {
        const pct = Math.abs((p.mark - p.entry) / p.entry * 100).toFixed(2)
        return gist.driverItem(p.sym, p.side, pct, fmt(p.entry), fmt(p.mark), fmt(Math.abs(p.pnl)))
      }).join("<br>")
      g += "<br><br>"
    }
    if (winners.length) {
      g += gist.winners(winners.map((p) => `${p.sym}: +${fmt(p.pnl)} USDT`).join(", "))
    }
    g += gist.liquidatedOutro(fmt(d.totalMM))
  } else {
    g += gist.safe(fmt(d.equity), fmt(d.totalMM), fmt(d.equity - d.totalMM))
    if (losers.length) {
      g += gist.safeLosers(losers.map((p) => p.sym).join(", "))
    }
  }
  return g
}

export function buildSteps(d: CrossResult): string {
  const liqDt = d.liquidationDate
  const st = crossTexts.result.steps
  let walletStep = ""
  if (d.isCoinM) {
    walletStep = d.walletAssets.map((w) => st.walletAsset(w.coin, String(w.amount), String(w.markPrice), String(w.deductRate), fmt(w.usdtValue))).join("")
    walletStep += st.walletTotal(d.walletAssets.map((w) => fmt(w.usdtValue)).join(" + "))
  } else {
    const closeFeeLine = d.totalCloseFee > 0 ? st.closingFeeLine(fmt(d.totalCloseFee), fmt(d.wallet), d.stable) : ""
    walletStep = st.walletLinear(fmt(d.walletBase), d.stable, closeFeeLine)
  }

  const posSteps = d.positions.map((p, i) => {
    if (p.isCoin) {
      const pvE = (p.qty! / p.entry).toFixed(6)
      const pvM = (p.qty! / p.mark).toFixed(6)
      const pnlCoin = p.side === "LONG" ? parseFloat(pvM) - parseFloat(pvE) : parseFloat(pvE) - parseFloat(pvM)
      return st.posCoin(i + 1, p.sym, p.side, String(p.qty), fmt(p.entry), pvE, p.baseCoin || "coins", fmt(p.mark), pvM, pnlCoin.toFixed(6), fmt(p.pnl), String(p.mmrPct), fmt(p.mm))
    }
    const pnlExpr = p.side === "LONG" ? `(${fmt(p.mark)} − ${fmt(p.entry)}) × ${p.size}` : `(${fmt(p.entry)} − ${fmt(p.mark)}) × ${p.size}`
    return st.posLinear(i + 1, p.sym, p.side, p.type, pnlExpr, fmt(p.pnl), fmt(p.mark), String(p.size), String(p.mmrPct), fmt(p.mm))
  }).join("")

  const lines = [
    st.time(liqDt.toUTCString()),
    st.walletBefore(fmt(d.isCoinM ? d.totalWalletUSDT : d.walletBase), d.isCoinM ? "USDT" : d.stable),
    walletStep,
    posSteps,
    st.totalPnl(`${d.totalPnl >= 0 ? "+" : ""}${fmt(d.totalPnl)}`),
    st.equity(fmt(d.isCoinM ? d.totalWalletUSDT : d.wallet), fmt(d.totalPnl), fmt(d.equity)),
    st.totalMm(fmt(d.totalMM)),
    st.marginRatio(fmt(d.totalMM), fmt(d.equity), fmt(d.marginRatio), d.liquidated ? st.statusLiquidated : st.statusSafe),
  ]
  return lines.join("")
}

export function buildExplain(d: CrossResult): { core: string; mmr: string; why: string } {
  const exp = crossTexts.result.explainContent
  const coinMFormulas = d.isCoinM ? exp.coreCoinM : ""
  const core = exp.core(coinMFormulas)
  const mmr = exp.mmr
  const why = d.liquidated
    ? exp.whyLiquidated(fmt(d.totalPnl), fmt(d.equity), fmt(d.totalMM), fmt(d.marginRatio))
    : exp.whySafe(fmt(d.equity), fmt(d.totalMM))

  return { core, mmr, why }
}
