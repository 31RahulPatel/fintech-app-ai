import type { MarketDataProvider, MarketSnapshot, MarketInstrument } from './types'
import { MockMarketDataProvider } from './mockProvider'
import { logger } from '../../utils/logger'

const TROY_OZ_TO_10G = 10 / 31.1034768
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
}

function formatIndex(price: number) {
  return Math.round(price).toLocaleString('en-IN')
}

function formatDecimal(price: number) {
  return price.toFixed(2)
}

/** Yahoo Finance's chart endpoint has no official public API or key — it's the same
 * unofficial endpoint many open-source finance tools use. No auth, but can break or
 * rate-limit without notice, which is why every call here falls back to the mock value. */
async function fetchYahooQuote(symbol: string): Promise<{ price: number; changePct: number } | null> {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`, {
      headers: BROWSER_HEADERS,
    })
    if (!res.ok) throw new Error(`Yahoo Finance responded ${res.status} for ${symbol}`)

    const data = (await res.json()) as any
    const meta = data?.chart?.result?.[0]?.meta
    const price = meta?.regularMarketPrice
    const prevClose = meta?.previousClose ?? meta?.chartPreviousClose

    if (typeof price !== 'number' || typeof prevClose !== 'number' || prevClose === 0) return null

    return { price, changePct: ((price - prevClose) / prevClose) * 100 }
  } catch (err) {
    logger.warn('Yahoo Finance fetch failed', { symbol, error: String(err) })
    return null
  }
}

/** NSE publishes no public API either — this mirrors the two-step dance every unofficial
 * NSE integration uses: fetch the homepage first to obtain session cookies (NSE blocks
 * direct API calls without them), then call the indices API with those cookies attached. */
async function fetchNseIndices(): Promise<Record<string, { price: number; changePct: number }> | null> {
  try {
    const homepage = await fetch('https://www.nseindia.com/', { headers: BROWSER_HEADERS })
    const cookies = (homepage.headers.getSetCookie?.() ?? [homepage.headers.get('set-cookie') ?? ''])
      .map((c) => c.split(';')[0])
      .filter(Boolean)
      .join('; ')

    const res = await fetch('https://www.nseindia.com/api/allIndices', {
      headers: { ...BROWSER_HEADERS, Accept: 'application/json', Cookie: cookies, Referer: 'https://www.nseindia.com/market-data/live-equity-market' },
    })
    if (!res.ok) throw new Error(`NSE responded ${res.status}`)

    const data = (await res.json()) as any
    const byIndex: Record<string, { price: number; changePct: number }> = {}
    for (const row of data?.data ?? []) {
      if (typeof row.last === 'number' && typeof row.percentChange === 'number') {
        byIndex[row.index] = { price: row.last, changePct: row.percentChange }
      }
    }
    return byIndex
  } catch (err) {
    logger.warn('NSE indices fetch failed', { error: String(err) })
    return null
  }
}

async function fetchCoinGeckoPrices(): Promise<Record<string, { usd: number; usd_24h_change: number }> | null> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
    )
    if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`)
    return (await res.json()) as Record<string, { usd: number; usd_24h_change: number }>
  } catch (err) {
    logger.warn('CoinGecko fetch failed', { error: String(err) })
    return null
  }
}

async function fetchTopHeadlines(): Promise<string[] | null> {
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(`https://newsapi.org/v2/top-headlines?category=business&country=in&pageSize=6&apiKey=${apiKey}`)
    if (!res.ok) throw new Error(`News API responded ${res.status}`)

    const data = (await res.json()) as any
    const headlines = (data?.articles ?? []).map((a: { title: string }) => a.title).filter(Boolean)
    return headlines.length ? headlines : null
  } catch (err) {
    logger.warn('News API fetch failed', { error: String(err) })
    return null
  }
}

/** Real-data provider: NSE (Nifty/Bank Nifty) + Yahoo Finance (Sensex, Nasdaq, S&P 500,
 * gold/silver/oil, USD/INR) + CoinGecko (crypto) + News API (headlines). Every source can
 * fail independently (all are free/unofficial or rate-limited) — each falls back to the
 * mock provider's value for that specific instrument so one flaky source never breaks
 * the whole report. */
export class LiveMarketDataProvider implements MarketDataProvider {
  private fallback = new MockMarketDataProvider()

  async getSnapshot(): Promise<MarketSnapshot> {
    const mock = await this.fallback.getSnapshot()
    const byMockSymbol = new Map(mock.instruments.map((i) => [i.symbol, i]))
    const fallbackOf = (symbol: string): MarketInstrument => byMockSymbol.get(symbol) as MarketInstrument

    const [nse, usdInr, gold, silver, oil, nasdaq, sp500, sensex, crypto, headlines] = await Promise.all([
      fetchNseIndices(),
      fetchYahooQuote('INR=X'),
      fetchYahooQuote('GC=F'),
      fetchYahooQuote('SI=F'),
      fetchYahooQuote('CL=F'),
      fetchYahooQuote('%5EIXIC'),
      fetchYahooQuote('%5EGSPC'),
      fetchYahooQuote('%5EBSESN'),
      fetchCoinGeckoPrices(),
      fetchTopHeadlines(),
    ])

    const usdInrRate = usdInr?.price

    const instruments: MarketInstrument[] = [
      nse?.['NIFTY 50']
        ? { symbol: 'NIFTY 50', price: formatIndex(nse['NIFTY 50'].price), change: Number(nse['NIFTY 50'].changePct.toFixed(2)) }
        : fallbackOf('NIFTY 50'),
      sensex
        ? { symbol: 'SENSEX', price: formatIndex(sensex.price), change: Number(sensex.changePct.toFixed(2)) }
        : fallbackOf('SENSEX'),
      nse?.['NIFTY BANK']
        ? { symbol: 'BANK NIFTY', price: formatIndex(nse['NIFTY BANK'].price), change: Number(nse['NIFTY BANK'].changePct.toFixed(2)) }
        : fallbackOf('BANK NIFTY'),
      nasdaq
        ? { symbol: 'NASDAQ', price: formatIndex(nasdaq.price), change: Number(nasdaq.changePct.toFixed(2)) }
        : fallbackOf('NASDAQ'),
      sp500
        ? { symbol: 'S&P 500', price: formatIndex(sp500.price), change: Number(sp500.changePct.toFixed(2)) }
        : fallbackOf('S&P 500'),
      gold && usdInrRate
        ? { symbol: 'GOLD (10g)', price: formatIndex(gold.price * usdInrRate * TROY_OZ_TO_10G), change: Number(gold.changePct.toFixed(2)) }
        : fallbackOf('GOLD (10g)'),
      silver && usdInrRate
        ? { symbol: 'SILVER (kg)', price: formatIndex(silver.price * usdInrRate * (1000 / 31.1034768)), change: Number(silver.changePct.toFixed(2)) }
        : fallbackOf('SILVER (kg)'),
      usdInr
        ? { symbol: 'USD/INR', price: formatDecimal(usdInr.price), change: Number(usdInr.changePct.toFixed(2)) }
        : fallbackOf('USD/INR'),
      oil
        ? { symbol: 'CRUDE OIL', price: formatDecimal(oil.price), change: Number(oil.changePct.toFixed(2)) }
        : fallbackOf('CRUDE OIL'),
      crypto?.bitcoin
        ? { symbol: 'BITCOIN', price: `$${crypto.bitcoin.usd.toLocaleString()}`, change: Number(crypto.bitcoin.usd_24h_change.toFixed(2)) }
        : fallbackOf('BITCOIN'),
      crypto?.ethereum
        ? { symbol: 'ETHEREUM', price: `$${crypto.ethereum.usd.toLocaleString()}`, change: Number(crypto.ethereum.usd_24h_change.toFixed(2)) }
        : fallbackOf('ETHEREUM'),
    ]

    return {
      instruments,
      headlines: headlines ?? mock.headlines,
      asOf: new Date().toISOString(),
    }
  }
}
