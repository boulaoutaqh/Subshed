'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Sub {
  id:string; serviceName:string; serviceIcon:string;
  amount:number; status:string; cancelUrl:string;
}

export default function Dashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [total, setTotal] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') load();
    if (window.location.search.includes('success=true')) {
      setIsPro(true);
      showToast('🎉 Welcome to Pro! All features unlocked.');
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [status]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/subscriptions');
      const data = await res.json();
      setSubs(data.subscriptions || []);
      setTotal(data.monthlyTotal || 0);
      setIsPro(data.isPro || false);
    } catch (e) {
      console.error('load error:', e);
    } finally {
      setLoading(false);
    }
  }

  async function scan() {
    if (!isPro) {
      showToast('🔒 Subscribe first to scan your email!');
      return;
    }
    setScanning(true);
    showToast('🔍 Scanning your inbox...');
    const res = await fetch('/api/scan', { method: 'POST' });
    const data = await res.json();
    if (data.subscriptions) {
      setSubs(data.subscriptions);
      const t = data.subscriptions.filter((s:Sub) => s.status==='active').reduce((a:number,s:Sub) => a+s.amount, 0);
      setTotal(parseFloat(t.toFixed(2)));
      showToast(`✅ Found ${data.found} subscriptions!`);
    } else showToast('❌ ' + data.error);
    setScanning(false);
  }

  async function cancel(id:string, name:string, amount:number) {
    const res = await fetch('/api/subscriptions', {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ id, status: 'cancelled' }),
    });
    const data = await res.json();
    if (data.success) { load(); showToast(`✅ ${name} marked as cancelled`); }
  }

  async function upgrade() {
    const res = await fetch('/api/lemonsqueezy/checkout', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else showToast('❌ ' + data.error);
  }

  function showToast(msg:string) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  if (loading) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'2rem',marginBottom:12}}>🔍</div>
          <div style={{color:'#16C761',fontWeight:700}}>Loading Subshed...</div>
        </div>
      </div>
    );
  }

  const active = subs.filter(s => s.status === 'active');
  const cancelled = subs.filter(s => s.status === 'cancelled');

  return (
    <div style={{minHeight:'100vh'}}>
      {toast && (
        <div style={{position:'fixed',bottom:24,right:24,zIndex:999,background:'#161B22',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'12px 20px'}}>
          {toast}
        </div>
      )}
      <header style={{height:60,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
        <div style={{fontWeight:800,fontSize:'1.1rem',letterSpacing:'-0.02em'}}>🔍 Sub<span style={{color:'#16C761'}}>shed</span></div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <button onClick={scan} disabled={scanning}
            style={{background:'#16C761',color:'#000',border:'none',borderRadius:10,padding:'8px 14px',fontSize:'0.9rem',fontWeight:700,cursor:'pointer'}}>
            {scanning ? '🔍 Scanning...' : '🔍 Scan Now'}
          </button>
          <button onClick={() => signOut({ callbackUrl: 'https://subshedapp.com' })} style={{background:'transparent',color:'#6B7280',border:'none',cursor:'pointer',fontSize:'0.9rem'}}>Sign Out</button>
        </div>
      </header>
      <main style={{padding:'24px',maxWidth:860,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
          {[
            {label:'Monthly Total', value:`$${total.toFixed(2)}`, color:'#FF4D4D'},
            {label:'Active', value:active.length, color:'#16C761'},
            {label:'Cancelled', value:cancelled.length, color:'#16C761'},
          ].map(k => (
            <div key={k.label} style={{background:'#0D1117',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'16px 20px'}}>
              <div style={{fontSize:'0.7rem',color:'#6B7280',textTransform:'uppercase',marginBottom:6}}>{k.label}</div>
              <div style={{fontFamily:'monospace',fontSize:'1.9rem',color:k.color}}>{k.value}</div>
            </div>
          ))}
        </div>

        {!isPro && (
          <div style={{background:'rgba(22,199,97,0.07)',border:'1px solid rgba(22,199,97,0.2)',borderRadius:12,padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
            <div>
              <div style={{fontWeight:700,marginBottom:3}}>✨ Upgrade to Pro</div>
              <div style={{fontSize:'0.8rem',color:'#6B7280'}}>Unlimited scans — One-time payment $9.99</div>
            </div>
            <button onClick={upgrade} style={{background:'#16C761',color:'#000',border:'none',borderRadius:10,padding:'8px 18px',fontWeight:700,cursor:'pointer'}}>Get Pro</button>
          </div>
        )}

        <div style={{background:'#0D1117',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12}}>
          <div style={{padding:'14px 20px',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',justifyContent:'space-between'}}>
            <span style={{fontWeight:700}}>Your Subscriptions</span>
            <span style={{fontSize:'0.75rem',color:'#6B7280'}}>{subs.length} found</span>
          </div>
          {subs.length === 0 ? (
            <div style={{padding:'60px 24px',textAlign:'center',color:'#6B7280'}}>
              <div style={{fontSize:'3rem',marginBottom:10}}>🔍</div>
              <div style={{fontWeight:600,marginBottom:6}}>No subscriptions yet</div>
              <div style={{fontSize:'0.82rem'}}>{isPro ? 'Click "Scan Now" to find all your subscriptions' : '🔒 Subscribe to scan your email'}</div>
            </div>
          ) : subs.map((s,i) => (
            <div key={s.id} style={{display:'grid',gridTemplateColumns:'40px 1fr 90px 110px',alignItems:'center',padding:'14px 20px',borderBottom:i<subs.length-1?'1px solid rgba(255,255,255,0.07)':'none'}}>
              <div style={{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem'}}>
                {s.serviceIcon || '📦'}
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:'0.92rem'}}>{s.serviceName}</div>
                {s.cancelUrl && s.status==='active' && (
                  <a href={s.cancelUrl} target="_blank" rel="noreferrer"
                    style={{fontSize:'0.68rem',color:'#6B7280',textDecoration:'underline'}}>Cancel page ↗</a>
                )}
              </div>
              <div style={{fontFamily:'monospace',fontSize:'0.9rem',color:s.status==='cancelled'?'#6B7280':'#fff'}}>
                ${s.amount.toFixed(2)}/mo
              </div>
              <div style={{display:'flex',justifyContent:'flex-end'}}>
                {s.status === 'cancelled' ? (
                  <span style={{fontSize:'0.72rem',color:'#16C761',fontWeight:700}}>✓ Cancelled</span>
                ) : (
                  <button onClick={() => cancel(s.id, s.serviceName, s.amount)}
                    style={{background:'rgba(255,77,77,0.1)',color:'#FF4D4D',border:'1px solid rgba(255,77,77,0.3)',borderRadius:8,padding:'4px 12px',fontSize:'0.8rem',cursor:'pointer'}}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}