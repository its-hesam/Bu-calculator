# Formulas and Calculation Methods — Bitunix Calculator


### Notation

| Symbol | Meaning |
| --- | --- |
| `long` / `LONG` | Position direction = buy (a.k.a. Long). Case-insensitive alias. |
| `short` / `SHORT` | Position direction = sell (a.k.a. Short). Case-insensitive alias. |
| `side` | One of `long` / `short` (or `LONG` / `SHORT`). |
| `entryPrice`, `openPrice` | Average entry price in quote currency per base unit. |
| `markPrice`, `mark`, `closePrice` | Reference/close price in quote currency per base unit. |
| `positionSize`, `size`, `qty` | Quantity in base coins (linear contracts). |
| `qtyUSD` | Contract quantity expressed in notional USD (coin-margined / USD-quantity contracts). |
| `mmrPct` | Maintenance Margin Rate, as a percent (e.g. `0.4` means 0.4%). |
| `MMR` | Same as `mmrPct`. |
| `MM` | Maintenance Margin (minimum margin required to keep the position open). |
| `IM` | Initial Margin (margin locked when the position was opened). |
| `stable` | Settlement coin label: `USDT`, `USDC`, or `coins` for coin-margined. |

### Global constants

| Constant | Value | Meaning |
| --- | --- | --- |
| `BANKRUPTCY_FEE` | `0.0006` (0.06%) | Bankruptcy fee rate applied to the position value in coin-margined liquidation. |
| `vipFees` | see [VIP fee schedule](#vip-fee-schedule) | Base maker/taker fee rates per VIP level, in percent. |




## Isolated Liquidation — Linear (USDT-M / USDC-M)

**Source function:** `calcIsoLinear`

Estimates the price at which a single isolated linear (USDT- or USDC-margined) position
is force-closed (liquidated).

### Inputs

| Input | Unit | Constraint |
| --- | --- | --- |
| `side` | — | `long` or `short` |
| `entryPrice` | quote currency per coin | must be a valid number > 0 |
| `positionSize` | base coins | must be a valid number > 0 |
| `mmrPct` | percent | must be a valid number > 0 |
| `leverage` | × (times) | optional; required when `availableMargin` is not supplied |
| `availableMargin` | quote currency | optional; if supplied it overrides the leverage-based margin |
| `stable` | — | `USDT` or `USDC` (label only, does not affect math) |

Exactly one of `availableMargin` / `leverage` must effectively supply the margin:

- if the margin field is present → margin = that value (source = "direct"),
- otherwise → margin = notional ÷ leverage (source = "leverage").

### Variables

| Variable | Definition |
| --- | --- |
| `margin` | Margin assigned to the isolated position (quote currency). |
| `MM` | Maintenance Margin (quote currency). |
| `diff` | Per-unit price distance from entry price to the liquidation price (quote currency per coin). |
| `liqPrice` | Estimated liquidation price. |
| `movePct` | Percentage move from entry to liquidation, shown with 4 decimals. |

### Formula

```text
mmr     = mmrPct / 100
MM      = positionSize × mmr × entryPrice
margin  = availableMargin                    (if supplied)
        = (positionSize × entryPrice) / leverage   (otherwise)

diff    = (margin − MM) / positionSize

LONG:   liqPrice = entryPrice − diff
SHORT:  liqPrice = entryPrice + diff

movePct = |(liqPrice − entryPrice) / entryPrice| × 100
```

Equivalently, the liquidation price is the price at which the margin buffer
`margin − MM` is exactly consumed by an adverse per-unit move of `diff`.

### Calculation Method

1. Compute the maintenance margin `MM = positionSize × entryPrice × mmrPct/100`.
2. Determine `margin` from the direct value, or as `(positionSize × entryPrice) / leverage`.
3. Compute the available buffer `margin − MM`.
4. Convert the buffer to a per-unit price distance: `diff = (margin − MM) / positionSize`.
5. For **long**: liquidation is below entry → `liqPrice = entryPrice − diff`.
   For **short**: liquidation is above entry → `liqPrice = entryPrice + diff`.
6. Compute the percentage move from entry to the liquidation price (absolute value).
7. Validate: if `margin ≤ MM`, mark result as invalid with a "low margin" reason
   (liquidation price would sit at/above entry for a long, i.e., the position could not
   have been opened at this margin).

### Example

Long position, entry `50,000`, size `0.1` BTC, MMR `0.4%`, leverage `10×`, no direct margin.

```text
MM     = 0.1 × 0.004 × 50,000        = 20.000000
margin = (0.1 × 50,000) / 10         = 500.000000
buffer = 500 − 20                    = 480.000000
diff   = 480 / 0.1                   = 4,800.000000
liq    = 50,000 − 4,800              = 45,200.000000
movePct= |(45,200 − 50,000) / 50,000| × 100 = 9.6000
```

### Expected Result

```text
Maintenance Margin : 20.000000 USDT
Margin             : 500.000000 USDT
Buffer             : 480.000000 USDT
Liquidation Price  : 45200.000000
Move %             : 9.6000%
```

### Edge cases / notes

- For a short the liquidation price is *above* entry; `diff` is added.
- If `margin ≤ MM`, result is flagged invalid (insufficient margin).
- `movePct` is always reported as a non-negative percentage.

---

## Isolated Liquidation — Coin-M

**Source function:** `calcIsoCoinM`

Estimates the liquidation price of a single isolated **coin-margined** position, where
the position is quoted in USD notional (`qtyUSD`) and everything else is denominated in
the base coin. A bankruptcy fee is applied to the margin pool.

### Inputs

| Input | Unit | Constraint |
| --- | --- | --- |
| `side` | — | `long` or `short` |
| `qtyUSD` | USD (notional contract quantity) | number > 0 |
| `entryPrice` | quote currency per coin | number > 0 |
| `mmrPct` | percent | number > 0 |
| `leverage` | × (times) | optional; required when margin not supplied |
| `availableMarginCoins` | base coins | optional; overrides leverage margin when supplied |

### Variables

| Variable | Definition |
| --- | --- |
| `PV` | Position value in base coins: `qtyUSD / entryPrice`. |
| `MM` | Maintenance margin in base coins. |
| `BF` | Bankruptcy fee in base coins. |
| `margin` | Initial margin in base coins. |
| `adj` | Net margin adjustment available to buffer adverse price movement. |

### Formula

```text
mmr  = mmrPct / 100
fee  = BANKRUPTCY_FEE = 0.0006
PV   = qtyUSD / entryPrice
MM   = PV × mmr
BF   = PV × fee
margin = availableMarginCoins          (if supplied)
       = PV / leverage                 (otherwise)

adj     = margin − MM − BF

LONG:   liqPrice = qtyUSD / (PV + adj)
SHORT:  liqPrice = qtyUSD / (PV − adj)

movePct = |(liqPrice − entryPrice) / entryPrice| × 100
```

### Calculation Method

1. Compute position value in coins `PV = qtyUSD / entryPrice`.
2. Compute maintenance margin `MM = PV × mmrPct/100`.
3. Compute bankruptcy fee `BF = PV × 0.0006`.
4. Determine initial margin: direct coin value or `PV / leverage`.
5. Compute adjustment `adj = margin − MM − BF`. This is the "safety buffer" in coins.
6. For **long**: liquidation price is lower; total coins backing the USD notional grow to
   `PV + adj`, so `liqPrice = qtyUSD / (PV + adj)`.
   For **short**: total coins backing the notional shrink to `PV − adj`, so
   `liqPrice = qtyUSD / (PV − adj)`.
7. Compute the move percentage.
8. Validate `margin > MM`, else invalid ("low margin").

### Example

Long coin-margined position: `qtyUSD = 100,000`, `entryPrice = 50,000`, `mmrPct = 0.5`,
`leverage = 50×`.

```text
PV      = 100,000 / 50,000      = 2.000000  BTC
MM      = 2 × 0.005             = 0.010000  BTC
BF      = 2 × 0.0006            = 0.001200  BTC
margin  = 2 / 50                = 0.040000  BTC
adj     = 0.040000 − 0.010000 − 0.001200 = 0.028800 BTC
liq     = 100,000 / (2 + 0.028800) = 49,290.220820
movePct = |(49,290.220820 − 50,000) / 50,000| × 100 = 1.4196
```

### Expected Result

```text
Position value (PV)   : 2.000000 BTC
Initial margin        : 0.040000 BTC
Maintenance Margin    : 0.010000 BTC
Bankruptcy fee (BF)   : 0.001200 BTC
Adjustment (adj)      : 0.028800 BTC
Liquidation Price     : 49290.220820
Move %                : 1.4196%
```

### Edge cases / notes

- The short formula subtracts `adj`: `qtyUSD / (PV − adj)`.
- The bankruptcy fee is **always** deducted from the margin buffer for coin-margined
  isolated positions; it does not appear in the linear version.
- Guard: invalid when `margin ≤ MM`.

---

## Isolated Liquidation Reduction (Two-Stage)

**Source functions:** `calcIsoLinearReduction`, `calcIsoCoinMReduction`

Used when a position has already been reduced by actual partial-closing orders (order
history). The calculation is split into two stages:

- **Stage A** walks the reduction orders chronologically and re-derives the remaining
  position size, remaining margin, and the maintenance margin tier after each reduction.
- **Stage B** computes the final liquidation price of the *remaining* position using the
  standard isolated liquidation formula (linear or coin-M) with the remaining size, the
  remaining tier's MMR, and the remaining margin.

The two variants (linear and coin-M) share the exact same Stage A logic and differ only
in how sizes, tiers, margins and MMs are denominated.

### 4.1 Tier Resolution

**Source function:** `tierAt(size, tiers)`

Tiers are an ascending list of maintenance-margin brackets.

| Input | Unit | Constraint |
| --- | --- | --- |
| `tiers[i].maxSize` | size units | `null` = unbounded (only allowed on the final tier); otherwise number > 0 and strictly increasing |
| `tiers[i].mmrPct` | percent | number > 0 |
| At least two tiers | — | required |

```text
tierAt(size, tiers):
  for i in 0..n-1:
      if tiers[i].maxSize != null AND size > tiers[i].maxSize: continue
      return Tier(i+1, mmrPct = tiers[i].mmrPct)      // first tier that contains size
  // (top tier has maxSize == null, so the loop always returns there)
```

Tier labels are 1-based: `Tier 1`, `Tier 2`, … `Tier n`.

Tier validation rules:

- every MMR must be `> 0`;
- every bounded `maxSize` must be `> 0`;
- bounded `maxSize` values must be **strictly increasing**;
- only the **last** tier may be unbounded (`maxSize` blank).

### 4.2 Stage A — Walk Reduction Orders

**Inputs (linear):** `side`, `entryPrice`, `positionSize` (coins), `availableMargin`
(stable coins), `tiers`, `orders`.

**Inputs (coin-M):** `side`, `qtyUSD` (USD notional), `entryPrice`,
`availableMarginCoins` (coins), `tiers`, `orders`.

**Order input:** `size` (reduction amount, same unit as position size), `pnl` (realized
PnL credited back to the margin, same denomination as margin), optional `time`.

Order validation rules (UI):

- at least one order;
- each order `size > 0`;
- each order `pnl` must be numeric (may be negative or positive);
- the **sum** of all reduction sizes must be **less than** the original position size
  (cannot reduce more than the position).

```text
# ordering
sort orders ascending by time; orders without a time sort LAST
    (missing time treated as +Infinity; stable ordering otherwise)

# per-unit MM helpers
linear: mmFor(size, mmrPct) = size × entryPrice × mmrPct/100
coinM : mmFor(size, mmrPct) = (size / entryPrice) × mmrPct/100     # in coins

# walk
size   = original size
margin = available margin
for each order in chronological order:
    sizeBefore  = size
    marginBefore= margin
    tierBefore  = tierAt(sizeBefore)
    mmBefore    = mmFor(sizeBefore, tierBefore.mmrPct)
    size   -= order.size
    margin += order.pnl
    tierAfter   = tierAt(size)
    mmAfter     = mmFor(size, tierAfter.mmrPct)
    record event(sizeBefore, order.size, order.pnl, sizeAfter=size,
                 marginBefore, marginAfter=margin,
                 tierBefore, tierAfter, mmBefore, mmAfter)

remainingSize  = size
remainingTier  = tierAfter of the last event (or original tier if no events)
marginAfter    = margin
```

So after each reduction:

```text
sizeAfter   = sizeBefore − order.size
marginAfter = marginBefore + order.pnl
```

and the maintenance margin before/after each event is recomputed from the tier that
contains the size at that moment.

### 4.3 Stage B — Final Liquidation of Remaining Position

Re-run the ordinary isolated liquidation on the remaining quantities:

- **Linear:** call the [linear isolated liquidation](#isolated-liquidation--linear-usdt-m--usdc-m)
  with `positionSize = remainingSize`, `mmrPct = remainingTier.mmrPct`,
  `availableMargin = marginAfter`.
- **Coin-M:** call the [coin-M isolated liquidation](#isolated-liquidation--coin-m) with
  `qtyUSD = remainingSize`, `mmrPct = remainingTier.mmrPct`,
  `availableMarginCoins = marginAfter`.

### Example (linear reduction)

Tiers: `Tier 1 = {maxSize 0.5, MMR 0.4}`, `Tier 2 = {unbounded, MMR 0.5}`.

Original position: long `1.0` BTC @ `50,000`, available margin `300` USDT.
Orders:

- Order 1: reduce `0.3` BTC, realized PnL `−50` (time earlier)
- Order 2: reduce `0.2` BTC, realized PnL `+80` (time later)

```text
Stage A:
 original: size 1.0 > 0.5  → Tier 2 (MMR 0.5)
           MM0 = 1.0 × 50,000 × 0.005 = 250.000000

 Event 1:
   sizeBefore = 1.0 (Tier 2, MMR 0.5)   mmBefore = 250.000000
   sizeAfter  = 1.0 − 0.3 = 0.7         marginAfter = 300 − 50 = 250.000000
   0.7 > 0.5 → Tier 2                   mmAfter = 0.7 × 50,000 × 0.005 = 175.000000

 Event 2:
   sizeBefore = 0.7 (Tier 2, MMR 0.5)   mmBefore = 175.000000
   sizeAfter  = 0.7 − 0.2 = 0.5         marginAfter = 250 + 80 = 330.000000
   0.5 ≤ 0.5 → Tier 1 (MMR 0.4)         mmAfter = 0.5 × 50,000 × 0.004 = 100.000000

 remainingSize = 0.5  remainingTier = Tier 1 (MMR 0.4)  marginAfter = 330

Stage B (linear isolated, long):
 MM   = 0.5 × 0.004 × 50,000          = 100.000000
 diff = (330 − 100) / 0.5             = 460.000000
 liq  = 50,000 − 460                  = 49,540.000000
 move = |(49,540 − 50,000)/50,000| × 100 = 0.9200
```

### Expected Result

```text
Original tier  : Tier 2 (MMR 0.5%), MM 250.000000 USDT
Event 1        : 1.0 → 0.7 BTC, margin 300 → 250; MM 250 → 175
Event 2        : 0.7 → 0.5 BTC, margin 250 → 330; MM 175 → 100 (tier → Tier 1)
Remaining      : 0.5 BTC (Tier 1, MMR 0.4%), margin 330.000000 USDT
Final Liq Price: 49540.000000
Final Move %   : 0.9200%
```

### Edge cases / notes

- If a reduction is skipped (empty order list), the "remaining" state equals the
  original state and Stage B reduces to the ordinary isolated liquidation.
- Order times are optional; untimed orders are applied last.
- Sum of order sizes must stay below the original size.
- Coin-M variant is identical except sizes are USD notionals, tiers bound USD notionals,
  and margins/MMs/bankruptcy fee are in coins; Stage B uses the coin-M formula.
- If the margin field is left blank in the UI, it is derived from leverage before Stage A:
  `margin = (size × entryPrice)/leverage` (linear) or `margin = (qtyUSD/entryPrice)/leverage`
  (coin-M); a blank leverage falls back to `1`.

---

## Cross Liquidation — Linear Wallet

**Source function:** `calcCrossLinear`

Stress-tests a **single-currency (USDT or USDC) cross wallet** holding one or more linear
positions at a given liquidation timestamp.

### Inputs

| Input | Unit | Constraint |
| --- | --- | --- |
| `walletBalance` | quote currency | valid number (may be 0) |
| `liquidationTime` | epoch ms (UTC) | from date+time picker |
| per position `symbol` | — | non-empty (uppercased) |
| per position `side` | — | `LONG` or `SHORT` |
| per position `size` | base coins | number > 0 |
| per position `entryPrice` | quote per coin | number > 0 |
| per position `markPrice` | quote per coin | number > 0 |
| per position `mmrPct` | percent | number > 0 |
| per position `closingFee` | quote currency | optional, default `0` |

### Variables

| Variable | Definition |
| --- | --- |
| `pnl_i` | Unrealized PnL of position `i`. |
| `mm_i` | Maintenance margin of position `i`. |
| `totalCloseFee` | Sum of per-position closing fees. |
| `wallet` | Wallet balance after deducting total closing fees. |
| `totalPnl` | Sum of unrealized PnL across all positions. |
| `totalMM` | Sum of maintenance margin across all positions. |
| `equity` | Wallet equity = wallet + total PnL. |
| `marginRatio` | Maintenance-margin ratio, percent. |
| `liquidated` | Boolean liquidation flag. |

### Formula

```text
per position i:
  LONG :  pnl_i = (markPrice_i − entryPrice_i) × size_i
  SHORT:  pnl_i = (entryPrice_i − markPrice_i) × size_i
  mm_i      = markPrice_i × size_i × mmrPct_i / 100
  closingFee_i defaults to 0

aggregates:
  totalCloseFee = Σ closingFee_i
  wallet        = walletBalance − totalCloseFee
  totalPnl      = Σ pnl_i
  totalMM       = Σ mm_i
  equity        = wallet + totalPnl
  marginRatio   = totalMM / equity × 100
  liquidated    = equity ≤ totalMM
```

### Calculation Method

1. For each position compute unrealized PnL from the price difference (long: mark − entry;
   short: entry − mark) times size.
2. Compute each position's maintenance margin at the **mark** price:
   `mark × size × mmrPct/100`.
3. Deduct all closing fees from the wallet balance.
4. Sum PnL and MM.
5. `equity = (walletBalance − totalCloseFee) + totalPnl`.
6. `marginRatio = totalMM / equity × 100`.
7. Liquidated when `equity ≤ totalMM` (i.e., the maintenance margin is no longer fully
   covered).

### Example

Wallet `1,500` USDT, no closing fees, liquidation timestamp given.

Position 1 — `BTCUSDT LONG`, size `1`, entry `30,000`, mark `29,600`, MMR `0.4`:
Position 2 — `ETHUSDT SHORT`, size `10`, entry `2,000`, mark `2,100`, MMR `0.5`:

```text
Position 1:
  pnl = (29,600 − 30,000) × 1          = −400.000000
  mm  = 29,600 × 1 × 0.004             = 118.400000
Position 2:
  pnl = (2,000 − 2,100) × 10           = −1,000.000000
  mm  = 2,100 × 10 × 0.005             = 105.000000

wallet      = 1,500 − 0                = 1,500.000000
totalPnl    = −400 + (−1,000)          = −1,400.000000
totalMM     = 118.4 + 105              = 223.400000
equity      = 1,500 + (−1,400)         = 100.000000
marginRatio = 223.4 / 100 × 100        = 223.400000 %
liquidated  = 100 ≤ 223.4              = true
```

### Expected Result

```text
Wallet            : 1,500.000000 USDT
Total PnL         : -1,400.000000 USDT
Total MM          : 223.400000 USDT
Equity            : 100.000000 USDT
Margin Ratio      : 223.400000%
Liquidated        : YES
```

### Edge cases / notes

- `marginRatio` uses `equity` as denominator. If `equity` is `0` or negative the ratio
  becomes infinite/negative; the `liquidated` flag (`equity ≤ totalMM`) is the
  authoritative check and remains well-defined.
- Closing fees are subtracted from the wallet before PnL is added.
- Liquidation date = `new Date(liquidationTime)` (input interpreted as UTC).

---

## Cross Liquidation — Coin-Mixed Wallet

**Source function:** `calcCrossCoinM`

Stress-tests a **cross wallet containing multiple coin assets** (valued in USDT using
exchange deduct rates) that may simultaneously hold **coin-margined (COIN-M)** and
**linear (USDT-M / USDC-M)** positions.

### Inputs

Wallet assets:

| Input | Unit | Constraint |
| --- | --- | --- |
| `coin` | — | non-empty ticker (e.g. `BTC`, `USDT`, or a custom name) |
| `amount` | coin units | > 0 |
| `deductRate` (`rate`) | percent | `0 … 100` |
| `markPrice` / price source | quote per coin | auto or manual, see below |

Positions (two shapes):

| Coin-M shape | Unit | Constraint |
| --- | --- | --- |
| `baseCoin` | — | ticker of the margin/base coin |
| `qtyUSD` | USD notional | number > 0 |
| `entryPrice`, `markPrice` | quote per coin | number > 0 |
| `mmrPct` | percent | number > 0 |

| Linear shape | Unit | Constraint |
| --- | --- | --- |
| `size` | base coins | number > 0 |
| `entryPriceL`, `markPriceL` | quote per coin | number > 0 |
| `mmrPct` | percent | number > 0 |

### Variables

| Variable | Definition |
| --- | --- |
| `usdtValue` | USDT-equivalent value of a wallet asset. |
| `totalWalletUSDT` | Σ `usdtValue` over wallet assets. |
| `pnl` | Position PnL, always converted to USDT. |
| `mm` | Position maintenance margin, always in USDT. |
| `equity`, `marginRatio`, `liquidated` | same semantics as the linear cross wallet. |

### Wallet asset valuation

For each wallet asset a price and source is resolved:

```text
if coin == "USDT" or coin == "USDC": markPrice = 1, source = "fixed"
else if a COIN-M position has baseCoin == coin and its markPrice > 0:
    markPrice = that position's markPrice, source = "auto (from position)"
else:
    markPrice = manualMarkPrice (> 0), source = "manual"
```

Then:

```text
usdtValue = amount × markPrice × deductRate / 100
totalWalletUSDT = Σ usdtValue
```

Default deduct rates come from a lookup table (see [EXR deduct-rate table](#exr-deduct-rate-table));
unknown/custom coins default to `95`. USDT's rate input is fixed at 100%.

### Coin-M position PnL and MM

A coin-margined position has notional `qtyUSD`, entry `entry`, mark `mark`,
margin coin `baseCoin`.

```text
pvE  = qtyUSD / entry          # position value in coins at entry
pvM  = qtyUSD / mark           # position value in coins at mark

LONG : pnlCoin = pvM − pvE
SHORT: pnlCoin = pvE − pvM

pnlUSDT = pnlCoin × mark

mmUSDT = (qtyUSD / mark) × mmrPct/100 × mark = qtyUSD × mmrPct / 100
```

Note: because `mark` cancels, a coin-M position's maintenance margin in USDT simplifies to
**`mm = qtyUSD × mmrPct/100`** (notional USD × MMR).

### Linear position PnL and MM (inside a mixed wallet)

```text
LONG : pnl = (mark − entry) × size
SHORT: pnl = (entry − mark) × size
mm       = mark × size × mmrPct/100
```

These are already in USDT (or the stable coin of the contract), treated as USDT.

### Account aggregates

```text
totalWalletUSDT = Σ wallet usdtValue
totalPnl        = Σ position pnl        (all already in USDT)
totalMM         = Σ position mm         (all already in USDT)
equity          = totalWalletUSDT + totalPnl
marginRatio     = totalMM / equity × 100
liquidated      = equity ≤ totalMM
```

Closing fees are not modelled in the coin-M wallet (`totalCloseFee = 0`,
`wallet = totalWalletUSDT`).

### Example

Wallet asset: `0.5 BTC`, deduct rate `99.9%`, BTC price auto-sourced at `40,000`.

Position (coin-M): `BTCUSD SHORT`, `qtyUSD = 10,000`, entry `40,000`, mark `42,000`,
MMR `0.5`.

```text
Asset valuation:
  usdtValue  = 0.5 × 40,000 × 0.999   = 19,980.000000 USDT

Position:
  pvE = 10,000 / 40,000 = 0.250000 BTC
  pvM = 10,000 / 42,000 = 0.238095 BTC
  pnlCoin = 0.250000 − 0.238095        = 0.011905 BTC      (loss: short, price rose)
  pnlUSDT = 0.011905 × 42,000          = −500.000000 USDT
  mm      = 10,000 × 0.005             = 50.000000 USDT    (qtyUSD × MMR)

totalWalletUSDT = 19,980.000000
equity          = 19,980 − 500         = 19,480.000000
marginRatio     = 50 / 19,480 × 100    = 0.2567%
liquidated      = 19,480 ≤ 50          = false
```

### Expected Result

```text
Wallet (USDT)     : 19,980.000000 USDT
Position PnL      : -500.000000 USDT
Position MM       : 50.000000 USDT
Equity            : 19,480.000000 USDT
Margin Ratio      : 0.2567%
Liquidated        : NO
```

### Edge cases / notes

- USDT and USDC wallet assets are each valued at `1` quote unit (`markPrice = 1`);
  their USDT value still applies the deduct rate (`USDT` default 100%, `USDC` default 99.9%).
- A COIN-M position's mark price, when present and > 0, becomes the auto price source for
  any wallet asset of the same base coin.
- Validation: deduct rate must be within `0 … 100`; amount must be `> 0`; custom coin
  name required when coin = OTHER; manual mark price `> 0` required when no auto source
  exists.

---

## Realized PnL — Linear (USDT-M / USDC-M)

**Source function:** `calcPnLLinear`

### Inputs

| Input | Unit | Constraint |
| --- | --- | --- |
| `side` | — | `long` / `short` |
| `openPrice` | quote per coin | number > 0 |
| `closePrice` | quote per coin | number > 0 |
| `qty` | base coins | number > 0 |
| `stable` | — | label (`USDT`/`USDC`) |
| `margin` | quote currency | optional (for ROI) |

### Formula

```text
LONG : pnl = (closePrice − openPrice) × qty
SHORT: pnl = (openPrice − closePrice) × qty

if margin provided and margin > 0:
    roi = pnl / margin × 100        # percent
else:
    roi = undefined
```

### Calculation Method

1. Multiply the signed per-unit price difference by quantity.
2. If a positive margin is given, express PnL as a return on that margin.
3. PnL sign convention: positive → profit, negative → loss.

### Example

Long: open `100`, close `120`, qty `2`, margin `20`.

```text
pnl = (120 − 100) × 2   = 40.000000 USDT
roi = 40 / 20 × 100     = 200.000000%
```

### Expected Result

```text
PnL : +40.000000 USDT
ROI : 200.000000%
```

### Edge cases / notes

- ROI only computed when `margin > 0`; otherwise omitted.
- Same math is used by the isolated/cross tools for their per-position unrealized PnL.

---

## Realized PnL — Coin-M

**Source function:** `calcPnLCoinM`

PnL for coin-margined contracts is measured in **base coins** first, then optionally
converted to USDT at the close price.

### Inputs

| Input | Unit | Constraint |
| --- | --- | --- |
| `side` | — | `long` / `short` |
| `coinName` | — | label of base coin |
| `openPrice` | quote per coin | number > 0 |
| `closePrice` | quote per coin | number > 0 |
| `qtyUSD` | USD notional | number > 0 |
| `margin` | base coins | optional (for ROI) |

### Formula

```text
LONG : pnl    = qtyUSD × (1/openPrice − 1/closePrice)
SHORT: pnl    = qtyUSD × (1/closePrice − 1/openPrice)

pnlUSD = pnl × closePrice

if margin provided and margin > 0:
    roi = pnl / margin × 100        # percent   (margin is in base coins)
else:
    roi = undefined
```

### Calculation Method

1. Convert the USD notional to coins at both open and close:
   `coins at open = qtyUSD/openPrice`, `coins at close = qtyUSD/closePrice`.
2. For long the trader gains coins when the price rises (fewer coins needed to sell the
   same notional at close than were bought at open): PnL in coins = difference.
3. Multiply the coin PnL by the close price to get USDT PnL.
4. ROI divides the coin PnL by the (coin-denominated) margin.

### Example

Long: `qtyUSD = 100,000`, open `40,000`, close `50,000`, margin `1` BTC.

```text
pnl    = 100,000 × (1/40,000 − 1/50,000)  = 0.500000 BTC
pnlUSD = 0.5 × 50,000                     = 25,000.000000 USDT
roi    = 0.5 / 1 × 100                    = 50.000000%
```

### Expected Result

```text
PnL   : +0.500000 BTC
PnL   : +25,000.000000 USDT
ROI   : 50.000000%
```

### Edge cases / notes

- Short flips the reciprocal subtraction order.
- The same reciprocal convention is used by the coin-M cross-wallet position math.

---

## Trading Fee — Linear

**Source functions:** `calcTradingFeeLinear`

Computes maker/taker trading fees for a round trip made of multiple entry and exit
orders, for USDT-M / USDC-M contracts. Opening and closing are separate transactions,
each charged separately.

### Inputs

| Input | Unit | Constraint |
| --- | --- | --- |
| `vipLevel` | — | integer `0 … 7` |
| `hasFeeCard` | boolean | fee-deduction card applied? |
| entry orders `{price, qty, orderType}` | price: quote/coin; qty: coins | price > 0, qty > 0, orderType ∈ {maker, taker} |
| exit orders `{price, qty, orderType}` | same | at least one entry and one exit order |
| `grossPnl` | quote currency | numeric (may be 0) |
| `stable` | — | label |

### Variables

| Variable | Definition |
| --- | --- |
| `baseMaker`, `baseTaker` | Base fee rates (percent) for the VIP level. |
| `effMaker`, `effTaker` | Effective rates after fee card halving. |
| `notional_i` | `price × qty` of an order. |
| `entryFee_i` / `exitFee_i` | Fee of one order, in stable coins. |
| `totalFee` | Σ entry fees + Σ exit fees. |

### Formula

```text
[baseMaker, baseTaker] = vipFees[vipLevel]

effMaker = hasFeeCard ? baseMaker / 2 : baseMaker
effTaker = hasFeeCard ? baseTaker / 2 : baseTaker

rateFor(maker)  = effMaker
rateFor(taker)  = effTaker

per order:
    notional = price × qty
    fee      = notional × rateFor(orderType) / 100      # rate is a percent

totals:
    totalEntryValue = Σ entry notional
    totalExitValue  = Σ exit notional
    totalEntryFee   = Σ entry fees
    totalExitFee    = Σ exit fees
    totalFee        = totalEntryFee + totalExitFee
    netPnl          = grossPnl − totalFee
```

### Calculation Method

1. Look up base maker/taker percent rates for the VIP level.
2. If a fee-deduction card is flagged, halve both rates.
3. For every entry/exit order multiply notional (`price × qty`) by the applicable rate
   and divide by 100.
4. Sum entry fees and exit fees separately, then total.
5. Net PnL = gross PnL minus total fees.

### Example

VIP 0 (maker `0.02`, taker `0.06`), no fee card.

Entry: 1 maker order, price `30,000`, qty `1`. Exit: 1 taker order, price `31,000`, qty `1`.
`grossPnl = 1,000`.

```text
entryFee = 30,000 × 1 × 0.02/100  = 6.000000 USDT
exitFee  = 31,000 × 1 × 0.06/100  = 18.600000 USDT
totalFee = 6 + 18.6               = 24.600000 USDT
netPnl   = 1,000 − 24.6           = 975.400000 USDT
```

### Expected Result

```text
Total entry fee : 6.000000 USDT
Total exit fee  : 18.600000 USDT
Total fee       : 24.600000 USDT
Net PnL         : 975.400000 USDT
```

### Edge cases / notes

- Fees are charged per transaction; entry and exit are never merged.
- With a fee card the effective rates above are halved (e.g. maker `0.01`, taker `0.03`).

---

## Trading Fee — Coin-M

**Source function:** `calcTradingFeeCoinM`

Same input shape as the linear version, but quantity is expressed in **USD notional**
(`qty`) and the fee is charged/settled in the **base coin**.

### Formula

```text
[baseMaker, baseTaker] = vipFees[vipLevel]
effMaker = hasFeeCard ? baseMaker / 2 : baseMaker
effTaker = hasFeeCard ? baseTaker / 2 : baseTaker

per order (qty in USD notional, price in quote per coin):
    fee = (qty × rateFor(orderType) / 100) / price       # fee in base coins

totals:
    totalEntryValue = Σ entry qty      (USD notionals)
    totalExitValue  = Σ exit qty       (USD notionals)
    totalEntryFee   = Σ entry fees     (base coins)
    totalExitFee    = Σ exit fees      (base coins)
    totalFee        = totalEntryFee + totalExitFee       (base coins)
```

Note about net PnL for coin-M:

- the library returns `netPnl = grossPnl − totalFee`, but because `totalFee` is in base
  coins and `grossPnl` is in USDT, the **UI recomputes** a USDT-equivalent fee before
  subtracting:

```text
totalFeeUSD = Σ over entries (entryFee_i × entryPrice_i)
            + Σ over exits   (exitFee_i × exitPrice_i)

netPnl = grossPnl − totalFeeUSD        # USDT
```

### Example

Coin: BTC. Entry: 1 maker order, qty `100,000` USD @ `40,000`.
Exit: 1 taker order, qty `100,000` USD @ `45,000`. `grossPnl = 100` USDT (no fee card).

```text
effMaker = 0.02   effTaker = 0.06

entryFee = (100,000 × 0.02/100) / 40,000 = 20 / 40,000     = 0.000500 BTC
exitFee  = (100,000 × 0.06/100) / 45,000 = 60 / 45,000     = 0.001333 BTC
totalFee = 0.000500 + 0.001333           = 0.001833 BTC

totalFeeUSD = 0.0005 × 40,000 + 0.001333 × 45,000
            = 20 + 60                    = 80.000000 USDT
netPnl      = 100 − 80                   = 20.000000 USDT
```

### Expected Result

```text
Total entry fee : 0.000500 BTC  (≈ 20.00 USDT)
Total exit fee  : 0.001333 BTC  (≈ 60.00 USDT)
Total fee       : 0.001833 BTC  (≈ 80.00 USDT)
Net PnL         : 20.000000 USDT
```

### Edge cases / notes

- Fee display precision for coin-M is 8 decimals (fee in coins); rate display uses 4.
- UI "total size" for coin-M = Σ qty in USD; for linear = Σ qty in coins.

---

## Funding Fee

**Source function:** `calcFundingFee`

Computes the periodic funding payment for a single position.

### Inputs

| Input | Unit | Constraint |
| --- | --- | --- |
| `side` | — | `long` / `short` |
| `size` | base coins | number > 0 |
| `markPrice` | quote per coin | number > 0 |
| `ratePct` | percent | numeric, may be negative, zero, or positive (field must be non-empty) |

### Formula

```text
fee     = size × markPrice × ratePct / 100
absFee  = |fee|
```

### Payment direction

```text
ratePct > 0  → LONG pays SHORT   (absFee)
ratePct < 0  → SHORT pays LONG   (absFee)
ratePct = 0  → no meaningful transfer (fee = 0)
```

### Calculation Method

1. Compute notional = `size × markPrice`.
2. Funding fee = notional × rate (percent → fraction).
3. Determine who pays/receives from the sign of the rate and the trader's side.

### Example

Long, size `2`, mark `50,000`, rate `0.01`.

```text
fee = 2 × 50,000 × 0.01/100 = 10.000000 USDT   (long pays)
```

### Expected Result

```text
Funding fee : 10.000000 USDT  (LONG pays SHORT)
Abs fee     : 10.000000 USDT
```

### Edge cases / notes

- The sign of `ratePct` determines direction, not the sign shown on the fee (display shows
  the signed value of `fee`; a positive rate yields a positive number).
- A zero/negative rate can make the short pay the long (rate < 0).

---

## Slippage

**Source function:** `calcSlippage`

Measures how far the actual closing fill drifted from the intended stop-loss price for a
triggered stop-loss market order.

### Inputs

| Input | Unit | Constraint |
| --- | --- | --- |
| `side` | — | `long` / `short` |
| `entryPrice` | quote per coin | number > 0 |
| `stopLossPrice` | quote per coin | number > 0 |
| `actualClosePrice` | quote per coin | number > 0 |
| `size` | base coins | number > 0 |
| `leverage` | × | optional (for ROI/margin) |

### Variables

| Variable | Definition |
| --- | --- |
| `pnlAtStopLoss` | PnL had the fill happened exactly at the stop-loss price. |
| `pnlAtActual` | PnL at the actual fill price. |
| `slippagePnl` | Extra loss/gain = actual PnL − stop-loss PnL. |
| `diff` | Absolute price gap between stop-loss and actual fill. |
| `slippagePct` | Price gap as percent of the stop-loss price. |
| `priceDiff` | Dollar impact of the gap = diff × size. |
| `margin` | Position margin if leverage supplied. |

### Formula

```text
pnlFor(closePrice):
  LONG : (closePrice − entryPrice) × size
  SHORT: (entryPrice − closePrice) × size

pnlAtStopLoss = pnlFor(stopLossPrice)
pnlAtActual   = pnlFor(actualClosePrice)

slippagePnl = pnlAtActual − pnlAtStopLoss
diff        = |stopLossPrice − actualClosePrice|
slippagePct = diff / stopLossPrice × 100
priceDiff   = diff × size

if leverage provided and leverage > 0:
    margin          = entryPrice × size / leverage
    roiAtStopLoss   = pnlAtStopLoss / margin × 100
    roiAtActual     = pnlAtActual / margin × 100
else: margin / ROIs undefined
```

### Calculation Method

1. Evaluate PnL at the stop-loss price and at the actual fill price with the side-aware
   PnL formula.
2. Slippage PnL = difference (negative = worse fill).
3. Price gap = absolute difference between intended and actual price.
4. Slippage percent is relative to the **stop-loss** price, not entry.
5. Dollar impact = gap × size.
6. If leverage given, compute margin and ROIs.

### Example

Long: entry `30,000`, stop-loss `29,500`, actual `29,000`, size `2`, leverage `10`.

```text
pnlAtStopLoss = (29,500 − 30,000) × 2  = −1,000.000000 USDT
pnlAtActual   = (29,000 − 30,000) × 2  = −2,000.000000 USDT
slippagePnl   = −2,000 − (−1,000)      = −1,000.000000 USDT
diff          = |29,500 − 29,000|      = 500.000000
slippagePct   = 500 / 29,500 × 100     = 1.6949%
priceDiff     = 500 × 2                = 1,000.000000 USDT
margin        = 30,000 × 2 / 10        = 6,000.000000 USDT
roiAtStopLoss = −1,000 / 6,000 × 100   = −16.6667%
roiAtActual   = −2,000 / 6,000 × 100   = −33.3333%
```

### Expected Result

```text
PnL at stop-loss : -1,000.000000 USDT
PnL at actual    : -2,000.000000 USDT
Slippage PnL     : -1,000.000000 USDT
Slippage %       : 1.6949%
Price impact     : 1,000.000000 USDT
ROI at SL / ROI  : -16.6667% / -33.3333%
```

### Edge cases / notes

- A fill *better* than the stop-loss yields a positive `slippagePnl`.
- `slippagePct` divides by the stop-loss price (which must be > 0).
- Margin/ROIs only appear when a positive leverage is supplied.

---

## Fund Flow Reconstruction

**Source function:** `reconstructFundFlow`

Reconstructs a wallet balance history from exported Excel (`.xlsx`/`.xls`) transaction
files and checks whether the ledger reconciles with a provided current balance.

### Inputs

| Input | Unit | Constraint |
| --- | --- | --- |
| `files` | Excel files | at least one file; each parsed from its first worksheet |
| `frozen` | quote currency | optional number (default `0`) |
| `available` | quote currency | optional number (default `0`) |

### Current balance

```text
currentBalance = frozen + available
```

### Row normalization (column mapping)

Each sheet row maps to a record with these columns (both Chinese and English headers are
accepted; the first non-empty alias wins):

| Output field | Chinese header | English headers |
| --- | --- | --- |
| `time` | 时间 | `Time`, `Transaction Time` |
| `type` | 类型 | `Type` (default `Unknown`) |
| `currency` | 币种 | `Currency` (default `USDT`, uppercased) |
| `contract` | 合约 | `Contract` (default empty) |
| `amount` | 金额 | `Amount` (commas stripped, `parseFloat`; fallback `0`) |

Time parsing:

```text
1) Replace the first space with "T" and run new Date(...) — if valid, use its epoch ms.
2) Otherwise try regex  (\d{4})[-/.](\d{1,2})[-/.](\d{1,2})  with optional
   [ T]hh:mm(:ss) and build a local Date → epoch ms.
3) If neither works the row is "unparsed" (parsed = false) but kept.
```

### Deduplication

```text
key = time.trim() + "|" + type.trim() + "|" + currency.toUpperCase()
      + "|" + contract.trim() + "|" + amount

first occurrence of a key is kept; later duplicates removed (counted).
```

### Ordering

```text
sort:
  parsed rows first, ordered newest → oldest by parsed time (descending epoch ms);
  unparsed rows last, preserving their original relative order.
```

### Balance reconstruction

Walk from the newest balance back to the oldest by processing rows in the sorted
(newest-first) order, subtracting each transaction amount:

```text
total          = Σ row.amount                     (all rows, signed amounts)
oldestBalance  = round8( currentBalance − total )

running = currentBalance
for each row in sorted order (newest → oldest):
    row.balanceAfter  = round8( running )
    row.balanceBefore = round8( running − row.amount )
    running           = row.balanceBefore

finalBalance = rows[0].balanceAfter               # after-balance of the newest row
balanceDiff  = round8( currentBalance − finalBalance )
reconciled   = |balanceDiff| < 1e-8

netChange    = round8( currentBalance − oldestBalance )   # == total (Σ amounts)
```

`round8(x) = Number(x.toFixed(8))`.

### Calculation Method

1. Read every file's first worksheet into rows; concatenate.
2. Normalize each row (aliases, currency uppercasing, amount parsing, time parsing).
3. Deduplicate identical rows.
4. Sort newest-first; parsed rows before unparsed rows.
5. `currentBalance = frozen + available`.
6. Derive `oldestBalance` (opening balance) from the net sum of all transactions.
7. Walk backward from `currentBalance` through the sorted rows, recording each row's
   balance before/after the transaction.
8. `finalBalance` = balance after the newest transaction row.
9. Compare with `currentBalance` → `reconciled`.
10. Report text uses `.toFixed(4)` on `finalBalance`, `oldest`, `netChange`.

### Example

`frozen = 0`, `available = 1,000`. Three signed transactions:

| # | Date/time | Type | Currency | Amount |
| --- | --- | --- | --- | --- |
| T1 | 2024-01-01 00:00 | Deposit | USDT | +500 |
| T2 | 2024-01-02 00:00 | Withdraw | USDT | −200 |
| T3 | 2024-01-03 00:00 | Realized PnL | USDT | +300 |

```text
currentBalance = 1,000
total          = 500 − 200 + 300       = 600
oldestBalance  = 1,000 − 600           = 400.00000000

sorted (newest first): T3, T2, T1

walk (running starts at 1,000):
  T3: balanceAfter = 1,000;  balanceBefore = 1,000 − 300 = 700   → running = 700
  T2: balanceAfter = 700;    balanceBefore = 700 − (−200) = 900  → running = 900
  T1: balanceAfter = 900;    balanceBefore = 900 − 500 = 400     → running = 400

finalBalance = rows[0].balanceAfter = 1,000.00000000
balanceDiff  = 1,000 − 1,000       = 0.00000000
reconciled   = true
netChange    = 1,000 − 400         = 600.00000000
```

### Expected Result

```text
txCount        : 3
oldestBalance  : 400.0000
currentBalance : 1000.0000
finalBalance   : 1000.0000
netChange      : +600.0000
reconciled     : true
```

Result rows (newest first):

```text
T3  amount +300  before 700.00000000  after 1000.00000000
T2  amount -200  before 900.00000000  after 700.00000000
T1  amount +500  before 400.00000000  after 900.00000000
```

### Edge cases / notes

- Implementation detail: because `finalBalance` is read from the newest row whose
  `balanceAfter` is seeded from `currentBalance`, `finalBalance` equals
  `currentBalance` up to 8-decimal rounding. Reconciliation therefore passes whenever
  the input has ≤ 8 decimals; it does not detect gaps between the exported file and the
  live balance.
- Rows with unparseable timestamps are kept, counted in `unparsedCount`, and treated as
  the oldest events (sorted after all parsed rows).
- Summing is only meaningful when all rows share one currency; the UI surfaces a warning
  when more than one currency is present.
- Each file's first worksheet only is read.
- Balance arithmetic rounds to 8 decimals at every step.

---

## Supporting Calculations

### Stop-loss proximity tag (isolated liquidation)

**Source function:** `stopLossProximity(entry, liq, sl)`

Classifies whether a stop-loss sits dangerously close to the liquidation price.

```text
move = |entry − liq|
dist = |sl − liq|

if move ≤ 0 or dist > move:  → "far"
else:                        → "close" if dist / move ≤ 0.2, else "far"
```

Interpretation: the stop-loss is "close" when it lies within 20% of the price distance
between the entry and the liquidation price.

### Stop-loss proximity tag (cross liquidation)

Computed from the resulting margin ratio (display logic, not part of the math library):

```text
close if marginRatio > 70   (%), otherwise far
```

### Risk bar (cross liquidation)

```text
pct        = min( marginRatio / 200 × 100, 100 )     # progress-bar fill
color       = danger  if marginRatio ≥ 100
            = warning if marginRatio > 70
            = success otherwise
```

### MMR explanation text block

Colleague/customer MMR summaries are generated per position:

```text
pair = position.symbol with a trailing (USDT|USDC) removed
line = "<symbol> (<side>): MMR <mmrPct>% → MM = <fmt(mm)> <unit>
        · https://.../<pair> limits"
```

### Template parameters (isolated liquidation)

Values echoed into the generated messages:

```text
buffer = margin − MM
sign   = "−" for long, "+" for short        (liq = entry ∓ buffer-per-unit)
liq    = liquidationPrice.toFixed(6)
```

---

## Reference Tables

### VIP fee schedule

`vipFees` is an array indexed by VIP level (`0 … 7`). Each entry is `[maker %, taker %]`.

| VIP level | Maker % | Taker % |
| --- | --- | --- |
| 0 | 0.020 | 0.060 |
| 1 | 0.020 | 0.050 |
| 2 | 0.016 | 0.050 |
| 3 | 0.014 | 0.040 |
| 4 | 0.012 | 0.0375 |
| 5 | 0.010 | 0.035 |
| 6 | 0.008 | 0.0315 |
| 7 | 0.006 | 0.030 |

### EXR deduct-rate table

Default exchange deduct rates (percent) used for valuing cross-margin wallet assets.
A coin not present defaults to `95`.

| Coin | Rate % | Coin | Rate % | Coin | Rate % |
| --- | --- | --- | --- | --- | --- |
| USDT | 100 | BTC | 99.9 | AAVE | 95 |
| USDC | 99.9 | ETH | 99.9 | BCH | 95 |
| USDE | 98.5 | BNB | 96 | DOT | 95 |
| FDUSD | 98.5 | XRP | 98 | LINK | 95 |
| | | SOL | 98.5 | LTC | 95 |
| | | DOGE | 95 | SUI | 95 |
| | | ADA | 95 | TON | 95 |
| | | AVAX | 95 | TRX | 95 |
| | | | | XAUT | 95 |
| | | | | XLM | 95 |

