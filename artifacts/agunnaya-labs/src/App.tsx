import { useEffect, useCallback } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { ProviderCtxProvider } from './context/ProviderContext';
import CustomCursor from './components/CustomCursor';
import BgCanvas from './components/BgCanvas';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AISection from './components/AISection';
import ArenaSection from './components/ArenaSection';
import LeaderboardSection from './components/LeaderboardSection';
import NFTSection from './components/NFTSection';
import AuditSection from './components/AuditSection';
import ProSection from './components/ProSection';
import SaasSection from './components/SaasSection';
import WaitlistSection from './components/WaitlistSection';
import SiteFooter from './components/SiteFooter';
import BackToTop from './components/BackToTop';
import MobileWalletBar from './components/MobileWalletBar';
import { useWallet } from './hooks/useWallet';
import { useReveal } from './hooks/useReveal';

function ProgressBar() {
  useEffect(() => {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    const onScroll = () => {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div id="progress-bar" className="progress-bar" />;
}

function AppInner() {
  const wallet = useWallet();
  const { show } = useToast();
  useReveal();

  const onToast = useCallback((msg: string, type?: 'default'|'success'|'error'|'warning') => {
    show(msg, type);
  }, [show]);

  return (
    <>
      <CustomCursor />
      <BgCanvas />
      <ProgressBar />
      <Header wallet={wallet} onToast={onToast} />
      <MobileWalletBar wallet={wallet} />

      <main>
        <HeroSection />
        <hr className="rule z" />
        <AISection />
        <hr className="rule z" />
        <ArenaSection />
        <hr className="rule z" />
        <LeaderboardSection />
        <hr className="rule z" />
        <NFTSection />
        <hr className="rule z" />
        <AuditSection />
        <hr className="rule z" />
        <ProSection />
        <hr className="rule z" />
        <SaasSection />
        <hr className="rule z" />
        <WaitlistSection />
      </main>

      <SiteFooter />
      <BackToTop />
    </>
  );
}

export default function App() {
  return (
    <ProviderCtxProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </ProviderCtxProvider>
  );
}
