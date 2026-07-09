import "./footer.css";

export default function Footer() {
  return (
    <footer className="section tf-footer" id="footer" data-section="footer">
      <div className="tf-footer__hex" />
      <div className="tf-footer__brand">THE TRADING FLOOR</div>
      <p className="tf-footer__tagline">Twelve agents. One analysis. No call without consensus.</p>
      <div className="tf-footer__links">
        <a href="#top">Home</a>
        <a href="#agents">Agents</a>
        <a href="#shrink">The Shrink</a>
        <a href="#pricing">Pricing</a>
        <a href="#">Discord</a>
      </div>
      <p className="tf-footer__legal">
        Behavioral analysis only. Not financial advice. Trade at your own risk.
      </p>
      <p className="tf-footer__copy">© {new Date().getFullYear()} The Trading Floor.</p>
    </footer>
  );
}
