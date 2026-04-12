import { useEffect, useState } from 'react';
import { useProvider } from '../context/ProviderContext';

export default function LiveBlock() {
  const provider = useProvider();
  const [block, setBlock] = useState<number | null>(null);

  useEffect(() => {
    if (!provider) return;
    const fetch = async () => {
      try { setBlock(await provider.getBlockNumber()); } catch {}
    };
    fetch();
    const id = setInterval(fetch, 12000);
    return () => clearInterval(id);
  }, [provider]);

  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontFamily:'var(--ff-m)', fontSize:'.6rem', color:'var(--dim)', letterSpacing:'.06em' }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--green)', display:'inline-block', animation:'blink 2s infinite' }} />
      {block ? `#${block.toLocaleString()}` : '···'}
    </span>
  );
}
