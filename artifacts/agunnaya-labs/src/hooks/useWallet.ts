import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { BASE_CHAIN_HEX, BASE_CHAIN_ID, ERC20_ABI, AGL_TOKEN } from '../config';

export interface WalletState {
  address: string | null;
  network: string | null;
  chainId: number | null;
  ethBalance: string | null;
  aglBalance: string | null;
  isConnected: boolean;
  isWrongNetwork: boolean;
}

type EthWindow = { ethereum?: ethers.Eip1193Provider & {
  on?: (e: string, cb: (...args: unknown[]) => void) => void;
  removeListener?: (e: string, cb: (...args: unknown[]) => void) => void;
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}};

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null, network: null, chainId: null,
    ethBalance: null, aglBalance: null,
    isConnected: false, isWrongNetwork: false,
  });

  const updateWallet = useCallback(async (provider: ethers.BrowserProvider) => {
    try {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const isWrongNetwork = chainId !== BASE_CHAIN_ID;

      const ethBal = await provider.getBalance(address);
      const ethBalance = parseFloat(ethers.formatEther(ethBal)).toFixed(4);

      let aglBalance = '0';
      try {
        const token = new ethers.Contract(AGL_TOKEN, ERC20_ABI, provider);
        const bal = await token.balanceOf(address);
        aglBalance = parseFloat(ethers.formatEther(bal)).toLocaleString(undefined, { maximumFractionDigits: 0 });
      } catch {}

      setState({
        address, network: isWrongNetwork ? 'Wrong Network' : 'Base Mainnet',
        chainId, ethBalance, aglBalance,
        isConnected: true, isWrongNetwork,
      });
    } catch {}
  }, []);

  const connect = useCallback(async () => {
    const win = window as unknown as EthWindow;
    if (!win.ethereum) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(win.ethereum);
      await provider.send('eth_requestAccounts', []);
      await updateWallet(provider);
    } catch {}
  }, [updateWallet]);

  const disconnect = useCallback(() => {
    setState({ address: null, network: null, chainId: null, ethBalance: null, aglBalance: null, isConnected: false, isWrongNetwork: false });
  }, []);

  const switchToBase = useCallback(async () => {
    const win = window as unknown as EthWindow;
    if (!win.ethereum?.request) return;
    try {
      await win.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BASE_CHAIN_HEX }] });
    } catch (err: unknown) {
      const e = err as { code?: number };
      if (e.code === 4902) {
        await win.ethereum.request?.({
          method: 'wallet_addEthereumChain',
          params: [{ chainId: BASE_CHAIN_HEX, chainName: 'Base Mainnet', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://mainnet.base.org'], blockExplorerUrls: ['https://basescan.org'] }]
        });
      }
    }
  }, []);

  const addAGLToWallet = useCallback(async () => {
    const win = window as unknown as EthWindow;
    if (!win.ethereum?.request) return false;
    try {
      const result = await win.ethereum.request({
        method: 'wallet_watchAsset',
        params: [{
          type: 'ERC20',
          options: { address: AGL_TOKEN, symbol: 'AGL', decimals: 18, image: '' },
        }] as unknown[],
      });
      return !!result;
    } catch { return false; }
  }, []);

  // Auto-reconnect if already connected
  useEffect(() => {
    const win = window as unknown as EthWindow;
    if (!win.ethereum) return;
    const provider = new ethers.BrowserProvider(win.ethereum);
    // Check if already authorized (no popup)
    provider.send('eth_accounts', []).then((accounts) => {
      if (Array.isArray(accounts) && accounts.length > 0) updateWallet(provider);
    }).catch(() => {});
  }, [updateWallet]);

  useEffect(() => {
    const win = window as unknown as EthWindow;
    if (!win.ethereum) return;
    const provider = new ethers.BrowserProvider(win.ethereum);
    const handleChange = () => updateWallet(provider);
    win.ethereum.on?.('accountsChanged', handleChange);
    win.ethereum.on?.('chainChanged', handleChange);
    return () => {
      win.ethereum?.removeListener?.('accountsChanged', handleChange);
      win.ethereum?.removeListener?.('chainChanged', handleChange);
    };
  }, [updateWallet]);

  return { ...state, connect, disconnect, switchToBase, addAGLToWallet };
}
