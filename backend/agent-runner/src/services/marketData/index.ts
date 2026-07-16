import { MockMarketDataProvider } from './mockProvider'
import { LiveMarketDataProvider } from './liveProvider'
import type { MarketDataProvider } from './types'

export * from './types'

export function getMarketDataProvider(): MarketDataProvider {
  return process.env.MARKET_DATA_PROVIDER === 'live' ? new LiveMarketDataProvider() : new MockMarketDataProvider()
}
