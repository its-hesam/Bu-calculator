export const appTexts = {
  brand: {
    name: "Bitunix",
    product: "Calculator",
  },
  aria: {
    openMenu: "Open tools menu",
    closeMenu: "Close tools menu",
  },
  tools: [
    { key: "iso", label: "Isolated Liq", description: "Liquidation price for a single isolated position — linear and coin-margined." },
    { key: "cross", label: "Cross Liq", description: "Stress-test a shared cross-margin wallet across every open position." },
    { key: "pnl", label: "PnL", description: "Realized profit & loss with ROI for linear and coin-margined contracts." },
    { key: "fee", label: "Trading Fee", description: "Maker/taker fees by VIP tier, settled in USDT or the base coin." },
    { key: "funding", label: "Funding Fee", description: "Periodic funding payments flowing between longs and shorts." },
    { key: "slip", label: "Slippage", description: "How far a trigger market fill drifts from your intended price." },
    { key: "fundflow", label: "Fund Flow", description: "Reconstruct a balance history from exported Excel transaction files." },
  ],
}

export const commonTexts = {
  side: { label: "Position Side", long: "Long", short: "Short", longUpper: "LONG", shortUpper: "SHORT" },
  orderTypes: { maker: "Maker", taker: "Taker" },
  reset: "Reset",
  copied: "Copied!",
  copy: "Copy",
  remove: "Remove",
  formula: "Formula",
  messagePlaceholder: "Message...",
  templateHeading: "Prepared Responses",
  responsesEyebrow: "Copy & send",
  copyHint: "Review, edit if needed, then copy straight into your message.",
  placeholderTitle: "Awaiting calculation",
  placeholderHint: "Fill in the inputs, then run the calculation. Results appear here.",
  stableTabs: { usdt: "USDT-M", usdc: "USDC-M", coin: "Coin-M" },
  positionInfo: "Position Information",
  positionInfoDesc: "Identifying details used in the prepared responses",
  currency: "Currency Name",
  currencyPlaceholder: "e.g. BTC, ETH, SOL",
  leverage: "Leverage",
  leveragePlaceholder: "e.g. 10",
  positionDirection: "Position Direction",
  positionId: "Position ID",
  positionIdPlaceholder: "e.g. 123456789",
  stopLossQuestion: "Did the position have a Stop Loss?",
  stopLossPrice: "Stop Loss Price",
  stopLossPricePlaceholder: "e.g. 57000",
  slProximityClose: "Your Stop Loss was very close to the liquidation price.",
  slProximityFar: "Your Stop Loss was relatively far from the liquidation price.",
}

export type TemplateVariant =
  | "isoLinear"
  | "isoLinearSL"
  | "isoCoinM"
  | "isoCoinMSL"
  | "cross"
  | "crossSL"
  | "pnlLinear"
  | "pnlCoinM"
  | "feeLinear"
  | "feeCoinM"
  | "funding"
  | "slippage"
  | "fundFlow"

export const templates: Record<TemplateVariant, { colleague: string; user: string }> = {
  isoLinear: {
    colleague:
      "Internal Note — Isolated Position Liquidation Assessment\n\nPosition: {{direction}} {{market}} ({{currency}}), entry {{entry}}, size {{size}}, MMR {{mmr}}.\nAvailable margin {{margin}} · maintenance margin {{mm}} · risk buffer {{buffer}}.\nEstimated liquidation price {{liq}} — a {{move}} price move from entry (leverage {{leverage}}).\nPosition ID: {{positionId}}.\n\nKindly review and confirm at your earliest convenience.",
    user:
      "Dear Customer,\n\nWe have reviewed your {{direction}} {{market}} ({{currency}}) position. Based on the parameters provided, the estimated liquidation price is {{liq}}.\n\nThe position may be subject to forced closure should the price move {{move}} to reach {{liq}}. We kindly advise you to maintain sufficient margin in your account at all times.\n\nShould you have any questions or require further assistance, please do not hesitate to contact our support team.",
  },
  isoLinearSL: {
    colleague:
      "Internal Note — Isolated Position Stopped Out (Stop Loss)\n\nPosition: {{direction}} {{market}} ({{currency}}), entry {{entry}}, size {{size}}, MMR {{mmr}}.\nStop Loss price: {{stopLoss}}.\n{{slProximityText}}\nThe position had a Stop Loss in place and was closed by it.\nAvailable margin {{margin}} · maintenance margin {{mm}} · risk buffer {{buffer}}.\nEstimated liquidation price {{liq}} — a {{move}} price move from entry (leverage {{leverage}}).\nPosition ID: {{positionId}}.\n\nKindly review and confirm at your earliest convenience.",
    user:
      "Dear Customer,\n\nWe have reviewed your {{direction}} {{market}} ({{currency}}) position. As the position had a Stop Loss in place, it was closed at the Stop Loss price of {{stopLoss}} before liquidation could occur.\n\n{{slProximityText}}\n\nThe estimated liquidation price was {{liq}} (a {{move}} price move from your entry of {{entry}}). We kindly advise you to maintain sufficient margin in your account at all times.\n\nShould you have any questions or require further assistance, please do not hesitate to contact our support team.",
  },
  isoCoinM: {
    colleague:
      "Internal Note — Isolated Coin-M Position Liquidation Assessment\n\nPosition: {{direction}} Coin-M ({{currency}}), quantity {{qty}}, entry {{entry}}, MMR {{mmr}}.\nAvailable margin {{margin}} · maintenance margin {{mm}} · risk buffer {{buffer}}.\nEstimated liquidation price {{liq}} — a {{move}} price move from entry (leverage {{leverage}}).\nPosition ID: {{positionId}}.\n\nKindly review and confirm at your earliest convenience.",
    user:
      "Dear Customer,\n\nWe have reviewed your {{direction}} Coin-M ({{currency}}) position. Based on the parameters provided, the estimated liquidation price is {{liq}}.\n\nThe position may be subject to forced closure should the price move {{move}} to reach {{liq}}. We kindly advise you to maintain sufficient margin in your account at all times.\n\nShould you have any questions or require further assistance, please do not hesitate to contact our support team.",
  },
  isoCoinMSL: {
    colleague:
      "Internal Note — Isolated Coin-M Position Stopped Out (Stop Loss)\n\nPosition: {{direction}} Coin-M ({{currency}}), quantity {{qty}}, entry {{entry}}, MMR {{mmr}}.\nStop Loss price: {{stopLoss}}.\n{{slProximityText}}\nThe position had a Stop Loss in place and was closed by it.\nAvailable margin {{margin}} · maintenance margin {{mm}} · risk buffer {{buffer}}.\nEstimated liquidation price {{liq}} — a {{move}} price move from entry (leverage {{leverage}}).\nPosition ID: {{positionId}}.\n\nKindly review and confirm at your earliest convenience.",
    user:
      "Dear Customer,\n\nWe have reviewed your {{direction}} Coin-M ({{currency}}) position. As the position had a Stop Loss in place, it was closed at the Stop Loss price of {{stopLoss}} before liquidation could occur.\n\n{{slProximityText}}\n\nThe estimated liquidation price was {{liq}} (a {{move}} price move from your entry of {{entry}}). We kindly advise you to maintain sufficient margin in your account at all times.\n\nShould you have any questions or require further assistance, please do not hesitate to contact our support team.",
  },
  cross: {
    colleague:
      "Internal Note — Cross Margin Assessment at {{time}}\n\nPosition: {{direction}} {{currency}} · Position ID {{positionId}}.\nVerdict: {{verdict}}.\n{{count}} position(s) · wallet {{wallet}} · unrealized PnL {{pnl}} · equity {{equity}}.\nMaintenance margin {{mm}} → margin ratio {{ratio}}.\n\nKindly review and confirm at your earliest convenience.",
    user:
      "Dear Customer,\n\nAt {{time}}, your cross-margin account was assessed as {{verdict}}. Your equity stood at {{equity}} against a maintenance margin of {{mm}}, resulting in a margin ratio of {{ratio}}.\n\nShould you have any questions or require further assistance, please do not hesitate to contact our support team.",
  },
  crossSL: {
    colleague:
      "Internal Note — Cross Margin Assessment (Stop Loss) at {{time}}\n\nPosition: {{direction}} {{currency}} · Position ID {{positionId}}.\nStop Loss price: {{stopLoss}}.\n{{slProximityText}}\nThe position had a Stop Loss in place and was closed by it before liquidation could occur.\nVerdict: {{verdict}}.\n{{count}} position(s) · wallet {{wallet}} · unrealized PnL {{pnl}} · equity {{equity}}.\nMaintenance margin {{mm}} → margin ratio {{ratio}}.\n\nKindly review and confirm at your earliest convenience.",
    user:
      "Dear Customer,\n\nAt {{time}}, your cross-margin account was assessed as {{verdict}}. Your equity stood at {{equity}} against a maintenance margin of {{mm}}, resulting in a margin ratio of {{ratio}}.\n\nAs your position had a Stop Loss in place, it was closed at the Stop Loss price of {{stopLoss}} before liquidation could occur.\n\n{{slProximityText}}\n\nShould you have any questions or require further assistance, please do not hesitate to contact our support team.",
  },
  pnlLinear: {
    colleague:
      "Internal Note — Realized PnL\n\n{{market}} {{direction}} position ({{currency}}) — entry {{open}}, exit {{close}}, quantity {{qty}}.\nRealized PnL: {{pnl}} · ROI {{roi}} (leverage {{leverage}}).\nPosition ID: {{positionId}}.\n\nKindly review and confirm.",
    user:
      "Dear Customer,\n\nYour {{market}} {{direction}} ({{currency}}) trade has been closed with a realized PnL of {{pnl}}.\nEntry {{open}} → exit {{close}}, size {{qty}}.\n\nShould you have any questions or require further assistance, please do not hesitate to contact our support team.",
  },
  pnlCoinM: {
    colleague:
      "Internal Note — Realized PnL (Coin-M)\n\nCoin-M {{direction}} position ({{currency}}) — entry {{open}}, exit {{close}}, quantity {{qty}}.\nRealized PnL {{pnl}} ≈ {{pnlUSD}} · ROI {{roi}} (leverage {{leverage}}).\nPosition ID: {{positionId}}.\n\nKindly review and confirm.",
    user:
      "Dear Customer,\n\nYour Coin-M {{direction}} ({{currency}}) trade has been closed with a realized PnL of {{pnl}} (approximately {{pnlUSD}}).\nEntry {{open}} → exit {{close}}, size {{qty}}.\n\nShould you have any questions or require further assistance, please do not hesitate to contact our support team.",
  },
  feeLinear: {
    colleague:
      "Internal Note — Trading Fee Breakdown\n\n{{market}} ({{currency}}) — {{direction}} position, {{vip}}, maker {{maker}} / taker {{taker}}.\nSize {{size}} · entry {{entry}} → exit {{exit}}.\nEntry fee {{entryFee}} · exit fee {{exitFee}} · total {{totalFee}}.\nPosition ID: {{positionId}}.\n\nKindly review and confirm.",
    user:
      "Dear Customer,\n\nFor your {{market}} ({{currency}}) {{direction}} trade (size {{size}}, entry {{entry}} → exit {{exit}}), the total trading fee is {{totalFee}}.\n\nShould you have any questions or require further assistance, please do not hesitate to contact our support team.",
  },
  feeCoinM: {
    colleague:
      "Internal Note — Trading Fee Breakdown (Coin-M)\n\n{{market}} ({{currency}}) — {{direction}} position, {{vip}}, maker {{maker}} / taker {{taker}}.\nQuantity {{qty}} · open {{open}} → close {{close}}.\nOpen fee {{openFee}} · close fee {{closeFee}} · total {{totalFee}}.\nPosition ID: {{positionId}}.\n\nKindly review and confirm.",
    user:
      "Dear Customer,\n\nFor your Coin-M ({{currency}}) {{direction}} trade (quantity {{qty}}, open {{open}} → close {{close}}), the total trading fee is {{totalFee}}, settled in {{currency}}.\n\nShould you have any questions or require further assistance, please do not hesitate to contact our support team.",
  },
  funding: {
    colleague:
      "Internal Note — Funding Fee\n\n{{direction}} {{currency}} position — size {{size}}, mark price {{mark}}, funding rate {{rate}}.\nFunding fee {{fee}}. Flow: {{flow}}.\nPosition ID: {{positionId}}.\n\nKindly review and confirm.",
    user:
      "Dear Customer,\n\nYour {{direction}} {{currency}} position ({{size}}) is subject to a funding fee of {{fee}} at a rate of {{rate}}.\n\n{{flow}}\n\nShould you have any questions or require further assistance, please do not hesitate to contact our support team.",
  },
  slippage: {
    colleague:
      "Internal Note — Slippage Assessment (Stop Loss)\n\nPosition: {{direction}} {{currency}} · Position ID {{positionId}} · leverage {{leverage}}.\nEntry {{entry}}, stop loss {{stopLoss}}, actual close {{actual}} (size {{size}}).\nPnL at Stop Loss: {{pnlAtSL}} · PnL at actual close: {{pnlActual}}.\nSlippage {{slippage}} · price impact {{priceDiff}} · PnL impact {{slippagePnl}}.\n\nKindly review and confirm.",
    user:
      "Dear Customer,\n\nYour {{direction}} {{currency}} position (entry {{entry}}) had a Stop Loss at {{stopLoss}} to limit your loss. However, the position was actually closed at {{actual}} due to market conditions, resulting in a slippage of {{slippage}}.\n\nPnL at the Stop Loss price was {{pnlAtSL}}, while the PnL at the actual closing price was {{pnlActual}} — a slippage impact of {{slippagePnl}} on {{size}}.\n\nMinor differences between the displayed and executed price are considered normal for market orders.\n\nShould you have any questions or require further assistance, please do not hesitate to contact our support team.",
  },
  fundFlow: {
    colleague:
      "Internal Note — Fund Flow Reconstruction\n\nReconstruction complete — {{count}} transactions.\nCurrent balance {{current}} · oldest reconstructed balance {{oldest}} · net change {{netChange}}.\n\nKindly review and confirm.",
    user:
      "Dear Customer,\n\nWe have reviewed the fund flow of your account across {{count}} transactions. Your current balance is {{current}}, and the reconstructed balance at the time of the oldest transaction is {{oldest}} (net change {{netChange}}).\n\nThe full breakdown is attached for your reference.\n\nShould you have any questions or require further assistance, please do not hesitate to contact our support team.",
  },
}

export const templateMeta = {
  colleague: { title: "Colleague Response", subtitle: "Internal team note" },
  user: { title: "User Response", subtitle: "Customer-facing message" },
}

export const isoTexts = {
  linear: {
    section: { title: "Position Details", description: "Define the trade you want to stress-test" },
    fields: {
      entry: { label: "Avg. Open Price", placeholder: "e.g. 60000" },
      size: { label: "Position Size", hint: "coins", placeholder: "e.g. 0.5" },
      mmr: { label: "MMR", hint: "%", placeholder: "e.g. 0.5" },
      leverage: { label: "Leverage", hint: "option A", placeholder: "e.g. 10" },
      margin: (stable: string) => ({ label: `Available Margin (${stable})`, hint: "option B — preferred", placeholder: "e.g. 500" }),
    },
    infoNote:
      "For a more accurate result, please enter the Available Margin. If only Leverage is entered, the margin is calculated as Position Size × Entry Price ÷ Leverage. When both fields are provided, the calculation is based on the Available Margin, and the Leverage entered will also be reflected in the result.",
    errors: {
      missing: "Please enter the Average Open Price, Position Size and MMR.",
      marginOrLeverage: "Please enter either Leverage or Available Margin.",
    },
    calculate: "Calculate Liquidation Price",
    heroTitle: "Estimated Liquidation Price",
    lowMarginTitle: "Available Margin is lower than the Maintenance Margin.",
    eyebrow: (side: string, sl: string) => `${side}-M · ${sl}`,
    heroSub: (movePct: string, below: boolean, entry: string) =>
      `A ${movePct}% move ${below ? "below" : "above"} your entry of ${entry}`,
    stats: {
      mm: "Maintenance Margin",
      margin: "Available Margin",
      buffer: "Risk Buffer",
      bufferSub: "Margin left before liquidation",
      move: "Price Move",
      moveSub: "Entry → liq",
      leverage: "Leverage Used",
    },
    breakdown: {
      formula: (sl: string) => `Formula Used (${sl} Position)`,
      steps: "Calculation Steps",
      details: "Position Details",
      mmr: "What is MMR?",
      narrative: "Plain-English Narrative",
      mmrIntro:
        "The Maintenance Margin Rate (MMR) defines the minimum margin that must be maintained at all times to keep a position open. This minimum margin is calculated as:",
      mmrOutro:
        "As the position moves into loss, the available margin is consumed. Once the remaining margin drops to this minimum, the exchange force-liquidates the position.",
    },
    formula: {
      long: "Liquidation Price = Avg. Open Price − ((Available Margin − Position Size × MMR × Avg. Open Price) ÷ Position Size)",
      short: "Liquidation Price = Avg. Open Price + ((Available Margin − Position Size × MMR × Avg. Open Price) ÷ Position Size)",
    },
    steps: {
      mm: (size: string, entry: string, mmrPct: string, value: string, stable: string) =>
        `Maintenance Margin = ${size} × ${entry} × ${mmrPct}% = ${value} ${stable}`,
      subtract: (margin: string, mm: string, value: string, stable: string) =>
        `Subtract from Available Margin: ${margin} − ${mm} = ${value} ${stable}`,
      divide: (margin: string, size: string, value: string) =>
        `Divide by Position Size: ${margin} ÷ ${size} = ${value}`,
      liq: (entry: string, sign: string, diff: string, liq: string) =>
        `Liquidation Price = ${entry} ${sign} ${diff} = ${liq}`,
    },
    details: {
      avgOpenPrice: "Avg. Open Price",
      positionSize: "Position Size",
      mmr: "MMR",
      positionType: "Position Type",
      marginDirect: (margin: string, stable: string, leverage?: string) =>
        `Available Margin: ${margin} ${stable} (entered directly)${leverage ? ` | Leverage entered: ${leverage} (for reference)` : ""}`,
      marginLeverage: (margin: string, stable: string, leverage: string) =>
        `Available Margin: ${margin} ${stable} (calculated from ${leverage} leverage)`,
    },
    narrative: (sl: string, entry: string, margin: string, stable: string, below: boolean, loss: string, mm: string, liq: string, movePct: string) =>
      `You opened a ${sl} position at ${entry} with ${margin} ${stable} in margin. As the price moves ${below ? "below" : "above"} your entry, the unrealized loss grows and consumes your margin. Once the loss reaches ${loss} ${stable} — leaving only the maintenance margin of ${mm} ${stable} — the position is subject to forced closure. Your estimated liquidation price is ${liq}, which represents a ${movePct}% move ${below ? "below" : "above"} your entry of ${entry}.`,
    lowMarginReason: (margin: string, stable: string, mm: string) =>
      `Your available margin (${margin} ${stable}) is equal to or less than the required maintenance margin (${mm} ${stable}). Please review the entered values — this position would be subject to immediate liquidation.`,
  },
  coinM: {
    section: { title: "Position Details", description: "Coin-margined futures settle in the base coin" },
    fields: {
      qty: { label: "Quantity Unit", hint: "USD", placeholder: "e.g. 10000" },
      entry: { label: "Open Price", placeholder: "e.g. 60000" },
      mmr: { label: "MMR", hint: "%", placeholder: "e.g. 0.5" },
      leverage: { label: "Leverage", hint: "option A", placeholder: "e.g. 10" },
      margin: { label: "Available Margin", hint: "option B — preferred, coins", placeholder: "e.g. 0.15" },
    },
    infoNote:
      "For a more accurate result, please enter the Available Margin. If only Leverage is entered, the margin is calculated as Position Value ÷ Leverage (Quantity ÷ Entry Price ÷ Leverage). When both fields are provided, the calculation is based on the Available Margin, and the Leverage entered will also be reflected in the result.",
    errors: {
      missing: "Please enter Quantity, Open Price and MMR.",
      marginOrLeverage: "Please enter either Leverage or Available Margin.",
    },
    calculate: "Calculate Liquidation Price",
    heroTitle: "Estimated Liquidation Price",
    lowMarginTitle: "Available Margin is lower than the Maintenance Margin.",
    eyebrow: (sl: string) => `Coin-M · ${sl}`,
    heroSub: (movePct: string, below: boolean, entry: string) =>
      `A ${movePct}% move ${below ? "below" : "above"} your entry of ${entry}`,
    stats: {
      mm: "Maintenance Margin",
      margin: "Available Margin",
      buffer: "Risk Buffer",
      bufferSub: "Margin left before liquidation",
      move: "Price Move",
      moveSub: "Entry → liq",
      leverage: "Leverage Used",
    },
    breakdown: {
      formula: (sl: string) => `Formula Used (${sl} Position)`,
      steps: "Calculation Steps",
      details: "Position Details",
      narrative: "Plain-English Narrative",
    },
    formula: {
      long: "Liq Price = Qty ÷ (PV + (AM − MM − BF))",
      short: "Liq Price = Qty ÷ (PV − (AM − MM − BF))",
    },
    steps: {
      pv: (qty: string, entry: string, pv: string) =>
        `Position Value (PV) = ${qty} ÷ ${entry} = ${pv} coins`,
      marginFromLeverage: (pv: string, leverage: string, margin: string) =>
        `Available Margin = PV ÷ Leverage = ${pv} ÷ ${leverage} = ${margin} coins`,
      marginDirect: (margin: string) => `Available Margin = ${margin} coins (entered directly)`,
      mm: (pv: string, mmrPct: string, mm: string) =>
        `Maintenance Margin (MM) = PV × MMR = ${pv} × ${mmrPct}% = ${mm} coins`,
      bf: (pv: string, bf: string) =>
        `Bankruptcy Fee (BF) = PV × 0.06% = ${pv} × 0.0006 = ${bf} coins`,
      adjustment: (margin: string, mm: string, bf: string, adj: string) =>
        `Adjustment = AM − MM − BF = ${margin} − ${mm} − ${bf} = ${adj} coins`,
      liq: (qty: string, pv: string, sign: string, adj: string, liq: string) =>
        `Liquidation Price = ${qty} ÷ (${pv} ${sign} ${adj}) = ${liq}`,
    },
    details: {
      qtyUnit: "Quantity Unit",
      entryPrice: "Entry Price",
      mmr: "MMR",
      positionType: "Position Type",
      marginDirect: (margin: string, leverage?: string) =>
        `Available Margin: ${margin} coins (entered directly)${leverage ? ` | Leverage entered: ${leverage} (for reference)` : ""}`,
      marginLeverage: (margin: string, leverage: string) =>
        `Available Margin: ${margin} coins (calculated from ${leverage} leverage)`,
    },
    narrative: (sl: string, entry: string, margin: string, below: boolean, liq: string, movePct: string) =>
      `You opened a ${sl} Coin-M position at ${entry} with an available margin of ${margin} coins. As the mark price moves ${below ? "below" : "above"} your entry, your margin is eroded. The position will be subject to forced closure once the mark price reaches ${liq}, which represents a ${movePct}% move ${below ? "below" : "above"} your entry.`,
    lowMarginReason: (margin: string, mm: string) =>
      `Your available margin (${margin} coins) is equal to or less than the required maintenance margin (${mm} coins). Please review the entered values — this position cannot exist under these parameters.`,
  },
}

export const crossTexts = {
  linear: {
    wallet: {
      section: { title: "Wallet & Liquidation Time", description: "Shared cross-margin wallet and the UTC snapshot to test" },
      fields: {
        wallet: (stable: string) => ({ label: `Wallet Balance (${stable})`, placeholder: "e.g. 1250.00" }),
        date: { label: "UTC Date" },
        time: { label: "UTC Time", hint: "HH:MM:SS" },
      },
    },
    positions: {
      section: { title: "Open Positions", description: "Add every linear position open in this wallet" },
      add: "Add",
      empty: "No positions yet — click Add to include one.",
      addMore: "Add Position",
      fields: {
        symbol: { label: "Symbol", placeholder: "e.g. BTCUSDT" },
        side: "Side",
        size: { label: "Size", hint: "coins" },
        entry: "Entry Price",
        mmr: { label: "MMR", hint: "%" },
        mark: { label: "Mark Price", placeholder: "At liquidation" },
        fee: { label: "Closing Fee", hint: "optional", placeholder: "e.g. 4.20" },
      },
    },
    errors: {
      wallet: "Enter a valid wallet balance.",
      time: "Enter the UTC date and time.",
      noPositions: "Add at least one position.",
      fillAll: "Fill all fields for every position.",
    },
    calculate: "Calculate Cross Liquidation",
  },
  coinM: {
    time: {
      section: { title: "Liquidation Time", description: "UTC snapshot at which to evaluate the account" },
      fields: {
        date: { label: "UTC Date" },
        time: { label: "UTC Time", hint: "HH:MM:SS" },
      },
    },
    assets: {
      section: { title: "Wallet Assets", description: "Every coin held as cross-margin collateral" },
      add: "Add",
      empty: "No assets yet — click Add to include one.",
      addMore: "Add Wallet Asset",
      otherOption: "OTHER…",
      infoNote:
        "Add each coin you hold in the Cross wallet. USDT = 100% exchange rate (no haircut). For coins with an open position, the mark price is pulled automatically from the position you enter below.",
      fields: {
        coin: "Coin",
        amount: { label: "Amount", placeholder: "e.g. 1.5" },
        rate: { label: "Rate", hint: "%" },
        customCoin: { label: "Coin Name", placeholder: "e.g. AVAX" },
        mark: { label: "Mark Price (USDT)", hint: "if no matching position", placeholder: "e.g. 83.00" },
      },
      usdtFootnote: "USDT: full face value, 100% exchange rate, no haircut.",
      otherFootnote: "Mark price will auto-fill from a matching open position if available.",
      priceSource: {
        fixed: "Fixed (1:1)",
        auto: (coin: string) => `Auto from ${coin} position`,
        manual: "Manual entry",
      },
    },
    positions: {
      section: { title: "Open Positions", description: "Mixed contract types are supported" },
      add: "Add",
      empty: "No positions yet — click Add to include one.",
      addMore: "Add Position",
      infoNote: "All position values are converted to USDT internally. Select the contract type for each position.",
      fields: {
        symbol: { label: "Symbol", placeholder: "e.g. SOLUSDT" },
        type: "Contract Type",
        side: "Side",
        mmr: { label: "MMR", hint: "%", placeholder: "e.g. 0.5" },
        baseCoin: { label: "Base Coin", placeholder: "e.g. SOL" },
        qty: { label: "Quantity", hint: "USD", placeholder: "e.g. 10000" },
        entry: { label: "Entry Price", placeholder: "e.g. 80" },
        mark: { label: "Mark Price", placeholder: "e.g. 83" },
        size: { label: "Size", hint: "coins", placeholder: "e.g. 10" },
      },
    },
    errors: {
      time: "Enter the UTC date and time.",
      noPositions: "Add at least one position.",
      noAssets: "Add at least one wallet asset.",
      symbolMmr: "Fill symbol and MMR for every position.",
      coinMFields: (sym: string) => `Fill all Coin-M fields for ${sym}.`,
      allFields: (sym: string) => `Fill all fields for ${sym}.`,
      coinName: "Enter a coin name for every wallet asset.",
      amount: (coin: string) => `Enter a valid amount for ${coin}.`,
      rate: (coin: string) => `Exchange rate for ${coin} must be 0–100%.`,
      mark: (coin: string) => `No open ${coin} position found. Enter mark price for ${coin} manually.`,
    },
    calculate: "Calculate Cross Coin-M Liquidation",
  },
  rowLabels: {
    position: "POSITION",
    wallet: "WALLET",
  },
  result: {
    verdict: {
      ok: "No Liquidation",
      danger: "Liquidation Confirmed",
      liquidated: (time: string, eq: string, mm: string, ratio: string) =>
        `At ${time}, total equity dropped to ${eq}, at or below the maintenance margin of ${mm}. Margin ratio reached ${ratio}%.`,
      safe: (time: string, mm: string, ratio: string) =>
        `At ${time}, total equity exceeded the maintenance margin of ${mm}. Margin ratio: ${ratio}%.`,
    },
    marginRatio: "Margin Ratio",
    converted: "(converted)",
    stats: {
      time: "Time of Liquidation (UTC)",
      timeSub: "Snapshot",
      wallet: "Wallet Before Liq.",
      fees: "Total Closing Fees",
      pnl: "Unrealized PnL",
      equity: "Total Equity",
      mm: "Maint. Margin Req.",
    },
    positionsTable: {
      heading: "Position Breakdown",
      pair: "Pair",
      type: "Type",
      side: "Side",
      size: "Size/Qty",
      entry: "Entry",
      mark: "Mark",
      pnl: "PnL (USDT)",
      mm: "MM (USDT)",
      totals: "Totals",
    },
    walletTable: {
      heading: "Wallet Collateral Breakdown",
      coin: "Coin",
      amount: "Amount",
      mark: "Mark Price",
      rate: "Exchange Rate",
      value: "USDT Value",
      source: "Source",
      total: "Total Collateral",
    },
    explain: {
      heading: "What Happened & Full Explanation",
      summary: "Summary",
      steps: "Step-by-Step Calculation",
      reference: "Formula Reference & Explanation",
      core: "Core Formulas:",
      mmr: "What is MMR?",
      why: "Why did liquidation happen?",
    },
    explainContent: {
      core: (coinM: string) =>
        `Equity = Total Wallet Collateral (USDT) + Σ Unrealized PnL (USDT)<br>PnL (Long, linear) = (Mark − Entry) × Size &nbsp;|&nbsp; PnL (Short, linear) = (Entry − Mark) × Size${coinM}<br>Maint. Margin = Mark Price × Size × MMR%<br>Margin Ratio = Σ Maint. Margin ÷ Equity × 100 &nbsp;|&nbsp; Liquidation when Ratio ≥ 100%`,
      coreCoinM:
        "<br>Coin-M PnL (Long) = (PV_mark − PV_entry) × Mark Price &nbsp;|&nbsp; where PV = Qty ÷ Price<br>Coin-M MM = (Qty ÷ Mark) × MMR% × Mark Price<br>Wallet USDT Value = Amount × Mark Price × Exchange Rate%",
      mmr: "MMR (Maintenance Margin Rate) defines the minimum margin that must be maintained at all times to keep a position open. As the position moves into loss, margin is consumed. Once the remaining margin falls to the minimum required by the MMR, the position is subject to liquidation.",
      whyLiquidated: (pnl: string, equity: string, mm: string, ratio: string) =>
        `The combined unrealized losses (${pnl} USDT) across all positions consumed the wallet equity. Total equity (${equity} USDT) fell to or below the maintenance margin required (${mm} USDT), pushing the margin ratio to ${ratio}%. The exchange force-closed all cross margin positions to prevent a negative balance.`,
      whySafe: (equity: string, mm: string) =>
        `The equity buffer of ${equity} USDT remained above the maintenance margin of ${mm} USDT — no liquidation occurred at this timestamp.`,
    },
    gist: {
      header: (time: string, wallet: string) =>
        `<strong>Time of Liquidation (UTC):</strong> ${time}<br><strong>Wallet Balance Before Liquidation:</strong> ${wallet}<br><br>`,
      liquidatedIntro:
        "Your cross margin account was liquidated because the combined losses across your open positions eroded the shared wallet balance beyond the minimum maintenance threshold.<br><br>",
      drivers: (count: number) => `Main driver${count > 1 ? "s" : ""} of the liquidation:<br>`,
      driverItem: (sym: string, side: string, pct: string, entry: string, mark: string, loss: string) =>
        `• <strong>${sym} ${side}</strong>: moved <strong>${pct}%</strong> against you — entry ${entry} → mark ${mark}, loss of <strong>${loss} USDT</strong>`,
      winners: (list: string) =>
        `Profitable positions (${list}) were not sufficient to offset the losses.<br><br>`,
      liquidatedOutro: (mm: string) =>
        `Once total equity (wallet collateral + all unrealised PnL) dropped to or below the total maintenance margin required (${mm} USDT), the exchange force-liquidated all positions simultaneously.`,
      safe: (equity: string, mm: string, buffer: string) =>
        `At this timestamp the account was not at liquidation. Equity of <strong>${equity} USDT</strong> exceeded the required maintenance margin of <strong>${mm} USDT</strong> by <strong>${buffer} USDT</strong>.`,
      safeLosers: (symbols: string) =>
        `<br><br>There were losing positions (${symbols}), but the wallet collateral was sufficient to absorb them at this timestamp.`,
    },
    steps: {
      time: (t: string) => `Time of Liquidation (UTC): ${t}`,
      walletBefore: (value: string, stable: string) => `Wallet Balance Before Liquidation: ${value} ${stable}`,
      walletAsset: (coin: string, amount: string, mark: string, rate: string, value: string) =>
        `<strong>${coin}</strong>: ${amount} × ${mark} (mark) × ${rate}% = <strong>${value} USDT</strong>`,
      walletTotal: (sum: string) => `<strong>Total Wallet Collateral (USDT):</strong> ${sum}`,
      walletLinear: (base: string, stable: string, closeFeeLine: string) =>
        `<strong>Wallet Balance:</strong> ${base} ${stable}${closeFeeLine}`,
      closingFeeLine: (fee: string, eff: string, stable: string) =>
        ` − ${fee} (closing fees) = ${eff} ${stable} effective`,
      posCoin: (n: number, sym: string, side: string, qty: string, entry: string, pvE: string, coin: string, mark: string, pvM: string, pnlCoin: string, pnl: string, mmrPct: string, mm: string) =>
        `<strong>#${n} ${sym} ${side} (Coin-M)</strong><br>PV at entry = ${qty} ÷ ${entry} = ${pvE} ${coin}<br>PV at mark = ${qty} ÷ ${mark} = ${pvM} ${coin}<br>PnL in coin = ${pvM} − ${pvE} = ${pnlCoin} ${coin}<br>PnL in USDT = ${pnlCoin} × ${mark} = <strong>${pnl} USDT</strong><br>MM = ${pvM} × ${mmrPct}% × ${mark} = <strong>${mm} USDT</strong>`,
      posLinear: (n: number, sym: string, side: string, type: string, pnlExpr: string, pnl: string, mark: string, size: string, mmrPct: string, mm: string) =>
        `<strong>#${n} ${sym} ${side} (${type})</strong><br>PnL = ${pnlExpr} = <strong>${pnl} USDT</strong><br>MM = ${mark} × ${size} × ${mmrPct}% = <strong>${mm} USDT</strong>`,
      totalPnl: (value: string) => `Total Unrealized PnL: ${value} USDT`,
      equity: (wallet: string, pnl: string, equity: string) =>
        `Equity = ${wallet} + (${pnl}) = <strong>${equity} USDT</strong>`,
      totalMm: (value: string) => `Total Maint. Margin = <strong>${value} USDT</strong>`,
      marginRatio: (mm: string, equity: string, ratio: string, status: string) =>
        `Margin Ratio = ${mm} ÷ ${equity} × 100 = <strong>${ratio}%</strong> ${status}`,
      statusLiquidated: "→ ≥ 100% — LIQUIDATED",
      statusSafe: "→ < 100% — SAFE",
    },
    report: {
      title: "CROSS MARGIN LIQUIDATION REPORT",
      time: (t: string) => `Time of Liquidation (UTC): ${t}`,
      walletBefore: (w: string) => `Wallet Balance Before Liquidation: ${w}`,
      resultLabel: (r: string) => `Result: ${r}`,
      resultLiquidated: "LIQUIDATION CONFIRMED",
      resultSafe: "NO LIQUIDATION AT THIS TIMESTAMP",
      walletHeading: "WALLET COLLATERAL",
      assetLine: (coin: string, amount: string, mark: string, rate: string, value: string, source: string) =>
        `${coin}: ${amount} × ${mark} × ${rate}% = ${value} USDT [${source}]`,
      totalWallet: (value: string) => `Total Wallet Collateral: ${value} USDT`,
      walletBalance: (value: string, stable: string) => `Wallet Balance: ${value} ${stable}`,
      closingFees: (value: string, stable: string) => `Closing Fees: −${value} ${stable}`,
      effectiveBalance: (value: string, stable: string) => `Effective Balance: ${value} ${stable}`,
      positionsHeading: "POSITIONS",
      positionTitle: (n: number, sym: string, side: string, type: string) =>
        `Position #${n}: ${sym} — ${side} (${type})`,
      coinQtyLine: (qty: string, entry: string, mark: string, mmrPct: string) =>
        `  Qty: ${qty} USD | Entry: ${entry} | Mark: ${mark} | MMR: ${mmrPct}%`,
      coinPvLine: (pvE: string, coin: string, pvM: string) =>
        `  PV at Entry = ${pvE} ${coin} | PV at Mark = ${pvM} ${coin}`,
      coinPnlLine: (pnl: string, mm: string) =>
        `  Unrealized PnL = ${pnl} USDT | Maint. Margin = ${mm} USDT`,
      linearQtyLine: (size: string, entry: string, mark: string, mmrPct: string) =>
        `  Size: ${size} coins | Entry: ${entry} | Mark: ${mark} | MMR: ${mmrPct}%`,
      linearPnlLine: (pnl: string, mm: string) =>
        `  Unrealized PnL = ${pnl} USDT | Maint. Margin = ${mm} USDT`,
      summaryHeading: "SUMMARY",
      totalPnl: (value: string) => `Total Unrealized PnL: ${value} USDT`,
      totalEquity: (value: string) => `Total Equity: ${value} USDT`,
      totalMm: (value: string) => `Total Maint. Margin Required: ${value} USDT`,
      marginRatio: (value: string) => `Margin Ratio: ${value}%`,
      status: (s: string) => `Status: ${s}`,
      statusLiquidated: "LIQUIDATED — Margin Ratio ≥ 100%",
      statusSafe: "SAFE — Margin Ratio < 100%",
      whatHappenedHeading: "WHAT HAPPENED",
      formulasHeading: "FORMULAS USED",
      formula1: "Wallet USDT Value = Amount × Mark Price × Exchange Rate%",
      formula2: "Equity = Total Wallet Collateral (USDT) + Σ Unrealized PnL (USDT)",
      formula3: "Coin-M PnL (Long) = (PV_mark − PV_entry) × Mark Price, where PV = Qty ÷ Price",
      formula4: "Linear PnL (Long) = (Mark − Entry) × Size",
      formula5: "Maint. Margin = Qty × MMR% [Coin-M] | Mark × Size × MMR% [Linear]",
      formula6: "Margin Ratio = Σ Maint. Margin ÷ Equity × 100",
      formula7: "Liquidation when Margin Ratio ≥ 100%",
      narrative: {
        liquidatedIntro: (time: string, wallet: string) =>
          `Your cross margin account was liquidated at ${time}. Starting from a wallet balance of ${wallet}, `,
        liquidatedPositions: (plural: boolean, list: string) =>
          `the position${plural ? "s" : ""} ${list} moved against you, producing a combined unrealized loss that consumed the available equity. `,
        liquidatedOutro: (equity: string, mm: string, ratio: string) =>
          `Total equity dropped to ${equity} USDT, at or below the required maintenance margin of ${mm} USDT (margin ratio ${ratio}%), so the exchange force-closed all open positions to prevent the balance from becoming negative.`,
        safe: (time: string, wallet: string, equity: string, mm: string, buffer: string, ratio: string) =>
          `At ${time}, the account was not subject to liquidation. Starting from a wallet balance of ${wallet}, equity stood at ${equity} USDT against a required maintenance margin of ${mm} USDT — a buffer of ${buffer} USDT (margin ratio ${ratio}%).`,
      },
    },
  },
}

export const pnlTexts = {
  linear: {
    section: { title: "Position Details", description: "Entry → exit price action to realize PnL" },
    fields: {
      qty: { label: "Quantity", hint: "coins", placeholder: "e.g. 0.5" },
      open: { label: "Open Price", placeholder: "e.g. 60000" },
      close: { label: "Close Price", placeholder: "e.g. 63000" },
      margin: { label: "Margin / Initial Investment", hint: "optional — enables ROI", placeholder: "Leave blank to skip ROI" },
    },
    calculate: "Calculate PnL",
    error: "Please fill all fields.",
    hero: { title: "Realized PnL" },
    eyebrow: (stable: string, side: string) => `${stable}-M · ${side}`,
    labels: { open: "Open:", close: "Close:", qty: "Qty:", side: "Side:" },
    stats: { pnl: "P&L Amount", roi: "ROI", side: "Side" },
    breakdown: {
      formula: (sl: string) => `Formula (${sl})`,
      calculation: "Calculation",
      details: "Position Details",
    },
    formula: {
      long: "PnL = (Close Price − Open Price) × Quantity",
      short: "PnL = (Open Price − Close Price) × Quantity",
    },
    calcLine: (expr: string, result: string) => `= ${expr} = ${result}`,
  },
  coinM: {
    section: { title: "Position Details", description: "Coin-margined PnL settles in the base coin" },
    fields: {
      coin: { label: "Coin Name", placeholder: "e.g. BTC, ETH, SOL" },
      open: { label: "Open Price", placeholder: "e.g. 60000" },
      close: { label: "Close Price", placeholder: "e.g. 63000" },
      qty: { label: "Quantity Unit", hint: "USD", placeholder: "e.g. 10000" },
      margin: { label: "Margin / Initial Investment", hint: "optional — enables ROI", placeholder: "Leave blank to skip ROI" },
    },
    calculate: "Calculate PnL",
    error: "Please fill all Coin-M fields.",
    hero: { title: "Realized PnL" },
    eyebrow: (side: string) => `Coin-M · ${side}`,
    heroSub: (value: string) => `≈ ${value} USD`,
    labels: { open: "Open:", close: "Close:", qty: "Qty:", side: "Side:" },
    stats: { pnl: "P&L in Coin", usd: "Approx. USD", roi: "ROI" },
    breakdown: {
      formula: (sl: string) => `Formula (${sl})`,
      calculation: "Calculation",
      details: "Position Details",
    },
    formula: {
      long: "PnL = Qty × (1 / Open Price − 1 / Close Price)",
      short: "PnL = Qty × (1 / Close Price − 1 / Open Price)",
    },
    calcLine: (expr: string, result: string, approx: string) => `= ${expr} = ${result} (~${approx} USD)`,
  },
}

export const feeTexts = {
  linear: {
    section: { title: "Fee Details", description: "VIP tier and order types drive the fee rate" },
    fields: {
      vip: "VIP Level",
      size: { label: "Position Size", hint: "coins", placeholder: "e.g. 2" },
      entryType: "Entry Order Type",
      exitType: "Exit Order Type",
      entry: { label: "Entry Price", placeholder: "e.g. 60000" },
      exit: { label: "Exit / Close Price", placeholder: "e.g. 62000" },
    },
    calculate: "Calculate Fees",
    error: "Please fill all fields.",
    hero: { title: "Total Trading Fees" },
    eyebrow: (stable: string, vip: string) => `${stable}-M · VIP ${vip}`,
    heroSub: (maker: string, taker: string) => `Maker ${maker}% · Taker ${taker}%`,
    stats: { entry: "Entry Fee", exit: "Exit Fee", vip: "VIP Level", total: "Total Fees" },
    breakdown: {
      entry: (type: string, rate: string) => `Entry Fee (${type} @ ${rate}%)`,
      exit: (type: string, rate: string) => `Exit Fee (${type} @ ${rate}%)`,
    },
    formulas: {
      entry: "Entry Price × Size × Rate%",
      exit: "Exit Price × Size × Rate%",
    },
  },
  coinM: {
    section: { title: "Fee Details", description: "Coin-margined fees settle in the base coin" },
    fields: {
      vip: "VIP Level",
      coin: { label: "Coin / Pair Name", placeholder: "e.g. BTC, ETH, SOL" },
      qty: { label: "Quantity Unit", hint: "USD", placeholder: "e.g. 10000" },
      entryType: "Entry Order Type",
      exitType: "Exit Order Type",
      open: { label: "Open Price", placeholder: "e.g. 60000" },
      close: { label: "Close Price", placeholder: "e.g. 62000" },
    },
    calculate: "Calculate Fees",
    error: "Please fill all Coin-M fields.",
    hero: { title: "Total Trading Fee" },
    eyebrow: (vip: string) => `Coin-M · VIP ${vip}`,
    heroSub: (coin: string, maker: string, taker: string) => `Settled in ${coin} · Maker ${maker}% · Taker ${taker}%`,
    stats: { open: "Open Fee", close: "Close Fee", pair: "Pair", total: "Total Fee" },
    breakdown: {
      open: (type: string, rate: string, coin: string) => `Open Fee (${type} @ ${rate}%) — settled in ${coin}`,
      close: (type: string, rate: string, coin: string) => `Close Fee (${type} @ ${rate}%) — settled in ${coin}`,
    },
    formulas: {
      open: "(Qty USD × Rate%) ÷ Open Price",
      close: "(Qty USD × Rate%) ÷ Close Price",
    },
  },
}

export const fundingTexts = {
  section: { title: "Funding Fee Calculator", description: "The periodic payment between longs and shorts" },
  fields: {
    size: { label: "Position Size", hint: "coins", placeholder: "e.g. 0.5" },
    mark: { label: "Mark Price", hint: "at funding time", placeholder: "e.g. 60000" },
    rate: { label: "Funding Rate", hint: "% — positive or negative", placeholder: "e.g. 0.01 or -0.005" },
  },
  calculate: "Calculate Funding Fee",
  error: "Please fill all fields.",
  hero: { title: "Funding Fee" },
  eyebrow: (side: string, rate: string) => `${side} position · ${rate}% rate`,
  formula: "Size × Mark Price × Funding Rate",
  stats: { fee: "Fee Amount", abs: "Abs. Fee", rate: "Funding Rate", side: "Side" },
  breakdown: {
    formula: "Formula",
    flow: "Who pays whom",
    flowNote: "Positive rate → Longs pay Shorts  |  Negative rate → Shorts pay Longs",
  },
  flow: {
    paysShort: (value: string) => `Long pays Short: ${value} USDT`,
    receivesFromLong: (value: string) => `Short receives from Long: ${value} USDT`,
    receivesFromShort: (value: string) => `Long receives from Short: ${value} USDT`,
    paysLong: (value: string) => `Short pays Long: ${value} USDT`,
  },
}

export const slippageTexts = {
  section: { title: "Slippage Calculator", description: "How far the fill drifted from your intended stop loss" },
  fields: {
    entry: { label: "Entry Price", placeholder: "e.g. 60000" },
    stopLoss: { label: "Stop Loss Price", placeholder: "e.g. 59000" },
    actual: { label: "Actual Position Closing Price", placeholder: "e.g. 58850" },
    size: { label: "Position Size", hint: "coins", placeholder: "e.g. 0.5" },
  },
  calculate: "Calculate Slippage",
  error: "Please fill all fields.",
  hero: { eyebrow: "Stop loss order slippage", title: "Slippage" },
  heroSub: (priceDiff: string, currency: string, size: string) => `Price difference of ${priceDiff} ${currency} on ${size} coins`,
  stats: {
    slippage: "Slippage %",
    priceDiff: "Price Diff",
    pnlAtSL: "PnL at Stop Loss",
    pnlActual: "PnL at Actual Close",
    slippagePnl: "Slippage PnL Impact",
    actual: "Actual Close",
    stopLoss: "Stop Loss",
  },
  breakdown: {
    slippage: "Slippage %",
    priceDiff: "Price Difference",
    pnlAtSL: "PnL if closed at Stop Loss",
    pnlActual: "PnL at actual closing price",
    pnlComparison: "PnL Comparison",
    pnlImpact: "Slippage PnL Impact",
  },
  formulas: {
    slippage: "|Stop Loss − Actual| ÷ Stop Loss × 100",
    priceDiff: "|Stop Loss − Actual| × Position Size",
    pnlLong: "PnL = (Close − Entry) × Position Size",
    pnlShort: "PnL = (Entry − Close) × Position Size",
    pnlImpact: "PnL (actual) − PnL (stop loss)",
  },
  about: {
    heading: "About Stop Loss Slippage",
    paragraph1:
      "A Stop Loss is intended to close the position at a predefined price to limit losses. During volatile or illiquid market conditions, however, the actual fill price may be worse than the Stop Loss price. The slippage is the difference between the PnL you expected at the Stop Loss price and the PnL actually realized at the closing price.",
    paragraph2:
      "This behavior is considered normal for market orders and is a common occurrence across financial markets. It is not regarded as abnormal or unusual.",
  },
}

export const fundflowTexts = {
  section: { title: "Excel Files & Balances", description: "Reconstruct a balance history from exported transaction files" },
  files: {
    file1: { label: "Excel File 1", hint: "required — transactions" },
    file2: { label: "Excel File 2", hint: "optional" },
    prompt: "Click to select (.xlsx, .xls)",
  },
  fields: {
    frozen: "Frozen as Margin",
    available: "Available Balance",
  },
  calculate: "Calculate",
  scriptHeading: "Script",
  summaryHeading: "Summary",
  summary: {
    current: "Current Balance",
    oldest: "Oldest Balance",
    count: "Transactions",
    netChange: "Net Change",
  },
  tableHeading: "Detailed Balance Reconstruction",
  table: {
    time: "Transaction Time (UTC+8)",
    type: "Type",
    currency: "Currency",
    contract: "Contract",
    amount: "Amount",
    balance: "Reconstructed Balance",
  },
  download: "Download Excel",
  newCalculation: "New Calculation",
  errors: {
    noFile: "Please upload at least one file.",
    readFailed: "Failed to read the selected file.",
    generic: "An unexpected error occurred. Please try again.",
  },
  export: {
    sheetName: "Reconstructed_Balance",
    fileName: "Balance_Reconstruction.xlsx",
  },
  report: (data: { current: string; txCount: number; latestType: string; latestAmount: string; latestTime: string; oldest: string }) => `
Dear Valued Customer,

Thank you for your patience.

We have carefully analyzed your Futures account transaction history. Here is a clear summary:

<strong>Current Balance:</strong> ${data.current} USDT
<strong>Total Transactions Processed:</strong> ${data.txCount}

<strong>Latest Transaction:</strong>
• Type: ${data.latestType}
• Amount: ${data.latestAmount} USDT
• Time: ${data.latestTime}

<strong>Balance Reconstruction:</strong>
We reconstructed your account balance by working backwards from your current balance (Frozen + Available).
This method allows us to determine what your balance was at any point in the past based on the uploaded transaction records.

Your balance at the time of the oldest transaction in the file was approximately <strong>${data.oldest} USDT</strong>.

If you have any questions about specific transactions or require further analysis, please do not hesitate to let us know.

Best regards,
Customer Support Team
  `.trim(),
}
