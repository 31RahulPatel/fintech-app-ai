export interface MarketInstrument {
  symbol: string
  price: string
  change: number
}

export interface MarketSnapshot {
  instruments: MarketInstrument[]
  headlines: string[]
  asOf: string
}

export interface MarketDataProvider {
  getSnapshot(): Promise<MarketSnapshot>
}
