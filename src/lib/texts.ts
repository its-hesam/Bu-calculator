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
      "Internal Note — Isolated Position Liquidation Assessment\n\nPosition: {{direction}} {{market}} ({{currency}})\nPOSITION ID: {{positionId}}\n\nEntry: {{entry}} · Size: {{size}} · MMR: {{mmr}}\nAvailable Margin: {{margin}} {{stable}}\nMaintenance Margin: {{mm}} {{stable}}\nLeverage: {{leverage}}\n\nEstimated Liquidation Price: {{liq}}\nPrice Move: {{move}} ({{direction}})\n\nCalculation Steps:\nMaintenance Margin = {{size}} × {{entry}} × {{mmr}}% = {{mm}} {{stable}}\nSubtract from Available Margin: {{margin}} − {{mm}} = {{buffer}} {{stable}}\nDivide by Position Size: {{buffer}} ÷ {{size}} = {{diff}}\nLiquidation Price = {{entry}} {{sign}} {{diff}} = {{liq}}\n\nKindly review and confirm at your earliest convenience.",
    user:
      "Thank you for your patience while we reviewed the details of your position.\n\nWe have thoroughly reviewed your {{direction}} {{market}} ({{currency}}) position:\n\n**{{market}}-{{direction}}**\n**POSITION ID:** {{positionId}}\n\nSymbol: {{currency}}\nDirection: {{direction}}\nMarket: {{market}}\nPosition Size: {{size}}\nEntry Price: {{entry}} {{stable}}\nAvailable Margin: {{margin}} {{stable}}\nLeverage: {{leverage}}\nMMR: {{mmr}}\n\nThe estimated liquidation price for your position is {{liq}}, which represents a {{move}} price move {{belowAbove}} your entry price of {{entry}} {{stable}}.\n\nCalculation Steps:\nMaintenance Margin = Position Size × Entry Price × MMR = {{size}} × {{entry}} × {{mmr}}% = {{mm}} {{stable}}\nSubtract from Available Margin: {{margin}} − {{mm}} = {{buffer}} {{stable}}\nDivide by Position Size: {{buffer}} ÷ {{size}} = {{diff}}\nLiquidation Price = {{entry}} {{sign}} {{diff}} = {{liq}}\n\nIf the market price reaches {{liq}}, your position may be subject to forced closure. We kindly advise you to maintain sufficient margin in your account at all times.\n\nWe hope this detailed breakdown clarifies how your estimated liquidation price was calculated.",
  },
  isoLinearSL: {
    colleague:
      "Internal Note — Isolated Position Stopped Out (Stop Loss)\n\nPosition: {{direction}} {{market}} ({{currency}})\nPOSITION ID: {{positionId}}\n\nEntry: {{entry}} · Size: {{size}} · MMR: {{mmr}}\nStop Loss Price: {{stopLoss}}\nAvailable Margin: {{margin}} {{stable}}\nMaintenance Margin: {{mm}} {{stable}}\nLeverage: {{leverage}}\n\nEstimated Liquidation Price: {{liq}}\nPrice Move: {{move}} ({{direction}})\n\nCalculation Steps:\nMaintenance Margin = {{size}} × {{entry}} × {{mmr}}% = {{mm}} {{stable}}\nSubtract from Available Margin: {{margin}} − {{mm}} = {{buffer}} {{stable}}\nDivide by Position Size: {{buffer}} ÷ {{size}} = {{diff}}\nLiquidation Price = {{entry}} {{sign}} {{diff}} = {{liq}}\n\n{{slProximityText}}\nThe position had a Stop Loss in place and was closed by it before liquidation could occur.\n\nKindly review and confirm at your earliest convenience.",
    user:
      "Thank you for your patience while we reviewed the details of your position.\n\nWe have thoroughly reviewed your {{direction}} {{market}} ({{currency}}) position:\n\n**{{market}}-{{direction}}**\n**POSITION ID:** {{positionId}}\n\nSymbol: {{currency}}\nDirection: {{direction}}\nMarket: {{market}}\nPosition Size: {{size}}\nEntry Price: {{entry}} {{stable}}\nStop Loss Price: {{stopLoss}}\nAvailable Margin: {{margin}} {{stable}}\nLeverage: {{leverage}}\nMMR: {{mmr}}\n\nYour position had a Stop Loss in place and was closed at the Stop Loss price of {{stopLoss}} before liquidation could occur.\n\n{{slProximityText}}\n\nThe estimated liquidation price was {{liq}} (a {{move}} price move from your entry of {{entry}}).\n\nCalculation Steps:\nMaintenance Margin = Position Size × Entry Price × MMR = {{size}} × {{entry}} × {{mmr}}% = {{mm}} {{stable}}\nSubtract from Available Margin: {{margin}} − {{mm}} = {{buffer}} {{stable}}\nDivide by Position Size: {{buffer}} ÷ {{size}} = {{diff}}\nLiquidation Price = {{entry}} {{sign}} {{diff}} = {{liq}}\n\nWe kindly advise you to maintain sufficient margin in your account at all times.\n\nWe hope this detailed breakdown clarifies how your estimated liquidation price was calculated.",
  },
  isoCoinM: {
    colleague:
      "Internal Note — Isolated Coin-M Position Liquidation Assessment\n\nPosition: {{direction}} Coin-M ({{currency}})\nPOSITION ID: {{positionId}}\n\nQuantity: {{qty}} · Entry: {{entry}} · MMR: {{mmr}}\nAvailable Margin: {{margin}} coins\nMaintenance Margin: {{mm}} coins\nLeverage: {{leverage}}\n\nEstimated Liquidation Price: {{liq}}\nPrice Move: {{move}} ({{direction}})\n\nCalculation Steps:\nPosition Value (PV) = Qty ÷ Entry Price = {{qty}} ÷ {{entry}} = {{pv}} coins\nMaintenance Margin (MM) = PV × MMR = {{pv}} × {{mmr}}% = {{mm}} coins\nBankruptcy Fee (BF) = PV × 0.06% = {{pv}} × 0.0006 = {{bf}} coins\nAdjustment = AM − MM − BF = {{margin}} − {{mm}} − {{bf}} = {{adj}} coins\nLiquidation Price = Qty ÷ (PV {{sign}} Adjustment) = {{qty}} ÷ ({{pv}} {{sign}} {{adj}}) = {{liq}}\n\nKindly review and confirm at your earliest convenience.",
    user:
      "Thank you for your patience while we reviewed the details of your position.\n\nWe have thoroughly reviewed your {{direction}} Coin-M ({{currency}}) position:\n\n**Coin-M-{{direction}}**\n**POSITION ID:** {{positionId}}\n\nSymbol: {{currency}}\nDirection: {{direction}}\nMarket: Coin-M\nQuantity Unit: {{qty}}\nEntry Price: {{entry}}\nAvailable Margin: {{margin}} coins\nLeverage: {{leverage}}\nMMR: {{mmr}}\n\nThe estimated liquidation price for your position is {{liq}}, which represents a {{move}} price move {{belowAbove}} your entry price of {{entry}}.\n\nCalculation Steps:\nPosition Value (PV) = Qty ÷ Entry Price = {{qty}} ÷ {{entry}} = {{pv}} coins\nMaintenance Margin (MM) = PV × MMR = {{pv}} × {{mmr}}% = {{mm}} coins\nBankruptcy Fee (BF) = PV × 0.06% = {{pv}} × 0.0006 = {{bf}} coins\nAdjustment = Available Margin − MM − BF = {{margin}} − {{mm}} − {{bf}} = {{adj}} coins\nLiquidation Price = Qty ÷ (PV {{sign}} Adjustment) = {{qty}} ÷ ({{pv}} {{sign}} {{adj}}) = {{liq}}\n\nIf the market price reaches {{liq}}, your position may be subject to forced closure. We kindly advise you to maintain sufficient margin in your account at all times.\n\nWe hope this detailed breakdown clarifies how your estimated liquidation price was calculated.",
  },
  isoCoinMSL: {
    colleague:
      "Internal Note — Isolated Coin-M Position Stopped Out (Stop Loss)\n\nPosition: {{direction}} Coin-M ({{currency}})\nPOSITION ID: {{positionId}}\n\nQuantity: {{qty}} · Entry: {{entry}} · MMR: {{mmr}}\nStop Loss Price: {{stopLoss}}\nAvailable Margin: {{margin}} coins\nMaintenance Margin: {{mm}} coins\nLeverage: {{leverage}}\n\nEstimated Liquidation Price: {{liq}}\nPrice Move: {{move}} ({{direction}})\n\nCalculation Steps:\nPosition Value (PV) = Qty ÷ Entry Price = {{qty}} ÷ {{entry}} = {{pv}} coins\nMaintenance Margin (MM) = PV × MMR = {{pv}} × {{mmr}}% = {{mm}} coins\nBankruptcy Fee (BF) = PV × 0.06% = {{pv}} × 0.0006 = {{bf}} coins\nAdjustment = AM − MM − BF = {{margin}} − {{mm}} − {{bf}} = {{adj}} coins\nLiquidation Price = Qty ÷ (PV {{sign}} Adjustment) = {{qty}} ÷ ({{pv}} {{sign}} {{adj}}) = {{liq}}\n\n{{slProximityText}}\nThe position had a Stop Loss in place and was closed by it before liquidation could occur.\n\nKindly review and confirm at your earliest convenience.",
    user:
      "Thank you for your patience while we reviewed the details of your position.\n\nWe have thoroughly reviewed your {{direction}} Coin-M ({{currency}}) position:\n\n**Coin-M-{{direction}}**\n**POSITION ID:** {{positionId}}\n\nSymbol: {{currency}}\nDirection: {{direction}}\nMarket: Coin-M\nQuantity Unit: {{qty}}\nEntry Price: {{entry}}\nStop Loss Price: {{stopLoss}}\nAvailable Margin: {{margin}} coins\nLeverage: {{leverage}}\nMMR: {{mmr}}\n\nYour position had a Stop Loss in place and was closed at the Stop Loss price of {{stopLoss}} before liquidation could occur.\n\n{{slProximityText}}\n\nThe estimated liquidation price was {{liq}} (a {{move}} price move from your entry of {{entry}}).\n\nCalculation Steps:\nPosition Value (PV) = Qty ÷ Entry Price = {{qty}} ÷ {{entry}} = {{pv}} coins\nMaintenance Margin (MM) = PV × MMR = {{pv}} × {{mmr}}% = {{mm}} coins\nBankruptcy Fee (BF) = PV × 0.06% = {{pv}} × 0.0006 = {{bf}} coins\nAdjustment = Available Margin − MM − BF = {{margin}} − {{mm}} − {{bf}} = {{adj}} coins\nLiquidation Price = Qty ÷ (PV {{sign}} Adjustment) = {{qty}} ÷ ({{pv}} {{sign}} {{adj}}) = {{liq}}\n\nWe kindly advise you to maintain sufficient margin in your account at all times.\n\nWe hope this detailed breakdown clarifies how your estimated liquidation price was calculated.",
  },
  cross: {
    colleague:
      "Internal Note — Cross Margin Assessment at {{time}}\n\nPosition: {{direction}} {{currency}} · POSITION ID {{positionId}}\nVerdict: {{verdict}}\n\n{{count}} position(s) · Wallet {{walletDisplay}} · Unrealized PnL {{pnlDisplay}} · Equity {{equityDisplay}}\nMaintenance Margin {{mmDisplay}} → Margin Ratio {{ratio}}%\n\nCalculation:\nEquity = Wallet + Unrealized PnL = {{walletNum}} + ({{pnlNum}}) = {{equityNum}} {{unit}}\nMargin Ratio = {{mmNum}} ÷ {{equityNum}} × 100 = {{ratio}}%\n\nKindly review and confirm at your earliest convenience.",
    user:
      "Thank you for your patience while we reviewed your cross-margin account.\n\nWe have thoroughly assessed your cross-margin account at {{time}} (UTC):\n\n**Cross Margin Assessment**\n**POSITION ID:** {{positionId}}\n\nVerdict: {{verdict}}\nWallet Balance: {{walletDisplay}}\nTotal Unrealized PnL: {{pnlDisplay}}\nTotal Equity: {{equityDisplay}}\nMaintenance Margin Required: {{mmDisplay}}\nMargin Ratio: {{ratio}}%\n\nCalculation:\nEquity = Wallet + Unrealized PnL = {{walletNum}} + ({{pnlNum}}) = {{equityNum}} {{unit}}\nMargin Ratio = Maintenance Margin ÷ Equity × 100 = {{mmNum}} ÷ {{equityNum}} × 100 = {{ratio}}%\n\n{{verdictDetail}}\n\nWe hope this detailed breakdown clarifies the assessment of your cross-margin account.",
  },
  crossSL: {
    colleague:
      "Internal Note — Cross Margin Assessment (Stop Loss) at {{time}}\n\nPosition: {{direction}} {{currency}} · POSITION ID {{positionId}}\nStop Loss Price: {{stopLoss}}\nVerdict: {{verdict}}\n\n{{count}} position(s) · Wallet {{walletDisplay}} · Unrealized PnL {{pnlDisplay}} · Equity {{equityDisplay}}\nMaintenance Margin {{mmDisplay}} → Margin Ratio {{ratio}}%\n\nCalculation:\nEquity = Wallet + Unrealized PnL = {{walletNum}} + ({{pnlNum}}) = {{equityNum}} {{unit}}\nMargin Ratio = {{mmNum}} ÷ {{equityNum}} × 100 = {{ratio}}%\n\n{{slProximityText}}\nThe position had a Stop Loss in place and was closed by it before liquidation could occur.\n\nKindly review and confirm at your earliest convenience.",
    user:
      "Thank you for your patience while we reviewed your cross-margin account.\n\nWe have thoroughly assessed your cross-margin account at {{time}} (UTC):\n\n**Cross Margin Assessment**\n**POSITION ID:** {{positionId}}\n\nVerdict: {{verdict}}\nWallet Balance: {{walletDisplay}}\nTotal Unrealized PnL: {{pnlDisplay}}\nTotal Equity: {{equityDisplay}}\nMaintenance Margin Required: {{mmDisplay}}\nMargin Ratio: {{ratio}}%\n\nCalculation:\nEquity = Wallet + Unrealized PnL = {{walletNum}} + ({{pnlNum}}) = {{equityNum}} {{unit}}\nMargin Ratio = Maintenance Margin ÷ Equity × 100 = {{mmNum}} ÷ {{equityNum}} × 100 = {{ratio}}%\n\n{{verdictDetail}}\n\nYour position had a Stop Loss in place and was closed at the Stop Loss price of {{stopLoss}} before liquidation could occur.\n\n{{slProximityText}}\n\nWe hope this detailed breakdown clarifies the assessment of your cross-margin account.",
  },
  pnlLinear: {
    colleague:
      "Internal Note — Realized PnL Review\n\nPosition: {{market}} {{direction}} ({{currency}})\nPOSITION ID: {{positionId}}\n\nSymbol: {{currency}}\nMarket: {{market}}\nDirection: {{direction}}\nPosition Size: {{qty}}\nEntry Price: {{open}}\nExit Price: {{close}}\n\n{{formula}}\n= {{expr}}\n= {{pnl}}\n\nROI: {{roi}} (leverage {{leverage}})\n\nKindly review and confirm.",
    user:
      "Thank you for your patience while we reviewed the details of your position.\n\nWe have thoroughly reviewed your {{market}} {{direction}} ({{currency}}) position:\n\n**{{market}}-{{direction}}**\n**POSITION ID:** {{positionId}}\n\nSymbol: {{currency}}\nDirection: {{direction}}\nMarket: {{market}}\nPosition Size: {{qty}}\nEntry Price: {{open}} {{stable}}\nExit Price: {{close}} {{stable}}\n\nYour realized PnL from the price movement:\n\n{{formula}}\n= {{expr}}\n= {{pnl}}\n\nTherefore, your {{direction}} trade resulted in a {{outcome}} of approximately {{pnlAbs}} {{stable}}.\n{{roiLine}}\n\nWe hope this detailed breakdown clarifies how your PnL was calculated.",
  },
  pnlCoinM: {
    colleague:
      "Internal Note — Realized PnL Review (Coin-M)\n\nPosition: Coin-M {{direction}} ({{currency}})\nPOSITION ID: {{positionId}}\n\nSymbol: {{currency}}\nDirection: {{direction}}\nQuantity Unit: {{qty}}\nEntry Price: {{open}}\nExit Price: {{close}}\n\n{{formula}}\n= {{expr}}\n= {{pnl}}\n≈ {{pnlUSD}}\n\nROI: {{roi}} (leverage {{leverage}})\n\nKindly review and confirm.",
    user:
      "Thank you for your patience while we reviewed the details of your position.\n\nWe have thoroughly reviewed your Coin-M {{direction}} ({{currency}}) position:\n\n**Coin-M-{{direction}}**\n**POSITION ID:** {{positionId}}\n\nSymbol: {{currency}}\nDirection: {{direction}}\nQuantity Unit: {{qty}}\nEntry Price: {{open}}\nExit Price: {{close}}\n\nYour realized PnL from the price movement:\n\n{{formula}}\n= {{expr}}\n= {{pnl}} ({{coin}})\n≈ {{pnlUSD}}\n\nTherefore, your {{direction}} trade resulted in a {{outcome}} of approximately {{pnlUSD}}.\n{{roiLine}}\n\nWe hope this detailed breakdown clarifies how your PnL was calculated.",
  },
  feeLinear: {
    colleague:
      "Thank you very much for your patience while we reviewed the details of your position.\n\nWe have carefully checked the complete transaction history of your {{pair}} position. Please find the details below:\n\nSymbol: {{pair}} · Margin Mode: {{marginMode}} · Leverage: {{leverage}}\nDirection: {{direction}} · Position Size: {{totalSize}} {{currency}}\n\nYour gross realized PnL from the price movement was: {{grossPnl}}\n\nYour account is {{vip}}, and your applicable Futures fee rates are Maker {{maker}} / Taker {{taker}}.\n\nPlease note that opening and closing a position are two separate transactions, and each transaction is charged a trading fee separately.\n\nOpening Fee: {{entryFee}}\nClosing Fee: {{exitFee}}\nTotal Fees: {{totalFee}}\n\nTherefore, your final PnL was:\n{{grossPnl}} − {{totalFee}} = {{netPnl}}\n\nKindly review and confirm.",
    user:
      "Thank you very much for your patience while we reviewed the details of your position.\n\nWe have carefully checked the complete transaction history of your {{pair}} position. Please find the details below:\n\nSymbol: {{pair}} · Margin Mode: {{marginMode}} · Leverage: {{leverage}}\nDirection: {{direction}} · Position Size: {{totalSize}} {{currency}}\n\nYour gross realized PnL from the price movement was: {{grossPnl}}\n\nYour account is {{vip}}, and your applicable Futures fee rates are Maker {{maker}} / Taker {{taker}}.\n\nPlease note that opening and closing a position are two separate transactions, and each transaction is charged a trading fee separately.\n\nOpening Fee: {{entryFee}}\nClosing Fee: {{exitFee}}\nTotal Fees: {{totalFee}}\n\nTherefore, your final PnL was:\n{{grossPnl}} − {{totalFee}} = {{netPnl}}\n\nWe hope this detailed breakdown clarifies how your position, PnL, and trading fees were calculated.",
  },
  feeCoinM: {
    colleague:
      "Thank you very much for your patience while we reviewed the details of your position.\n\nWe have carefully checked the complete transaction history of your {{pair}} position. Please find the details below:\n\nSymbol: {{pair}} · Margin Mode: {{marginMode}} · Leverage: {{leverage}}\nDirection: {{direction}} · Position Size: {{totalSize}} {{currency}}\n\nYour gross realized PnL from the price movement was: {{grossPnl}}\n\nYour account is {{vip}}, and your applicable Futures fee rates are Maker {{maker}} / Taker {{taker}}.\n\nPlease note that opening and closing a position are two separate transactions, and each transaction is charged a trading fee separately.\n\nOpening Fee: {{entryFee}}\nClosing Fee: {{exitFee}}\nTotal Fees: {{totalFee}}\n\nTherefore, your final PnL was:\n{{grossPnl}} − {{totalFee}} = {{netPnl}}\n\nKindly review and confirm.",
    user:
      "Thank you very much for your patience while we reviewed the details of your position.\n\nWe have carefully checked the complete transaction history of your {{pair}} position. Please find the details below:\n\nSymbol: {{pair}} · Margin Mode: {{marginMode}} · Leverage: {{leverage}}\nDirection: {{direction}} · Position Size: {{totalSize}} {{currency}}\n\nYour gross realized PnL from the price movement was: {{grossPnl}}\n\nYour account is {{vip}}, and your applicable Futures fee rates are Maker {{maker}} / Taker {{taker}}.\n\nPlease note that opening and closing a position are two separate transactions, and each transaction is charged a trading fee separately.\n\nOpening Fee: {{entryFee}}\nClosing Fee: {{exitFee}}\nTotal Fees: {{totalFee}}\n\nTherefore, your final PnL was:\n{{grossPnl}} − {{totalFee}} = {{netPnl}}\n\nWe hope this detailed breakdown clarifies how your position, PnL, and trading fees were calculated.",
  },
  funding: {
    colleague:
      "Internal Note — Funding Fee Review\n\nPosition: {{direction}} {{currency}} ({{sizeLabel}})\nPOSITION ID: {{positionId}}\n\nFunding Rate: {{rate}}\nMark Price: {{mark}} USDT\nPosition Size: {{sizeLabel}}\n\nFunding Fee = Size × Mark Price × Funding Rate\n= {{size}} × {{mark}} × {{rate}}%\n= {{fee}} USDT\n\nFlow: {{flow}}\n\nKindly review and confirm.",
    user:
      "Thank you for your patience while we reviewed the funding fee applied to your position.\n\nWe have reviewed your {{direction}} {{currency}} position:\n\n**{{currency}}-{{direction}}**\n**POSITION ID:** {{positionId}}\n\nPosition Size: {{sizeLabel}}\nMark Price: {{mark}} USDT\nFunding Rate: {{rate}}\n\nFunding Fee = Position Size × Mark Price × Funding Rate\n= {{size}} × {{mark}} × {{rate}}%\n= {{fee}} USDT\n\n{{flow}}\n\nWe hope this detailed breakdown clarifies how your funding fee was calculated.",
  },
  slippage: {
    colleague:
      "Thank you for your patience.\n\nWe completely understand how important this matter is to you.\n\nWe have thoroughly reviewed the position:\n\n**{{pair}}-Isolated-{{leverage}}x-{{side}}**\n**POSITION ID:** {{positionId}}\n**CLOSED AT:** {{closedPrice}}\n**Stop loss:** {{stopLossPrice}} (Market)\n\n{{priceDiffFormula}}\n\n{{pnlDiffFormula}}\n\nBased on our investigation, the stop loss order was configured as a Market order.\n\nWith market orders, once the trigger price is reached, the order is immediately executed at the best available price in the order book.\n\nAs a result, during periods of rapid price movement or sharp market fluctuations, a small difference between the trigger price and the final execution price may occur. This is a normal market behavior known as market fluctuation and does not indicate any issue with the system.\n\nThis means your stop loss was triggered correctly.\n\nHowever, due to the extremely rapid price movement at that moment, the difference between the trigger price and the final execution price is considered normal under such market conditions, as the order execution may be affected by the speed of the price movement.\n\nTherefore, there was no problem on the system side, and the order was executed according to the market conditions at that time.",
    user:
      "Thank you for your patience.\n\nWe completely understand how important this matter is to you.\n\nWe have thoroughly reviewed the position:\n\n**{{pair}}-Isolated-{{leverage}}x-{{side}}**\n**POSITION ID:** {{positionId}}\n**CLOSED AT:** {{closedPrice}}\n**Stop loss:** {{stopLossPrice}} (Market)\n\nBased on our investigation, the stop loss order was configured as a Market order.\n\nWith market orders, once the trigger price is reached, the order is immediately executed at the best available price in the order book.\n\nAs a result, during periods of rapid price movement or sharp market fluctuations, a small difference between the trigger price and the final execution price may occur. This is a normal market behavior known as market fluctuation and does not indicate any issue with the system.\n\nThis means your stop loss was triggered correctly.\n\nHowever, due to the extremely rapid price movement at that moment, the difference between the trigger price and the final execution price is considered normal under such market conditions, as the order execution may be affected by the speed of the price movement.\n\nTherefore, there was no problem on the system side, and the order was executed according to the market conditions at that time.",
  },
  fundFlow: {
    colleague:
      "Internal Note — Fund Flow Reconstruction\n\nMerged {{fileCount}} file(s) · processed {{count}} transactions ({{duplicates}} duplicate(s) removed).\n\nFinal Available Balance: {{finalBalance}} USDT\nBalance at the oldest transaction: {{oldest}} USDT\nNet Change: {{netChange}} USDT\n\nThe account balance was reconstructed backwards from the current balance (Frozen + Available) and verified forward across the complete transaction history.\n\nKindly review and confirm.",
    user:
      "Dear Valued Customer,\n\nThank you for your patience.\n\nWe have carefully analyzed the complete transaction history of your Futures account.\n\nBased on the transaction history provided and the calculations performed, the available balance of your Futures account is **{{finalBalance}} USDT**.\n\nCalculation Summary:\n• Transactions Processed: {{count}}\n• Files Merged: {{fileCount}}\n• Duplicate Transactions Removed: {{duplicates}}\n• Balance at the oldest transaction: {{oldest}} USDT\n\nIf you have any questions about specific transactions, please do not hesitate to let us know.\n\nBest regards,\nCustomer Support Team",
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
  common: {
    feeDeductionCard: "Did the user have a Fee Deduction Card?",
    feeDeductionHint: "All applicable fee rates are divided by 2",
    grossPnl: { label: "Gross Realized PnL (before fees)", hint: "USDT", placeholder: "e.g. 120.5" },
    marginMode: { label: "Margin Mode", isolated: "Isolated", cross: "Cross" },
    entries: {
      section: "Entry Transactions",
      add: "Add Entry",
      addMore: "Add Entry",
      empty: "No entries yet — click Add Entry to include one.",
      fields: { time: { label: "Entry Time", placeholder: "e.g. 2024-01-01 10:00" }, price: { label: "Entry Price", placeholder: "e.g. 60000" }, qty: "Size", type: "Order Type" },
    },
    exits: {
      section: "Exit Transactions",
      add: "Add Exit",
      addMore: "Add Exit",
      empty: "No exits yet — click Add Exit to include one.",
      fields: { time: { label: "Exit Time", placeholder: "e.g. 2024-01-01 14:00" }, price: { label: "Exit Price", placeholder: "e.g. 62000" }, qty: "Size", type: "Order Type" },
    },
    entryRow: "Entry",
    exitRow: "Exit",
  },
  linear: {
    section: { title: "Fee Details", description: "VIP tier, order types and Fee Deduction Card drive the fee rate" },
    fields: {
      vip: "VIP Level",
    },
    calculate: "Calculate Fees",
    error: "Please add at least one entry and one exit, and fill all fields.",
    errorRows: "Please fill all fields for every entry and exit.",
    errorPnl: "Please enter the gross realized PnL.",
    hero: { title: "Total Trading Fees" },
    eyebrow: (stable: string, vip: string) => `${stable}-M · VIP ${vip}`,
    heroSub: (maker: string, taker: string, feeCard: boolean) =>
      `Maker ${maker}% · Taker ${taker}%${feeCard ? " · Fee Deduction Card (÷2)" : ""}`,
    stats: { entry: "Total Entry Fee", exit: "Total Exit Fee", vip: "VIP Level", total: "Total Fees", netPnl: "Final PnL" },
    breakdown: {
      entry: (count: number) => `Entry Fee${count > 1 ? `s (${count})` : ""}`,
      exit: (count: number) => `Exit Fee${count > 1 ? `s (${count})` : ""}`,
      fees: "Fee Rates",
      summary: "Summary",
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
    },
    calculate: "Calculate Fees",
    error: "Please add at least one entry and one exit, and fill all fields.",
    errorRows: "Please fill all fields for every entry and exit.",
    errorPnl: "Please enter the gross realized PnL.",
    hero: { title: "Total Trading Fee" },
    eyebrow: (vip: string) => `Coin-M · VIP ${vip}`,
    heroSub: (coin: string, maker: string, taker: string, feeCard: boolean) =>
      `Settled in ${coin} · Maker ${maker}% · Taker ${taker}%${feeCard ? " · Fee Deduction Card (÷2)" : ""}`,
    stats: { open: "Total Open Fee", close: "Total Close Fee", pair: "Pair", total: "Total Fee", netPnl: "Final PnL" },
    breakdown: {
      open: (count: number) => `Open Fee${count > 1 ? `s (${count})` : ""} — settled in the base coin`,
      close: (count: number) => `Close Fee${count > 1 ? `s (${count})` : ""} — settled in the base coin`,
      fees: "Fee Rates",
      summary: "Summary",
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
  section: { title: "Excel Files & Balances", description: "Merge, deduplicate and process the complete transaction history to determine the available balance" },
  files: {
    add: "Add File",
    empty: "No files yet — click Add File to include one.",
    label: "Transaction File",
    prompt: "Click to select (.xlsx, .xls)",
    remove: "Remove",
  },
  fields: {
    frozen: "Frozen as Margin",
    available: "Available Balance",
  },
  calculate: "Calculate",
  scriptHeading: "Script",
  summaryHeading: "Summary",
  summary: {
    finalBalance: "Final Available Balance",
    count: "Transactions",
    files: "Files",
    duplicates: "Duplicates Removed",
    oldest: "Oldest Balance",
    netChange: "Net Change",
  },
  tableHeading: "Detailed Balance Reconstruction",
  table: {
    index: "#",
    time: "Transaction Time (UTC+8)",
    type: "Type",
    currency: "Currency",
    contract: "Contract",
    amount: "Amount",
    before: "Balance Before",
    after: "Balance After",
  },
  pageSize: 100,
  pagination: {
    prev: "Prev",
    next: "Next",
  },
  download: "Download Excel",
  newCalculation: "New Calculation",
  errors: {
    noFile: "Please upload at least one file.",
    noValid: "No valid transactions were found in the uploaded files.",
    readFailed: "Failed to read the selected file.",
    generic: "An unexpected error occurred. Please try again.",
  },
  warnings: {
    unparsed: (count: number) =>
      `${count} transaction(s) had an unreadable timestamp and were processed in file order at the end of the history. Please verify these entries.`,
    reconcile: (diff: string) =>
      `The reconstructed history differs from the entered balance by ${diff} USDT. Please double-check the uploaded files and the entered Available / Frozen balances.`,
    currencies: (list: string) =>
      `The files contain multiple currencies (${list}). Amounts are summed as-is without currency conversion.`,
  },
  export: {
    sheetName: "Reconstructed_Balance",
    fileName: "Balance_Reconstruction.xlsx",
    colIndex: "#",
    colTime: "Transaction Time (UTC+8)",
    colType: "Type",
    colCurrency: "Currency",
    colContract: "Contract",
    colAmount: "Amount",
    colBefore: "Balance Before",
    colAfter: "Balance After",
  },
  report: (data: { finalBalance: string; txCount: number; fileCount: number; duplicateCount: number; oldest: string; netChange: string }) => `
Dear Valued Customer,

Thank you for your patience.

We have carefully analyzed the complete transaction history of your Futures account.

Based on the transaction history provided and the calculations performed, the available balance of your Futures account is <strong>${data.finalBalance} USDT</strong>.

Calculation Summary:
<strong>Total Transactions Processed:</strong> ${data.txCount}
<strong>Files Merged:</strong> ${data.fileCount}
<strong>Duplicate Transactions Removed:</strong> ${data.duplicateCount}
<strong>Balance at the time of the oldest transaction:</strong> ${data.oldest} USDT
<strong>Net Change:</strong> ${data.netChange} USDT

If you have any questions about specific transactions or require further analysis, please do not hesitate to let us know.

Best regards,
Customer Support Team
  `.trim(),
}
