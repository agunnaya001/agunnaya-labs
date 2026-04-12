import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { ethers } from 'ethers';
import { BASE_RPC } from '../config';

const Ctx = createContext<ethers.JsonRpcProvider | null>(null);

export function useProvider() {
  return useContext(Ctx);
}

export function ProviderCtxProvider({ children }: { children: ReactNode }) {
  const provider = useMemo(() => new ethers.JsonRpcProvider(BASE_RPC), []);
  return <Ctx.Provider value={provider}>{children}</Ctx.Provider>;
}
