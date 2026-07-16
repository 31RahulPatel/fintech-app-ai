import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">₹</span>
          FintechOps
        </div>
        <p className="footer-tagline">Your Trusted Financial Companion</p>
        <p className="footer-copy">© {new Date().getFullYear()} FintechOps. Built for the AWS Builder Center Always-On Agent Challenge.</p>
      </div>
    </footer>
  )
}
