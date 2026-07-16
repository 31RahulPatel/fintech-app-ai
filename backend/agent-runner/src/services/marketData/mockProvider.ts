import type { MarketDataProvider, MarketSnapshot } from './types'

const BASE_INSTRUMENTS = [
  { symbol: 'NIFTY 50', base: 22456.8 },
  { symbol: 'SENSEX', base: 74085.6 },
  { symbol: 'BANK NIFTY', base: 47234.5 },
  { symbol: 'NASDAQ', base: 18540.2 },
  { symbol: 'S&P 500', base: 5745.3 },
  { symbol: 'GOLD (10g)', base: 71240 },
  { symbol: 'SILVER (kg)', base: 86900 },
  { symbol: 'USD/INR', base: 83.42 },
  { symbol: 'CRUDE OIL', base: 82.15 },
  { symbol: 'BITCOIN', base: 67340 },
  { symbol: 'ETHEREUM', base: 3480 },
]

function jitter(base: number) {
  const changePct = (Math.random() - 0.5) * 3
  return { price: base * (1 + changePct / 100), changePct }
}

/** Offline default provider — mirrors schedule-api's, kept as a separate copy per-Lambda
 * (see ARCHITECTURE.md for why this project avoids a shared Lambda Layer). */
export class MockMarketDataProvider implements MarketDataProvider {
  async getSnapshot(): Promise<MarketSnapshot> {
    const instruments = BASE_INSTRUMENTS.map(({ symbol, base }) => {
      const { price, changePct } = jitter(base)
      return {
        symbol,
        price: symbol.includes('INR') || symbol === 'CRUDE OIL' ? price.toFixed(2) : Math.round(price).toLocaleString('en-IN'),
        change: Number(changePct.toFixed(2)),
      }
    })

    return {
      instruments,
      headlines: [
        'RBI holds repo rate steady for sixth straight meeting',
        'Nifty 50 hits fresh record high on strong FII inflows',
        'Gold prices firm up as global uncertainty weighs on risk assets',
        'Bitcoin reclaims key level as institutional demand picks up',
      ],
      asOf: new Date().toISOString(),
    }
  }
}
