import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

type ToastType = 'default' | 'success' | 'error' | 'warning';

interface Toast {
  id: number;
  msg: string;
  type: ToastType;
}

interface ToastCtx {
  show: (msg: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx>({ show: () => {} });

export function useToast() { return useContext(Ctx); }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const show = useCallback((msg: string, type: ToastType = 'default') => {
    const id = ++counter.current;
    setToasts(prev => [...prev.slice(-3), { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const colors: Record<ToastType, string> = {
    default: 'rgba(200,255,0,.25)',
    success: 'rgba(34,197,94,.3)',
    error: 'rgba(239,68,68,.3)',
    warning: 'rgba(249,115,22,.3)',
  };

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div style={{ position:'fixed', bottom:28, right:28, zIndex:700, display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background:'var(--card)', border:`1px solid ${colors[t.type]}`,
            borderRadius:6, padding:'11px 18px', fontFamily:'var(--ff-m)',
            fontSize:'.7rem', color:'var(--text)', letterSpacing:'.04em',
            maxWidth:300, animation:'toastIn .22s ease', boxShadow:'0 8px 32px rgba(0,0,0,.4)',
          }}>
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
