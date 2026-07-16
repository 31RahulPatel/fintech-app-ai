import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import Button from '../../components/Button/Button'
import MarketTicker from '../../components/MarketTicker/MarketTicker'
import { BoltIcon, ArrowRightIcon } from '../../components/Icons/Icons'
import './Landing.css'

const HERO_TICKER = [
  { symbol: 'NIFTY 50', price: '22,456.80', change: 1.24 },
  { symbol: 'SENSEX', price: '74,085.60', change: 0.98 },
  { symbol: 'BANK NIFTY', price: '47,234.50', change: -0.45 },
]

const AVATARS = ['A', 'B', 'C', 'D', 'E']

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <Navbar />

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="landing-badge">
            <BoltIcon width={14} height={14} />
            New: Bazar.ai with Scheduled Prompts
          </span>

          <h1 className="landing-title">
            Your Trusted <span className="landing-title-accent">Financial</span>
            <br />
            Companion
          </h1>

          <p className="landing-subtitle">
            Make smarter financial decisions with real-time market data and AI-powered insights.
            Everything you need to manage your finances in one place.
          </p>

          <div className="landing-cta">
            <Button onClick={() => navigate('/signup')}>
              Get Started Free <ArrowRightIcon width={16} height={16} />
            </Button>
            <Button variant="outline" onClick={() => navigate('/login')}>
              Try Bazar.ai
            </Button>
          </div>

          <div className="landing-trust">
            <div className="landing-avatars">
              {AVATARS.map((letter) => (
                <span key={letter} className="landing-avatar">
                  {letter}
                </span>
              ))}
            </div>
            <span>
              Join <strong>50,000+</strong> users making smarter financial decisions
            </span>
          </div>
        </div>

        <div className="landing-hero-visual">
          <MarketTicker items={HERO_TICKER} />
        </div>
      </section>

      <Footer />
    </div>
  )
}
