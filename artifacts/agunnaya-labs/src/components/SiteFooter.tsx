export default function SiteFooter() {
  return (
    <footer className="z">
      <div className="footer-logo">AGUNNAYA LABS</div>
      <div className="footer-links">
        <a href="https://github.com/agunnaya001" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://github.com/apps/smart-contract-auditor-bot" target="_blank" rel="noopener noreferrer">Auditor Bot</a>
        <a href="https://v0-smart-contract-auditor-bot.vercel.app/" target="_blank" rel="noopener noreferrer">Dashboard</a>
        <a href={`https://basescan.org/token/0xEA1221B4d80A89BD8C75248Fae7c176BD1854698`} target="_blank" rel="noopener noreferrer">AGL on BaseScan</a>
        <a href="https://x.com/agunnaya001" target="_blank" rel="noopener noreferrer">X / Twitter</a>
        <a href="https://base.org" target="_blank" rel="noopener noreferrer">Base</a>
      </div>
      <div className="footer-copy">© 2026 Agunnaya Labs · MIT License</div>
    </footer>
  );
}
