import './MarketTicker.css'

export default function MarketTicker({ items }) {
  return (
    <div className="ticker-card">
      <div className="ticker-dots">
        <span className="dot dot-red" />
        <span className="dot dot-orange" />
        <span className="dot dot-green" />
      </div>
      <div className="ticker-list">
        {items.map((item) => (
          <div className="ticker-row" key={item.symbol}>
            <span className="ticker-symbol">{item.symbol}</span>
            <div className="ticker-values">
              <span className="ticker-price">{item.price}</span>
              <span className={`ticker-change ${item.change >= 0 ? 'up' : 'down'}`}>
                {item.change >= 0 ? '+' : ''}
                {item.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
