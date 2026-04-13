import { useEffect, useCallback, lazy, Suspense } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { ProviderCtxProvider } from './context/ProviderContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import CustomCursor from './components/CustomCursor';
import BgCanvas from './components/BgCanvas';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import BackToTop from './components/BackToTop';
import MobileWalletBar from './components/MobileWalletBar';
import { useWallet } from './hooks/useWallet';
import { useReveal } from './hooks/useReveal';

// Lazy-load below-fold sections for faster initial paint
const AISection        = lazy(() => import('./components/AISection'));
const ArenaSection     = lazy(() => import('./components/ArenaSection'));
const LeaderboardSection = lazy(() => import('./components/LeaderboardSection'));
const NFTSection       = lazy(() => import('./components/NFTSection'));
const AuditSection     = lazy(() => import('./components/AuditSection'));
const ProSection       = lazy(() => import('./components/ProSection'));
const SaasSection      = lazy(() => import('./components/SaasSection'));
const WaitlistSection  = lazy(() => import('./components/WaitlistSection'));
const SiteFooter       = lazy(() => import('./components/SiteFooter'));

function SectionFallback() {
  return (
    <div style={{ padding: '80px 48px' }}>
      <div style={{ height: 14, width: 120, background: 'var(--border)', borderRadius: 3, marginBottom: 24, animation: 'pulse 1.4s ease-in-out infinite' }} />
      <div style={{ height: 52, width: 320, background: 'var(--border)', borderRadius: 3, animation: 'pulse 1.4s ease-in-out infinite' }} />
    </div>
  );
}

function ProgressBar() {
  useEffect(() => {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (!total) return;
      bar.style.width = (window.scrollY / total) * 100 + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div id="progress-bar" className="progress-bar" />;
}

function Section({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<SectionFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
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
        <ErrorBoundary>
          <HeroSection />
        </ErrorBoundary>

        <hr className="rule z" />
        <Section><AISection /></Section>
        <hr className="rule z" />
        <Section><ArenaSection /></Section>
        <hr className="rule z" />
        <Section><LeaderboardSection /></Section>
        <hr className="rule z" />
        <Section><NFTSection /></Section>
        <hr className="rule z" />
        <Section><AuditSection /></Section>
        <hr className="rule z" />
        <Section><ProSection /></Section>
        <hr className="rule z" />
        <Section><SaasSection /></Section>
        <hr className="rule z" />
        <Section><WaitlistSection /></Section>
      </main>

      <Section><SiteFooter /></Section>
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
