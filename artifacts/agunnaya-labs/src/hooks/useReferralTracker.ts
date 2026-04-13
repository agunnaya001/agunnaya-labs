import { useEffect } from 'react';

/**
 * Reads the ?ref= query parameter on first visit and saves it to localStorage.
 * Also stores the connected wallet address so the referral widget can generate links.
 */
export function useReferralTracker(walletAddress: string | null) {
  // Save connected wallet for referral link generation
  useEffect(() => {
    if (!walletAddress) return;
    try { localStorage.setItem('agl_wallet', walletAddress); } catch {}
  }, [walletAddress]);

  // Capture referrer on first visit
  useEffect(() => {
    try {
      if (localStorage.getItem('agl_ref')) return; // already captured
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref && ref !== 'connect-wallet-first') {
        localStorage.setItem('agl_ref', ref);
        // Increment referrer's count
        const key = `agl_ref_count`;
        // This is the referrer's count stored on their own browser; in production
        // this would go to a backend. For now we just track locally.
        const count = parseInt(localStorage.getItem(key) ?? '0', 10);
        localStorage.setItem(key, String(count + 1));
      }
    } catch {}
  }, []);
}
