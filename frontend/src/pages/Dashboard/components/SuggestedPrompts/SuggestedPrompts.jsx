import { TrendUpIcon, CoinsIcon, PercentIcon, ShieldIcon, BoltIcon, RefreshIcon } from '../../../../components/Icons/Icons'
import './SuggestedPrompts.css'

const PROMPTS = [
  { icon: TrendUpIcon, label: 'Market Analysis', prompt: 'Give me a quick analysis of today’s Nifty 50 and Sensex movement.' },
  { icon: CoinsIcon, label: 'SIP Guide', prompt: 'Explain how a SIP works and how much I should invest monthly to reach ₹50L in 15 years.' },
  { icon: PercentIcon, label: 'Portfolio Review', prompt: 'Review a portfolio that is 70% equity, 20% debt, 10% gold. Any suggestions?' },
  { icon: ShieldIcon, label: 'Tax Planning', prompt: 'What are the best tax-saving investment options under the new tax regime?' },
  { icon: BoltIcon, label: 'Crypto Update', prompt: 'Give me the latest update on Bitcoin and Ethereum prices and sentiment.' },
  { icon: RefreshIcon, label: 'Mutual Funds', prompt: 'Suggest a mix of mutual funds for a moderate-risk investor.' },
]

export default function SuggestedPrompts({ onSelect }) {
  return (
    <div className="suggested-grid">
      {PROMPTS.map(({ icon: Icon, label, prompt }) => (
        <button key={label} type="button" className="suggested-card" onClick={() => onSelect(prompt)}>
          <span className="suggested-icon">
            <Icon width={20} height={20} />
          </span>
          {label}
        </button>
      ))}
    </div>
  )
}
